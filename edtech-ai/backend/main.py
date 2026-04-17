from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database, models
from api import auth, cms, test_engine, path_engine, user_stats, flashcard

# Khởi tạo DB tables (Trong dự án thực tế nên quản lý bằng Alembic)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="EdTech AI Platform API",
    description="Backend API cho hệ thống học tiếng Anh EdTech"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cms.router)
app.include_router(test_engine.router)
app.include_router(path_engine.router)
app.include_router(user_stats.router)
app.include_router(flashcard.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to EdTech AI Platform API (FastAPI + PostgreSQL)"}
