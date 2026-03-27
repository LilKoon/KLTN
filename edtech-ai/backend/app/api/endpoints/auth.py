from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.models import NguoiDung
from app.core.config import settings

router = APIRouter()

# ─── Password hashing ───────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# ─── JWT Token ──────────────────────────────────────────────────────────
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# ─── Schemas ────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# ─── Routes ─────────────────────────────────────────────────────────────

@router.post("/register", status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Kiểm tra email đã tồn tại chưa
    result = await db.execute(select(NguoiDung).where(NguoiDung.Email == body.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")

    # Tạo user mới
    new_user = NguoiDung(
        TenNguoiDung=body.name,
        Email=body.email,
        MatKhau=hash_password(body.password),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {
        "message": "Đăng ký thành công!",
        "user_id": str(new_user.MaNguoiDung)
    }


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Tìm user theo email
    result = await db.execute(select(NguoiDung).where(NguoiDung.Email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.MatKhau):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")

    # Tạo JWT token
    token = create_access_token(data={
        "sub": str(user.MaNguoiDung),
        "email": user.Email
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_name": user.TenNguoiDung
    }
