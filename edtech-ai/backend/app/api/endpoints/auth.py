from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
import os
import shutil
from app.core.database import get_db
from app.core.models import NguoiDung
from app.core.config import settings

router = APIRouter()

UPLOAD_DIR = "static/uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)

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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(NguoiDung).where(NguoiDung.MaNguoiDung == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user

# ─── Schemas ────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None

class GoogleLoginRequest(BaseModel):
    token: str

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
        SoDienThoai=body.phone,
        TrangThai="OFFLINE"
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

    user.TrangThai = "ACTIVE"
    await db.commit()

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

import urllib.request
import json
import uuid

@router.post("/google")
async def google_login(body: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    url = f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={body.token}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            google_data = json.loads(response.read().decode())
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token Google không hợp lệ")

    email = google_data.get("email")
    name = google_data.get("name", "Google User")
    
    if not email:
        raise HTTPException(status_code=400, detail="Không lấy được email từ Google")

    # Kiểm tra DB xem user đã tồn tại chưa
    result = await db.execute(select(NguoiDung).where(NguoiDung.Email == email))
    user = result.scalar_one_or_none()

    if not user:
        # Tạo user mới nếu chưa có
        random_password = str(uuid.uuid4()) # Mật khẩu ngẫu nhiên cho user Google
        user = NguoiDung(
            TenNguoiDung=name,
            Email=email,
            MatKhau=hash_password(random_password),
            TrangThai="ACTIVE",
            VaiTro="USER"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        user.TrangThai = "ACTIVE"
        await db.commit()

    # Tạo JWT token
    token = create_access_token(data={
        "sub": str(user.MaNguoiDung),
        "email": user.Email
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_name": user.TenNguoiDung,
        "email": user.Email
    }

@router.post("/logout")
async def logout(current_user: NguoiDung = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    current_user.TrangThai = "OFFLINE"
    await db.commit()
    return {"message": "Đăng xuất thành công"}

@router.get("/me")
async def get_me(current_user: NguoiDung = Depends(get_current_user)):
    return {
        "id": str(current_user.MaNguoiDung),
        "name": current_user.TenNguoiDung,
        "email": current_user.Email,
        "phone": current_user.SoDienThoai,
        "bio": current_user.TieuSu,
        "avatar": current_user.AnhDaiDien
    }

@router.put("/me")
async def update_me(body: ProfileUpdate, db: AsyncSession = Depends(get_db), current_user: NguoiDung = Depends(get_current_user)):
    if body.name is not None:
        current_user.TenNguoiDung = body.name
    if body.phone is not None:
        current_user.SoDienThoai = body.phone
    if body.bio is not None:
        current_user.TieuSu = body.bio
        
    await db.commit()
    return {"message": "Cập nhật thành công"}

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: NguoiDung = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ext = file.filename.split('.')[-1].lower()
    if ext not in ['jpg', 'jpeg', 'png', 'gif']:
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận file ảnh định dạng JPG, PNG, GIF")

    timestamp = int(datetime.utcnow().timestamp())
    filename = f"avatar_{current_user.MaNguoiDung}_{timestamp}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    if current_user.AnhDaiDien:
        old_filename = current_user.AnhDaiDien.split('/')[-1]
        old_file_path = os.path.join(UPLOAD_DIR, old_filename)
        if os.path.exists(old_file_path):
            try:
                os.remove(old_file_path)
            except Exception:
                pass

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    url_path = f"/static/uploads/avatars/{filename}"
    current_user.AnhDaiDien = url_path
    await db.commit()

    return {"message": "Cập nhật ảnh đại diện thành công", "avatarUrl": url_path}
