import json
import os
import tempfile
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

import database, models, schemas
from api.auth import get_current_user, get_optional_user
from llm.orchestrator import call_llm, LLMTask
from rag.chunker import extract_text_from_pdf, extract_chat_attachment, IMAGE_EXTS
from error_handler import raise_app_error
from llm.prompts.chat_rag import build_rag_chat_system, build_rag_user_message
from rag.rag_pipeline import retrieve_context, rag_generate_and_check

router = APIRouter(prefix="/ai", tags=["AI Engine"])

CEFR_LEVELS = {"A1", "A2", "B1", "B2", "C1", "C2"}


def _parse_json(text: str) -> list:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]
    parsed = json.loads(text.strip())
    if isinstance(parsed, list):
        return parsed
    # Model returned a dict like {"flashcards": [...]} u2192 extract first list value
    for v in parsed.values():
        if isinstance(v, list):
            return v
    return list(parsed.values())


@router.post("/flashcards/generate", response_model=List[schemas.FlashcardItem])
async def generate_flashcards(
    req: schemas.FlashcardGenerateRequest,
    current_user=Depends(get_current_user),
):
    if req.level.upper() not in CEFR_LEVELS:
        raise_app_error("AI_002")
    count = max(1, min(req.count, 20))
    system = (
        "You are an English vocabulary teacher. Respond ONLY with a valid JSON array. "
        "No markdown fences, no explanation outside JSON. "
        'Each item: {"word":"...","pos":"noun/verb/adj/adv/phrase",'
        '"phonetic":"/IPA/","meaning_vi":"nghia tieng Viet ngan gon",'
        '"example":"cau vi du tu nhien"}'
    )
    messages = [
        {
            "role": "user",
            "content": (
                f"Generate {count} English vocabulary flashcards for "
                f"topic '{req.topic}' at CEFR level {req.level.upper()}."
            ),
        }
    ]
    try:
        result = await call_llm(
            task=LLMTask.FLASHCARD_GEN,
            messages=messages,
            system_prompt=system,
            max_tokens=2048,
            json_mode=True,
        )
        data = _parse_json(result["text"])
        return [schemas.FlashcardItem(**item) for item in data]
    except Exception as exc:
        raise_app_error("AI_001", detail=str(exc))


@router.post("/flashcards/from-text", response_model=List[schemas.FlashcardItem])
async def flashcards_from_text(
    req: schemas.FlashcardFromTextRequest,
    current_user=Depends(get_current_user),
):
    count = max(1, min(req.count, 30))
    system = (
        "You are an English vocabulary teacher. Respond ONLY with a valid JSON array. "
        "No markdown fences, no explanation outside JSON. "
        'Each item: {"word":"...","pos":"noun/verb/adj/adv/phrase",'
        '"phonetic":"/IPA/","meaning_vi":"nghia tieng Viet ngan gon",'
        '"example":"cau vi du lay tu doan van"}'
    )
    messages = [
        {
            "role": "user",
            "content": (
                f"Extract {count} key English vocabulary words from the following text "
                f"for flashcard set '{req.topic}'.\n\nText:\n{req.text[:4000]}"
            ),
        }
    ]
    try:
        result = await call_llm(
            task=LLMTask.FLASHCARD_GEN,
            messages=messages,
            system_prompt=system,
            max_tokens=2048,
            json_mode=True,
        )
        data = _parse_json(result["text"])
        return [schemas.FlashcardItem(**item) for item in data]
    except Exception as exc:
        raise_app_error("AI_001", detail=str(exc))


