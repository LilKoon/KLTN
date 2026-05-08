"""Admin API: quản lý người dùng, đánh giá, thông báo, hoạt động, cấu hình."""
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from uuid import UUID, uuid4
from datetime import datetime, timedelta
from typing import Optional, List
import os
import re

import database, models, schemas
from api.auth import get_current_user

ALLOWED_MATERIAL_TYPES = {"GRAMMAR", "VOCABULARY", "LISTENING", "READING", "WRITING", "SPEAKING", "OTHER"}
MATERIALS_DIR = os.path.join("static", "materials")
MAX_MATERIAL_SIZE = 30 * 1024 * 1024  # 30MB

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(current_user: models.NguoiDung = Depends(get_current_user)):
    """Chặn truy cập nếu user không phải ADMIN."""
    if current_user.VaiTro != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ ADMIN mới được truy cập",
        )
    return current_user


def _log(db: Session, admin: models.NguoiDung, request: Optional[Request], action: str,
         doi_tuong: Optional[str] = None, chi_tiet: Optional[dict] = None):
    """Ghi nhật ký hành động admin (best-effort, không raise)."""
    try:
        ip = request.client.host if request and request.client else None
        ua = request.headers.get("user-agent") if request else None
        db.add(models.NhatKyHoatDong(
            MaNguoiDung=admin.MaNguoiDung,
            HanhDong=action,
            DoiTuong=doi_tuong,
            ChiTiet=chi_tiet,
            DiaChiIP=ip,
            UserAgent=ua,
        ))
        db.commit()
    except Exception:
        db.rollback()


# -------------------- DASHBOARD --------------------

@router.get("/dashboard/stats", response_model=schemas.AdminDashboardStats)
def get_dashboard_stats(
    db: Session = Depends(database.get_db),
    _: models.NguoiDung = Depends(require_admin),
):
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    online_window = now - timedelta(minutes=15)

    total_users = db.query(func.count(models.NguoiDung.MaNguoiDung)).filter(models.NguoiDung.VaiTro == "USER").scalar() or 0
    total_admins = db.query(func.count(models.NguoiDung.MaNguoiDung)).filter(models.NguoiDung.VaiTro == "ADMIN").scalar() or 0
    active_users = db.query(func.count(models.NguoiDung.MaNguoiDung)).filter(models.NguoiDung.TrangThai == "ACTIVE").scalar() or 0
    banned_users = db.query(func.count(models.NguoiDung.MaNguoiDung)).filter(models.NguoiDung.TrangThai == "BANNED").scalar() or 0
    total_courses = db.query(func.count(models.KhoaHoc.MaKhoaHoc)).scalar() or 0
    total_lessons = db.query(func.count(models.BaiHoc.MaBaiHoc)).scalar() or 0
    total_questions = db.query(func.count(models.NganHangCauHoi.MaCauHoi)).scalar() or 0
    total_flashcard_decks = db.query(func.count(models.BoDTheFlashcard.MaBoDe)).scalar() or 0
    pending_reviews = db.query(func.count(models.DanhGia.MaDanhGia)).filter(models.DanhGia.TrangThai == "PENDING").scalar() or 0
    new_users_today = db.query(func.count(models.NguoiDung.MaNguoiDung)).filter(models.NguoiDung.NgayTao >= today_start).scalar() or 0
    activity_count = db.query(func.count(models.NhatKyHoatDong.MaNhatKy)).scalar() or 0
    online_users = db.query(func.count(func.distinct(models.NhatKyHoatDong.MaNguoiDung))).filter(
        models.NhatKyHoatDong.NgayTao >= online_window
    ).scalar() or 0

    return schemas.AdminDashboardStats(
        total_users=total_users,
        total_admins=total_admins,
        active_users=active_users,
        banned_users=banned_users,
        total_courses=total_courses,
        total_lessons=total_lessons,
        total_questions=total_questions,
        total_flashcard_decks=total_flashcard_decks,
        pending_reviews=pending_reviews,
        new_users_today=new_users_today,
        online_users=online_users,
        activity_count=activity_count,
    )


# -------------------- USERS --------------------

