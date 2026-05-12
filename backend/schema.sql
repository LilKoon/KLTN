-- Tự động sinh từ models.py bằng SQLAlchemy


CREATE TABLE cau_hinh_he_thong (
	"Khoa" VARCHAR(100) NOT NULL, 
	"GiaTri" TEXT, 
	"MoTa" VARCHAR(255), 
	"NgayCapNhat" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("Khoa")
)

;


CREATE TABLE khoa_hoc (
	"MaKhoaHoc" UUID NOT NULL, 
	"TenKhoaHoc" VARCHAR(255) NOT NULL, 
	"MoTa" TEXT, 
	"MucDo" VARCHAR(50), 
	"TrangThai" VARCHAR(50), 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaKhoaHoc")
)

;


CREATE TABLE nguoi_dung (
	"MaNguoiDung" UUID NOT NULL, 
	"TenNguoiDung" VARCHAR(255) NOT NULL, 
	"Email" VARCHAR(255) NOT NULL, 
	"MatKhau" VARCHAR(255) NOT NULL, 
	"VaiTro" VARCHAR(50), 
	"TrangThai" VARCHAR(50), 
	"DiemNangLuc" FLOAT, 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	"IsVerified" BOOLEAN, 
	"VerifyOTP" VARCHAR(6), 
	"OTPExpiry" TIMESTAMP WITHOUT TIME ZONE, 
	"GoogleId" VARCHAR(100), 
	"AvatarUrl" VARCHAR(500), 
	"OAuthProvider" VARCHAR(20), 
	"SoDienThoai" VARCHAR(20), 
	"TieuSu" TEXT, 
	"LastSeenAt" TIMESTAMP WITHOUT TIME ZONE, 
	"GoiDangKy" VARCHAR(20), 
	"GoiHetHan" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaNguoiDung"), 
	UNIQUE ("Email"), 
	UNIQUE ("GoogleId")
)

;


CREATE TABLE bai_hoc (
	"MaBaiHoc" UUID NOT NULL, 
	"MaKhoaHoc" UUID, 
	"TenBaiHoc" VARCHAR(255) NOT NULL, 
	"ThuTu" INTEGER NOT NULL, 
	"NoiDungLyThuyet" JSONB, 
	"TrangThai" VARCHAR(50), 
	"KyNang" VARCHAR(50), 
	"ChuDe" VARCHAR(255), 
	"FileAudio" VARCHAR(255), 
	PRIMARY KEY ("MaBaiHoc"), 
	FOREIGN KEY("MaKhoaHoc") REFERENCES khoa_hoc ("MaKhoaHoc") ON DELETE CASCADE
)

;


CREATE TABLE bai_kiem_tra (
	"MaBaiKiemTra" UUID NOT NULL, 
	"MaNguoiDung" UUID NOT NULL, 
	"MaKhoaHoc" UUID, 
	"LoaiBaiKiemTra" VARCHAR(50) NOT NULL, 
	"TrangThai" VARCHAR(50), 
	"TongDiem" FLOAT, 
	"MoTaDanhGiaAI" TEXT, 
	"KetQuaLevel" INTEGER, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaBaiKiemTra"), 
	FOREIGN KEY("MaNguoiDung") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE CASCADE
)

;


CREATE TABLE bai_test_ai (
	"MaBaiTestAI" UUID NOT NULL, 
	"MaNguoiDung" UUID NOT NULL, 
	"TenBaiTest" VARCHAR(255) NOT NULL, 
	"ChuDe" VARCHAR(255), 
	"CapDo" VARCHAR(10), 
	"SoLuongCau" INTEGER, 
	"DSCauHoi" JSONB NOT NULL, 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaBaiTestAI"), 
	FOREIGN KEY("MaNguoiDung") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE CASCADE
)

;


CREATE TABLE bo_the_flashcard (
	"MaBoDe" UUID NOT NULL, 
	"MaNguoiDung" UUID NOT NULL, 
	"TenBoDe" VARCHAR(200) NOT NULL, 
	"CapDo" VARCHAR(10) NOT NULL, 
	"SoLuongThe" INTEGER NOT NULL, 
	"DuLieuThe" JSON NOT NULL, 
	"LaHeThong" BOOLEAN, 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaBoDe"), 
	FOREIGN KEY("MaNguoiDung") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE CASCADE
)

;


CREATE TABLE danh_gia (
	"MaDanhGia" UUID NOT NULL, 
	"MaNguoiDung" UUID NOT NULL, 
	"LoaiDoiTuong" VARCHAR(50), 
	"MaDoiTuong" UUID, 
	"DiemDanhGia" INTEGER, 
	"NoiDung" TEXT NOT NULL, 
	"TrangThai" VARCHAR(20), 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	"NgayDuyet" TIMESTAMP WITHOUT TIME ZONE, 
	"MaAdminDuyet" UUID, 
	PRIMARY KEY ("MaDanhGia"), 
	FOREIGN KEY("MaNguoiDung") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE CASCADE, 
	FOREIGN KEY("MaAdminDuyet") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE SET NULL
)

