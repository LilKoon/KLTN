"""
Spaced Repetition cho câu hỏi MCQ — biến thể SM-2.

Map MCQ correctness + thời gian → quality score 0..5:
    is_correct=False           → q=1
    is_correct=True, t > 30s  → q=3 (đúng nhưng chậm — khó)
    is_correct=True, t 10-30s → q=4 (đúng bình thường)
    is_correct=True, t < 10s  → q=5 (đúng + nhanh — master)
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

import models


def _quality(is_correct: bool, time_seconds: Optional[int]) -> int:
    if not is_correct:
        return 1
    t = time_seconds or 15
    if t < 10:
        return 5
    if t <= 30:
        return 4
    return 3


def update_sr(db: Session, user_id: UUID, ma_cau_hoi: UUID,
              is_correct: bool, time_seconds: Optional[int] = None) -> None:
    """Cập nhật SM-2 state cho 1 (user, question) pair. Tạo row mới nếu chưa có."""
    q = _quality(is_correct, time_seconds)
    now = datetime.utcnow()

    sr = db.query(models.CauHoiSR).filter(
        models.CauHoiSR.MaNguoiDung == user_id,
        models.CauHoiSR.MaCauHoi == ma_cau_hoi,
    ).first()

    if sr is None:
        sr = models.CauHoiSR(
            MaNguoiDung=user_id,
            MaCauHoi=ma_cau_hoi,
            EasinessFactor=2.5,
            Interval=0,
            Repetitions=0,
            NextDue=now,
            LastSeen=now,
        )
        db.add(sr)

    # SM-2 update
    if q < 3:
        sr.Repetitions = 0
        sr.Interval = 1
    else:
        if (sr.Repetitions or 0) == 0:
            sr.Interval = 1
        elif sr.Repetitions == 1:
            sr.Interval = 6
        else:
            sr.Interval = max(1, int(round((sr.Interval or 1) * (sr.EasinessFactor or 2.5))))
        sr.Repetitions = (sr.Repetitions or 0) + 1

    # EF update
    ef = (sr.EasinessFactor or 2.5) + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    sr.EasinessFactor = max(1.3, ef)

    sr.NextDue = now + timedelta(days=int(sr.Interval))
    sr.LastSeen = now


def refresh_question_difficulty(db: Session, ma_cau_hois: list) -> None:
    """Tính lại DoKho cho danh sách câu hỏi từ p-value lịch sử.
    Gọi sau khi submit để DoKho bám sát realtime data.
    """
    if not ma_cau_hois:
        return
    from sqlalchemy import text
    db.execute(text("""
        WITH stats AS (
            SELECT ct."MaCauHoi" AS mch, AVG(CASE WHEN ct."LaCauDung" THEN 1.0 ELSE 0.0 END) AS p_correct
            FROM "chi_tiet_lam_bai" ct
            WHERE ct."MaCauHoi" = ANY(CAST(:ids AS uuid[]))
            GROUP BY ct."MaCauHoi"
        )
        UPDATE "ngan_hang_cau_hoi" nh
        SET "DoKho" = GREATEST(0.05, LEAST(0.95, 1.0 - s.p_correct))
        FROM stats s
        WHERE nh."MaCauHoi" = s.mch
    """), {"ids": [str(x) for x in ma_cau_hois]})


def get_due_question_ids(db: Session, user_id: UUID, limit: int = 100,
                         skill: Optional[str] = None) -> list:
    """Trả list MaCauHoi đến hạn ôn (NextDue ≤ now), prioritize Interval thấp."""
    now = datetime.utcnow()
    q = db.query(models.CauHoiSR).filter(
        models.CauHoiSR.MaNguoiDung == user_id,
        models.CauHoiSR.NextDue <= now,
    )
    if skill:
        q = q.join(models.NganHangCauHoi, models.NganHangCauHoi.MaCauHoi == models.CauHoiSR.MaCauHoi)\
             .filter(models.NganHangCauHoi.KyNang == skill)
    rows = q.order_by(models.CauHoiSR.Interval.asc(), models.CauHoiSR.NextDue.asc()).limit(limit).all()
    return [r.MaCauHoi for r in rows]
