from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from fastapi.staticfiles import StaticFiles
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Mount static files to serve audios
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# from app.api.endpoints import topic
# app.include_router(topic.router, prefix="/api/v1/topic", tags=["topic"])

from app.api.endpoints import auth
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

from app.api.endpoints import exam
app.include_router(exam.router, prefix="/api/v1/exam", tags=["exam"])

from app.api.endpoints import roadmap
app.include_router(roadmap.router, prefix="/api/v1/roadmap", tags=["roadmap"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Edtech AI Backend is working!"}