@router.post("/quiz/generate", response_model=List[schemas.QuizQuestion])
async def generate_quiz(
    req: schemas.QuizGenerateRequest,
    current_user=Depends(get_current_user),
):
    if req.level.upper() not in CEFR_LEVELS:
        raise_app_error("AI_002")
    count = max(1, min(req.count, 15))
    system = (
        "You are an English exam creator for Vietnamese learners. "
        "Respond ONLY with a valid JSON array. No markdown, no preamble. "
        'Each item: {"question":"...","options":["A...","B...","C...","D..."],'
        '"answer":0,"explanation_vi":"giai thich tieng Viet, kem quy tac ngu phap"}. '
        '"answer" is 0-based index of correct option.'
    )
    messages = [
        {
            "role": "user",
            "content": (
                f"Create {count} multiple-choice English questions on "
                f"topic '{req.topic}' at CEFR level {req.level.upper()}."
            ),
        }
    ]
    try:
        result = await call_llm(
            task=LLMTask.QUIZ_EXTRACT,
            messages=messages,
            system_prompt=system,
            max_tokens=3000,
            json_mode=True,
        )
        data = _parse_json(result["text"])
        return [schemas.QuizQuestion(**item) for item in data]
    except Exception as exc:
        raise_app_error("AI_001", detail=str(exc))


