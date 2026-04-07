from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    TenNguoiDung: str

class UserCreate(UserBase):
    MatKhau: str

class UserResponse(UserBase):
    MaNguoiDung: UUID
    VaiTro: str
    TrangThai: str
    DiemNangLuc: float
    NgayTao: datetime

    class Config:
        from_attributes = True

class KhoaHocBase(BaseModel):
    TenKhoaHoc: str
    MoTa: Optional[str] = None
    MucDo: Optional[str] = None

class KhoaHocCreate(KhoaHocBase):
    pass

class KhoaHocResponse(KhoaHocBase):
    MaKhoaHoc: UUID
    TrangThai: str
    NgayTao: datetime

    class Config:
        from_attributes = True

class BaiHocBase(BaseModel):
    TenBaiHoc: str
    ThuTu: int
    NoiDungLyThuyet: Optional[Any] = None

class BaiHocCreate(BaiHocBase):
    MaKhoaHoc: UUID

class BaiHocResponse(BaiHocBase):
    MaBaiHoc: UUID
    MaKhoaHoc: UUID
    TrangThai: str

    class Config:
        from_attributes = True

class NganHangCauHoiBase(BaseModel):
    KyNang: str
    MucDo: Optional[str] = 'MEDIUM'
    NoiDung: str
    DSDapAn: Any
    DapAnDung: str
    GiaiThich: Optional[str] = None

class NganHangCauHoiCreate(NganHangCauHoiBase):
    MaKhoaHoc: Optional[UUID] = None


class NganHangCauHoiResponse(NganHangCauHoiBase):
    MaCauHoi: UUID
    MaKhoaHoc: Optional[UUID] = None

    class Config:
        from_attributes = True

class TestAnswer(BaseModel):
    MaCauHoi: UUID
    CauTraLoi: str

class TestSubmitRequest(BaseModel):
    answers: List[TestAnswer]

class TestResultResponse(BaseModel):
    DiemSo: float
    XepLoai: str
    TinNhan: str

# Lộ Trình AI Schemas
class TrangThaiNodeBase(BaseModel):
    MaNode: UUID
    MaBaiHoc: Optional[UUID] = None
    TieuDe: str
    MoTa: Optional[str] = None
    ThuTu: int
    LoaiNode: str
    TrangThai: str
    NoiDungBoost: Optional[Dict[str, Any]] = None

class TrangThaiNodeResponse(TrangThaiNodeBase):
    class Config:
        from_attributes = True

class LoTrinhCaNhanResponse(BaseModel):
    MaLoTrinh: UUID
    TrangThai: str
    cac_node: List[TrangThaiNodeResponse] = []

    class Config:
        from_attributes = True
