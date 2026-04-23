import json
import logging
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Request
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/bug-report", tags=["Bug Reports"])

BUG_LOG_PATH = Path(__file__).parent.parent / "bug_reports.json"
_write_lock = threading.Lock()
MAX_ENTRIES = 1000  # keep file bounded


def _load_log() -> list[dict]:
    if not BUG_LOG_PATH.exists():
        return []
    try:
        with open(BUG_LOG_PATH, encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception as e:
        logger.warning(f"Bug log corrupt, starting fresh: {e}")
        return []


def append_bug_report(entry: dict) -> str:
    """Append entry to bug_reports.json (thread-safe). Returns report_id."""
    report_id = uuid.uuid4().hex[:12]
    entry = {
        "report_id": report_id,
        "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        **entry,
    }
    with _write_lock:
        log = _load_log()
        log.append(entry)
        if len(log) > MAX_ENTRIES:
            log = log[-MAX_ENTRIES:]
        tmp = BUG_LOG_PATH.with_suffix(".json.tmp")
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(log, f, ensure_ascii=False, indent=2)
        tmp.replace(BUG_LOG_PATH)
    return report_id


class BugReportIn(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    message: Optional[str] = None
    location: Optional[str] = None
    detail: Optional[str] = None
    category: Optional[str] = None
    source: Optional[str] = "frontend"
    url: Optional[str] = None
    user_agent: Optional[str] = None
    note: Optional[str] = None


@router.post("")
async def submit_bug_report(report: BugReportIn, request: Request):
    entry = {
        **report.model_dump(exclude_none=True),
        "ip": request.client.host if request.client else None,
    }
    report_id = append_bug_report(entry)
    logger.info(f"Bug report saved: {report_id} (id={report.id})")
    return {"report_id": report_id, "status": "saved"}
