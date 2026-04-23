"""
exam_service.py — Business logic cho bài kiểm tra đầu vào.
Chỉ cần sửa EXAM_CONFIG hoặc hàm fetch_random_questions().
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sql_func, any_
from app.core.models import NganHangCauHoi, BaiKiemTra, ChiTietLamBai, PhanKiemTra
import uuid
import asyncio
import google.generativeai as genai
from app.core.config import settings

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)



# CẤU HÌNH BÀI THI — Sửa ở đây khi thêm kỹ năng hoặc đổi số câu

EXAM_CONFIG = {
    "total_questions": 30,
    "time_limit_minutes": 30,
    "distribution": [
        # Mỗi entry: kỹ năng + số câu theo từng level
        # Thêm kỹ năng mới Chỉ cần thêm 1 dòng ở đây
        {"skill": "GRAMMAR", "levels": {1: 4, 2: 3, 3: 3}},
        {"skill": "VOCABULARY", "levels": {1: 4, 2: 3, 3: 3}},
        {"skill": "LISTENING", "levels": {1: 10, 2: 0, 3: 0}},
    ]
}



# LẤY CÂU HỎI NGẪU NHIÊN

async def fetch_random_questions(db: AsyncSession, purpose: str = "DAU_VAO") -> list:
    all_questions = []

    for entry in EXAM_CONFIG["distribution"]:
        skill = entry["skill"]
        for level, count in entry["levels"].items():
            if count == 0:
                continue
            # Query: lấy ngẫu nhiên `count` câu theo skill + level + mục đích
            # any_() tương đương: WHERE 'DAU_VAO' = ANY(mucdichsudung)
            conditions = [
                NganHangCauHoi.KyNang == skill,
                NganHangCauHoi.MucDo == level,
                NganHangCauHoi.MucDichSuDung.contains([purpose]),
            ]
            if skill == "LISTENING":
                conditions.append(NganHangCauHoi.FileAudioDinhKem.is_not(None))
                conditions.append(NganHangCauHoi.FileAudioDinhKem != "")
                conditions.append(NganHangCauHoi.FileAudioDinhKem != "null")

            result = await db.execute(
                select(NganHangCauHoi)
                .where(*conditions)
                .order_by(sql_func.random())
                .limit(count)
            )
            questions = result.scalars().all()
            all_questions.extend(questions)

    return all_questions


# TẠO BÀI KIỂM TRA MỚI

async def create_exam(db: AsyncSession, user_id: str, exam_type: str = "DAU_VAO") -> dict:
    """
    Tạo bài kiểm tra mới + lấy câu hỏi ngẫu nhiên.
    exam_type: 'DAU_VAO' hoặc 'FINAL'
    """
    # 0a. Kiểm tra đã COMPLETED chưa (chỉ check logic DAU_VAO)
    if exam_type == "DAU_VAO":
        result = await db.execute(
            select(BaiKiemTra).where(
                BaiKiemTra.MaNguoiDung == uuid.UUID(user_id),
                BaiKiemTra.LoaiBaiKiemTra == exam_type,
                BaiKiemTra.TrangThai == "COMPLETED"
            ).order_by(BaiKiemTra.CreatedAt.desc())
        )
        existing_exam = result.scalars().first()
        if existing_exam:
            return {
                "already_completed": True,
                "exam_id": str(existing_exam.MaBaiKiemTra)
            }
    # 0b. Nếu có bài IN_PROGRESS → reuse, không tạo mới
    result = await db.execute(
        select(BaiKiemTra).where(
            BaiKiemTra.MaNguoiDung == uuid.UUID(user_id),
            BaiKiemTra.LoaiBaiKiemTra == exam_type,
            BaiKiemTra.TrangThai == "IN_PROGRESS"
        ).order_by(BaiKiemTra.CreatedAt.desc())
    )
    in_progress_exam = result.scalars().first()
    if in_progress_exam:
        # Lấy lại câu hỏi từ ChiTietLamBai (nếu có) hoặc generate mới
        result2 = await db.execute(
            select(ChiTietLamBai).where(
                ChiTietLamBai.MaBaiKiemTra == in_progress_exam.MaBaiKiemTra
            )
        )
        existing_details = result2.scalars().all()
        if existing_details:
            # Reuse: lấy câu hỏi gốc từ chi tiết đã có
            qids = [d.MaCauHoi for d in existing_details]
            result3 = await db.execute(
                select(NganHangCauHoi).where(NganHangCauHoi.MaCauHoi.in_(qids))
            )
            qs_map = {q.MaCauHoi: q for q in result3.scalars().all()}
            questions_for_client = []
            for i, d in enumerate(existing_details):
                q = qs_map.get(d.MaCauHoi)
                if not q:
                    continue
                questions_for_client.append({
                    "question_id": str(q.MaCauHoi),
                    "index": i + 1,
                    "question": q.NoiDung,
                    "options": q.DSDapAn,
                    "skill": q.KyNang,
                    "level": q.MucDo,
                    "audio": q.FileAudioDinhKem,
                })
            return {
                "already_completed": False,
                "exam_id": str(in_progress_exam.MaBaiKiemTra),
                "questions": questions_for_client,
                "total_questions": len(questions_for_client),
                "time_limit_minutes": EXAM_CONFIG["time_limit_minutes"],
            }

    # 1. Lấy câu hỏi ngẫu nhiên
    purpose = "EXAM" if exam_type == "FINAL" else "DAU_VAO"
    questions = await fetch_random_questions(db, purpose=purpose)

    if not questions:
        return None

    # 2. Tạo record BaiKiemTra
    exam = BaiKiemTra(
        MaNguoiDung=uuid.UUID(user_id),
        LoaiBaiKiemTra=exam_type,
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
            "audio": q.FileAudioDinhKem,
        })

    return {
        "exam_id": str(exam.MaBaiKiemTra),
        "questions": questions_for_client,
        "total_questions": len(questions_for_client),
        "time_limit_minutes": EXAM_CONFIG["time_limit_minutes"],
    }


# CHẤM ĐIỂM & LƯU KẾT QUẢ

async def grade_exam(db: AsyncSession, exam_id: str, user_id: str, answers: list) -> dict:
    """
    Chấm điểm bài thi.
    answers = [
        {"question_id": "uuid-...", "selected": "A", "time_spent": 15},
        ...
    ]
     Để đổi cách tính điểm, chỉ cần sửa hàm này.
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

    # 3. Chấm từng câu, lưu ChiTietLamBai và gom nhóm theo kỹ năng
    correct_count = 0
    total = len(answers)
    skill_stats = {}

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

        skill = question.KyNang
        if skill not in skill_stats:
            skill_stats[skill] = {"correct": 0, "total": 0}
        
        skill_stats[skill]["total"] += 1
        if is_correct:
            skill_stats[skill]["correct"] += 1

        # Lưu chi tiết
        detail = ChiTietLamBai(
            MaBaiKiemTra=uuid.UUID(exam_id),
            MaCauHoi=uuid.UUID(q_id),
            LuaChon=selected,
            LaCauDung=is_correct,
            ThoiGianLamCauHoi=time_spent,
        )
        db.add(detail)

    # 4. Tính % từng kỹ năng và lưu vào PhanKiemTra
    final_skills = {}
    for skill, stats in skill_stats.items():
        pct = round((stats["correct"] / stats["total"]) * 100, 2) if stats["total"] > 0 else 0
        final_skills[skill] = pct
        pkt = PhanKiemTra(
            MaBaiKiemTra=uuid.UUID(exam_id),
            KyNang=skill,
            PhanTramDiem=pct,
        )
        db.add(pkt)

    # 5. Đánh giá sự tiến bộ nếu đây là bài FINAL test
    if exam.LoaiBaiKiemTra == "FINAL":
        res_dau_vao = await db.execute(
            select(BaiKiemTra).where(
                BaiKiemTra.MaNguoiDung == uuid.UUID(user_id),
                BaiKiemTra.LoaiBaiKiemTra == "DAU_VAO",
                BaiKiemTra.TrangThai == "COMPLETED"
            ).order_by(BaiKiemTra.CreatedAt.desc())
        )
        dau_vao_exam = res_dau_vao.scalars().first()
        
        dau_vao_skills = {}
        if dau_vao_exam:
            res_pk = await db.execute(
                select(PhanKiemTra).where(PhanKiemTra.MaBaiKiemTra == dau_vao_exam.MaBaiKiemTra)
            )
            dau_vao_pk = res_pk.scalars().all()
            dau_vao_skills = {pk.KyNang: float(pk.PhanTramDiem or 0) for pk in dau_vao_pk}

        prompt_lines = []
        for skill, curr_pct in final_skills.items():
            prev_pct = dau_vao_skills.get(skill)
            if prev_pct is not None:
                diff = curr_pct - prev_pct
                if diff > 0:
                    prompt_lines.append(f"{skill}: Tăng từ {prev_pct}% lên {curr_pct}%")
                elif diff < 0:
                    prompt_lines.append(f"{skill}: Giảm từ {prev_pct}% xuống {curr_pct}%")
                else:
                    prompt_lines.append(f"{skill}: Giữ nguyên {curr_pct}%")
            else:
                prompt_lines.append(f"{skill}: Đạt {curr_pct}% (Không có dữ liệu đầu vào)")

        prompt_str = "\n".join(prompt_lines)
        base_prompt = f"""Bạn là một chuyên gia đánh giá và giáo dục AI trong ứng dụng học tiếng anh Edtech. Một sinh viên vừa hoàn thành bài kiểm tra cuối khóa so với đánh giá sinh viên đó ở đầu vào. Dưới đây là sự thay đổi điểm phần trăm kỹ năng:
{prompt_str}

Hãy viết một nhận xét ngắn gọn (dưới 60 từ) bằng tiếng Việt. Bắt buộc nhận xét phải ấm áp, khích lệ. Nếu giảm thì khuyên tự tin và ôn tập lại nhé. Đừng lặp nguyên si các con số khô khan mà hãy biến tấu bằng lời nhận xét sinh động (tiến bộ vượt bậc, sụt giảm một chút xíu...)."""
        fallback_msg = "Hệ thống AI hiện chưa được cấu hình.\n"

        try:
            if settings.GEMINI_API_KEY:
                model = genai.GenerativeModel('gemini-flash-latest')
                response = await asyncio.to_thread(model.generate_content, base_prompt)
                exam.MoTaDanhGiaAI = response.text
            else:
                exam.MoTaDanhGiaAI = fallback_msg
        except Exception as e:
            print("Gemini Generation Error:", e)
            err_str = str(e).lower()
            if "quota" in err_str or "exhausted" in err_str or "429" in err_str:
                exam.MoTaDanhGiaAI = f"Hệ thống AI đang bị quá tải (Google Rate Limit), vui lòng nộp lại bài sau 1 phút! Dữ liệu gốc: {fallback_msg}"
            else:
                exam.MoTaDanhGiaAI = f"Kết nối đến AI bị gián đoạn. {fallback_msg}" + prompt_str

    # 6. Tính điểm tổng và cập nhật BaiKiemTra
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


