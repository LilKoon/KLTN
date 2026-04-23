import json
import os
import tempfile
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

import database, schemas
from api.auth import get_current_user, get_optional_user
from llm.orchestrator import call_llm, LLMTask
from rag.chunker import extract_text_from_pdf
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