@router.get("/users", response_model=List[schemas.AdminUserListItem])
def list_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    role: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(database.get_db),
    _: models.NguoiDung = Depends(require_admin),
):
    q = db.query(models.NguoiDung)
    if search:
        like = f"%{search}%"
        q = q.filter((models.NguoiDung.TenNguoiDung.ilike(like)) | (models.NguoiDung.Email.ilike(like)))
    if role and role.upper() in ("USER", "ADMIN"):
        q = q.filter(models.NguoiDung.VaiTro == role.upper())
    if status_filter and status_filter.upper() in ("ACTIVE", "BANNED", "BLOCKED"):
        q = q.filter(models.NguoiDung.TrangThai == status_filter.upper())
    return q.order_by(desc(models.NguoiDung.NgayTao)).offset(skip).limit(limit).all()


@router.patch("/users/{user_id}", response_model=schemas.AdminUserListItem)
def update_user(
    user_id: UUID,
    payload: schemas.AdminUserUpdate,
    request: Request,
    db: Session = Depends(database.get_db),
    admin: models.NguoiDung = Depends(require_admin),
):
    user = db.query(models.NguoiDung).filter(models.NguoiDung.MaNguoiDung == user_id).first()
    if not user:
        raise HTTPException(404, "Không tìm thấy người dùng")
    if payload.TenNguoiDung:
        user.TenNguoiDung = payload.TenNguoiDung
    if payload.Email and payload.Email != user.Email:
        existed = db.query(models.NguoiDung).filter(
            models.NguoiDung.Email == payload.Email,
            models.NguoiDung.MaNguoiDung != user_id,
        ).first()
        if existed:
            raise HTTPException(400, "Email đã tồn tại")
        user.Email = payload.Email
    if payload.MatKhau:
        if len(payload.MatKhau) < 6:
            raise HTTPException(400, "Mật khẩu phải ≥ 6 ký tự")
        from api.auth import get_password_hash
        user.MatKhau = get_password_hash(payload.MatKhau)
    if payload.VaiTro:
        v = payload.VaiTro.upper()
        if v not in ("USER", "ADMIN"):
            raise HTTPException(400, "Vai trò không hợp lệ")
        user.VaiTro = v
    if payload.TrangThai:
        s = payload.TrangThai.upper()
        if s not in ("ACTIVE", "BANNED", "BLOCKED"):
            raise HTTPException(400, "Trạng thái không hợp lệ")
        # Lưu nguyên giá trị FE gửi (ACTIVE/BANNED/BLOCKED) — FE đã handle các giá trị này
        user.TrangThai = s
    db.commit()
    db.refresh(user)
    log_payload = payload.model_dump(exclude_none=True)
    log_payload.pop("MatKhau", None)  # đừng log password
    _log(db, admin, request, "UPDATE_USER", str(user_id), log_payload)
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: UUID,
    request: Request,
    db: Session = Depends(database.get_db),
    admin: models.NguoiDung = Depends(require_admin),
):
    if user_id == admin.MaNguoiDung:
        raise HTTPException(400, "Không thể tự xoá tài khoản của chính bạn")
    user = db.query(models.NguoiDung).filter(models.NguoiDung.MaNguoiDung == user_id).first()
    if not user:
        raise HTTPException(404, "Không tìm thấy người dùng")
    db.delete(user)
    db.commit()
    _log(db, admin, request, "DELETE_USER", str(user_id))
    return {"message": "Đã xoá người dùng"}


# -------------------- REVIEWS --------------------

@router.get("/reviews", response_model=List[schemas.DanhGiaResponse])
def list_reviews(
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    _: models.NguoiDung = Depends(require_admin),
):
    q = db.query(models.DanhGia)
    if status_filter:
        q = q.filter(models.DanhGia.TrangThai == status_filter.upper())
    return q.order_by(desc(models.DanhGia.NgayTao)).offset(skip).limit(limit).all()


