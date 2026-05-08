import warnings
from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI

# Suppress PyTorch DataLoader pin_memory warning when running on CPU without accelerator
warnings.filterwarnings("ignore", message=".*'pin_memory' argument is set as true but no accelerator is found.*")
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import database, models
from api import auth, cms, test_engine, path_engine, user_stats, ai_engine, flashcard_store, rag_api, chat_session, exam_service, admin, materials, subscription
from api.quiz_extraction import router as quiz_extract_router
from api.oauth import router as oauth_router
from api.bug_report import router as bug_report_router
from error_handler import AppError, app_error_handler

models.Base.metadata.create_all(bind=database.engine)


def _preload_models():
    try:
        from rag.embedder import EmbedderSingleton
        from rag.reranker import RerankerSingleton
        from rag.hallucination_detector import GLiClassSingleton
        EmbedderSingleton.get()
        print("  [OK] BGE-small embedder loaded")
        RerankerSingleton.get()
        print("  [OK] CrossEncoder reranker loaded")
        GLiClassSingleton.get()
        print("  [OK] GLiClass hallucination detector loaded")
    except Exception as e:
        print(f"  [WARN] Model preload: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Pre-loading AI models...")
    await asyncio.get_event_loop().run_in_executor(None, _preload_models)
    print("Server ready.")
    yield
    print("Server shutting down.")


api = FastAPI(
    title="EdTech AI Platform API",
    description="Backend API cho hệ thống học tiếng Anh EdTech",
    lifespan=lifespan,
)

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Maintenance mode middleware ───────────────────────────────
from fastapi import Request
from fastapi.responses import JSONResponse
from jose import jwt as _jwt, JWTError as _JWTError

# Cho phép admin vẫn truy cập + một số path public khi bảo trì
_MAINTENANCE_ALLOW_PREFIXES = (
    "/auth/login", "/auth/me", "/admin/", "/static/", "/docs", "/openapi.json", "/redoc",
    "/subscription/",
)


@api.middleware("http")
async def maintenance_mode_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    path = request.url.path
    if any(path.startswith(p) for p in _MAINTENANCE_ALLOW_PREFIXES):
        return await call_next(request)
    # Đọc setting
    db = database.SessionLocal()
    try:
        item = db.query(models.CauHinhHeThong).filter(models.CauHinhHeThong.Khoa == "maintenance_mode").first()
        is_on = bool(item and (item.GiaTri or "").strip().lower() in ("true", "1", "yes", "on"))
    except Exception:
        is_on = False
    finally:
        db.close()
    if not is_on:
        return await call_next(request)
    # Kiểm tra token: admin được vào
    auth_hdr = request.headers.get("authorization", "")
    if auth_hdr.lower().startswith("bearer "):
        token = auth_hdr.split(" ", 1)[1]
        try:
            payload = _jwt.decode(token, database.settings.SECRET_KEY, algorithms=[database.settings.ALGORITHM])
            if (payload.get("role") or "").upper() == "ADMIN":
                return await call_next(request)
        except _JWTError:
            pass
    return JSONResponse(
        status_code=503,
        content={"detail": "MAINTENANCE_MODE", "message": "Hệ thống đang bảo trì. Vui lòng quay lại sau."},
    )

api.include_router(auth.router)
api.include_router(cms.router)
api.include_router(test_engine.router)
api.include_router(path_engine.router)
api.include_router(user_stats.router)
api.include_router(ai_engine.router)
api.include_router(flashcard_store.router)
api.include_router(rag_api.router)
api.include_router(chat_session.router)
api.include_router(quiz_extract_router)
api.include_router(oauth_router)
api.include_router(bug_report_router)
api.include_router(exam_service.router)
api.include_router(admin.router)
api.include_router(materials.router)
api.include_router(subscription.router)

api.add_exception_handler(AppError, app_error_handler)

api.mount("/static", StaticFiles(directory="static"), name="static")

app = api


@api.get("/")
def read_root():
    return {"message": "Welcome to EdTech AI Platform API (FastAPI + PostgreSQL)"}
