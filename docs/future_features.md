# Future Features & Ideas (Gamification)

Tài liệu này lưu trữ các ý tưởng tính năng đã được brainstorm nhưng tạm thời hoãn lại (Out of Scope) trong Phase hiện tại để tập trung vào các luồng nghiệp vụ cốt lõi.

## Option B: Hệ thống Danh hiệu & Bảng xếp hạng (Badges & Leaderboard)

**Mô tả:** 
Xây dựng lớp sâu hơn của hệ thống Gamification bên cạnh Chuỗi ngày học (Streak). Hệ thống này sẽ cấp tự động các Huy hiệu khi User đạt thành tựu nhất định (ví dụ: thi được 100 điểm, duy trì 7 ngày học liên tiếp) và xếp hạng tín dụng học tập theo tuần.

**Cấu trúc SQL dự kiến (Tham khảo):**
```sql
CREATE TABLE DanhHieu (
    MaDanhHieu UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    TenDanhHieu VARCHAR(255) NOT NULL,
    Icon VARCHAR(255),
    MoTa TEXT,
    DieuKienDatDuoc JSONB -- Logic rules
);

CREATE TABLE NguoiDung_DanhHieu (
    MaBanGhi UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    MaNguoiDung UUID REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    MaDanhHieu UUID REFERENCES DanhHieu(MaDanhHieu) ON DELETE CASCADE,
    NgayNhan TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**Implementation Strategy:**
- Khi người dùng hoàn thành 1 khóa học hoặc 1 bài kiểm tra, Backend sẽ kích hoạt một **Background Worker** để quét xem điểm của người dùng có khớp với `DieuKienDatDuoc` trong bảng `DanhHieu` hay không.
- Nếu khớp, insert vào bảng `NguoiDung_DanhHieu` và push Push Notification qua Firebase/APNS chúc mừng người dùng.
