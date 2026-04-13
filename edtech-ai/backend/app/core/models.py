import uuid
from sqlalchemy import Column, String, Numeric, Integer, Boolean, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.core.database import Base


# ─── Người Dùng ──────────────────────────────────────────────────────────
class NguoiDung(Base):
    __tablename__ = "nguoidung"

    MaNguoiDung = Column("manguoidung", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    TenNguoiDung = Column("tennguoidung", String(255), nullable=False)
    Email = Column("email", String(255), unique=True, nullable=False)
    MatKhau = Column("matkhau", String(255), nullable=False)
    DiemNangLuc = Column("diemnangluc", Numeric(5, 2), default=0.0)
    NgayTao = Column("created_at", TIMESTAMP(timezone=True), server_default=func.now())


# ─── Ngân Hàng Câu Hỏi ──────────────────────────────────────────────────
class NganHangCauHoi(Base):
    __tablename__ = "nganhangcauhoi"

    MaCauHoi = Column("macauhoi", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaKhoaHoc = Column("makhoahoc", UUID(as_uuid=True), nullable=True)
    MaNhom = Column("manhom", UUID(as_uuid=True), nullable=True)
    KyNang = Column("kynang", String(50), nullable=False)
    MucDo = Column("mucdo", Integer, nullable=False, default=1)
    NoiDung = Column("noidung", Text, nullable=False)
    DSDapAn = Column("dsdapan", JSONB, nullable=False)
    DapAnDung = Column("dapandung", Text, nullable=False)
    GiaiThich = Column("giaithich", Text, nullable=True)
    MucDichSuDung = Column("mucdichsudung", String(50), default="COURSE")
    FileAudioDinhKem = Column("fileaudiodinhkem", Text, nullable=True)
    CreatedAt = Column("created_at", TIMESTAMP(timezone=True), server_default=func.now())
    UpdatedAt = Column("updated_at", TIMESTAMP(timezone=True), server_default=func.now())


# ─── Bài Kiểm Tra ───────────────────────────────────────────────────────
class BaiKiemTra(Base):
    __tablename__ = "baikiemtra"

    MaBaiKiemTra = Column("mabaikiemtra", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaNguoiDung = Column("manguoidung", UUID(as_uuid=True), nullable=True)
    MaKhoaHoc = Column("makhoahoc", UUID(as_uuid=True), nullable=True)
    LoaiBaiKiemTra = Column("loaibaikiemtra", String(50), nullable=False)
    TrangThai = Column("trangthai", String(50), default="PENDING")
    TongDiem = Column("tongdiem", Numeric(5, 2), nullable=True)
    MoTaDanhGiaAI = Column("motadanhgiaai", Text, nullable=True)
    KetQuaLevel = Column("ketqualevel", Integer, nullable=True)
    CreatedAt = Column("created_at", TIMESTAMP(timezone=True), server_default=func.now())
    UpdatedAt = Column("updated_at", TIMESTAMP(timezone=True), server_default=func.now())


# ─── Chi Tiết Làm Bài ───────────────────────────────────────────────────
class ChiTietLamBai(Base):
    __tablename__ = "chitietlambai"

    MaChiTiet = Column("machitiet", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    MaBaiKiemTra = Column("mabaikiemtra", UUID(as_uuid=True), nullable=True)
    MaCauHoi = Column("macauhoi", UUID(as_uuid=True), nullable=True)
    LuaChon = Column("luachon", Text, nullable=True)
    LaCauDung = Column("lacaudung", Boolean, nullable=False)
    ThoiGianLamCauHoi = Column("thoigianlamcauhoi", Integer, nullable=True)
    CreatedAt = Column("created_at", TIMESTAMP(timezone=True), server_default=func.now())