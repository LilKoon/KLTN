import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Boolean, Float, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from database import Base

class NguoiDung(Base):
    __tablename__ = "NguoiDung"

    MaNguoiDung = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    TenNguoiDung = Column(String(255), nullable=False)
    Email = Column(String(255), unique=True, nullable=False)
    MatKhau = Column(String(255), nullable=False)
    VaiTro = Column(String(50), default='USER')
    TrangThai = Column(String(50), default='ACTIVE')
    DiemNangLuc = Column(Float, default=0.0)
    NgayTao = Column(DateTime, default=datetime.utcnow)

class KhoaHoc(Base):
    __tablename__ = "KhoaHoc"

    MaKhoaHoc = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    TenKhoaHoc = Column(String(255), nullable=False)
    MoTa = Column(Text, nullable=True)
    MucDo = Column(String(50), nullable=True)
    TrangThai = Column(String(50), default='ACTIVE')
    NgayTao = Column(DateTime, default=datetime.utcnow)

    bai_hocs = relationship("BaiHoc", back_populates="khoa_hoc", cascade="all, delete-orphan")
    cau_hois = relationship("NganHangCauHoi", back_populates="khoa_hoc")

class BaiHoc(Base):
    __tablename__ = "BaiHoc"

    MaBaiHoc = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaKhoaHoc = Column(UUID(as_uuid=True), ForeignKey("KhoaHoc.MaKhoaHoc", ondelete="CASCADE"))
    TenBaiHoc = Column(String(255), nullable=False)
    ThuTu = Column(Integer, nullable=False)
    NoiDungLyThuyet = Column(JSONB, nullable=True)
    TrangThai = Column(String(50), default='ACTIVE')

    khoa_hoc = relationship("KhoaHoc", back_populates="bai_hocs")

class NganHangCauHoi(Base):
    __tablename__ = "NganHangCauHoi"

    MaCauHoi = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaKhoaHoc = Column(UUID(as_uuid=True), ForeignKey("KhoaHoc.MaKhoaHoc", ondelete="SET NULL"))
    KyNang = Column(String(50), nullable=False)
    MucDo = Column(String(50), default='MEDIUM')
    NoiDung = Column(Text, nullable=False)
    DSDapAn = Column(JSONB, nullable=False)
    DapAnDung = Column(Text, nullable=False)
    GiaiThich = Column(Text, nullable=True)

    khoa_hoc = relationship("KhoaHoc", back_populates="cau_hois")

class LoTrinhCaNhan(Base):
    __tablename__ = "LoTrinhCaNhan"

    MaLoTrinh = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"), unique=True)
    TrangThai = Column(String(50), default='ACTIVE') # ACTIVE / RESET
    NgayTao = Column(DateTime, default=datetime.utcnow)
    
    nguoi_dung = relationship("NguoiDung")
    cac_node = relationship("TrangThaiNode", back_populates="lo_trinh", cascade="all, delete-orphan", order_by="TrangThaiNode.ThuTu")

class TrangThaiNode(Base):
    __tablename__ = "TrangThaiNode"

    MaNode = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaLoTrinh = Column(UUID(as_uuid=True), ForeignKey("LoTrinhCaNhan.MaLoTrinh", ondelete="CASCADE"))
    
    # Node có thể link tới Bài Học gốc (Core), hoặc null nếu bài tập AI tự sinh
    MaBaiHoc = Column(UUID(as_uuid=True), ForeignKey("BaiHoc.MaBaiHoc", ondelete="SET NULL"), nullable=True)
    
    TieuDe = Column(String(255), nullable=False)
    MoTa = Column(Text, nullable=True)
    ThuTu = Column(Integer, nullable=False)
    
    # CORE / SKIPPED / BOOSTED / TEST_80
    LoaiNode = Column(String(50), default='CORE') 
    
    # LOCKED / CURRENT / COMPLETED
    TrangThai = Column(String(50), default='LOCKED')
    
    # Cho cơ chế BOOST (bài tập riêng lẻ lưu JSON)
    NoiDungBoost = Column(JSONB, nullable=True)

    lo_trinh = relationship("LoTrinhCaNhan", back_populates="cac_node")
    bai_hoc = relationship("BaiHoc")