# THÔNG TIN BÀI TEST FINAL (So sánh đầu vào)
async def get_final_test_info(db: AsyncSession, user_id: str) -> dict:
    """
    Lấy thông tin DAU_VAO làm baseline và lịch sử 10 bài FINAL tests
    """
    dau_vao_res = await db.execute(
        select(BaiKiemTra).where(
            BaiKiemTra.MaNguoiDung == uuid.UUID(user_id),
            BaiKiemTra.LoaiBaiKiemTra == "DAU_VAO",
            BaiKiemTra.TrangThai == "COMPLETED"
        ).order_by(BaiKiemTra.CreatedAt.desc())
    )
    dau_vao_exam = dau_vao_res.scalars().first()

    skills = {}
    if dau_vao_exam:
        res_pk = await db.execute(
            select(PhanKiemTra).where(PhanKiemTra.MaBaiKiemTra == dau_vao_exam.MaBaiKiemTra)
        )
        pk_list = res_pk.scalars().all()
        skills = {pk.KyNang: float(pk.PhanTramDiem or 0) for pk in pk_list}

    history_res = await db.execute(
        select(BaiKiemTra).where(
            BaiKiemTra.MaNguoiDung == uuid.UUID(user_id),
            BaiKiemTra.LoaiBaiKiemTra == "FINAL",
            BaiKiemTra.TrangThai == "COMPLETED"
        ).order_by(BaiKiemTra.CreatedAt.desc()).limit(10)
    )
    history_exams = history_res.scalars().all()
    history = []
    for h in history_exams:
        history.append({
            "exam_id": str(h.MaBaiKiemTra),
            "score": float(h.TongDiem or 0),
            "created_at": h.CreatedAt.isoformat() if h.CreatedAt else None
        })

    return {
        "has_dau_vao": True if dau_vao_exam else False,
        "dau_vao_exam_id": str(dau_vao_exam.MaBaiKiemTra) if dau_vao_exam else None,
        "dau_vao_score": float(dau_vao_exam.TongDiem or 0) if dau_vao_exam else 0,
        "skills": skills,
        "history": history
    }


