-- Tạo các bảng
-- 1. Bảng NguoiDung
CREATE TABLE NguoiDung (
    MaNguoiDung UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    TenNguoiDung VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    MatKhau VARCHAR(255) NOT NULL,
    DiemNangLuc DECIMAL(5,2) DEFAULT 0.0,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng TaiLieu
CREATE TABLE TaiLieu (
    MaTaiLieu UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    TenTaiLieu VARCHAR(255) NOT NULL,
    DuongDan TEXT,
    NoiDung TEXT, -- Lưu text thô trích xuất từ PDF
    NgayTaiLen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng BaiKiemTra
CREATE TABLE BaiKiemTra (
    MaBaiKiemTra UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    ChuDe VARCHAR(255) NOT NULL,
    LoaiBaiKiemTra VARCHAR(50) NOT NULL, -- 'DAU_VAO', 'TONG_KET', 'FINAL'
    TrangThai VARCHAR(50) DEFAULT 'PENDING',
    TongDiem DECIMAL(5,2),
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng PhanKiemTra
CREATE TABLE PhanKiemTra (
    MaPKT UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaBaiKiemTra UUID REFERENCES BaiKiemTra(MaBaiKiemTra) ON DELETE CASCADE,
    TenPhan VARCHAR(100) NOT NULL,
    PhanTramDiem DECIMAL(5,2),
    is_the_weak_grade BOOLEAN DEFAULT FALSE
);

-- 5. Bảng CauHoi
CREATE TABLE CauHoi (
    MaCauHoi UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaPKT UUID REFERENCES PhanKiemTra(MaPKT) ON DELETE CASCADE,
    NoiDung TEXT NOT NULL,
    DSDapAn JSONB NOT NULL, -- Lưu mảng: ["a", "b", "b", "d"]
    DapAnDung TEXT NOT NULL
);

-- 6. Bảng ChiTietLamBai (Bảng trung gian lưu vết câu sai)
CREATE TABLE ChiTietLamBai (
    MaChiTiet UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    MaBaiKiemTra UUID REFERENCES BaiKiemTra(MaBaiKiemTra) ON DELETE CASCADE,
    MaCauHoi UUID REFERENCES CauHoi(MaCauHoi) ON DELETE CASCADE,
    LuaChon TEXT,
    LaCauDung BOOLEAN NOT NULL,
    ThoiGianLamBai TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bảng LoTrinhHoc
CREATE TABLE LoTrinhHoc (
    MaLoTrinh UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    TrangThai VARCHAR(50) DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'PASSED', 'FAILED'
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bảng NoiDungHoc -- liên kết với bảng lộ trình học
CREATE TABLE NoiDungHoc (
    MaNoiDung UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaLoTrinh UUID REFERENCES LoTrinhHoc(MaLoTrinh) ON DELETE CASCADE,
    NoiDung JSONB NOT NULL, -- Cấu trúc linh hoạt AI trả về
    TrangThai VARCHAR(50) DEFAULT 'LOCKED' -- 'LOCKED', 'UNLOCKED', 'COMPLETED'
);

-- 9. Bảng BoTheGhiNho
CREATE TABLE BoTheGhiNho (
    MaBoThe UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    TenBoThe VARCHAR(255) NOT NULL,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Bảng TheGhiNho (Tích hợp Spaced Repetition)
CREATE TABLE TheGhiNho (
    MaThe UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaBoThe UUID REFERENCES BoTheGhiNho(MaBoThe) ON DELETE CASCADE,
    MatTruoc TEXT NOT NULL,
    MatSau TEXT NOT NULL,
    MucDoGhiNho INTEGER DEFAULT 1,
    NgayOnTapTiepTheo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Bảng LichSuHocTap
CREATE TABLE LichSuHocTap (
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    MaBoThe UUID REFERENCES BoTheGhiNho(MaBoThe) ON DELETE CASCADE,
    TrangThai VARCHAR(50) DEFAULT 'DANG_HOC', 
    LanHocCuoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (MaNguoiDung, MaBoThe)
);