@router.post("/quiz/save", response_model=schemas.AIQuizSummary)
def save_ai_quiz(
    req: schemas.AIQuizSaveRequest,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    if not req.questions:
        raise HTTPException(status_code=422, detail="Cần ít nhất 1 câu hỏi.")
    title = (req.title or req.topic or "Bài test AI").strip() or "Bài test AI"
    deck = models.BaiTestAI(
        MaNguoiDung=current_user.MaNguoiDung,
        TenBaiTest=title,
        ChuDe=(req.topic or "").strip() or None,
        CapDo=(req.level or "B1").upper(),
        SoLuongCau=len(req.questions),
        DSCauHoi=[q.model_dump() for q in req.questions],
    )
    db.add(deck)
    db.commit()
    db.refresh(deck)
    return schemas.AIQuizSummary(
        id=deck.MaBaiTestAI,
        title=deck.TenBaiTest,
        topic=deck.ChuDe,
        level=deck.CapDo,
        count=deck.SoLuongCau,
        created_at=deck.NgayTao,
    )


@router.get("/quiz/list", response_model=List[schemas.AIQuizSummary])
def list_ai_quizzes(
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    decks = (
        db.query(models.BaiTestAI)
        .filter(models.BaiTestAI.MaNguoiDung == current_user.MaNguoiDung)
        .order_by(models.BaiTestAI.NgayTao.desc())
        .all()
    )
    return [
        schemas.AIQuizSummary(
            id=d.MaBaiTestAI,
            title=d.TenBaiTest,
            topic=d.ChuDe,
            level=d.CapDo,
            count=d.SoLuongCau,
            created_at=d.NgayTao,
        )
        for d in decks
    ]


@router.get("/quiz/{quiz_id}", response_model=schemas.AIQuizDetail)
def get_ai_quiz(
    quiz_id: UUID,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    deck = (
        db.query(models.BaiTestAI)
        .filter(
            models.BaiTestAI.MaBaiTestAI == quiz_id,
            models.BaiTestAI.MaNguoiDung == current_user.MaNguoiDung,
        )
        .first()
    )
    if not deck:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài test.")
    return schemas.AIQuizDetail(
        id=deck.MaBaiTestAI,
        title=deck.TenBaiTest,
        topic=deck.ChuDe,
        level=deck.CapDo,
        count=deck.SoLuongCau,
        created_at=deck.NgayTao,
        questions=[schemas.QuizQuestion(**q) for q in deck.DSCauHoi],
    )


@router.delete("/quiz/{quiz_id}")
def delete_ai_quiz(
    quiz_id: UUID,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    deck = (
        db.query(models.BaiTestAI)
        .filter(
            models.BaiTestAI.MaBaiTestAI == quiz_id,
            models.BaiTestAI.MaNguoiDung == current_user.MaNguoiDung,
        )
        .first()
    )
    if not deck:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài test.")
    db.delete(deck)
    db.commit()
    return {"message": "Đã xoá bài test."}


@router.post("/chat")
async def ai_chat(
    payload: schemas.ChatRequest,
    current_user=Depends(get_optional_user),
):
    user_id = str(current_user.MaNguoiDung) if current_user else "anonymous"
    last_query = payload.messages[-1].content if payload.messages else ""
    use_rag = payload.use_rag and current_user

    if use_rag:
        async def llm_fn(context: str) -> str:
            system = build_rag_chat_system(has_context=bool(context))
            history = [
                {"role": m.role, "content": m.content}
                for m in payload.messages[:-1]
            ]
            user_content = (
                f"T\u00e0i li\u1ec7u tham kh\u1ea3o:\n---\n{context}\n---\n\nC\u00e2u h\u1ecfi: {last_query}"
                if context else last_query
            )
            history.append({"role": "user", "content": user_content})
            result = await call_llm(
                task=LLMTask.CHAT_RAG,
                messages=history,
                system_prompt=system,
                max_tokens=1200,
                force_provider=payload.preferred_provider,
            )
            return result["text"]

        try:
            full_result = await rag_generate_and_check(
                query=last_query,
                user_id=user_id,
                llm_call_fn=llm_fn,
                check_hallucination=payload.check_hallucination,
                hallucination_threshold=0.5,
            )
        except RuntimeError as exc:
            raise_app_error("AI_001", detail=str(exc))

        response = {
            "reply": full_result["reply"],
            "used_rag": True,
            "sources": full_result["sources"],
            "retrieval_stats": full_result["retrieval_stats"],
        }
        hal = full_result.get("hallucination", {})
        if hal.get("should_warn"):
            response["warning"] = {
                "type": "hallucination_risk",
                "verdict": hal.get("verdict"),
                "score": hal.get("hallucination_score"),
                "message": "M\u1ed9t ph\u1ea7n c\u00e2u tr\u1ea3 l\u1eddi c\u00f3 th\u1ec3 kh\u00f4ng c\u00f3 trong t\u00e0i li\u1ec7u g\u1ed1c",
            }
        return response

    # Non-RAG path
    context = (payload.document or "")[:4000]  # truncate to ~1000 tokens
    system = build_rag_chat_system(has_context=bool(context))
    # Keep only last 6 messages to avoid token overflow
    history = payload.messages[:-1]
    if len(history) > 6:
        history = history[-6:]
    llm_messages = [{"role": m.role, "content": m.content} for m in history]
    last_content = build_rag_user_message(last_query, context)
    llm_messages.append({"role": "user", "content": last_content})

    try:
        result = await call_llm(
            task=LLMTask.CHAT_RAG,
            messages=llm_messages,
            system_prompt=system,
            max_tokens=1500,
            force_provider=payload.preferred_provider,
        )
        return {
            "reply": result["text"],
            "provider": result["provider"],
            "used_rag": bool(context),
            "used_fallback": result["used_fallback"],
        }
    except RuntimeError as exc:
        raise_app_error("AI_001", detail=str(exc))


@router.post("/extract-pdf")
async def extract_pdf_text(
    file: UploadFile = File(...),
    current_user=Depends(get_optional_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise_app_error("PDF_001")
    try:
        content = await file.read()
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name
        try:
            text = extract_text_from_pdf(tmp_path)
        finally:
            os.unlink(tmp_path)
        if not text.strip():
            raise_app_error("PDF_003")
        return {"text": text, "char_count": len(text), "word_count": len(text.split())}
    except Exception as exc:
        from error_handler import AppError
        if isinstance(exc, AppError):
            raise
        raise_app_error("PDF_002", detail=str(exc))


@router.post("/chat/extract-attachment")
async def extract_chat_attachment_endpoint(
    file: UploadFile = File(...),
    current_user=Depends(get_optional_user),
):
    """
    Extract text from a chatbot attachment so the model can use it as context.
    PDF with text → pymupdf. PDF with images / image files → easyocr.
    """
    name = (file.filename or "").lower()
    if "." not in name:
        raise HTTPException(status_code=415, detail="Tệp không có phần mở rộng.")
    ext = "." + name.rsplit(".", 1)[-1]
    allowed = {".pdf"} | IMAGE_EXTS
    if ext not in allowed:
        raise HTTPException(
            status_code=415,
            detail=f"Định dạng không hỗ trợ. Chấp nhận: PDF, {', '.join(sorted(IMAGE_EXTS))}",
        )

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

    return {
        "filename": file.filename,
        "text": text,
        "source_type": result.get("source_type"),
        "pages": result.get("pages"),
        "char_count": len(text),
    }
