import uuid
from sqlalchemy import Column, String, Text, Integer, Boolean, Float, DateTime, Date, Time, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
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
    
    # Gamification & Notification
    ChuoiNgayHoc = Column(Integer, default=0)
    NgayHocCuoiCung = Column(Date, nullable=True)
    ThoiGianOnTap = Column(Time, default="08:00:00")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class KhoaHoc(Base):
    __tablename__ = "KhoaHoc"

    MaKhoaHoc = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    TenKhoaHoc = Column(String(255), nullable=False)
    MoTa = Column(Text, nullable=True)
    MucDo = Column(String(50), nullable=True)
    TrangThai = Column(String(50), default='ACTIVE')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class BaiHoc(Base):
    __tablename__ = "BaiHoc"

    MaBaiHoc = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaKhoaHoc = Column(UUID(as_uuid=True), ForeignKey("KhoaHoc.MaKhoaHoc", ondelete="CASCADE"))
    TenBaiHoc = Column(String(255), nullable=False)
    ThuTu = Column(Integer, nullable=False)
    LoaiBaiHoc = Column(String(50), nullable=True)
    NoiDungLyThuyet = Column(JSONB, nullable=True)
    TrangThai = Column(String(50), default='ACTIVE')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class NhomCauHoi(Base):
    __tablename__ = "NhomCauHoi"
    
    MaNhom = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaKhoaHoc = Column(UUID(as_uuid=True), ForeignKey("KhoaHoc.MaKhoaHoc", ondelete="SET NULL"))
    NoiDungChung = Column(Text, nullable=True)
    FileAudio = Column(Text, nullable=True)
    LoaiNhom = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class NganHangCauHoi(Base):
    __tablename__ = "NganHangCauHoi"

    MaCauHoi = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaKhoaHoc = Column(UUID(as_uuid=True), ForeignKey("KhoaHoc.MaKhoaHoc", ondelete="SET NULL"))
    MaNhom = Column(UUID(as_uuid=True), ForeignKey("NhomCauHoi.MaNhom", ondelete="SET NULL"))
    KyNang = Column(String(50), nullable=False)
    MucDo = Column(String(50), default='MEDIUM')
    NoiDung = Column(Text, nullable=False)
    DSDapAn = Column(JSONB, nullable=False)
    DapAnDung = Column(Text, nullable=False)
    GiaiThich = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TaiLieu(Base):
    __tablename__ = "TaiLieu"
    
    MaTaiLieu = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"))
    TenTaiLieu = Column(String(255), nullable=False)
    DuongDan = Column(Text, nullable=True)
    NoiDung = Column(Text, nullable=True)
    FileHash = Column(String(255), nullable=True)
    TrangThaiXuLy = Column(String(50), default='PENDING')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class BaiKiemTra(Base):
    __tablename__ = "BaiKiemTra"

    MaBaiKiemTra = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"))
    MaKhoaHoc = Column(UUID(as_uuid=True), ForeignKey("KhoaHoc.MaKhoaHoc", ondelete="SET NULL"))
    LoaiBaiKiemTra = Column(String(50), nullable=False)
    TrangThai = Column(String(50), default='PENDING')
    TongDiem = Column(Float, nullable=True)
    MoTaDanhGiaAI = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class PhanKiemTra(Base):
    __tablename__ = "PhanKiemTra"

    MaPKT = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaBaiKiemTra = Column(UUID(as_uuid=True), ForeignKey("BaiKiemTra.MaBaiKiemTra", ondelete="CASCADE"))
    KyNang = Column(String(50), nullable=False)
    PhanTramDiem = Column(Float, nullable=True)
    is_the_weak_grade = Column(Boolean, default=False)

class ChiTietLamBai(Base):
    __tablename__ = "ChiTietLamBai"

    MaChiTiet = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaBaiKiemTra = Column(UUID(as_uuid=True), ForeignKey("BaiKiemTra.MaBaiKiemTra", ondelete="CASCADE"))
    MaCauHoi = Column(UUID(as_uuid=True), ForeignKey("NganHangCauHoi.MaCauHoi", ondelete="CASCADE"))
    LuaChon = Column(Text, nullable=True)
    LaCauDung = Column(Boolean, nullable=False)
    ThoiGianLamCauHoi = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

