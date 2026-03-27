import uuid
from sqlalchemy import Column, String, Numeric, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class NguoiDung(Base):
    __tablename__ = "nguoidung"

    #loi chu thuong và in hoa
    MaNguoiDung = Column("manguoidung", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    TenNguoiDung = Column("tennguoidung", String(255), nullable=False)
    Email = Column("email", String(255), unique=True, nullable=False)
    MatKhau = Column("matkhau", String(255), nullable=False)  # Lưu bcrypt hash
    DiemNangLuc = Column("diemnangluc", Numeric(5, 2), default=0.0)
    NgayTao = Column("ngaytao", TIMESTAMP, server_default=func.now())