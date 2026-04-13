"""
exam_service.py — Business logic cho bài kiểm tra đầu vào.

★ ĐỂ MỞ RỘNG: Chỉ cần sửa EXAM_CONFIG hoặc hàm fetch_random_questions().
  Không cần sửa API endpoints hay frontend.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sql_func
from app.core.models import NganHangCauHoi, BaiKiemTra, ChiTietLamBai
import uuid


# ══════════════════════════════════════════════════════════════════════════
# CẤU HÌNH BÀI THI — Sửa ở đây khi thêm kỹ năng hoặc đổi số câu
# ══════════════════════════════════════════════════════════════════════════
EXAM_CONFIG = {
    "total_questions": 30,
    "time_limit_minutes": 30,
    "distribution": [
        # Mỗi entry: kỹ năng + số câu theo từng level
        # Thêm kỹ năng mới? Chỉ cần thêm 1 dòng ở đây!
        {"skill": "GRAMMAR", "levels": {1: 10, 2: 10, 3: 10}},
        # {"skill": "LISTENING", "levels": {1: 5, 2: 5, 3: 5}},
        # {"skill": "READING",   "levels": {1: 5, 2: 5, 3: 5}},
    ]
}


# ══════════════════════════════════════════════════════════════════════════
# LẤY CÂU HỎI NGẪU NHIÊN
# ══════════════════════════════════════════════════════════════════════════
async def fetch_random_questions(db: AsyncSession) -> list:
    """
    Lấy câu hỏi ngẫu nhiên theo EXAM_CONFIG.
    
    ★ Để đổi thuật toán (adaptive, weighted...), chỉ cần sửa hàm này.
    """
    all_questions = []

    for entry in EXAM_CONFIG["distribution"]:
        skill = entry["skill"]
        for level, count in entry["levels"].items():
            # Query: lấy ngẫu nhiên `count` câu theo skill + level
            result = await db.execute(
                select(NganHangCauHoi)
                .where(
                    NganHangCauHoi.KyNang == skill,
                    NganHangCauHoi.MucDo == level,
                    NganHangCauHoi.MucDichSuDung == "EXAM",
                )
                .order_by(sql_func.random())
                .limit(count)
            )
            questions = result.scalars().all()
            all_questions.extend(questions)

    return all_questions


# ══════════════════════════════════════════════════════════════════════════
# TẠO BÀI KIỂM TRA MỚI
# ══════════════════════════════════════════════════════════════════════════
async def create_exam(db: AsyncSession, user_id: str) -> dict:
    """
    Tạo bài kiểm tra mới + lấy câu hỏi ngẫu nhiên.
    Trả về exam_id, danh sách câu hỏi (ẩn đáp án), và time_limit.
    """
    # 1. Lấy câu hỏi ngẫu nhiên
    questions = await fetch_random_questions(db)

    if not questions:
        return None

    # 2. Tạo record BaiKiemTra
    exam = BaiKiemTra(
        MaNguoiDung=uuid.UUID(user_id),
        LoaiBaiKiemTra="DAU_VAO",
        TrangThai="IN_PROGRESS",
    )
    db.add(exam)
    await db.commit()
    await db.refresh(exam)

    # 3. Format câu hỏi cho frontend (ẨN đáp án đúng & giải thích)
    questions_for_client = []
    for i, q in enumerate(questions):
        questions_for_client.append({
            "index": i,
            "question_id": str(q.MaCauHoi),
            "question": q.NoiDung,
            "options": q.DSDapAn,  # {"A": "...", "B": "...", "C": "...", "D": "..."}
            "skill": q.KyNang,
            "level": q.MucDo,
        })

    return {
        "exam_id": str(exam.MaBaiKiemTra),
        "questions": questions_for_client,
        "total_questions": len(questions_for_client),
        "time_limit_minutes": EXAM_CONFIG["time_limit_minutes"],
    }


# ══════════════════════════════════════════════════════════════════════════
# CHẤM ĐIỂM & LƯU KẾT QUẢ
# ══════════════════════════════════════════════════════════════════════════
async def grade_exam(db: AsyncSession, exam_id: str, user_id: str, answers: list) -> dict:
    """
    Chấm điểm bài thi.
    
    answers = [
        {"question_id": "uuid-...", "selected": "A", "time_spent": 15},
        ...
    ]
    
    ★ Để đổi cách tính điểm, chỉ cần sửa hàm này.
    """
    # 1. Kiểm tra bài thi tồn tại và thuộc về user
    result = await db.execute(
        select(BaiKiemTra).where(
            BaiKiemTra.MaBaiKiemTra == uuid.UUID(exam_id),
            BaiKiemTra.MaNguoiDung == uuid.UUID(user_id),
        )
    )
    exam = result.scalar_one_or_none()
    if not exam:
        return None

    # 2. Lấy tất cả câu hỏi liên quan để so đáp án
    question_ids = [uuid.UUID(a["question_id"]) for a in answers]
    result = await db.execute(
        select(NganHangCauHoi).where(NganHangCauHoi.MaCauHoi.in_(question_ids))
    )
    questions_map = {str(q.MaCauHoi): q for q in result.scalars().all()}

    # 3. Chấm từng câu và lưu ChiTietLamBai
    correct_count = 0
    total = len(answers)

    for ans in answers:
        q_id = ans["question_id"]
        selected = ans.get("selected", "")
        time_spent = ans.get("time_spent", 0)

        question = questions_map.get(q_id)
        if not question:
            continue

        is_correct = (selected == question.DapAnDung)
        if is_correct:
            correct_count += 1

        # Lưu chi tiết
        detail = ChiTietLamBai(
            MaBaiKiemTra=uuid.UUID(exam_id),
            MaCauHoi=uuid.UUID(q_id),
            LuaChon=selected,
            LaCauDung=is_correct,
            ThoiGianLamCauHoi=time_spent,
        )
        db.add(detail)

    # 4. Tính điểm và cập nhật BaiKiemTra
    score = round((correct_count / total) * 100, 2) if total > 0 else 0

    exam.TongDiem = score
    exam.TrangThai = "COMPLETED"
    await db.commit()

    return {
        "exam_id": exam_id,
        "score": float(score),
        "correct_count": correct_count,
        "total_questions": total,
    }


# ══════════════════════════════════════════════════════════════════════════
# LẤY KẾT QUẢ CHI TIẾT
# ══════════════════════════════════════════════════════════════════════════
async def get_exam_result(db: AsyncSession, exam_id: str, user_id: str) -> dict:
    """
    Lấy kết quả chi tiết bài thi: điểm, từng câu đúng/sai, giải thích.
    """
    # 1. Lấy bài kiểm tra
    result = await db.execute(
        select(BaiKiemTra).where(
            BaiKiemTra.MaBaiKiemTra == uuid.UUID(exam_id),
            BaiKiemTra.MaNguoiDung == uuid.UUID(user_id),
        )
    )
    exam = result.scalar_one_or_none()
    if not exam:
        return None

    # 2. Lấy tất cả chi tiết làm bài
    result = await db.execute(
        select(ChiTietLamBai).where(
            ChiTietLamBai.MaBaiKiemTra == uuid.UUID(exam_id)
        )
    )
    details = result.scalars().all()

    # 3. Lấy câu hỏi gốc để có nội dung + giải thích
    question_ids = [d.MaCauHoi for d in details]
    result = await db.execute(
        select(NganHangCauHoi).where(NganHangCauHoi.MaCauHoi.in_(question_ids))
    )
    questions_map = {q.MaCauHoi: q for q in result.scalars().all()}

    # 4. Build chi tiết từng câu
    detail_list = []
    correct_count = 0
    for i, d in enumerate(details):
        q = questions_map.get(d.MaCauHoi)
        if not q:
            continue

        if d.LaCauDung:
            correct_count += 1

        detail_list.append({
            "index": i + 1,
            "question": q.NoiDung,
            "options": q.DSDapAn,
            "selected": d.LuaChon,
            "correct_answer": q.DapAnDung,
            "is_correct": d.LaCauDung,
            "explanation": q.GiaiThich or "",
            "skill": q.KyNang,
            "level": q.MucDo,
            "time_spent": d.ThoiGianLamCauHoi,
        })

    total = len(detail_list)
    score = float(exam.TongDiem) if exam.TongDiem else 0

    return {
        "exam_id": exam_id,
        "score": score,
        "correct_count": correct_count,
        "wrong_count": total - correct_count,
        "total_questions": total,
        "status": exam.TrangThai,
        "details": detail_list,
    }
