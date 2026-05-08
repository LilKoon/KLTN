from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import os
import shutil
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
import database, models, schemas
from services.email_service import generate_otp, send_verification_email, send_password_reset_email
from error_handler import raise_app_error

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, database.settings.SECRET_KEY, algorithms=[database.settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.NguoiDung).filter(models.NguoiDung.Email == email).first()
    if user is None:
        raise credentials_exception
    # Block tài khoản bị khoá
    if user.TrangThai and user.TrangThai.upper() in ("BANNED", "BLOCKED"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ACCOUNT_BANNED",
        )
    # Cập nhật LastSeenAt (best-effort)
    try:
        from datetime import datetime as _dt
        if hasattr(user, "LastSeenAt"):
            user.LastSeenAt = _dt.utcnow()
            db.commit()
    except Exception:
        db.rollback()
    return user


def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: Session = Depends(database.get_db),
) -> Optional[models.NguoiDung]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, database.settings.SECRET_KEY, algorithms=[database.settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    return db.query(models.NguoiDung).filter(models.NguoiDung.Email == email).first()


def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=database.settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, database.settings.SECRET_KEY, algorithm=database.settings.ALGORITHM)
    return encoded_jwt


@router.post("/register", response_model=schemas.RegisterResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check setting allow_signup
    setting = db.query(models.CauHinhHeThong).filter(models.CauHinhHeThong.Khoa == "allow_signup").first()
    allow = (setting.GiaTri or "true").strip().lower() if setting else "true"
    if allow not in ("true", "1", "yes", "on"):
        raise HTTPException(status_code=403, detail="SIGNUP_DISABLED")

    # Email blacklist
    from api.admin import is_email_banned
    if is_email_banned(db, user.email):
        raise HTTPException(status_code=403, detail="ACCOUNT_BANNED")

    if db.query(models.NguoiDung).filter(models.NguoiDung.Email == user.email).first():
        raise_app_error("AUTH_001")

    otp = generate_otp()
    new_user = models.NguoiDung(
        TenNguoiDung=user.TenNguoiDung,
        Email=user.email,
        MatKhau=get_password_hash(user.MatKhau),
        IsVerified=False,
        VerifyOTP=otp,
        OTPExpiry=datetime.utcnow() + timedelta(minutes=15),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    email_sent = send_verification_email(new_user.Email, new_user.TenNguoiDung, otp)
    if not email_sent:
        raise_app_error("GENERAL_002", detail="Lỗi gửi email (SMTP). Vui lòng kiểm tra lại cấu hình mật khẩu ứng dụng Gmail.")

    return {
        "message": "Đăng ký thành công. Vui lòng kiểm tra email để nhập mã xác nhận.",
        "email": new_user.Email,
        "email_sent": email_sent,
    }


@router.post("/verify-email")
def verify_email(payload: schemas.VerifyEmailRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.NguoiDung).filter(models.NguoiDung.Email == payload.email).first()
    if not user:
        raise_app_error("AUTH_004")
    if user.IsVerified:
        raise_app_error("AUTH_005")
    if not user.VerifyOTP or user.VerifyOTP != payload.otp:
        raise_app_error("AUTH_006")
    if user.OTPExpiry and datetime.utcnow() > user.OTPExpiry:
        raise_app_error("AUTH_007")

    user.IsVerified = True
    user.VerifyOTP = None
    user.OTPExpiry = None
    db.commit()

    token = create_access_token(data={"sub": user.Email, "role": user.VaiTro})
    return {
        "message": "X\u00e1c th\u1ef1c th\u00e0nh c\u00f4ng! Ch\u00e0o m\u1eebng b\u1ea1n \u0111\u1ebfn v\u1edbi EdTech AI.",
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/resend-otp")
def resend_otp(payload: schemas.ResendOTPRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.NguoiDung).filter(models.NguoiDung.Email == payload.email).first()
    if not user or user.IsVerified:
        raise_app_error("AUTH_008")

    new_otp = generate_otp()
    user.VerifyOTP = new_otp
    user.OTPExpiry = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    email_sent = send_verification_email(user.Email, user.TenNguoiDung, new_otp)
    if not email_sent:
        raise_app_error("GENERAL_002", detail="Lỗi gửi email (SMTP). Vui lòng kiểm tra lại cấu hình mật khẩu ứng dụng Gmail.")
        
    return {"message": "\u0110\u00e3 g\u1eedi l\u1ea1i m\u00e3 x\u00e1c nh\u1eadn"}


@router.post("/forgot-password")
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.NguoiDung).filter(models.NguoiDung.Email == payload.email).first()
    if not user:
        raise_app_error("AUTH_004")

    otp = generate_otp()
    user.VerifyOTP = otp
    user.OTPExpiry = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    email_sent = send_password_reset_email(user.Email, user.TenNguoiDung, otp)
    if not email_sent:
        raise_app_error("GENERAL_002", detail="Lỗi gửi email (SMTP). Vui lòng kiểm tra lại cấu hình mật khẩu ứng dụng Gmail.")
        
    return {
        "message": "Mã xác nhận đã được gửi đến email của bạn.",
        "email_sent": email_sent,
    }


@router.post("/verify-reset-otp")
def verify_reset_otp(payload: schemas.VerifyResetOTPRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.NguoiDung).filter(models.NguoiDung.Email == payload.email).first()
    if not user:
        raise_app_error("AUTH_004")
    if not user.VerifyOTP or user.VerifyOTP != payload.otp:
        raise_app_error("AUTH_006")
    if user.OTPExpiry and datetime.utcnow() > user.OTPExpiry:
        raise_app_error("AUTH_007")
    return {"valid": True, "message": "Mã xác nhận hợp lệ."}


@router.post("/reset-password")
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(database.get_db)):
    if len(payload.new_password) < 6:
        raise_app_error("AUTH_009")

    user = db.query(models.NguoiDung).filter(models.NguoiDung.Email == payload.email).first()
    if not user:
        raise_app_error("AUTH_004")
    if not user.VerifyOTP or user.VerifyOTP != payload.otp:
        raise_app_error("AUTH_006")
    if user.OTPExpiry and datetime.utcnow() > user.OTPExpiry:
        raise_app_error("AUTH_007")

    user.MatKhau = get_password_hash(payload.new_password)
    user.VerifyOTP = None
    user.OTPExpiry = None
    db.commit()
    return {"message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."}


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.NguoiDung).filter(models.NguoiDung.Email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.MatKhau):
        raise_app_error("AUTH_002")
    if not user.IsVerified:
        raise_app_error("AUTH_003", detail="EMAIL_NOT_VERIFIED")
    # Email blacklist + TrangThai check (bao quát cả ban-by-email)
    from api.admin import is_email_banned
    if is_email_banned(db, user.Email) or (user.TrangThai and user.TrangThai.upper() in ("BANNED", "BLOCKED")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ACCOUNT_BANNED",
        )

    # Cập nhật LastSeenAt khi đăng nhập
    try:
        from datetime import datetime as _dt
        if hasattr(user, "LastSeenAt"):
            user.LastSeenAt = _dt.utcnow()
            db.commit()
    except Exception:
        db.rollback()

    access_token = create_access_token(data={"sub": user.Email, "role": user.VaiTro})
    return {"access_token": access_token, "token_type": "bearer", "user_name": user.TenNguoiDung}


