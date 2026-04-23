# HƯỚNG DẪN CHẠY HỆ THỐNG THỦ CÔNG (MANUAL RUN)

Tài liệu này hướng dẫn cách khởi động toàn bộ hệ thống EdTech AI (bao gồm Backend và Frontend) trên máy tính của bạn.

---

## 1. Yêu cầu hệ thống
- **Node.js** (v18 trở lên)
- **Python** (3.10 trở lên)
- **PostgreSQL** (Đang chạy trên cổng `8386`)

### Sử dụng Conda (Khuyên dùng)
Nếu bạn sử dụng Conda, bạn có thể tạo môi trường và cài đặt thư viện như sau:
```bash
# Tạo môi trường mới
conda create -n edtech_ai python=3.10 -y

# Kích hoạt môi trường
conda activate edtech_ai

# Di chuyển vào thư mục backend
cd backend

# Cài đặt các thư viện chính qua conda (nếu muốn tối ưu)
conda install numpy psycopg2 faiss-cpu -c conda-forge -y

# Cài đặt tất cả các thư viện còn lại qua pip
pip install -r requirements.txt
```

---

## 2. Khởi tạo Cơ sở dữ liệu (Database)

Đảm bảo PostgreSQL đang chạy trên cổng `8386`.

1. Mở Terminal và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện cần thiết (nếu chưa):
   ```bash
   pip install -r requirements.txt
   ```
3. Chạy script khởi tạo database:
   ```bash
   python init_db.py
   ```
   *Script này sẽ tạo database `kltn_edtech_ai` và nạp schema từ file SQL.*

4. (Tùy chọn) Tạo tài khoản admin mặc định:
   ```bash
   python create_admin.py
   ```

---

## 3. Khởi chạy Backend (FastAPI)

1. Mở một Terminal mới.
2. Di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
3. Kích hoạt môi trường ảo (nếu có):
   ```bash
   .\venv\Scripts\activate
   ```
4. Chạy server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *API sẽ chạy tại: `http://127.0.0.1:8000`*

---

## 4. Khởi chạy Frontend (React + Vite)

1. Mở một Terminal mới khác.
2. Di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
3. Cài đặt các gói phụ thuộc (nếu là lần đầu):
   ```bash
   npm install
   ```
4. Chạy frontend ở chế độ phát triển:
   ```bash
   npm run dev
   ```
   *Frontend sẽ chạy tại: `http://localhost:5173`*

---

## 5. Tài khoản đăng nhập mẫu

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Admin** | `admin@edtech.ai` | `admin123` |
| **Học viên** | `nguyenvana@gmail.com` | `123456` |

---

## 6. Lưu ý quan trọng
- Luôn khởi động **Database** trước khi chạy Backend.
- Backend phải đang chạy (cổng 8000) để Frontend có thể gọi API.
- Nếu gặp lỗi kết nối AI, hãy kiểm tra các API Key trong file `backend/.env`.
