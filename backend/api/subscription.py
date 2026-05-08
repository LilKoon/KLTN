"""Subscription tier + rate limit + payment endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta, date
from typing import Optional, List
from uuid import UUID, uuid4
from pydantic import BaseModel

import database, models
from api.auth import get_current_user

router = APIRouter(prefix="/subscription", tags=["Subscription & Payment"])

# ─── Plan config ──────────────────────────────────────────────
BASE_LIMITS = {
    "chatbot":       10,   # /day
    "ai_test":       5,
    "ai_flashcard":  5,
    "learning_path": 1,
}

PLAN_MULTIPLIER = {"FREE": 1, "PRO": 5, "ULTRA": 10}

PLAN_PRICES = {  # VNĐ / tháng
    "FREE":  0,
    "PRO":   99000,
    "ULTRA": 199000,
}

PLAN_INFO = {
    "FREE": {
        "ten_goi": "Free",
        "gia_thang": 0,
        "mo_ta": "Trải nghiệm cơ bản",
        "tinh_nang": [
            "Chatbot AI: 10 lượt/ngày",
            "Tạo bài test AI: 5 lượt/ngày",
            "Tạo flashcard AI: 5 lượt/ngày",
            "Tạo lộ trình học: 1 lượt/ngày",
            "Truy cập tất cả bài học cốt lõi",
        ],
    },
    "PRO": {
        "ten_goi": "Pro",
        "gia_thang": PLAN_PRICES["PRO"],
        "mo_ta": "Cho học viên nghiêm túc — tăng 5x giới hạn AI",
        "tinh_nang": [
            "Chatbot AI: 50 lượt/ngày (x5)",
            "Tạo bài test AI: 25 lượt/ngày (x5)",
            "Tạo flashcard AI: 25 lượt/ngày (x5)",
            "Tạo lộ trình học: 5 lượt/ngày (x5)",
            "Hỗ trợ ưu tiên",
        ],
    },
    "ULTRA": {
        "ten_goi": "Ultra",
        "gia_thang": PLAN_PRICES["ULTRA"],
        "mo_ta": "Toàn bộ tính năng AI x10 — phù hợp luyện thi tập trung",
        "tinh_nang": [
            "Chatbot AI: 100 lượt/ngày (x10)",
            "Tạo bài test AI: 50 lượt/ngày (x10)",
            "Tạo flashcard AI: 50 lượt/ngày (x10)",
            "Tạo lộ trình học: 10 lượt/ngày (x10)",
            "Hỗ trợ 24/7 + tư vấn riêng",
        ],
    },
}

ALLOWED_PLANS = {"PRO", "ULTRA"}
ALLOWED_PAYMENTS = {"CARD", "BANK", "MOMO", "ZALOPAY", "TEST"}


# ─── Helpers ──────────────────────────────────────────────────
def _current_plan(user: models.NguoiDung) -> str:
    """Return effective plan: nếu hết hạn thì rớt về FREE."""
    if not user.GoiDangKy or user.GoiDangKy == "FREE":
        return "FREE"
    if user.GoiHetHan and user.GoiHetHan < datetime.utcnow():
        return "FREE"
    return user.GoiDangKy.upper()


def _limit_for(plan: str, feature: str) -> int:
    return BASE_LIMITS.get(feature, 0) * PLAN_MULTIPLIER.get(plan.upper(), 1)


def check_rate_limit(feature: str):
    """Dependency: raise 429 nếu vượt limit, tự tăng counter."""
    def _dep(
        current_user: models.NguoiDung = Depends(get_current_user),
        db: Session = Depends(database.get_db),
    ):
        if feature not in BASE_LIMITS:
            return current_user  # không track tính năng lạ
        plan = _current_plan(current_user)
        limit = _limit_for(plan, feature)
        if limit <= 0:
            raise HTTPException(429, detail=f"FEATURE_DISABLED:{feature}")

        today = date.today().isoformat()
        counter = db.query(models.RateLimitCounter).filter(
            models.RateLimitCounter.MaNguoiDung == current_user.MaNguoiDung,
            models.RateLimitCounter.TinhNang == feature,
            models.RateLimitCounter.Ngay == today,
        ).first()
        if not counter:
            counter = models.RateLimitCounter(
                MaNguoiDung=current_user.MaNguoiDung,
                TinhNang=feature,
                Ngay=today,
                SoLuong=0,
            )
            db.add(counter)
            db.flush()

        if counter.SoLuong >= limit:
            raise HTTPException(
                429,
                detail={
                    "code": "RATE_LIMIT_EXCEEDED",
                    "feature": feature,
                    "plan": plan,
                    "limit": limit,
                    "used": counter.SoLuong,
                    "message": f"Bạn đã hết lượt {feature} hôm nay ({counter.SoLuong}/{limit}). Nâng cấp gói để tăng giới hạn.",
                },
            )
        counter.SoLuong += 1
        db.commit()
        return current_user
    return _dep


# ─── Schemas ──────────────────────────────────────────────────
class UpgradeRequest(BaseModel):
    goi: str               # PRO | ULTRA
    so_thang: int = 1
    phuong_thuc: str       # CARD | BANK | MOMO | ZALOPAY | TEST
    ghi_chu: Optional[str] = None


# ─── Endpoints ────────────────────────────────────────────────
@router.get("/plans")
def get_plans():
    return PLAN_INFO


@router.get("/me")
def get_my_subscription(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    plan = _current_plan(current_user)
    today = date.today().isoformat()
    rows = db.query(models.RateLimitCounter).filter(
        models.RateLimitCounter.MaNguoiDung == current_user.MaNguoiDung,
        models.RateLimitCounter.Ngay == today,
    ).all()
    used = {r.TinhNang: r.SoLuong for r in rows}
    usage = {}
    for f in BASE_LIMITS.keys():
        limit = _limit_for(plan, f)
        usage[f] = {"used": used.get(f, 0), "limit": limit, "remaining": max(0, limit - used.get(f, 0))}
    return {
        "plan": plan,
        "expires_at": current_user.GoiHetHan.isoformat() if current_user.GoiHetHan else None,
        "info": PLAN_INFO.get(plan, PLAN_INFO["FREE"]),
        "usage": usage,
    }


@router.post("/upgrade")
def upgrade_plan(
    payload: UpgradeRequest,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    goi = payload.goi.upper()
    method = payload.phuong_thuc.upper()
    if goi not in ALLOWED_PLANS:
        raise HTTPException(400, "Gói không hợp lệ")
    if method not in ALLOWED_PAYMENTS:
        raise HTTPException(400, "Phương thức thanh toán không hợp lệ")
    if payload.so_thang < 1 or payload.so_thang > 24:
        raise HTTPException(400, "Số tháng phải 1–24")

    so_tien = PLAN_PRICES[goi] * payload.so_thang
    txn = models.GiaoDich(
        MaNguoiDung=current_user.MaNguoiDung,
        Goi=goi,
        SoThang=payload.so_thang,
        SoTien=so_tien,
        PhuongThuc=method,
        TrangThai='PENDING',
        GhiChu=payload.ghi_chu,
    )
    db.add(txn)
    db.flush()

    # Auto-confirm khi method = TEST hoặc CARD (mock card sandbox)
    auto_complete = method in ("TEST", "CARD", "MOMO", "ZALOPAY")
    if auto_complete:
        txn.TrangThai = 'COMPLETED'
        # Apply tier
        now = datetime.utcnow()
        base = current_user.GoiHetHan if (current_user.GoiHetHan and current_user.GoiHetHan > now and current_user.GoiDangKy == goi) else now
        current_user.GoiDangKy = goi
        current_user.GoiHetHan = base + timedelta(days=30 * payload.so_thang)

    # Notify admin
    try:
        notif = models.ThongBao(
            TieuDe=f"Giao dịch mới: {goi} ({payload.so_thang} tháng) — {so_tien:,}đ",
            NoiDung=f"Người dùng {current_user.Email} đăng ký gói {goi} qua {method}. Trạng thái: {txn.TrangThai}.",
            DoiTuongNhan='ADMIN',
            MaNguoiTao=current_user.MaNguoiDung,
        )
        db.add(notif)
    except Exception:
        pass

    db.commit()
    db.refresh(txn)
    return {
        "MaGiaoDich": str(txn.MaGiaoDich),
        "Goi": txn.Goi,
        "SoTien": txn.SoTien,
        "PhuongThuc": txn.PhuongThuc,
        "TrangThai": txn.TrangThai,
        "current_plan": _current_plan(current_user),
        "expires_at": current_user.GoiHetHan.isoformat() if current_user.GoiHetHan else None,
    }


@router.get("/transactions/me")
def my_transactions(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    rows = db.query(models.GiaoDich).filter(
        models.GiaoDich.MaNguoiDung == current_user.MaNguoiDung
    ).order_by(desc(models.GiaoDich.NgayTao)).all()
    return [
        {
            "MaGiaoDich": str(r.MaGiaoDich),
            "Goi": r.Goi, "SoThang": r.SoThang, "SoTien": r.SoTien,
            "PhuongThuc": r.PhuongThuc, "TrangThai": r.TrangThai,
            "NgayTao": r.NgayTao.isoformat() if r.NgayTao else None,
        }
        for r in rows
    ]
