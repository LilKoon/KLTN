import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
import database, models, schemas
from api.auth import oauth2_scheme, verify_password

router = APIRouter(prefix="/test", tags=["Micro-Test AI Scoring"])

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

@router.get("/placement")
def get_placement_test(db: Session = Depends(database.get_db)):
    """
    Lấy ngẫu nhiên 10 câu hỏi để làm bài định vị đầu vào.
    Ẩn đi trường Đáp Án Đúng để chống cheat từ FE.
    """
    questions = db.query(models.NganHangCauHoi).order_by(func.random()).limit(10).all()
    
    # Process return data to hide exact correct answer
    results = []
    for q in questions:
        # Xáo trộn lại vị trí đáp án để mỗi lần test một khác
        dap_an_list = list(q.DSDapAn) if isinstance(q.DSDapAn, list) else q.DSDapAn
        random.shuffle(dap_an_list)
        
        results.append({
            "MaCauHoi": q.MaCauHoi,
            "KyNang": q.KyNang,
            "NoiDung": q.NoiDung,
            "DSDapAn": dap_an_list
        })
        
    return {"total": len(results), "questions": results}

@router.post("/placement/submit", response_model=schemas.TestResultResponse)
def submit_placement_test(
    payload: schemas.TestSubmitRequest, 
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Nhận mảng câu trả lời, đối chiếu đáp án lưu trong DB.
    Tính điểm (Hệ 10 hoặc 100) và cập nhật cột DiemNangLuc cho user.
    """
    if not payload.answers:
        raise HTTPException(status_code=400, detail="Không nhận được đáp án nào.")
        
    diem = 0.0
    tong_cau = len(payload.answers)
    diem_moi_cau = 10.0 / tong_cau
    
    # Query tất cả câu hỏi được submit
    cauhoi_ids = [ans.MaCauHoi for ans in payload.answers]
    db_questions = db.query(models.NganHangCauHoi).filter(models.NganHangCauHoi.MaCauHoi.in_(cauhoi_ids)).all()
    
    # Tạo map để tra cứu nhanh đáp án đúng
    correct_answers_map = {str(q.MaCauHoi): q.DapAnDung for q in db_questions}
    
    for ans in payload.answers:
        qid = str(ans.MaCauHoi)
        if qid in correct_answers_map:
            # So sánh case-insensitive / trim
            if correct_answers_map[qid].strip().lower() == ans.CauTraLoi.strip().lower():
                diem += diem_moi_cau
                
    diem = round(diem, 1) # Làm tròn 1 chữ số thập phân
    
    # Xếp loại AI
    xeploai = ""
    tin_nhan = ""
    if diem >= 8.0:
        xeploai = "Advanced"
        tin_nhan = "Xuất sắc! AI đánh giá nền tảng bạn rất vững. Sẽ tiến hành khóa (SKIP) các bài học cơ bản để tiết kiệm thời gian."
    elif diem >= 5.0:
        xeploai = "Intermediate"
        tin_nhan = "Khá tốt! AI sẽ giữ lại một số bài học cốt lõi và bổ sung thêm bài tập tăng cường (BOOST)."
    else:
        xeploai = "Beginner"
        tin_nhan = "Khởi điểm khiêm tốn. Đừng lo, lộ trình sẽ được thiết kế lại từ đầu với tốc độ chậm nhất để bạn dễ dàng nắm bắt."
        
    # Cập nhật DB
    current_user.DiemNangLuc = diem
    db.commit()
    
    return schemas.TestResultResponse(
        DiemSo=diem,
        XepLoai=xeploai,
        TinNhan=tin_nhan
    )
