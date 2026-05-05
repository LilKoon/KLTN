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
    IsVerified = Column(Boolean, default=False)
    VerifyOTP = Column(String(6), nullable=True)
    OTPExpiry = Column(DateTime, nullable=True)
    GoogleId = Column(String(100), nullable=True, unique=True)
    AvatarUrl = Column(String(500), nullable=True)
    OAuthProvider = Column(String(20), nullable=True)
    SoDienThoai = Column(String(20), nullable=True)
    TieuSu = Column(Text, nullable=True)

    bo_the_flashcard = relationship("BoDTheFlashcard", back_populates="nguoi_dung", cascade="all, delete-orphan")

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
    # Phân loại bài học theo kỹ năng và chủ đề
    KyNang = Column(String(50), nullable=True)   # GRAMMAR | LISTENING | VOCABULARY
    ChuDe = Column(String(255), nullable=True)   # Tên chủ đề gốc từ dataset
    FileAudio = Column(String(255), nullable=True)  # Đường dẫn mp3 (chỉ dùng cho LISTENING)

    khoa_hoc = relationship("KhoaHoc", back_populates="bai_hocs")

class NganHangCauHoi(Base):
    __tablename__ = "NganHangCauHoi"

    MaCauHoi = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaKhoaHoc = Column(UUID(as_uuid=True), ForeignKey("KhoaHoc.MaKhoaHoc", ondelete="SET NULL"))
    MaBaiHoc = Column(UUID(as_uuid=True), ForeignKey("BaiHoc.MaBaiHoc", ondelete="SET NULL"), nullable=True)
    KyNang = Column(String(50), nullable=False)
    MucDo = Column(String(50), default='MEDIUM')
    NoiDung = Column(Text, nullable=False)
    DSDapAn = Column(JSONB, nullable=False)
    DapAnDung = Column(Text, nullable=False)
    GiaiThich = Column(Text, nullable=True)

    NguonPDF = Column(String(200), nullable=True)
    FileAudio = Column(String(255), nullable=True)

    khoa_hoc = relationship("KhoaHoc", back_populates="cau_hois")
    bai_hoc = relationship("BaiHoc")


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
    
    # CORE / SKIPPED / BOOSTED / TEST_80 / REVIEW / FINAL_TEST
    LoaiNode = Column(String(50), default='CORE') 
    
    # LOCKED / CURRENT / COMPLETED
    TrangThai = Column(String(50), default='LOCKED')
    
    # Cho cơ chế BOOST (bài tập riêng lẻ lưu JSON)
    NoiDungBoost = Column(JSONB, nullable=True)

    # REVIEW & FINAL_TEST tracking
    DiemOntap = Column(Float, nullable=True)   # điểm lần gần nhất (0.0 - 1.0)
    SoLanThu = Column(Integer, default=0)       # đếm số lần đã thử

    lo_trinh = relationship("LoTrinhCaNhan", back_populates="cac_node")
    bai_hoc = relationship("BaiHoc")



class BoDTheFlashcard(Base):
    __tablename__ = "bo_the_flashcard"

    MaBoDe = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"), nullable=False)
    TenBoDe = Column(String(200), nullable=False)
    CapDo = Column(String(10), nullable=False)
    SoLuongThe = Column(Integer, nullable=False)
    DuLieuThe = Column(JSON, nullable=False)
    NgayTao = Column(DateTime, default=datetime.utcnow)

    trang_thai_sr = relationship("TrangThaiSR", back_populates="bo_the", cascade="all, delete-orphan")
    nguoi_dung = relationship("NguoiDung", back_populates="bo_the_flashcard")


class TrangThaiSR(Base):
    __tablename__ = "trang_thai_sr"

    MaSR = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaBoDe = Column(UUID(as_uuid=True), ForeignKey("bo_the_flashcard.MaBoDe", ondelete="CASCADE"), nullable=False)
    IndexThe = Column(Integer, nullable=False)
    EasinessFactor = Column(Float, default=2.5)
    Interval = Column(Integer, default=0)
    Repetitions = Column(Integer, default=0)
    NextDue = Column(DateTime, default=datetime.utcnow)

    bo_the = relationship("BoDTheFlashcard", back_populates="trang_thai_sr")


