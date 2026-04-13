"""
exam.py — API endpoints cho bài kiểm tra đầu vào.

Chỉ làm nhiệm vụ nhận request → gọi exam_service → trả response.
Không chứa business logic.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
from jose import jwt, JWTError

from app.core.database import get_db
from app.core.config import settings
from app.core.exam_service import create_exam, grade_exam, get_exam_result

router = APIRouter()


# ─── Helper: Lấy user_id từ JWT token ───────────────────────────────────
def get_user_id_from_token(token: str) -> str:
    """Decode JWT và trả về user_id (sub claim)."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Token hết hạn hoặc không hợp lệ")


# ─── Schemas ─────────────────────────────────────────────────────────────
class StartExamRequest(BaseModel):
    token: str


class AnswerItem(BaseModel):
    question_id: str
    selected: str          # "A", "B", "C", "D"
    time_spent: Optional[int] = 0  # Thời gian làm câu này (giây)


class SubmitExamRequest(BaseModel):
    token: str
    exam_id: str
    answers: List[AnswerItem]


class GetResultRequest(BaseModel):
    token: str


# ─── Routes ──────────────────────────────────────────────────────────────

@router.post("/start")
async def start_exam(body: StartExamRequest, db: AsyncSession = Depends(get_db)):
    """
    Bắt đầu bài kiểm tra đầu vào.
    Trả về exam_id + danh sách 30 câu hỏi ngẫu nhiên (ẩn đáp án).
    """
    user_id = get_user_id_from_token(body.token)

    result = await create_exam(db, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Không đủ câu hỏi trong ngân hàng đề")

    return result


@router.post("/submit")
async def submit_exam(body: SubmitExamRequest, db: AsyncSession = Depends(get_db)):
    """
    Nộp bài → chấm điểm → lưu kết quả vào DB.
    """
    user_id = get_user_id_from_token(body.token)

    answers_data = [a.model_dump() for a in body.answers]
    result = await grade_exam(db, body.exam_id, user_id, answers_data)

    if not result:
        raise HTTPException(status_code=404, detail="Bài kiểm tra không tồn tại")

    return result


@router.post("/result/{exam_id}")
async def exam_result(exam_id: str, body: GetResultRequest, db: AsyncSession = Depends(get_db)):
    """
    Lấy kết quả chi tiết bài kiểm tra.
    """
    user_id = get_user_id_from_token(body.token)

    result = await get_exam_result(db, exam_id, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy kết quả bài kiểm tra")

    return result
