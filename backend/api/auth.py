from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
import database, models, schemas
from services.email_service import generate_otp, send_verification_email
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


@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if db.query(models.NguoiDung).filter(models.NguoiDung.Email == user.email).first():
        raise_app_error("AUTH_001")

    new_user = models.NguoiDung(
        TenNguoiDung=user.TenNguoiDung,
        Email=user.email,
        MatKhau=get_password_hash(user.MatKhau),
        IsVerified=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.Email, "role": new_user.VaiTro})
    return {"access_token": token, "token_type": "bearer", "user_name": new_user.TenNguoiDung}


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

    send_verification_email(user.Email, user.TenNguoiDung, new_otp)
    return {"message": "\u0110\u00e3 g\u1eedi l\u1ea1i m\u00e3 x\u00e1c nh\u1eadn"}


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.NguoiDung).filter(models.NguoiDung.Email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.MatKhau):
        raise_app_error("AUTH_002")
    if not user.IsVerified:
        raise_app_error("AUTH_003", detail="EMAIL_NOT_VERIFIED")

    access_token = create_access_token(data={"sub": user.Email, "role": user.VaiTro})
    return {"access_token": access_token, "token_type": "bearer", "user_name": user.TenNguoiDung}