class NodeKhoaHoc(Base):
    __tablename__ = "NodeKhoaHoc"

    MaNode = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaKhoaHoc = Column(UUID(as_uuid=True), ForeignKey("KhoaHoc.MaKhoaHoc", ondelete="CASCADE"))
    MaBaiHoc = Column(UUID(as_uuid=True), ForeignKey("BaiHoc.MaBaiHoc", ondelete="SET NULL"))
    ThuTu = Column(Integer, nullable=False)
    LoaiNode = Column(String(50), default='CORE')
    ToaDoX = Column(Float, nullable=True)
    ToaDoY = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LoTrinhHoc(Base):
    __tablename__ = "LoTrinhHoc"

    MaLoTrinh = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"))
    MaKhoaHoc = Column(UUID(as_uuid=True), ForeignKey("KhoaHoc.MaKhoaHoc", ondelete="CASCADE"))
    MaBaiKiemTraDauVao = Column(UUID(as_uuid=True), ForeignKey("BaiKiemTra.MaBaiKiemTra", ondelete="SET NULL"))
    TrangThai = Column(String(50), default='IN_PROGRESS')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TrangThaiNode(Base):
    __tablename__ = "TrangThaiNode"

    MaTrangThaiNode = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaLoTrinh = Column(UUID(as_uuid=True), ForeignKey("LoTrinhHoc.MaLoTrinh", ondelete="CASCADE"))
    MaNode = Column(UUID(as_uuid=True), ForeignKey("NodeKhoaHoc.MaNode", ondelete="CASCADE"))
    
    NoiDungAI = Column(JSONB, nullable=True)
    TrangThai = Column(String(50), default='LOCKED')
    ThoiGianHoanThanh = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ChuDeFlashcard(Base):
    __tablename__ = "ChuDeFlashcard"

    MaChuDe = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    TenChuDe = Column(String(255), unique=True, nullable=False)
    NgonNgu = Column(String(50), default="en")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class BoTheGhiNho(Base):
    __tablename__ = "BoTheGhiNho"

    MaBoThe = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"))
    TenBoThe = Column(String(255), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TheGhiNho(Base):
    __tablename__ = "TheGhiNho"

    MaThe = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaChuDe = Column(UUID(as_uuid=True), ForeignKey("ChuDeFlashcard.MaChuDe", ondelete="SET NULL"), nullable=True)
    TuVung = Column(String(255), nullable=False)
    LoaiTu = Column(String(50), nullable=True)
    PhienAm = Column(String(255), nullable=True)
    Nghia = Column(Text, nullable=False)
    ViDuNguCanh = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TheGhiNho_NguoiDung(Base):
    __tablename__ = "TheGhiNho_NguoiDung"

    MaTrangThaiThe = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"))
    MaThe = Column(UUID(as_uuid=True), ForeignKey("TheGhiNho.MaThe", ondelete="CASCADE"))
    MaBoThe = Column(UUID(as_uuid=True), ForeignKey("BoTheGhiNho.MaBoThe", ondelete="CASCADE"), nullable=True)

    KhoangCachNgay = Column(Integer, default=1)
    SoLanOnThanhCong = Column(Integer, default=0)
    HeSoDe = Column(Float, default=2.5)
    NgayOnTapTiepTheo = Column(DateTime(timezone=True), server_default=func.now())

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class LichSuHocTap(Base):
    __tablename__ = "LichSuHocTap"

    MaLichSu = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"))
    LoaiHanhDong = Column(String(50), nullable=False)
    DoiTuongID = Column(UUID(as_uuid=True), nullable=True)
    GhiChu = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BaoCaoLoi(Base):
    __tablename__ = "BaoCaoLoi"

    MaBaoCao = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"))
    LoaiLoi = Column(String(50), nullable=False)
    DoiTuongLoi = Column(String(50), nullable=False)
    DoiTuongID = Column(UUID(as_uuid=True), nullable=False)
    LyDo = Column(Text, nullable=True)
    GhiChuAdmin = Column(Text, nullable=True)
    TrangThai = Column(String(50), default='PENDING')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class PhienDangNhap(Base):
    __tablename__ = "PhienDangNhap"

    MaPhien = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"))
    RefreshToken = Column(String(500), unique=True, nullable=False)
    ThietBi = Column(String(100), nullable=True)
    DiaChiIP = Column(String(50), nullable=True)
    HanSuDung = Column(DateTime(timezone=True), nullable=False)
    IsRevoked = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TienTrinhAI(Base):
    __tablename__ = "TienTrinhAI"

    MaTienTrinh = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"))
    LoaiTacVu = Column(String(50), nullable=False)
    DoiTuongID = Column(UUID(as_uuid=True), nullable=True)
    TrangThai = Column(String(50), default='PENDING')
    PhanTram = Column(Integer, default=0)
    KetQuaJSON = Column(JSONB, nullable=True)
    Loi = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
