import warnings
from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI

# Suppress PyTorch DataLoader pin_memory warning when running on CPU without accelerator
warnings.filterwarnings("ignore", message=".*'pin_memory' argument is set as true but no accelerator is found.*")
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import database, models
from api import auth, cms, test_engine, path_engine, user_stats, ai_engine, flashcard_store, rag_api, chat_session, exam_service
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

api.add_exception_handler(AppError, app_error_handler)

api.mount("/static", StaticFiles(directory="static"), name="static")

app = api


@api.get("/")
def read_root():
    return {"message": "Welcome to EdTech AI Platform API (FastAPI + PostgreSQL)"}
