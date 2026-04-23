import uuid
import json
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

import database, models, schemas
from api.auth import oauth2_scheme
from rag.chunker import extract_text_from_pdf
from llm.orchestrator import call_llm, LLMTask
from llm.prompts.quiz_extract import QUIZ_EXTRACT_SYSTEM, CLASSIFY_LEVEL_SYSTEM

router = APIRouter(prefix="/quiz-extraction", tags=["Quiz PDF Extraction"])
UPLOAD_DIR = Path("uploads/quiz_pdfs")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_admin_user(token: str = Depends(oauth2_scheme),
                   db: Session = Depends(database.get_db)):
    from jose import jwt, JWTError
    try:
        payload = jwt.decode(token, database.settings.SECRET_KEY,
                             algorithms=[database.settings.ALGORITHM])
        email = payload.get("sub")
        user = db.query(models.NguoiDung).filter(models.NguoiDung.Email == email).first()
        if not user or user.VaiTro != "admin":
            raise HTTPException(403, "Ch\u1ec9 Admin")
        return user
    except JWTError:
        raise HTTPException(401, "Token kh\u00f4ng h\u1ee3p l\u1ec7")


def _map_cefr_to_difficulty(level: str) -> str:
    return {"A1": "EASY", "A2": "EASY", "B1": "MEDIUM",
            "B2": "MEDIUM", "C1": "HARD", "C2": "HARD"}.get(level, "MEDIUM")


@router.post("/extract")
async def extract_quiz_from_pdf(
    file: UploadFile = File(...),
    admin=Depends(get_admin_user),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Ch\u1ec9 nh\u1eadn .pdf")

    job_id = str(uuid.uuid4())
    save_path = UPLOAD_DIR / f"{job_id}.pdf"

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        full_text = extract_text_from_pdf(str(save_path))
    except Exception as e:
        raise HTTPException(500, f"Kh\u00f4ng \u0111\u1ecdc \u0111\u01b0\u1ee3c PDF: {e}")

    if not full_text.strip():
        raise HTTPException(422, "PDF kh\u00f4ng c\u00f3 text. C\u00f3 th\u1ec3 l\u00e0 file scan c\u1ea7n OCR.")

    # LLM Extract MCQ
    try:
        result = await call_llm(
            task=LLMTask.QUIZ_EXTRACT,
            messages=[{"role": "user", "content": f"V\u0103n b\u1ea3n PDF:\n\n{full_text[:15000]}"}],
            system_prompt=QUIZ_EXTRACT_SYSTEM,
            max_tokens=4096,
            json_mode=True,
        )
        raw_questions = json.loads(result["text"])
    except Exception as e:
        raise HTTPException(500, f"LLM tr\u00edch xu\u1ea5t th\u1ea5t b\u1ea1i: {e}")

    if not raw_questions:
        raise HTTPException(404, "Kh\u00f4ng t\u00ecm th\u1ea5y c\u00e2u h\u1ecfi MCQ trong PDF")

    # LLM Classify Level
    classify_provider = "fallback"
    try:
        classify_input = json.dumps(
            [{"question_idx": i, "question": q["question"], "options": q["options"]}
             for i, q in enumerate(raw_questions)],
            ensure_ascii=False,
        )
        classify_result = await call_llm(
            task=LLMTask.CLASSIFY_LEVEL,
            messages=[{"role": "user", "content": f"Ph\u00e2n lo\u1ea1i c\u00e1c c\u00e2u h\u1ecfi sau:\n{classify_input}"}],
            system_prompt=CLASSIFY_LEVEL_SYSTEM,
            max_tokens=2048,
            json_mode=True,
        )
        classifications = json.loads(classify_result["text"])
        classify_provider = classify_result.get("provider", "unknown")
    except Exception:
        classifications = [
            {"question_idx": i, "level": "B1", "skill": "Grammar", "explanation_vi": ""}
            for i in range(len(raw_questions))
        ]

    class_map = {c["question_idx"]: c for c in classifications}
    merged = []
    for i, q in enumerate(raw_questions):
        cls = class_map.get(i, {"level": "B1", "skill": "Grammar", "explanation_vi": ""})
        correct = q.get("correct_answer", "UNKNOWN")
        options = q.get("options", [])
        if correct not in options:
            correct = options[0] if options else "UNKNOWN"
        merged.append({
            "question": q["question"],
            "options": options,
            "correct_answer": correct,
            "explanation": q.get("explanation"),
            "explanation_vi": cls.get("explanation_vi", ""),
            "level": cls.get("level", "B1"),
            "skill": cls.get("skill", "Grammar"),
            "has_unknown_answer": correct == "UNKNOWN",
        })

    return {
        "job_id": job_id,
        "filename": file.filename,
        "total_extracted": len(merged),
        "has_unknown_answers": sum(1 for q in merged if q["has_unknown_answer"]),
        "questions": merged,
        "provider_used": result.get("provider", "unknown"),
        "classify_provider": classify_provider,
    }


@router.post("/import")
async def import_questions_to_db(
    payload: schemas.QuizImportRequest,
    admin=Depends(get_admin_user),
    db: Session = Depends(database.get_db),
):
    if not payload.questions:
        raise HTTPException(400, "Danh s\u00e1ch c\u00e2u h\u1ecfi r\u1ed7ng")

    to_import = payload.questions
    if payload.skip_unknown_answers:
        to_import = [q for q in to_import if q.correct_answer != "UNKNOWN"]

    if not to_import:
        raise HTTPException(400, "Kh\u00f4ng c\u00f3 c\u00e2u h\u1ecfi n\u00e0o h\u1ee3p l\u1ec7 \u0111\u1ec3 import")

    inserted = 0
    skipped = 0

    for q in to_import:
        existing = db.query(models.NganHangCauHoi).filter(
            models.NganHangCauHoi.NoiDung == q.question
        ).first()
        if existing:
            skipped += 1
            continue

        db.add(models.NganHangCauHoi(
            MaCauHoi=uuid.uuid4(),
            KyNang=q.skill,
            MucDo=_map_cefr_to_difficulty(q.level),
            CefLevel=q.level,
            NoiDung=q.question,
            DSDapAn=q.options,
            DapAnDung=q.correct_answer,
            GiaiThich=q.explanation_vi or q.explanation or "",
            NguonPDF=payload.source_filename,
        ))
        inserted += 1

    db.commit()
    return {
        "inserted": inserted,
        "skipped_duplicate": skipped,
        "total_requested": len(payload.questions),
    }
