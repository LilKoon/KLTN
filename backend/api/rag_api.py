import uuid
import os
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session

import database, models
from api.auth import get_current_user
from rag.rag_pipeline import index_pdf, delete_pdf_index, retrieve_context
from error_handler import raise_app_error

router = APIRouter(prefix="/rag", tags=["RAG - PDF Knowledge Base"])
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload/user")
async def upload_user_pdf(
    file: UploadFile = File(...),
    display_name: str = Form(...),
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    if not file.filename.endswith(".pdf"):
        raise_app_error("PDF_001")

    doc_id = str(uuid.uuid4())
    namespace = f"user_{current_user.MaNguoiDung}"
    user_dir = UPLOAD_DIR / namespace
    user_dir.mkdir(parents=True, exist_ok=True)
    save_path = user_dir / f"{doc_id}.pdf"

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        result = index_pdf(str(save_path), doc_id, display_name, namespace)
    except Exception as e:
        os.remove(save_path)
        raise_app_error("RAG_001", detail=str(e))

    db.add(models.TaiLieuRAG(
        MaTaiLieu=uuid.UUID(doc_id),
        MaNguoiDung=current_user.MaNguoiDung,
        TenHienThi=display_name,
        TenFile=file.filename,
        Namespace=namespace,
        SoChunk=result["chunks_indexed"],
    ))
    db.commit()
    return {"message": "Upload th\u00e0nh c\u00f4ng", "doc_id": doc_id, "chunks": result["chunks_indexed"]}


@router.post("/upload/admin")
async def upload_admin_pdf(
    file: UploadFile = File(...),
    display_name: str = Form(...),
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    if current_user.VaiTro != "admin":
        raise_app_error("RAG_003")
    if not file.filename.endswith(".pdf"):
        raise_app_error("PDF_001")

    doc_id = str(uuid.uuid4())
    namespace = "admin"
    admin_dir = UPLOAD_DIR / "admin"
    admin_dir.mkdir(exist_ok=True)
    save_path = admin_dir / f"{doc_id}.pdf"

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        result = index_pdf(str(save_path), doc_id, display_name, namespace)
    except Exception as e:
        os.remove(save_path)
        raise_app_error("RAG_001", detail=str(e))

    db.add(models.TaiLieuRAG(
        MaTaiLieu=uuid.UUID(doc_id),
        MaNguoiDung=current_user.MaNguoiDung,
        TenHienThi=display_name,
        TenFile=file.filename,
        Namespace=namespace,
        SoChunk=result["chunks_indexed"],
        LaAdminDoc=True,
    ))
    db.commit()
    return {"message": "Upload th\u00e0nh c\u00f4ng (Admin)", "doc_id": doc_id, "chunks": result["chunks_indexed"]}


@router.get("/documents")
def list_documents(
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    namespace = f"user_{current_user.MaNguoiDung}"
    return db.query(models.TaiLieuRAG).filter(
        models.TaiLieuRAG.Namespace == namespace
    ).all()


@router.delete("/documents/{doc_id}")
def delete_document(
    doc_id: str,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    doc = db.query(models.TaiLieuRAG).filter(
        models.TaiLieuRAG.MaTaiLieu == doc_id,
        models.TaiLieuRAG.MaNguoiDung == current_user.MaNguoiDung,
    ).first()
    if not doc:
        raise_app_error("RAG_002")
    delete_pdf_index(doc_id, doc.Namespace)
    db.delete(doc)
    db.commit()
    return {"message": "\u0110\u00e3 x\u00f3a"}


@router.get("/search")
def search_rag(
    q: str,
    top_k: int = 5,
    current_user=Depends(get_current_user),
):
    context, chunks = retrieve_context(q, str(current_user.MaNguoiDung), top_k)
    return {"context": context, "chunks": chunks}
