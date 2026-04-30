import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import database, models, schemas
from api.auth import oauth2_scheme, verify_password

router = APIRouter(prefix="/path", tags=["Hybrid Learning Path"])

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    from jose import jwt, JWTError
    try:
        payload = jwt.decode(token, database.settings.SECRET_KEY, algorithms=[database.settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    user = db.query(models.NguoiDung).filter(models.NguoiDung.Email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.get("/current", response_model=schemas.LoTrinhCaNhanResponse)
def get_current_path(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Lấy Cây Lộ Trình học tập đang Active của User.
    Bao gồm các Node (Core, Skipped, Boosted).
    """
    lo_trinh = db.query(models.LoTrinhCaNhan).filter(
        models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
        models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
    ).first()

    if not lo_trinh:
        raise HTTPException(status_code=404, detail="AI chưa tạo hoặc chưa thi định vị Khóa học.")
        
    return lo_trinh


@router.post("/generate", response_model=schemas.LoTrinhCaNhanResponse)
def generate_personalized_path(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Sinh learning path bằng rules-based engine (ONNX) dựa trên điểm placement test.
    Idempotent: gọi lại sẽ regenerate (xoá lộ trình cũ, tạo mới).
    """
    # 1. Bắt buộc đã hoàn thành placement test
    latest_test = db.query(models.BaiKiemTra).filter(
        models.BaiKiemTra.MaNguoiDung == current_user.MaNguoiDung,
        models.BaiKiemTra.LoaiBaiKiemTra == 'DAU_VAO',
        models.BaiKiemTra.TrangThai == 'COMPLETED',
    ).order_by(models.BaiKiemTra.created_at.desc()).first()

    if not latest_test:
        raise HTTPException(
            status_code=400,
            detail="Vui lòng hoàn thành bài test đầu vào trước khi tạo lộ trình.",
        )

    # 2. Đọc điểm % từng kỹ năng từ PhanKiemTra
    pkts = db.query(models.PhanKiemTra).filter(
        models.PhanKiemTra.MaBaiKiemTra == latest_test.MaBaiKiemTra
    ).all()
    pct = {p.KyNang.upper(): (p.PhanTramDiem or 0.0) for p in pkts}
    g = pct.get("GRAMMAR", 0.0) / 10.0
    l = pct.get("LISTENING", 0.0) / 10.0
    v = pct.get("VOCABULARY", 0.0) / 10.0

    # 3. Inference + build path
    from learning_engine import get_engine, build_learning_path
    from learning_engine.path_builder import overall_to_cefr
    cefr = overall_to_cefr((g + l + v) / 3.0)
    pred = get_engine().predict({"level": cefr, "grammar": g, "listening": l, "vocab": v})
    path_nodes = build_learning_path(pred, cefr)

    # 4. Xoá lộ trình cũ (unique constraint MaNguoiDung) → cascade xoá nodes
    db.query(models.LoTrinhCaNhan).filter(
        models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung
    ).delete(synchronize_session=False)
    db.flush()

    new_path = models.LoTrinhCaNhan(
        MaLoTrinh=uuid.uuid4(),
        MaNguoiDung=current_user.MaNguoiDung,
        TrangThai='ACTIVE',
    )
    db.add(new_path)
    db.flush()

    for n in path_nodes:
        db.add(models.TrangThaiNode(
            MaNode=uuid.uuid4(),
            MaLoTrinh=new_path.MaLoTrinh,
            MaBaiHoc=None,
            TieuDe=n["title"],
            MoTa=n["description"],
            ThuTu=n["thu_tu"],
            LoaiNode=n["kind"],
            TrangThai='CURRENT' if n["thu_tu"] == 1 else 'LOCKED',
            NoiDungBoost={
                "skill": n["skill"],
                "skill_vi": n["skill_vi"],
                "target_level": n["target_level"],
                "weight": n["weight"],
                "is_weak": n["is_weak"],
                "exercises_count": n["exercises_count"],
            },
        ))

    db.commit()
    db.refresh(new_path)
    return new_path


@router.post("/reset")
def reset_learning_path(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Người dùng yêu cầu xóa lộ trình hiện tại, trả Điểm Năng Lực về 0 để thi lại đầu vào.
    """
    # Cascade delete OR update status
    # Ở đây dùng Cascade Delete cho nhanh sạch tệp rác.
    db.query(models.LoTrinhCaNhan).filter(
        models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung
    ).delete()
    
    current_user.DiemNangLuc = 0.0
    db.commit()
    
    return {"message": "Lộ trình đã bị hủy. Bạn có thể làm lại bài Test định vị."}

@router.get("/node/{ma_node}")
def get_node_detail(
    ma_node: str,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaNode == ma_node,
        models.TrangThaiNode.MaLoTrinh.in_(
            db.query(models.LoTrinhCaNhan.MaLoTrinh).filter(
               models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
               models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
            )
        )
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node không tồn tại")
        
    bai_hoc = node.bai_hoc if node.bai_hoc else None
    
    return {
        "node": node,
        "bai_hoc": bai_hoc
    }

@router.post("/node/{ma_node}/complete")
def complete_node(
    ma_node: str,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaNode == ma_node,
        models.TrangThaiNode.MaLoTrinh.in_(
            db.query(models.LoTrinhCaNhan.MaLoTrinh).filter(
               models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
               models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
            )
        )
    ).first()
    
    if not node:
        raise HTTPException(status_code=404, detail="Node không tồn tại trong lộ trình.")

    node.TrangThai = 'COMPLETED'
    
    # Mở khóa node tiếp theo
    next_node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaLoTrinh == node.MaLoTrinh,
        models.TrangThaiNode.ThuTu > node.ThuTu
    ).order_by(models.TrangThaiNode.ThuTu).first()
    
    if next_node and next_node.TrangThai == 'LOCKED':
        next_node.TrangThai = 'CURRENT'
        
    db.commit()
    return {"message": "Hoàn tất bài học. Node tiếp theo đã được mở!"}

import random

@router.get("/node/{ma_node}/checkpoint")
def get_checkpoint_test(
    ma_node: str,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Lấy 5 câu hỏi ngẫu nhiên từ DB giống Micro-Test
    questions = db.query(models.NganHangCauHoi).all()
    selected_questions = random.sample(questions, min(5, len(questions)))
    
    result = []
    for q in selected_questions:
        dap_an = list(q.DSDapAn.values())
        random.shuffle(dap_an)
        result.append({
            "MaCauHoi": str(q.MaCauHoi),
            "NoiDung": q.NoiDung,
            "DapAn": dap_an
        })
    return result

@router.post("/node/{ma_node}/checkpoint")
def submit_checkpoint_test(
    ma_node: str,
    payload: schemas.TestSubmitRequest,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaNode == ma_node,
        models.TrangThaiNode.MaLoTrinh.in_(
            db.query(models.LoTrinhCaNhan.MaLoTrinh).filter(
               models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
               models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
            )
        )
    ).first()
    
    if not node:
        raise HTTPException(status_code=404, detail="Node không tồn tại")
        
    correct_count = 0
    total_q = len(payload.answers)
    for ans in payload.answers:
        q = db.query(models.NganHangCauHoi).filter(models.NganHangCauHoi.MaCauHoi == str(ans.MaCauHoi)).first()
        if q and q.DapAnDung.strip() == ans.CauTraLoi.strip():
            correct_count += 1
            
    score = (correct_count / total_q) * 10 if total_q > 0 else 0
    passed = score >= 8.0
    
    if passed:
        node.TrangThai = 'COMPLETED'
        next_node = db.query(models.TrangThaiNode).filter(
            models.TrangThaiNode.MaLoTrinh == node.MaLoTrinh,
            models.TrangThaiNode.ThuTu > node.ThuTu
        ).order_by(models.TrangThaiNode.ThuTu).first()
        if next_node and next_node.TrangThai == 'LOCKED':
            next_node.TrangThai = 'CURRENT'
        db.commit()
    
    return {
        "DiemSo": score,
        "XepLoai": "PASS" if passed else "FAIL",
        "TinNhan": "Chúc mừng bạn đã vượt qua." if passed else "Chưa đạt 80% yêu cầu. AI gợi ý bạn xem lại toàn bộ lý thuyết."
    }

@router.get("/node/{ma_node}/exercises")
def get_node_exercises(
    ma_node: str,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaNode == ma_node,
        models.TrangThaiNode.MaLoTrinh.in_(
            db.query(models.LoTrinhCaNhan.MaLoTrinh).filter(
               models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
               models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
            )
        )
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node không tồn tại")
        
    questions = db.query(models.NganHangCauHoi).all()
    selected_questions = random.sample(questions, min(5, len(questions)))
    
    result = []
    for q in selected_questions:
        dap_an = list(q.DSDapAn.values())
        random.shuffle(dap_an)
        result.append({
            "MaCauHoi": str(q.MaCauHoi),
            "NoiDung": q.NoiDung,
            "DapAn": dap_an,
            "DapAnDung": q.DapAnDung.strip()
        })
    return result