@router.post("/reviews", response_model=schemas.DanhGiaResponse)
def create_review_as_user(
    payload: schemas.DanhGiaCreate,
    db: Session = Depends(database.get_db),
    current_user: models.NguoiDung = Depends(get_current_user),
):
    """User tạo đánh giá - không cần quyền admin để tạo, nhưng admin duyệt."""
    review = models.DanhGia(
        MaNguoiDung=current_user.MaNguoiDung,
        LoaiDoiTuong=payload.LoaiDoiTuong,
        MaDoiTuong=payload.MaDoiTuong,
        DiemDanhGia=payload.DiemDanhGia,
        NoiDung=payload.NoiDung,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.patch("/reviews/{review_id}", response_model=schemas.DanhGiaResponse)
def moderate_review(
    review_id: UUID,
    payload: schemas.DanhGiaModerate,
    request: Request,
    db: Session = Depends(database.get_db),
    admin: models.NguoiDung = Depends(require_admin),
):
    if payload.TrangThai.upper() not in ("APPROVED", "REJECTED", "PENDING"):
        raise HTTPException(400, "Trạng thái không hợp lệ")
    review = db.query(models.DanhGia).filter(models.DanhGia.MaDanhGia == review_id).first()
    if not review:
        raise HTTPException(404, "Không tìm thấy đánh giá")
    review.TrangThai = payload.TrangThai.upper()
    review.NgayDuyet = datetime.utcnow()
    review.MaAdminDuyet = admin.MaNguoiDung
    db.commit()
    db.refresh(review)
    _log(db, admin, request, "MODERATE_REVIEW", str(review_id), {"status": review.TrangThai})
    return review


@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: UUID,
    request: Request,
    db: Session = Depends(database.get_db),
    admin: models.NguoiDung = Depends(require_admin),
):
    review = db.query(models.DanhGia).filter(models.DanhGia.MaDanhGia == review_id).first()
    if not review:
        raise HTTPException(404, "Không tìm thấy đánh giá")
    db.delete(review)
    db.commit()
    _log(db, admin, request, "DELETE_REVIEW", str(review_id))
    return {"message": "Đã xoá đánh giá"}


# -------------------- NOTIFICATIONS --------------------

@router.get("/notifications", response_model=List[schemas.ThongBaoResponse])
def list_notifications(
    db: Session = Depends(database.get_db),
    _: models.NguoiDung = Depends(require_admin),
):
    return db.query(models.ThongBao).order_by(desc(models.ThongBao.NgayTao)).all()