;


CREATE TABLE giao_dich (
	"MaGiaoDich" UUID NOT NULL, 
	"MaNguoiDung" UUID NOT NULL, 
	"Goi" VARCHAR(20) NOT NULL, 
	"SoThang" INTEGER, 
	"SoTien" INTEGER NOT NULL, 
	"PhuongThuc" VARCHAR(30) NOT NULL, 
	"TrangThai" VARCHAR(20), 
	"MaGiaoDichNgoai" VARCHAR(100), 
	"GhiChu" TEXT, 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	"NgayCapNhat" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaGiaoDich"), 
	FOREIGN KEY("MaNguoiDung") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE CASCADE
)

;


CREATE TABLE lo_trinh_ca_nhan (
	"MaLoTrinh" UUID NOT NULL, 
	"MaNguoiDung" UUID, 
	"TrangThai" VARCHAR(50), 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaLoTrinh"), 
	UNIQUE ("MaNguoiDung"), 
	FOREIGN KEY("MaNguoiDung") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE CASCADE
)

;


CREATE TABLE nhat_ky_hoat_dong (
	"MaNhatKy" UUID NOT NULL, 
	"MaNguoiDung" UUID, 
	"HanhDong" VARCHAR(100) NOT NULL, 
	"DoiTuong" VARCHAR(100), 
	"ChiTiet" JSONB, 
	"DiaChiIP" VARCHAR(45), 
	"UserAgent" VARCHAR(500), 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaNhatKy"), 
	FOREIGN KEY("MaNguoiDung") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE SET NULL
)

;


CREATE TABLE phien_chat (
	"MaPhien" UUID NOT NULL, 
	"MaNguoiDung" UUID NOT NULL, 
	"TieuDe" VARCHAR(200) NOT NULL, 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	"NgayCapNhat" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaPhien"), 
	FOREIGN KEY("MaNguoiDung") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE CASCADE
)

;


CREATE TABLE rate_limit_counter (
	"MaCounter" UUID NOT NULL, 
	"MaNguoiDung" UUID NOT NULL, 
	"TinhNang" VARCHAR(50) NOT NULL, 
	"Ngay" VARCHAR(10) NOT NULL, 
	"SoLuong" INTEGER, 
	PRIMARY KEY ("MaCounter"), 
	FOREIGN KEY("MaNguoiDung") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE CASCADE
)

;


CREATE TABLE tai_lieu_hoc_tap (
	"MaTaiLieu" UUID NOT NULL, 
	"TenTaiLieu" VARCHAR(255) NOT NULL, 
	"MoTa" TEXT, 
	"LoaiTaiLieu" VARCHAR(50) NOT NULL, 
	"LoaiFile" VARCHAR(20), 
	"DungLuong" INTEGER, 
	"DuongDan" VARCHAR(500) NOT NULL, 
	"MaNguoiTaiLen" UUID, 
	"TrangThai" VARCHAR(20), 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaTaiLieu"), 
	FOREIGN KEY("MaNguoiTaiLen") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE SET NULL
)

;


CREATE TABLE tai_lieu_rag (
	"MaTaiLieu" UUID NOT NULL, 
	"MaNguoiDung" UUID, 
	"TenHienThi" VARCHAR(200) NOT NULL, 
	"TenFile" VARCHAR(200) NOT NULL, 
	"Namespace" VARCHAR(100) NOT NULL, 
	"SoChunk" INTEGER, 
	"LaAdminDoc" BOOLEAN, 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaTaiLieu"), 
	FOREIGN KEY("MaNguoiDung") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE CASCADE
)

;


CREATE TABLE thong_bao (
	"MaThongBao" UUID NOT NULL, 
	"TieuDe" VARCHAR(255) NOT NULL, 
	"NoiDung" TEXT NOT NULL, 
	"DoiTuongNhan" VARCHAR(20), 
	"MaNguoiTao" UUID, 
	"TrangThai" VARCHAR(20), 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaThongBao"), 
	FOREIGN KEY("MaNguoiTao") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE SET NULL
)

;


CREATE TABLE ngan_hang_cau_hoi (
	"MaCauHoi" UUID NOT NULL, 
	"MaKhoaHoc" UUID, 
	"MaBaiHoc" UUID, 
	"KyNang" VARCHAR(50) NOT NULL, 
	"MucDo" VARCHAR(50), 
	"NoiDung" TEXT NOT NULL, 
	"DSDapAn" JSONB NOT NULL, 
	"DapAnDung" TEXT NOT NULL, 
	"GiaiThich" TEXT, 
	"NguonPDF" VARCHAR(200), 
	"FileAudio" VARCHAR(255), 
	"TrangThai" VARCHAR(50), 
	"DoKho" FLOAT, 
	PRIMARY KEY ("MaCauHoi"), 
	FOREIGN KEY("MaKhoaHoc") REFERENCES khoa_hoc ("MaKhoaHoc") ON DELETE SET NULL, 
	FOREIGN KEY("MaBaiHoc") REFERENCES bai_hoc ("MaBaiHoc") ON DELETE SET NULL
)