@router.get("/me")
def get_me(current_user: models.NguoiDung = Depends(get_current_user), db: Session = Depends(database.get_db)):
    has_test = db.query(models.BaiKiemTra).filter(
        models.BaiKiemTra.MaNguoiDung == current_user.MaNguoiDung,
        models.BaiKiemTra.LoaiBaiKiemTra == "DAU_VAO",
        models.BaiKiemTra.TrangThai == "COMPLETED"
    ).first() is not None

    return {
        "TenNguoiDung": current_user.TenNguoiDung,
        "Email": current_user.Email,
        "SoDienThoai": current_user.SoDienThoai,
        "TieuSu": current_user.TieuSu,
        "AvatarUrl": current_user.AvatarUrl,
        "VaiTro": current_user.VaiTro,
        "NgayTao": current_user.NgayTao.isoformat() if current_user.NgayTao else None,
        "HasCompletedPlacementTest": has_test
    }

@router.put("/me")
def update_me(profile: schemas.ProfileUpdate, current_user: models.NguoiDung = Depends(get_current_user), db: Session = Depends(database.get_db)):
    current_user.TenNguoiDung = profile.TenNguoiDung
    current_user.SoDienThoai = profile.SoDienThoai
    current_user.TieuSu = profile.TieuSu
    db.commit()
    db.refresh(current_user)
    return {"message": "Cập nhật thành công"}

@router.post("/upload-avatar")
def upload_avatar(file: UploadFile = File(...), current_user: models.NguoiDung = Depends(get_current_user), db: Session = Depends(database.get_db)):
    upload_dir = "static/avatars"
    os.makedirs(upload_dir, exist_ok=True)
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"avatar_{current_user.MaNguoiDung}{file_extension}"
    file_path = os.path.join(upload_dir, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    current_user.AvatarUrl = f"/{file_path.replace(os.sep, '/')}"
    db.commit()
    return {"message": "Tải lên ảnh thành công", "AvatarUrl": current_user.AvatarUrl}

@router.put("/change-password")
def change_password(data: schemas.ChangePassword, current_user: models.NguoiDung = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if not verify_password(data.current_password, current_user.MatKhau):
        raise_app_error("AUTH_002", detail="Mật khẩu hiện tại không đúng")
    
    current_user.MatKhau = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Đổi mật khẩu thành công"}

