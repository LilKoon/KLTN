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
