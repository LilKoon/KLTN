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
    Thuật toán AI tự động nhào nặn ra lô trình:
    Dựa trên DiemNangLuc đầu vào, quét kho BaiHoc.
    Điểm càng cao, càng nhiều node đầu bị đánh nhãn SKIPPED.
    """
    if current_user.DiemNangLuc <= 0:
        raise HTTPException(status_code=400, detail="Vui lòng làm bài Micro-Test để có điểm năng lực đầu vào.")
        
    # Check current active path
    active_path = db.query(models.LoTrinhCaNhan).filter(
        models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
        models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
    ).first()
    
    if active_path:
        return active_path # Đã tạo rồi

    # Lấy khóa "IELTS Nền tảng 5.0" làm Core
    core_course = db.query(models.KhoaHoc).filter(models.KhoaHoc.TenKhoaHoc == "IELTS Nền tảng 5.0").first()
    if not core_course:
         raise HTTPException(status_code=500, detail="Seed Course missing from DB")
         
    bai_hocs = db.query(models.BaiHoc).filter(models.BaiHoc.MaKhoaHoc == core_course.MaKhoaHoc).order_by(models.BaiHoc.ThuTu).all()

    # Tạo Lộ Trình Ca Nhân
    new_path = models.LoTrinhCaNhan(
        MaLoTrinh=uuid.uuid4(),
        MaNguoiDung=current_user.MaNguoiDung,
        TrangThai='ACTIVE'
    )
    db.add(new_path)
    db.flush() # Để lấy ID tạm thời
    
    # AI RULE: 
    # Nếu Điểm > 8.0 -> 3 bài đầu SKIPPED
    # Nếu Điểm >= 5.0 -> 1 bài đầu SKIPPED
    skip_count = 0
    if current_user.DiemNangLuc >= 8.0:
        skip_count = 3
    elif current_user.DiemNangLuc >= 5.0:
        skip_count = 1
        
    # Tạo chuỗi lộ trình (tính toán index nội suy Checkpoint)
    sequence_items = []
    total_bai_hocs = len(bai_hocs)
    cp1_idx = total_bai_hocs // 3
    cp2_idx = (total_bai_hocs * 2) // 3
    
    for i, bh in enumerate(bai_hocs):
        sequence_items.append({
            "type": "LESSON",
            "bh": bh,
            "tieu_de": bh.TenBaiHoc
        })
        if i == cp1_idx:
            sequence_items.append({
                "type": "CHECKPOINT",
                "bh": None,
                "tieu_de": "Bài Test Giữa Kỳ (Trạm số 1)",
                "mota": "Đánh giá năng lực thu nạp kiến thức trong chặng vừa qua. Yêu cầu 80%."
            })
        elif i == cp2_idx:
            sequence_items.append({
                "type": "CHECKPOINT",
                "bh": None,
                "tieu_de": "Bài Test Giữa Kỳ (Trạm số 2)",
                "mota": "Đánh giá năng lực thu nạp kiến thức trong chặng vừa qua. Yêu cầu 80%."
            })
            
    sequence_items.append({
        "type": "FINAL_TEST",
        "bh": None,
        "tieu_de": "Kiểm Tra Trùm Cuối (Final Test)",
        "mota": "Trạm dừng chân cuối cùng. Chứng minh bạn đã sẵn sàng."
    })

    lessons_seen = 0
    thu_tu_node = 1
    found_current = False
    
    for item in sequence_items:
        is_skipped = False
        
        # Đã học qua số lượng bài cần skip chưa?
        if lessons_seen < skip_count:
            is_skipped = True
            
        if item["type"] == "LESSON":
            lessons_seen += 1
            loai_node = 'SKIPPED' if is_skipped else 'CORE'
            mota = "AI đánh giá bạn đã nắm vững kiến thức, tiết kiệm thời gian." if is_skipped else "Bài học lý thuyết cốt lõi không thể bỏ qua."
        else:
            # CHECKPOINT hoặc FINAL_TEST
            loai_node = 'SKIPPED' if is_skipped else 'TEST_80'
            mota = "AI miễn thi cho chặng này." if is_skipped else item["mota"]
            
        if is_skipped:
            trang_thai = 'COMPLETED'
        elif not found_current:
            trang_thai = 'CURRENT'
            found_current = True
        else:
            trang_thai = 'LOCKED'
            
        db.add(models.TrangThaiNode(
            MaNode=uuid.uuid4(),
            MaLoTrinh=new_path.MaLoTrinh,
            MaBaiHoc=item["bh"].MaBaiHoc if item["bh"] else None,
            TieuDe=item["tieu_de"],
            MoTa=mota,
            ThuTu=thu_tu_node,
            LoaiNode=loai_node,
            TrangThai=trang_thai
        ))
        thu_tu_node += 1
        
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
