# KẾ HOẠCH TRIỂN KHAI NỀN TẢNG EDTECH AI (HYBRID LEARNING PLATFORM)
> **Phiên bản**: 3.0 (Cập nhật kiến trúc Hybrid & AI)
> **Tech Stack**: Frontend React (Vite) + Backend Python (FastAPI) + CSDL PostgreSQL

---

## TỔNG QUAN KIẾN TRÚC MỚI (DỰA TRÊN `ChucNang.txt`)

Hệ thống được thiết kế giải quyết triệt để 2 bài toán lớn trong giáo dục:
1. **Chống hổng kiến thức**: Học theo Khung chuẩn (Core Syllabus) để đảm bảo lý thuyết. Kiểm tra (Pass/Fail) 80% mỗi chặng.
2. **Cá nhân hóa cực độ (Hybrid AI)**: Thuật toán AI can thiệp vào lộ trình để **BỎ QUA (SKIP)** các bài đã giỏi và tự động **TĂNG CƯỜNG (BOOST)** sinh bài tập vá kỹ năng yếu. 

---

## CHI TIẾT CÁC GIAI ĐOẠN PHÁT TRIỂN (PHASE BREAKDOWN)

### ✅ Phase 1: Setup Môi trường & Database (ĐÃ HOÀN THÀNH)
- Thiết lập React Workspace (Tailwind, React Router).
- Khởi tạo Backend FastAPI + Cấu trúc Pydantic schemas.
- Thiết kế DB PostgreSQL: Bảng `NguoiDung`, `KhoaHoc`, `BaiHoc`, `NganHangCauHoi`, v.v.

### ✅ Phase 2: Core Authentication (ĐÃ HOÀN THÀNH)
- Hàm băm mật khẩu `bcrypt`, sinh Token JWT ở FastAPI.
- Giao diện `Login.jsx` (Client) & `AdminLogin.jsx` (Admin).
- Tích hợp Fetch API từ React (`AuthContext.jsx`) kết nối Backend `/auth/login`, `/auth/register`.

### 🚀 Phase 3: Hybrid Learning Engine (Trái tim của Hệ thống - Đang triển khai)
Đây là cốt lõi theo đúng file `ChucNang.txt` phân hệ 1.

#### 📍 Phase 3.1: Micro-Test & Onboarding (Khởi động)
- **Mục tiêu**: Phân loại đầu vào. Cho phép User chọn 1 trong 2 rẽ nhánh: Học từ Số 0 hoặc Test năng lực.
- **Backend Task**: API lấy ngẫu nhiên 20 câu trong `NganHangCauHoi` theo đa dạng kỹ năng. API lưu `DiemNangLuc`.
- **Frontend Task**: Giao diện làm bài Micro-Test. Hiển thị báo cáo đánh giá kỹ năng ngay sau khi nộp bài.

#### 📍 Phase 3.2: Cơ chế Cốt lõi (Core Syllabus & Checkpoint 80%)
- **Mục tiêu**: Xây dựng Lộ trình cứng (Cây bài học).
- **Backend Task**: API trả về danh sách `KhoaHoc` và `BaiHoc`. API kiểm tra đáp án (Passing Grade 80% required).
- **Frontend Task**: Giao diện học lý thuyết. Logic khóa các Node bài học phía sau nếu Node trước chưa đạt 80%.

#### 📍 Phase 3.3: AI Personalization (Cơ chế SKIP & BOOST)
- **Mục tiêu**: AI tự động thay đổi cấu trúc cây Lộ trình của từng user.
- **Cơ chế SKIP**: API phân tích `DiemNangLuc` đầu vào. Nếu Node A thuộc kỹ năng > 90%, API set status node A thành `skipped`. Tiết kiệm thời gian.
- **Cơ chế BOOST**: Khi user trượt bài Checkpoint (Pass/Fail) quá 2 lần, API gọi LLM (Gemini/ChatGPT) tự động sinh ra một chặng bài tập bổ trợ chèn ngay vào lộ trình và đánh dấu `boosted`.

---

### 🚀 Phase 4: Trợ lý Tự học & Gamification
Giải quyết mục số 3 và 4 trong tài liệu `ChucNang.txt`.

#### 📍 Phase 4.1: AI Flashcards Generator (Học mở rộng)
- **Mục tiêu**: Tự động sinh thẻ từ vựng từ ngách cụ thể hoặc từ File tài liệu.
- **Backend Task**: Viết API `/ai/generate-flashcard` nhận Upload PDF hoặc Text Input (ví dụ "Ngữ cảnh IT"), gọi Gemini AI trích xuất (Từ vựng, Phiên âm, Định nghĩa, Ví dụ). Lưu DB.
- **Frontend Task**: Giao diện lật Flashcard 2 mặt (Flip Card animation).

#### 📍 Phase 4.2: Tự động Gom Lỗi Sai (Auto-Save Mistakes)
- **Mục tiêu**: Khắc sâu kiến thức từ sai lầm.
- **Logic**: Crawler ngầm quét các câu mà User chọn sai trong các bài Test, tự động Convert thành Flashcard ném vào kho "Ôn tập".

#### 📍 Phase 4.3: Gamification & Spaced Repetition (Động lực)
- **Mục tiêu**: Giữ chân người dùng mỗi ngày.
- **Logic**: 
  - API tính toán Spaced Repetition (Đường cong lãng quên): Yêu cầu người dùng ôn lại thẻ ngay màn hình đăng nhập.
  - Dashboard UI: Biểu đồ Heatmap (Chuỗi ngày học liên tục giống Github), biểu đồ Radar đánh giá năng lực hiện tại.

---

### 🚀 Phase 5: Phân hệ Admin CMS (Quản trị Sư phạm)
Xây dựng quyền lực cho Giảng viên/Quản trị viên (Phân hệ 2 `ChucNang.txt`).

#### 📍 Task 5.1: Quản lý Khung Sư phạm (Core Content)
- **Backend Task**: API CRUD `KhoaHoc`, `BaiHoc`, `NganHangCauHoi`.
- **Frontend Task**: Giao diện Bảng CRUD, Upload nội dung động (Rich text editor).

#### 📍 Task 5.2: Giám sát Lộ trình & Duyệt AI
- **Backend Task**: API xem thống kê tiến độ của User A. API `human-in-the-loop` cho phép duyệt/xóa các Flashcard do AI sinh bị lệch chuẩn (Báo cáo lỗi nội dung).
- **Frontend Task**: Màn hình Giám sát tiến độ học viên, duyệt Báo cáo Report. Biểu đồ thống kê tăng trưởng hệ thống.

---

## 🎯 CỘT MỐC TIẾP THEO (NEXT STEP TRONG SESSION)
**Target:** Thực thi **Phase 3.1 & 3.2**
1. Đổ dữ liệu mẫu (Seeder) cho Bảng Câu hỏi phân loại đầu vào.
2. Code API `/test/placement` để Frontend bốc câu random.
3. Code giao diện làm bài Test trên Frontend.
