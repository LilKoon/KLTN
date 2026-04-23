from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import database, models
from api.auth import oauth2_scheme

router = APIRouter(prefix="/user", tags=["User Stats & Info"])

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    from jose import jwt, JWTError
    try:
        payload = jwt.decode(token, database.settings.SECRET_KEY, algorithms=[database.settings.ALGORITHM])
        email: str = payload.get("sub")
    except JWTError:
        return None
    return db.query(models.NguoiDung).filter(models.NguoiDung.Email == email).first()


@router.get("/stats")
def get_dashboard_stats(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    if not current_user:
        return {}

    # 1. Điểm đánh giá (AVG)
    avg_score = current_user.DiemNangLuc or 0.0

    # 2. Số bài hoàn thành (Dựa vào TrangThaiNode)
    # Lấy lộ trình Active
    active_path = db.query(models.LoTrinhCaNhan).filter(
        models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
        models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
    ).first()

    completed_nodes = 0
    if active_path:
        completed_nodes = db.query(models.TrangThaiNode).filter(
            models.TrangThaiNode.MaLoTrinh == active_path.MaLoTrinh,
            models.TrangThaiNode.TrangThai == 'COMPLETED',
            models.TrangThaiNode.LoaiNode.in_(['CORE', 'TEST_80', 'BOOSTED']) # Bỏ tag SKIPPED ra
        ).count()

    # 3. Tổng bài Test (Micro-test = 1, Checkpoint = X)
    test_count = 1 if current_user.DiemNangLuc > 0 else 0

    return {
        "streak_days": 1, # Hiện tại hardcode 1 ngày
        "study_hours": 0.5, # Hardcode tạm
        "completed_tests": test_count,
        "completed_nodes": completed_nodes,
        "avg_score": avg_score
    }
