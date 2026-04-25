import os
import tempfile
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session

import database, models
from api.auth import get_current_user
from llm.orchestrator import call_llm, LLMTask
from llm.prompts.chat_rag import build_rag_chat_system, build_rag_user_message
from rag.chunker import extract_chat_attachment, IMAGE_EXTS
from error_handler import raise_app_error

router = APIRouter(prefix="/chat", tags=["Chat Sessions"])


class SessionSummary(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    attachment_count: int
    message_count: int


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    attachment_id: Optional[str] = None
    created_at: datetime


class AttachmentOut(BaseModel):
    id: str
    filename: str
    source_type: str
    char_count: int
    created_at: datetime


class SessionDetail(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageOut]
    attachments: List[AttachmentOut]


class CreateSessionRequest(BaseModel):
    title: Optional[str] = None


class SendMessageRequest(BaseModel):
    content: str
    attachment_id: Optional[UUID] = None


def _serialize_message(m: models.TinNhanChat) -> MessageOut:
    return MessageOut(
        id=str(m.MaTinNhan),
        role=m.VaiTro,
        content=m.NoiDung,
        attachment_id=str(m.MaTaiLieu) if m.MaTaiLieu else None,
        created_at=m.NgayTao,
    )


def _serialize_attachment(a: models.TaiLieuChat) -> AttachmentOut:
    return AttachmentOut(
        id=str(a.MaTaiLieu),
        filename=a.TenFile,
        source_type=a.LoaiNguon,
        char_count=a.SoKyTu,
        created_at=a.NgayTao,
    )


def _own_session(db: Session, session_id: UUID, user_id) -> models.PhienChat:
    sess = db.query(models.PhienChat).filter(
        models.PhienChat.MaPhien == session_id,
        models.PhienChat.MaNguoiDung == user_id,
    ).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Phiên chat không tồn tại")
    return sess


@router.get("/sessions", response_model=List[SessionSummary])
def list_sessions(
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    sessions = (
        db.query(models.PhienChat)
        .filter(models.PhienChat.MaNguoiDung == current_user.MaNguoiDung)
        .order_by(models.PhienChat.NgayCapNhat.desc())
        .all()
    )
    out = []
    for s in sessions:
        out.append(SessionSummary(
            id=str(s.MaPhien),
            title=s.TieuDe,
            created_at=s.NgayTao,
            updated_at=s.NgayCapNhat,
            attachment_count=len(s.tai_lieus),
            message_count=len(s.tin_nhans),
        ))
    return out


@router.post("/sessions", response_model=SessionSummary)
def create_session(
    req: CreateSessionRequest,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    title = (req.title or "Cuộc trò chuyện mới").strip()[:200]
    sess = models.PhienChat(
        MaNguoiDung=current_user.MaNguoiDung,
        TieuDe=title or "Cuộc trò chuyện mới",
    )
    db.add(sess)
    db.commit()
    db.refresh(sess)
    return SessionSummary(
        id=str(sess.MaPhien),
        title=sess.TieuDe,
        created_at=sess.NgayTao,
        updated_at=sess.NgayCapNhat,
        attachment_count=0,
        message_count=0,
    )


@router.get("/sessions/{session_id}", response_model=SessionDetail)
def get_session(
    session_id: UUID,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    sess = _own_session(db, session_id, current_user.MaNguoiDung)
    return SessionDetail(
        id=str(sess.MaPhien),
        title=sess.TieuDe,
        created_at=sess.NgayTao,
        updated_at=sess.NgayCapNhat,
        messages=[_serialize_message(m) for m in sess.tin_nhans],
        attachments=[_serialize_attachment(a) for a in sess.tai_lieus],
    )


@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: UUID,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    sess = _own_session(db, session_id, current_user.MaNguoiDung)
    db.delete(sess)
    db.commit()
    return {"deleted": str(session_id)}


@router.post("/sessions/{session_id}/attachments")
async def upload_attachment(
    session_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    sess = _own_session(db, session_id, current_user.MaNguoiDung)

    name = (file.filename or "").lower()
    if "." not in name:
        raise HTTPException(status_code=415, detail="Tệp không có phần mở rộng.")
    ext = "." + name.rsplit(".", 1)[-1]
    allowed = {".pdf"} | IMAGE_EXTS
    if ext not in allowed:
        raise HTTPException(status_code=415, detail="Định dạng không hỗ trợ.")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=422, detail="Tệp rỗng.")

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(raw)
        tmp_path = tmp.name
    try:
        result = extract_chat_attachment(tmp_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Lỗi đọc tệp: {exc}")
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

    text = (result.get("text") or "").strip()
    if not text:
        raise HTTPException(status_code=422, detail="Không trích xuất được nội dung từ tệp.")

    doc = models.TaiLieuChat(
        MaPhien=sess.MaPhien,
        TenFile=file.filename,
        LoaiNguon=result.get("source_type", "pdf_text"),
        NoiDungText=text,
        SoKyTu=len(text),
    )
    db.add(doc)
    sess.NgayCapNhat = datetime.utcnow()
    db.commit()
    db.refresh(doc)
    return {
        "id": str(doc.MaTaiLieu),
        "filename": doc.TenFile,
        "source_type": doc.LoaiNguon,
        "char_count": doc.SoKyTu,
        "text": text,
    }


@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: UUID,
    req: SendMessageRequest,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    sess = _own_session(db, session_id, current_user.MaNguoiDung)
    content = req.content.strip()
    if not content:
        raise HTTPException(status_code=422, detail="Nội dung trống.")

    # Validate attachment_id if provided
    linked_attachment = None
    if req.attachment_id:
        linked_attachment = db.query(models.TaiLieuChat).filter(
            models.TaiLieuChat.MaTaiLieu == req.attachment_id,
            models.TaiLieuChat.MaPhien == sess.MaPhien,
        ).first()
        if not linked_attachment:
            raise HTTPException(status_code=404, detail="Tệp đính kèm không thuộc phiên này.")

    # Determine context document: linked attachment, else latest in session
    context_doc = linked_attachment
    if not context_doc and sess.tai_lieus:
        context_doc = max(sess.tai_lieus, key=lambda a: a.NgayTao)

    # Persist user message
    next_order = (max((m.ThuTu for m in sess.tin_nhans), default=-1)) + 1
    user_msg = models.TinNhanChat(
        MaPhien=sess.MaPhien,
        VaiTro="user",
        NoiDung=content,
        MaTaiLieu=linked_attachment.MaTaiLieu if linked_attachment else None,
        ThuTu=next_order,
    )
    db.add(user_msg)

    # Auto-set title from first user message
    if sess.TieuDe in ("Cuộc trò chuyện mới", "") and not sess.tin_nhans:
        sess.TieuDe = content[:80].strip() or "Cuộc trò chuyện mới"

    db.flush()  # need user_msg.NgayTao etc. saved before LLM call

    # Build LLM history
    prior = list(sess.tin_nhans) + [user_msg]
    prior.sort(key=lambda m: m.ThuTu)
    # Keep last 6 messages to avoid token overflow
    history = prior[-7:-1] if len(prior) > 7 else prior[:-1]
    llm_messages = [{"role": m.VaiTro, "content": m.NoiDung} for m in history]

    context = (context_doc.NoiDungText[:4000] if context_doc else "")
    system = build_rag_chat_system(has_context=bool(context))
    last_content = build_rag_user_message(content, context)
    llm_messages.append({"role": "user", "content": last_content})

    try:
        result = await call_llm(
            task=LLMTask.CHAT_RAG,
            messages=llm_messages,
            system_prompt=system,
            max_tokens=1500,
        )
    except RuntimeError as exc:
        raise_app_error("AI_001", detail=str(exc))

    reply_text = result["text"]
    assistant_msg = models.TinNhanChat(
        MaPhien=sess.MaPhien,
        VaiTro="assistant",
        NoiDung=reply_text,
        ThuTu=next_order + 1,
    )
    db.add(assistant_msg)
    sess.NgayCapNhat = datetime.utcnow()
    db.commit()
    db.refresh(assistant_msg)
    db.refresh(user_msg)

    return {
        "user_message": _serialize_message(user_msg),
        "assistant_message": _serialize_message(assistant_msg),
        "session_title": sess.TieuDe,
        "used_document": bool(context),
        "document_id": str(context_doc.MaTaiLieu) if context_doc else None,
    }
