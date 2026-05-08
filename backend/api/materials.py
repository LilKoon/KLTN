"""User-facing read-only endpoint cho kho tài liệu admin upload."""
from fastapi import APIRouter, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session
from typing import Optional, List

import database, models, schemas

router = APIRouter(prefix="/materials", tags=["Tài liệu học tập"])

ALLOWED_TYPES = {"GRAMMAR", "VOCABULARY", "LISTENING", "READING", "WRITING", "SPEAKING", "OTHER"}


@router.get("", response_model=List[schemas.TaiLieuResponse])
def list_materials(
    loai: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(database.get_db),
):
    q = db.query(models.TaiLieuHocTap).filter(models.TaiLieuHocTap.TrangThai == 'ACTIVE')
    if loai and loai.upper() in ALLOWED_TYPES:
        q = q.filter(models.TaiLieuHocTap.LoaiTaiLieu == loai.upper())
    if search:
        like = f"%{search}%"
        q = q.filter(
            (models.TaiLieuHocTap.TenTaiLieu.ilike(like)) |
            (models.TaiLieuHocTap.MoTa.ilike(like))
        )
    return q.order_by(desc(models.TaiLieuHocTap.NgayTao)).all()
