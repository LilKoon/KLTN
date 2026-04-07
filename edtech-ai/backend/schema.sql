-- ==========================================
-- PHÂN HỆ 1: QUẢN LÝ TÀI KHOẢN (USER & ADMIN)
-- ==========================================
CREATE TABLE NguoiDung (
    MaNguoiDung UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    TenNguoiDung VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    MatKhau VARCHAR(255) NOT NULL,
    VaiTro VARCHAR(50) DEFAULT 'USER', -- 'USER' hoặc 'ADMIN'
    TrangThai VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE' hoặc 'BANNED'
    DiemNangLuc DECIMAL(5,2) DEFAULT 0.0,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHÂN HỆ 2: KHUNG NỘI DUNG CỐT LÕI (ADMIN QUẢN LÝ)
-- ==========================================
CREATE TABLE KhoaHoc (
    MaKhoaHoc UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    TenKhoaHoc VARCHAR(255) NOT NULL,
    MoTa TEXT,
    MucDo VARCHAR(50), -- Ví dụ: 'A1', 'B2', 'TOEIC 500'
    TrangThai VARCHAR(50) DEFAULT 'ACTIVE',
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE BaiHoc (
    MaBaiHoc UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaKhoaHoc UUID REFERENCES KhoaHoc(MaKhoaHoc) ON DELETE CASCADE,
    TenBaiHoc VARCHAR(255) NOT NULL,
    ThuTu INT NOT NULL, -- Thứ tự bài học gốc
    NoiDungLyThuyet JSONB, -- Nội dung bài học tĩnh do Admin soạn
    TrangThai VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE NganHangCauHoi (
    MaCauHoi UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaKhoaHoc UUID REFERENCES KhoaHoc(MaKhoaHoc) ON DELETE SET NULL,
    KyNang VARCHAR(50) NOT NULL, -- 'VOCAB', 'GRAMMAR', 'READING', 'LISTENING'
    MucDo VARCHAR(50) DEFAULT 'MEDIUM',
    NoiDung TEXT NOT NULL,
    DSDapAn JSONB NOT NULL, -- Ví dụ: ["A", "B", "C", "D"]
    DapAnDung TEXT NOT NULL,
    GiaiThich TEXT -- Giải thích tĩnh từ Admin
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
    FileHash VARCHAR(255), -- ĐÃ THÊM: Mã băm (MD5/SHA) để check trùng lặp, tiết kiệm API
    NgayTaiLen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE BaiKiemTra (
    MaBaiKiemTra UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    MaKhoaHoc UUID REFERENCES KhoaHoc(MaKhoaHoc) ON DELETE SET NULL,
    LoaiBaiKiemTra VARCHAR(50) NOT NULL, -- 'DAU_VAO', 'TONG_KET_MODULE', 'FINAL'
    TrangThai VARCHAR(50) DEFAULT 'PENDING',
    TongDiem DECIMAL(5,2),
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PhanKiemTra (
    MaPKT UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaBaiKiemTra UUID REFERENCES BaiKiemTra(MaBaiKiemTra) ON DELETE CASCADE,
    KyNang VARCHAR(50) NOT NULL,
    PhanTramDiem DECIMAL(5,2),
    is_the_weak_grade BOOLEAN DEFAULT FALSE -- Đánh dấu phần yếu để AI nhắm mục tiêu
);

CREATE TABLE ChiTietLamBai (
    MaChiTiet UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaBaiKiemTra UUID REFERENCES BaiKiemTra(MaBaiKiemTra) ON DELETE CASCADE,
    MaCauHoi UUID REFERENCES NganHangCauHoi(MaCauHoi) ON DELETE CASCADE,
    LuaChon TEXT,
    LaCauDung BOOLEAN NOT NULL,
    ThoiGianLamBai TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHÂN HỆ 4: LỘ TRÌNH HỌC TẬP LAI (HYBRID ROADMAP)
-- ==========================================
CREATE TABLE LoTrinhHoc (
    MaLoTrinh UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    MaKhoaHoc UUID REFERENCES KhoaHoc(MaKhoaHoc) ON DELETE CASCADE,
    MaBaiKiemTra UUID REFERENCES BaiKiemTra(MaBaiKiemTra) ON DELETE SET NULL,
    TrangThai VARCHAR(50) DEFAULT 'IN_PROGRESS',
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ChiTietLoTrinh (
    MaChiTietLoTrinh UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaLoTrinh UUID REFERENCES LoTrinhHoc(MaLoTrinh) ON DELETE CASCADE,
    MaBaiHoc UUID REFERENCES BaiHoc(MaBaiHoc) ON DELETE SET NULL,
    ThuTu INT NOT NULL,
    LoaiHocPhan VARCHAR(50) DEFAULT 'CORE', -- 'CORE' (Bài gốc) hoặc 'AI_BOOST' (Bài AI sinh)
    NoiDungAI JSONB, -- Nội dung bổ trợ nếu là bài AI_BOOST sinh ra
    TrangThai VARCHAR(50) DEFAULT 'LOCKED' -- 'LOCKED', 'UNLOCKED', 'SKIPPED', 'COMPLETED'
);

-- ==========================================
-- PHÂN HỆ 5: FLASHCARD & ÔN TẬP NGẮT QUÃNG
-- ==========================================
CREATE TABLE BoTheGhiNho (
    MaBoThe UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    TenBoThe VARCHAR(255) NOT NULL,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TheGhiNho (
    MaThe UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaBoThe UUID REFERENCES BoTheGhiNho(MaBoThe) ON DELETE CASCADE,
    MatTruoc TEXT NOT NULL, 
    MatSau TEXT NOT NULL, 
    MucDoGhiNho INTEGER DEFAULT 1, -- Thuật toán Spaced Repetition (1-5)
    NgayOnTapTiepTheo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHÂN HỆ 6: GAMIFICATION & KIỂM SOÁT AI
-- ==========================================
CREATE TABLE LichSuHocTap (
    MaLichSu UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    LoaiHanhDong VARCHAR(50) NOT NULL, -- 'COMPLETED_LESSON', 'FINISHED_TEST', 'REVIEWED_FLASHCARD', v.v.
    DoiTuongID UUID, 
    GhiChu TEXT, 
    ThoiGian TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ĐÃ THÊM: Bảng quản lý Feedback để Admin duyệt nội dung AI sinh bị lỗi
CREATE TABLE BaoCaoLoi (
    MaBaoCao UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    LoaiLoi VARCHAR(50) NOT NULL, -- 'SAI_KIEN_THUC', 'LOI_CHINH_TA', 'KHONG_LIEN_QUAN'
    DoiTuongLoi VARCHAR(50) NOT NULL, -- 'FLASHCARD', 'AI_BOOST_QUESTION'
    DoiTuongID UUID NOT NULL, -- ID của Thẻ hoặc Chi tiết lộ trình bị lỗi
    LyDo TEXT, -- Ghi chú chi tiết của User
    TrangThai VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'RESOLVED', 'REJECTED'
    NgayBaoCao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