;


CREATE TABLE phan_kiem_tra (
	"MaPKT" UUID NOT NULL, 
	"MaBaiKiemTra" UUID NOT NULL, 
	"KyNang" VARCHAR(50) NOT NULL, 
	"PhanTramDiem" FLOAT, 
	"KetQuaLevel" INTEGER, 
	is_the_weak_grade BOOLEAN, 
	PRIMARY KEY ("MaPKT"), 
	FOREIGN KEY("MaBaiKiemTra") REFERENCES bai_kiem_tra ("MaBaiKiemTra") ON DELETE CASCADE
)

;


CREATE TABLE tai_lieu_chat (
	"MaTaiLieu" UUID NOT NULL, 
	"MaPhien" UUID NOT NULL, 
	"TenFile" VARCHAR(255) NOT NULL, 
	"LoaiNguon" VARCHAR(20) NOT NULL, 
	"NoiDungText" TEXT NOT NULL, 
	"SoKyTu" INTEGER, 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaTaiLieu"), 
	FOREIGN KEY("MaPhien") REFERENCES phien_chat ("MaPhien") ON DELETE CASCADE
)

;


CREATE TABLE trang_thai_node (
	"MaNode" UUID NOT NULL, 
	"MaLoTrinh" UUID, 
	"MaBaiHoc" UUID, 
	"TieuDe" VARCHAR(255) NOT NULL, 
	"MoTa" TEXT, 
	"ThuTu" INTEGER NOT NULL, 
	"LoaiNode" VARCHAR(50), 
	"TrangThai" VARCHAR(50), 
	"NoiDungBoost" JSONB, 
	"DiemOntap" FLOAT, 
	"SoLanThu" INTEGER, 
	PRIMARY KEY ("MaNode"), 
	FOREIGN KEY("MaLoTrinh") REFERENCES lo_trinh_ca_nhan ("MaLoTrinh") ON DELETE CASCADE, 
	FOREIGN KEY("MaBaiHoc") REFERENCES bai_hoc ("MaBaiHoc") ON DELETE SET NULL
)

;


CREATE TABLE trang_thai_sr (
	"MaSR" UUID NOT NULL, 
	"MaBoDe" UUID NOT NULL, 
	"IndexThe" INTEGER NOT NULL, 
	"EasinessFactor" FLOAT, 
	"Interval" INTEGER, 
	"Repetitions" INTEGER, 
	"NextDue" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaSR"), 
	FOREIGN KEY("MaBoDe") REFERENCES bo_the_flashcard ("MaBoDe") ON DELETE CASCADE
)

;


CREATE TABLE cau_hoi_sr (
	"MaSR" UUID NOT NULL, 
	"MaNguoiDung" UUID NOT NULL, 
	"MaCauHoi" UUID NOT NULL, 
	"EasinessFactor" FLOAT, 
	"Interval" INTEGER, 
	"Repetitions" INTEGER, 
	"NextDue" TIMESTAMP WITHOUT TIME ZONE, 
	"LastSeen" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaSR"), 
	FOREIGN KEY("MaNguoiDung") REFERENCES nguoi_dung ("MaNguoiDung") ON DELETE CASCADE, 
	FOREIGN KEY("MaCauHoi") REFERENCES ngan_hang_cau_hoi ("MaCauHoi") ON DELETE CASCADE
)

;


CREATE TABLE chi_tiet_lam_bai (
	"MaChiTiet" UUID NOT NULL, 
	"MaBaiKiemTra" UUID NOT NULL, 
	"MaCauHoi" UUID NOT NULL, 
	"LuaChon" TEXT, 
	"LaCauDung" BOOLEAN NOT NULL, 
	"ThoiGianLamCauHoi" INTEGER, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaChiTiet"), 
	FOREIGN KEY("MaBaiKiemTra") REFERENCES bai_kiem_tra ("MaBaiKiemTra") ON DELETE CASCADE, 
	FOREIGN KEY("MaCauHoi") REFERENCES ngan_hang_cau_hoi ("MaCauHoi") ON DELETE CASCADE
)

;


CREATE TABLE tin_nhan_chat (
	"MaTinNhan" UUID NOT NULL, 
	"MaPhien" UUID NOT NULL, 
	"VaiTro" VARCHAR(20) NOT NULL, 
	"NoiDung" TEXT NOT NULL, 
	"MaTaiLieu" UUID, 
	"ThuTu" INTEGER NOT NULL, 
	"NgayTao" TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY ("MaTinNhan"), 
	FOREIGN KEY("MaPhien") REFERENCES phien_chat ("MaPhien") ON DELETE CASCADE, 
	FOREIGN KEY("MaTaiLieu") REFERENCES tai_lieu_chat ("MaTaiLieu") ON DELETE SET NULL
)

;