class TaiLieuRAG(Base):
    __tablename__ = "tai_lieu_rag"

    MaTaiLieu = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"))
    TenHienThi = Column(String(200), nullable=False)
    TenFile = Column(String(200), nullable=False)
    Namespace = Column(String(100), nullable=False)
    SoChunk = Column(Integer, default=0)
    LaAdminDoc = Column(Boolean, default=False)
    NgayTao = Column(DateTime, default=datetime.utcnow)


class PhienChat(Base):
    __tablename__ = "phien_chat"

    MaPhien = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"), nullable=False)
    TieuDe = Column(String(200), nullable=False, default="Cuộc trò chuyện mới")
    NgayTao = Column(DateTime, default=datetime.utcnow)
    NgayCapNhat = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tin_nhans = relationship("TinNhanChat", back_populates="phien", cascade="all, delete-orphan", order_by="TinNhanChat.ThuTu")
    tai_lieus = relationship("TaiLieuChat", back_populates="phien", cascade="all, delete-orphan")


class TinNhanChat(Base):
    __tablename__ = "tin_nhan_chat"

    MaTinNhan = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaPhien = Column(UUID(as_uuid=True), ForeignKey("phien_chat.MaPhien", ondelete="CASCADE"), nullable=False)
    VaiTro = Column(String(20), nullable=False)  # 'user' | 'assistant'
    NoiDung = Column(Text, nullable=False)
    MaTaiLieu = Column(UUID(as_uuid=True), ForeignKey("tai_lieu_chat.MaTaiLieu", ondelete="SET NULL"), nullable=True)
    ThuTu = Column(Integer, nullable=False, default=0)
    NgayTao = Column(DateTime, default=datetime.utcnow)

    phien = relationship("PhienChat", back_populates="tin_nhans")
    tai_lieu = relationship("TaiLieuChat", foreign_keys=[MaTaiLieu])


class TaiLieuChat(Base):
    __tablename__ = "tai_lieu_chat"

    MaTaiLieu = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaPhien = Column(UUID(as_uuid=True), ForeignKey("phien_chat.MaPhien", ondelete="CASCADE"), nullable=False)
    TenFile = Column(String(255), nullable=False)
    LoaiNguon = Column(String(20), nullable=False)  # pdf_text | pdf_ocr | image_ocr
    NoiDungText = Column(Text, nullable=False)
    SoKyTu = Column(Integer, default=0)
    NgayTao = Column(DateTime, default=datetime.utcnow)

    phien = relationship("PhienChat", back_populates="tai_lieus")

class BaiKiemTra(Base):
    __tablename__ = "BaiKiemTra"

    MaBaiKiemTra = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"), nullable=False)
    MaKhoaHoc = Column(UUID(as_uuid=True), nullable=True)
    LoaiBaiKiemTra = Column(String(50), nullable=False)
    TrangThai = Column(String(50), default='PENDING')
    TongDiem = Column(Float, nullable=True)
    MoTaDanhGiaAI = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PhanKiemTra(Base):
    __tablename__ = "PhanKiemTra"

    MaPKT = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaBaiKiemTra = Column(UUID(as_uuid=True), ForeignKey("BaiKiemTra.MaBaiKiemTra", ondelete="CASCADE"), nullable=False)
    KyNang = Column(String(50), nullable=False)
    PhanTramDiem = Column(Float, nullable=True)
    is_the_weak_grade = Column(Boolean, default=False)

class ChiTietLamBai(Base):
    __tablename__ = "ChiTietLamBai"

    MaChiTiet = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaBaiKiemTra = Column(UUID(as_uuid=True), ForeignKey("BaiKiemTra.MaBaiKiemTra", ondelete="CASCADE"), nullable=False)
    MaCauHoi = Column(UUID(as_uuid=True), ForeignKey("NganHangCauHoi.MaCauHoi", ondelete="CASCADE"), nullable=False)
    LuaChon = Column(Text, nullable=True)
    LaCauDung = Column(Boolean, nullable=False)
    ThoiGianLamCauHoi = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class BaiTestAI(Base):
    __tablename__ = "BaiTestAI"

    MaBaiTestAI = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column(UUID(as_uuid=True), ForeignKey("NguoiDung.MaNguoiDung", ondelete="CASCADE"), nullable=False)
    TenBaiTest = Column(String(255), nullable=False)
    ChuDe = Column(String(255), nullable=True)
    CapDo = Column(String(10), nullable=True)
    SoLuongCau = Column(Integer, default=0)
    DSCauHoi = Column(JSONB, nullable=False)
    NgayTao = Column(DateTime, default=datetime.utcnow)
