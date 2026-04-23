-- ==========================================
-- PHÂN HỆ 1: QUẢN LÝ TÀI KHOẢN & GAMIFICATION
-- ==========================================
CREATE TABLE NguoiDung (
    MaNguoiDung UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    TenNguoiDung VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    MatKhau VARCHAR(255) NOT NULL,
    VaiTro VARCHAR(50) DEFAULT 'USER', -- 'USER' hoặc 'ADMIN'
    TrangThai VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE' hoặc 'BANNED'
    DiemNangLuc DECIMAL(5,2) DEFAULT 0.0,
    
    -- Gamification & Notifications
    ChuoiNgayHoc INT DEFAULT 0,
    NgayHocCuoiCung DATE,
    ThoiGianOnTap TIME DEFAULT '08:00:00',
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHÂN HỆ 2: KHUNG NỘI DUNG CỐT LÕI
-- ==========================================
CREATE TABLE KhoaHoc (
    MaKhoaHoc UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    TenKhoaHoc VARCHAR(255) NOT NULL,
    MoTa TEXT,
    MucDo VARCHAR(50), 
    TrangThai VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE BaiHoc (
    MaBaiHoc UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaKhoaHoc UUID REFERENCES KhoaHoc(MaKhoaHoc) ON DELETE CASCADE,
    TenBaiHoc VARCHAR(255) NOT NULL,
    ThuTu INT NOT NULL, 
    LoaiBaiHoc VARCHAR(50), -- VD: 'VOCABULARIES', 'GRAMMAR', 'LISTENING', 'READING'
    NoiDungLyThuyet JSONB, 
    TrangThai VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- NhomCauHoi phục vụ cho đoạn văn Reading dài hoặc Audio Listning dùng chung cho nhiều câu hỏi
CREATE TABLE NhomCauHoi (
    MaNhom UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaKhoaHoc UUID REFERENCES KhoaHoc(MaKhoaHoc) ON DELETE SET NULL,
    NoiDungChung TEXT, 
    FileAudio TEXT, 
    LoaiNhom VARCHAR(50), -- 'READING_PASSAGE', 'LISTENING_AUDIO'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE NganHangCauHoi (
    MaCauHoi UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaKhoaHoc UUID REFERENCES KhoaHoc(MaKhoaHoc) ON DELETE SET NULL,
    MaNhom UUID REFERENCES NhomCauHoi(MaNhom) ON DELETE SET NULL, -- Câu hỏi có thể thuộc 1 nhóm đoạn văn/nghe
    KyNang VARCHAR(50) NOT NULL, 
    MucDo VARCHAR(50) DEFAULT 'MEDIUM',
    NoiDung TEXT NOT NULL,
    DSDapAn JSONB NOT NULL, 
    DapAnDung TEXT NOT NULL,
    GiaiThich TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHÂN HỆ 3: CÔNG CỤ AI FLASHCARD & BÀI TEST
-- ==========================================
CREATE TABLE TaiLieu (
    MaTaiLieu UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    TenTaiLieu VARCHAR(255) NOT NULL,
    DuongDan TEXT,
    NoiDung TEXT, 
    FileHash VARCHAR(255), 
    TrangThaiXuLy VARCHAR(50) DEFAULT 'PENDING', -- Vì AI xử lý tài liệu mất thời gian
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE BaiKiemTra (
    MaBaiKiemTra UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    MaKhoaHoc UUID REFERENCES KhoaHoc(MaKhoaHoc) ON DELETE SET NULL,
    LoaiBaiKiemTra VARCHAR(50) NOT NULL, -- 'DAU_VAO', 'TONG_KET_MODULE', 'FINAL'
    TrangThai VARCHAR(50) DEFAULT 'PENDING',
    TongDiem DECIMAL(5,2),
    MoTaDanhGiaAI TEXT, -- Đánh giá tổng quan của AI sau khi test xong
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PhanKiemTra (
    MaPKT UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaBaiKiemTra UUID REFERENCES BaiKiemTra(MaBaiKiemTra) ON DELETE CASCADE,
    KyNang VARCHAR(50) NOT NULL,
    PhanTramDiem DECIMAL(5,2),
    is_the_weak_grade BOOLEAN DEFAULT FALSE 
);

CREATE TABLE ChiTietLamBai (
    MaChiTiet UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaBaiKiemTra UUID REFERENCES BaiKiemTra(MaBaiKiemTra) ON DELETE CASCADE,
    MaCauHoi UUID REFERENCES NganHangCauHoi(MaCauHoi) ON DELETE CASCADE,
    LuaChon TEXT,
    LaCauDung BOOLEAN NOT NULL,
    ThoiGianLamCauHoi INT, -- Tính bằng giây (gamification track speed)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHÂN HỆ 4: LỘ TRÌNH HỌC TẬP LAI (HYBRID ROADMAP) - TỐI ƯU HÓA NODE
-- ==========================================
-- Bảng này định nghĩa "bản đồ" (Node) của một khóa học (dùng chung cho mọi User)
CREATE TABLE NodeKhoaHoc (
    MaNode UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaKhoaHoc UUID REFERENCES KhoaHoc(MaKhoaHoc) ON DELETE CASCADE,
    MaBaiHoc UUID REFERENCES BaiHoc(MaBaiHoc) ON DELETE SET NULL, -- Bài học lõi (nếu có)
    ThuTu INT NOT NULL,
    LoaiNode VARCHAR(50) DEFAULT 'CORE', -- 'CORE', 'AI_BOOST', 'TEST'
    ToaDoX DECIMAL(5,2), -- Tính năng bản đồ (như Duolingo)
    ToaDoY DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng này lưu tiến trình/thông tin của riêng User (Root Lộ trình)
CREATE TABLE LoTrinhHoc (
    MaLoTrinh UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    MaKhoaHoc UUID REFERENCES KhoaHoc(MaKhoaHoc) ON DELETE CASCADE,
    MaBaiKiemTraDauVao UUID REFERENCES BaiKiemTra(MaBaiKiemTra) ON DELETE SET NULL,
    TrangThai VARCHAR(50) DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng này lưu trạng thái từng Node của User (TrangThaiNode)
CREATE TABLE TrangThaiNode (
    MaTrangThaiNode UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaLoTrinh UUID REFERENCES LoTrinhHoc(MaLoTrinh) ON DELETE CASCADE,
    MaNode UUID REFERENCES NodeKhoaHoc(MaNode) ON DELETE CASCADE,
    
    NoiDungAI JSONB, -- Nội dung bổ trợ nếu đây là node AI Boost sinh riêng cho user này
    TrangThai VARCHAR(50) DEFAULT 'LOCKED', -- 'LOCKED', 'UNLOCKED', 'SKIPPED', 'COMPLETED'
    ThoiGianHoanThanh TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHÂN HỆ 5: FLASHCARD & ÔN TẬP NGẮT QUÃNG
-- ==========================================
CREATE TABLE BoTheGhiNho (
    MaBoThe UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    TenBoThe VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TheGhiNho (
    MaThe UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaBoThe UUID REFERENCES BoTheGhiNho(MaBoThe) ON DELETE CASCADE,
    MatTruoc TEXT NOT NULL, 
    MatSau TEXT NOT NULL, 
    PhienAm TEXT, 
    ViDuNguCanh TEXT, 
    
    -- Thuật toán Spaced Repetition (SuperMemo)
    KhoangCachNgay INT DEFAULT 1, 
    SoLanOnThanhCong INT DEFAULT 0, 
    HeSoDe DECIMAL(5,2) DEFAULT 2.5, 
    NgayOnTapTiepTheo TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHÂN HỆ 6: GAMIFICATION, KIỂM SOÁT AI & LOGS
-- ==========================================
CREATE TABLE LichSuHocTap (
    MaLichSu UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    LoaiHanhDong VARCHAR(50) NOT NULL, 
    DoiTuongID UUID, 
    GhiChu TEXT, 
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE BaoCaoLoi (
    MaBaoCao UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    LoaiLoi VARCHAR(50) NOT NULL, 
    DoiTuongLoi VARCHAR(50) NOT NULL, 
    DoiTuongID UUID NOT NULL, 
    LyDo TEXT, 
    GhiChuAdmin TEXT, -- Cho phép Admin Note
    TrangThai VARCHAR(50) DEFAULT 'PENDING', 
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHÂN HỆ 7: BẢO MẬT & QUẢN LÝ TIẾN TRÌNH AI
-- ==========================================
CREATE TABLE PhienDangNhap (
    MaPhien UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    RefreshToken VARCHAR(500) UNIQUE NOT NULL,
    ThietBi VARCHAR(100),
    DiaChiIP VARCHAR(50),
    HanSuDung TIMESTAMPTZ NOT NULL,
    IsRevoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TienTrinhAI (
    MaTienTrinh UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    LoaiTacVu VARCHAR(50) NOT NULL,
    DoiTuongID UUID,
    TrangThai VARCHAR(50) DEFAULT 'PENDING',
    PhanTram INT DEFAULT 0,
    KetQuaJSON JSONB,
    Loi TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Chuyen muc do cau hoi tu dang text sang int de de dua ra nhung muc do cau hoi cho user
ALTER TABLE NganHangCauHoi DROP COLUMN MucDo;
ALTER TABLE NganHangCauHoi ADD COLUMN MucDo INT NOT NULL DEFAULT 1;

-- Cot MucDichSuDung luu nhieu muc dich duoi dang mang TEXT[]
-- Vi du: ARRAY['EXAM', 'DAU_VAO'], ARRAY['COURSE'], ARRAY['EXAM']
ALTER TABLE NganHangCauHoi ADD COLUMN MucDichSuDung TEXT[] DEFAULT '{}';
ALTER TABLE NganHangCauHoi ADD COLUMN FileAudioDinhKem TEXT; -- cho phan listenning

-- ==========================================
-- CAP NHAT MUC DICH SU DUNG CHO TUNG KY NANG
-- ==========================================

-- VOCAB: phuc vu ca bai kiem tra dau vao (DAU_VAO) va bai thi (EXAM)
UPDATE NganHangCauHoi
SET MucDichSuDung = ARRAY['EXAM', 'DAU_VAO']
WHERE KyNang = 'VOCAB';

-- GRAMMAR: phuc vu ca bai kiem tra dau vao (DAU_VAO) va bai thi (EXAM)
UPDATE NganHangCauHoi
SET MucDichSuDung = ARRAY['EXAM', 'DAU_VAO']
WHERE KyNang = 'GRAMMAR';

-- LISTENING: phuc vu ca bai kiem tra dau vao (DAU_VAO) va bai thi (EXAM)
UPDATE NganHangCauHoi
SET MucDichSuDung = ARRAY['EXAM', 'DAU_VAO']
WHERE KyNang = 'LISTENING';

-- Cac cau hoi khong thuoc 3 ky nang tren mac dinh la COURSE
UPDATE NganHangCauHoi
SET MucDichSuDung = ARRAY['COURSE']
WHERE MucDichSuDung = '{}' OR MucDichSuDung IS NULL;

-- Index ho tro query theo muc dich (GIN index cho array)
CREATE INDEX idx_nganhangcauhoi_mucdichsudung ON NganHangCauHoi USING GIN (MucDichSuDung);

-- ==========================================
-- VI DU QUERY LAY CAU HOI THEO MUC DICH
-- ==========================================
-- Lay cau hoi dau vao (DAU_VAO):
--   SELECT * FROM NganHangCauHoi WHERE 'DAU_VAO' = ANY(MucDichSuDung);
--
-- Lay cau hoi thi (EXAM):
--   SELECT * FROM NganHangCauHoi WHERE 'EXAM' = ANY(MucDichSuDung);
--
-- Lay cau hoi VOCAB cho bai thi dau vao:
--   SELECT * FROM NganHangCauHoi
--   WHERE KyNang = 'VOCAB' AND 'DAU_VAO' = ANY(MucDichSuDung);

ALTER TABLE BaiKiemTra ADD COLUMN KetQuaLevel INT; -- luu tong quan sau bai test

ALTER TABLE PhanKiemTra ADD COLUMN KetQuaLevel INT; -- luu cho tung ki nang rieng biet
