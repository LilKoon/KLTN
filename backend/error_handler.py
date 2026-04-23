import json
import uuid
import inspect
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

_CATALOG_PATH = Path(__file__).parent / "errors.json"

with open(_CATALOG_PATH, encoding="utf-8") as f:
    ERROR_CATALOG: dict = json.load(f)


class AppError(Exception):
    """Structured application error referenced by ID in errors.json."""

    def __init__(self, error_id: str, detail: Optional[str] = None, location: Optional[str] = None):
        if error_id not in ERROR_CATALOG:
            raise ValueError(f"Unknown error_id: {error_id}")
        self.error_id = error_id
        self.detail = detail
        self.location = location or _caller_location(stack_depth=2)
        super().__init__(f"{error_id}: {ERROR_CATALOG[error_id]['title']}")


def _caller_location(stack_depth: int = 1) -> str:
    """Return 'path/to/file.py:func_name:line' for the frame `stack_depth` above this call."""
    try:
        frame = inspect.stack()[stack_depth]
        filename = Path(frame.filename).as_posix()
        # Shorten to just the 'backend/...' portion
        parts = filename.split("/backend/", 1)
        short = "backend/" + parts[1] if len(parts) == 2 else Path(frame.filename).name
        return f"{short}:{frame.function}:{frame.lineno}"
    except Exception:
        return "unknown"


def raise_app_error(error_id: str, detail: Optional[str] = None) -> None:
    """Raise AppError with location auto-detected from caller."""
    raise AppError(error_id, detail=detail, location=_caller_location(stack_depth=2))


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    entry = ERROR_CATALOG[exc.error_id]
    body = {
        "error": {
            "id": exc.error_id,
            "title": entry["title"],
            "message": entry["message"],
            "category": entry.get("category", "general"),
            "location": exc.location,
            "detail": exc.detail,
            "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "request_id": uuid.uuid4().hex[:12],
        }
    }
    logger.warning(
        "AppError %s at %s — path=%s detail=%s",
        exc.error_id, exc.location, request.url.path, exc.detail,
    )
    # Auto-log to bug_reports.json so developers have a single place to review
    try:
        from api.bug_report import append_bug_report
        append_bug_report({
            "id": exc.error_id,
            "title": entry["title"],
            "message": entry["message"],
            "category": entry.get("category", "general"),
            "location": exc.location,
            "detail": exc.detail,
            "source": "backend",
            "url": str(request.url.path),
            "ip": request.client.host if request.client else None,
        })
    except Exception as log_err:
        logger.error(f"Failed to write bug report: {log_err}")
    return JSONResponse(status_code=entry["http_status"], content=body)
