from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: Optional[str] = None

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

# AI Engine Schemas
class FlashcardItem(BaseModel):
    word: str
    pos: str
    phonetic: str
    meaning_vi: str
    example: str

class FlashcardGenerateRequest(BaseModel):
    topic: str
    level: str = "B1"
    count: int = 8

class FlashcardFromTextRequest(BaseModel):
    text: str
    topic: str
    count: int = 10

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer: int
    explanation_vi: str

class QuizGenerateRequest(BaseModel):
    level: str = "B1"
    topic: str = "Grammar & Vocabulary"
    count: int = 8

class AIQuizSaveRequest(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None
    level: Optional[str] = "B1"
    questions: List[QuizQuestion]

class AIQuizSummary(BaseModel):
    id: UUID
    title: str
    topic: Optional[str] = None
    level: Optional[str] = None
    count: int
    created_at: datetime

    class Config:
        from_attributes = True

class AIQuizDetail(AIQuizSummary):
    questions: List[QuizQuestion]

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    document: Optional[str] = None
    use_rag: bool = True
    preferred_provider: Optional[str] = None
    check_hallucination: bool = True

# Flashcard Storage Schemas
class DeckCreate(BaseModel):
    topic: str
    level: str
    cards: List[FlashcardItem]

class SRState(BaseModel):
    index: int
    ef: float
    interval: int
    reps: int
    next_due: datetime

class DeckResponse(BaseModel):
    id: UUID
    topic: str
    level: str
    count: int
    created_at: datetime
    due_today: int = 0

    class Config:
        from_attributes = True

class ReviewSubmitItem(BaseModel):
    card_index: int
    quality: int

class ReviewSubmitRequest(BaseModel):
    results: List[ReviewSubmitItem]

class DeckListItem(BaseModel):
    id: UUID
    title: str
    terms: int
    level: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DeckCloneRequest(BaseModel):
    MaBoTheGoc: UUID

# Quiz PDF Extraction Schemas
class QuizQuestionToImport(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None
    explanation_vi: Optional[str] = None
    level: str = "B1"
    skill: str = "Grammar"

class QuizImportRequest(BaseModel):
    questions: List[QuizQuestionToImport]
    source_filename: str
    skip_unknown_answers: bool = True

# Email Verification Schemas
class RegisterResponse(BaseModel):
    message: str
    email: str
    email_sent: bool

class VerifyEmailRequest(BaseModel):
    email: str
    otp: str

class ResendOTPRequest(BaseModel):
    email: str

class ForgotPasswordRequest(BaseModel):
    email: str

class VerifyResetOTPRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class ProfileUpdate(BaseModel):
    TenNguoiDung: str
    SoDienThoai: Optional[str] = None
    TieuSu: Optional[str] = None

class ChangePassword(BaseModel):
    current_password: str
    new_password: str


# ============================================================
# ADMIN SCHEMAS
# ============================================================

class AdminUserListItem(BaseModel):
    MaNguoiDung: UUID
    TenNguoiDung: str
    Email: EmailStr
    VaiTro: str
    TrangThai: str
    DiemNangLuc: float
    IsVerified: bool
    NgayTao: datetime

    class Config:
        from_attributes = True


class AdminUserUpdate(BaseModel):
    TenNguoiDung: Optional[str] = None
    VaiTro: Optional[str] = None        # USER | ADMIN
    TrangThai: Optional[str] = None     # ACTIVE | BANNED


class AdminDashboardStats(BaseModel):
    total_users: int
    total_admins: int
    active_users: int
    banned_users: int
    total_courses: int
    total_lessons: int
    total_questions: int
    total_flashcard_decks: int
    pending_reviews: int
    new_users_today: int = 0
    online_users: int = 0
    activity_count: int = 0


class DanhGiaCreate(BaseModel):
    LoaiDoiTuong: Optional[str] = None
    MaDoiTuong: Optional[UUID] = None
    DiemDanhGia: Optional[int] = None
    NoiDung: str


class DanhGiaResponse(BaseModel):
    MaDanhGia: UUID
    MaNguoiDung: UUID
    LoaiDoiTuong: Optional[str] = None
    MaDoiTuong: Optional[UUID] = None
    DiemDanhGia: Optional[int] = None
    NoiDung: str
    TrangThai: str
    NgayTao: datetime
    NgayDuyet: Optional[datetime] = None

    class Config:
        from_attributes = True


class DanhGiaModerate(BaseModel):
    TrangThai: str  # APPROVED | REJECTED


class ThongBaoCreate(BaseModel):
    TieuDe: str
    NoiDung: str
    DoiTuongNhan: Optional[str] = 'ALL'


class ThongBaoResponse(BaseModel):
    MaThongBao: UUID
    TieuDe: str
    NoiDung: str
    DoiTuongNhan: str
    TrangThai: str
    NgayTao: datetime

    class Config:
        from_attributes = True


class NhatKyResponse(BaseModel):
    MaNhatKy: UUID
    MaLog: Optional[UUID] = None      # alias = MaNhatKy (FE đang dùng)
    MaNguoiDung: Optional[UUID] = None
    TenNguoiDung: Optional[str] = None  # join từ NguoiDung
    HanhDong: str
    NoiDung: Optional[str] = None     # alias = HanhDong + DoiTuong cho FE hiển thị
    DoiTuong: Optional[str] = None
    ChiTiet: Optional[Any] = None
    DiaChiIP: Optional[str] = None
    NgayTao: datetime

    class Config:
        from_attributes = True


class CauHinhItem(BaseModel):
    Khoa: str
    GiaTri: Optional[str] = None
    MoTa: Optional[str] = None


class CauHinhUpdate(BaseModel):
    GiaTri: Optional[str] = None
    MoTa: Optional[str] = None


class SystemDeckCreate(BaseModel):
    TenBoDe: str
    CapDo: str
    cards: List[FlashcardItem]