@router.post("/notifications", response_model=schemas.ThongBaoResponse)
def create_notification(
    payload: schemas.ThongBaoCreate,
    request: Request,
    db: Session = Depends(database.get_db),
    admin: models.NguoiDung = Depends(require_admin),
):
    target = (payload.DoiTuongNhan or "ALL").upper()
    if target not in ("ALL", "USER", "ADMIN"):
        raise HTTPException(400, "Đối tượng nhận không hợp lệ")
    n = models.ThongBao(
        TieuDe=payload.TieuDe,
        NoiDung=payload.NoiDung,
        DoiTuongNhan=target,
        MaNguoiTao=admin.MaNguoiDung,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    _log(db, admin, request, "CREATE_NOTIFICATION", str(n.MaThongBao))
    return n


@router.delete("/notifications/{notif_id}")
def delete_notification(
    notif_id: UUID,
    request: Request,
    db: Session = Depends(database.get_db),
    admin: models.NguoiDung = Depends(require_admin),
):
    n = db.query(models.ThongBao).filter(models.ThongBao.MaThongBao == notif_id).first()
    if not n:
        raise HTTPException(404, "Không tìm thấy thông báo")
    db.delete(n)
    db.commit()
    _log(db, admin, request, "DELETE_NOTIFICATION", str(notif_id))
    return {"message": "Đã xoá thông báo"}


# -------------------- ACTIVITY LOG --------------------

@router.get("/activity", response_model=List[schemas.NhatKyResponse])
def list_activity(
    skip: int = 0,
    limit: int = 200,
    user_id: Optional[UUID] = None,
    db: Session = Depends(database.get_db),
    _: models.NguoiDung = Depends(require_admin),
):
    q = (
        db.query(models.NhatKyHoatDong, models.NguoiDung.TenNguoiDung)
        .outerjoin(models.NguoiDung, models.NguoiDung.MaNguoiDung == models.NhatKyHoatDong.MaNguoiDung)
    )
    if user_id:
        q = q.filter(models.NhatKyHoatDong.MaNguoiDung == user_id)
    rows = q.order_by(desc(models.NhatKyHoatDong.NgayTao)).offset(skip).limit(limit).all()

    out = []
    for log, ten in rows:
        noi_dung = log.HanhDong + (f" · {log.DoiTuong}" if log.DoiTuong else "")
        out.append(schemas.NhatKyResponse(
            MaNhatKy=log.MaNhatKy,
            MaLog=log.MaNhatKy,
            MaNguoiDung=log.MaNguoiDung,
            TenNguoiDung=ten or "Hệ thống",
            HanhDong=log.HanhDong,
            NoiDung=noi_dung,
            DoiTuong=log.DoiTuong,
            ChiTiet=log.ChiTiet,
            DiaChiIP=log.DiaChiIP,
            NgayTao=log.NgayTao,
        ))
    return out


# Alias FE-friendly: /admin/activity-logs gọi cùng handler
@router.get("/activity-logs", response_model=List[schemas.NhatKyResponse])
def list_activity_logs(
    skip: int = 0,
    limit: int = 200,
    user_id: Optional[UUID] = None,
    db: Session = Depends(database.get_db),
    admin: models.NguoiDung = Depends(require_admin),
):
    return list_activity(skip=skip, limit=limit, user_id=user_id, db=db, _=admin)


# -------------------- SETTINGS --------------------

@router.get("/settings", response_model=List[schemas.CauHinhItem])
def list_settings(
    db: Session = Depends(database.get_db),
    _: models.NguoiDung = Depends(require_admin),
):
    return db.query(models.CauHinhHeThong).order_by(models.CauHinhHeThong.Khoa).all()


@router.put("/settings/{khoa}", response_model=schemas.CauHinhItem)
def upsert_setting(
    khoa: str,
    payload: schemas.CauHinhUpdate,
    request: Request,
    db: Session = Depends(database.get_db),
    admin: models.NguoiDung = Depends(require_admin),
):
    item = db.query(models.CauHinhHeThong).filter(models.CauHinhHeThong.Khoa == khoa).first()
    if not item:
        item = models.CauHinhHeThong(Khoa=khoa)
        db.add(item)
    if payload.GiaTri is not None:
        item.GiaTri = payload.GiaTri
    if payload.MoTa is not None:
        item.MoTa = payload.MoTa
    db.commit()
    db.refresh(item)
    _log(db, admin, request, "UPDATE_SETTING", khoa, {"value": item.GiaTri})
    return item


# -------------------- SYSTEM FLASHCARDS --------------------

@router.get("/system-flashcards", response_model=List[schemas.DeckResponse])
def list_system_decks(
    db: Session = Depends(database.get_db),
    _: models.NguoiDung = Depends(require_admin),
):
    decks = db.query(models.BoDTheFlashcard).filter(models.BoDTheFlashcard.LaHeThong == True).order_by(desc(models.BoDTheFlashcard.NgayTao)).all()
    return [
        schemas.DeckResponse(
            id=d.MaBoDe,
            topic=d.TenBoDe,
            level=d.CapDo,
            count=d.SoLuongThe,
            created_at=d.NgayTao,
            due_today=0,
        )
        for d in decks
    ]


@router.post("/system-flashcards", response_model=schemas.DeckResponse)
def create_system_deck(
    payload: schemas.SystemDeckCreate,
    request: Request,
    db: Session = Depends(database.get_db),
    admin: models.NguoiDung = Depends(require_admin),
):
    deck = models.BoDTheFlashcard(
        MaNguoiDung=admin.MaNguoiDung,
        TenBoDe=payload.TenBoDe,
        CapDo=payload.CapDo,
        SoLuongThe=len(payload.cards),
        DuLieuThe=[c.model_dump() for c in payload.cards],
        LaHeThong=True,
    )
    db.add(deck)
    db.commit()
    db.refresh(deck)
    _log(db, admin, request, "CREATE_SYSTEM_DECK", str(deck.MaBoDe))
    return schemas.DeckResponse(
        id=deck.MaBoDe,
        topic=deck.TenBoDe,
        level=deck.CapDo,
        count=deck.SoLuongThe,
        created_at=deck.NgayTao,
        due_today=0,
    )


@router.delete("/system-flashcards/{deck_id}")
def delete_system_deck(
    deck_id: UUID,
    request: Request,
    db: Session = Depends(database.get_db),
    admin: models.NguoiDung = Depends(require_admin),
):
    deck = db.query(models.BoDTheFlashcard).filter(
        models.BoDTheFlashcard.MaBoDe == deck_id,
        models.BoDTheFlashcard.LaHeThong == True,
    ).first()
    if not deck:
        raise HTTPException(404, "Không tìm thấy bộ thẻ hệ thống")
    db.delete(deck)
    db.commit()
    _log(db, admin, request, "DELETE_SYSTEM_DECK", str(deck_id))
    return {"message": "Đã xoá bộ thẻ hệ thống"}


# -------------------- LEARNING MATERIALS (KHO TÀI LIỆU) --------------------

def _safe_filename(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", name)[:120] or "file"


@router.get("/materials", response_model=List[schemas.TaiLieuResponse])
def list_materials_admin(
    loai: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(database.get_db),
    _: models.NguoiDung = Depends(require_admin),
):
    q = db.query(models.TaiLieuHocTap).filter(models.TaiLieuHocTap.TrangThai == 'ACTIVE')
    if loai and loai.upper() in ALLOWED_MATERIAL_TYPES:
        q = q.filter(models.TaiLieuHocTap.LoaiTaiLieu == loai.upper())
    if search:
        like = f"%{search}%"
        q = q.filter((models.TaiLieuHocTap.TenTaiLieu.ilike(like)) | (models.TaiLieuHocTap.MoTa.ilike(like)))
    return q.order_by(desc(models.TaiLieuHocTap.NgayTao)).all()


@router.post("/materials", response_model=schemas.TaiLieuResponse)
async def upload_material(
    request: Request,
    file: UploadFile = File(...),
    TenTaiLieu: str = Form(...),
    MoTa: Optional[str] = Form(None),
    LoaiTaiLieu: str = Form('OTHER'),
    db: Session = Depends(database.get_db),
    admin: models.NguoiDung = Depends(require_admin),
):
    loai = (LoaiTaiLieu or 'OTHER').upper()
    if loai not in ALLOWED_MATERIAL_TYPES:
        raise HTTPException(400, f"Loại tài liệu không hợp lệ. Chấp nhận: {sorted(ALLOWED_MATERIAL_TYPES)}")

    os.makedirs(MATERIALS_DIR, exist_ok=True)
    raw = await file.read()
    if len(raw) > MAX_MATERIAL_SIZE:
        raise HTTPException(400, "File quá lớn (giới hạn 30MB)")

    ext = os.path.splitext(file.filename or '')[1].lower().lstrip('.') or 'bin'
    saved_name = f"{uuid4().hex}_{_safe_filename(file.filename or 'file')}"
    saved_path = os.path.join(MATERIALS_DIR, saved_name)
    with open(saved_path, "wb") as f:
        f.write(raw)

    item = models.TaiLieuHocTap(
        TenTaiLieu=TenTaiLieu,
        MoTa=MoTa,
        LoaiTaiLieu=loai,
        LoaiFile=ext,
        DungLuong=len(raw),
        DuongDan=f"/static/materials/{saved_name}",
        MaNguoiTaiLen=admin.MaNguoiDung,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    _log(db, admin, request, "UPLOAD_MATERIAL", str(item.MaTaiLieu), {"loai": loai, "ten": TenTaiLieu})
    return item


@router.delete("/materials/{mat_id}")
def delete_material(
    mat_id: UUID,
    request: Request,
    db: Session = Depends(database.get_db),
    admin: models.NguoiDung = Depends(require_admin),
):
    item = db.query(models.TaiLieuHocTap).filter(models.TaiLieuHocTap.MaTaiLieu == mat_id).first()
    if not item:
        raise HTTPException(404, "Không tìm thấy tài liệu")
    # xoá file vật lý
    if item.DuongDan and item.DuongDan.startswith("/static/"):
        local = item.DuongDan[len("/static/"):]
        full = os.path.join("static", local)
        try:
            if os.path.exists(full):
                os.remove(full)
        except OSError:
            pass
    db.delete(item)
    db.commit()
    _log(db, admin, request, "DELETE_MATERIAL", str(mat_id))
    return {"message": "Đã xoá tài liệu"}