# LẤY KẾT QUẢ CHI TIẾT
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
            "audio": q.FileAudioDinhKem,
        })

    total = len(detail_list)
    score = float(exam.TongDiem) if exam.TongDiem else 0

    comparison = None
    if exam.LoaiBaiKiemTra == "FINAL":
        res_dau_vao = await db.execute(
            select(BaiKiemTra).where(
                BaiKiemTra.MaNguoiDung == uuid.UUID(user_id),
                BaiKiemTra.LoaiBaiKiemTra == "DAU_VAO",
                BaiKiemTra.TrangThai == "COMPLETED"
            ).order_by(BaiKiemTra.CreatedAt.desc())
        )
        dau_vao_exam = res_dau_vao.scalars().first()
        if dau_vao_exam:
            # Lấy PhanKiemTra của cả 2 bài
            res_dv_pk = await db.execute(select(PhanKiemTra).where(PhanKiemTra.MaBaiKiemTra == dau_vao_exam.MaBaiKiemTra))
            dv_skills = {pk.KyNang: float(pk.PhanTramDiem or 0) for pk in res_dv_pk.scalars().all()}
            
            res_fn_pk = await db.execute(select(PhanKiemTra).where(PhanKiemTra.MaBaiKiemTra == exam.MaBaiKiemTra))
            fn_skills = {pk.KyNang: float(pk.PhanTramDiem or 0) for pk in res_fn_pk.scalars().all()}
            
            comparison = {}
            for skill, fn_pct in fn_skills.items():
                dv_pct = dv_skills.get(skill)
                if dv_pct is not None:
                    diff = fn_pct - dv_pct
                    status = "same"
                    if diff > 0: status = "increase"
                    elif diff < 0: status = "decrease"
                    comparison[skill] = {"status": status, "diff": round(abs(diff), 1), "old_pct": dv_pct, "new_pct": fn_pct}

    return {
        "exam_id": exam_id,
        "exam_type": exam.LoaiBaiKiemTra,
        "score": score,
        "correct_count": correct_count,
        "wrong_count": total - correct_count,
        "total_questions": total,
        "status": exam.TrangThai,
        "evaluation": exam.MoTaDanhGiaAI,
        "details": detail_list,
        "comparison": comparison
    }
