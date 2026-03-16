# Edtech AI Smart Companion (Option C) - Project Plan

## Goal
Xây dựng nền tảng học Tiếng Anh kết hợp AI (Smart Companion), hỗ trợ hai luồng chính: Học theo Topic (sinh Micro-lesson) và Học theo File (Upload PDF -> Tóm tắt, Flashcard, Q&A).
Sử dụng **ReactJS** cho Frontend, và **Python** (FastAPI/Django/Flask) cho Backend.

## Tech Stack
-   **Frontend:** ReactJS, Tailwind CSS (Styling), Axios (API calls).
-   **Backend:** Python (Khuyến nghị FastAPI vì hỗ trợ Asynchronous tốt cho AI Streaming), Pydantic, SQLAlchemy.
-   **AI Integration:** OpenAI API (hoặc Anthropic/Gemini) kết hợp với LangChain/LlamaIndex cho tác vụ RAG (PDF processing).
-   **Database:** PostgreSQL (Lưu User, Progress, Flashcard) + Vector Database (ChromaDB / Pinecone để lưu PDF Embeddings).
-   **Background Worker:** Celery + Redis (Dùng cho luồng Upload PDF nặng).

## Tasks & Phases

### Phase 1: Core System & Infrastructure Setup
- [ ] Task 1.1: Backend - Khởi tạo dự án Python, setup FastAPI, connect PostgreSQL. → Verify: `curl localhost:8000/health` returns 200 OK.
- [ ] Task 1.2: Frontend - Khởi tạo dự án ReactJS (Vite), setup Tailwind, định tuyến (React Router). → Verify: Chạy `npm run dev` xem trang Home load thành công.
- [ ] Task 1.3: Database - Thiết kế Schema cơ bản (Users, Topics, Courses, Documents). → Verify: Kiểm tra các table đã tạo trong PostgreSQL.
- [ ] Task 1.4: AI - Đăng ký API Key (OpenAI), setup class Base LLM Client trong Backend. → Verify: Gọi hàm test AI trả về kết quả "Hello World".

### Phase 2: Micro-Learning Module (Luồng Topic)
- [ ] Task 2.1: Tham số hóa Prompt - Viết các prompt tạo Từ vựng, Hội thoại, và Trắc nghiệm. → Verify: Gửi "Sân bay", AI trả về đúng định dạng JSON 3 phần.
- [ ] Task 2.2: API Endpoint - Viết API `/api/v1/generate/topic` (Streaming hoặc Sync) gọi LLM. → Verify: Dùng Postman gọi API và nhận response JSON.
- [ ] Task 2.3: UI - Xây dựng trang nhập Topic và Dashboard hiển thị (Từ vựng, Bài đọc, Quiz). → Verify: Giao diện render đẹp mắt, không lỗi layout.
- [ ] Task 2.4: API Integration - Nối UI vào API, lưu kết quả bài học vào DB sau khi học xong. → Verify: User thao tác hết bài, kiểm tra data trong PostgreSQL.

### Phase 3: Document Processing Module (Luồng PDF/DOC - RAG)
- [ ] Task 3.1: Setup Worker - Cài đặt Celery/Redis cho Background processing. → Verify: Worker khởi chạy và nhận một thử nghiệm dummy task.
- [ ] Task 3.2: PDF Parsing & UI - Viết API `/api/v1/upload/document`, UI cho phép kéo thả file PDF. → Verify: Up file PDF lên, file lưu vào local/cloud storage thành công.
- [ ] Task 3.3: Task Xử lý PDF - Viết logic: Đọc PDF -> Tóm tắt -> Bóc tách từ vựng -> Load vào Vector DB. → Verify: File 20 trang chạy qua Worker, Vector DB có data mới.
- [ ] Task 3.4: RAG Chatbot - Viết API `/api/v1/chat` để User hỏi đáp về nội dung file. → Verify: Hỏi "Trong file trang 3 có chữ gì khó?", AI lấy đúng context trả lời.
- [ ] Task 3.5: Giao diện Document Workspace - Xây dựng UI xem Tóm tắt, lật Flashcard bóc từ PDF, khung Chatbot. → Verify: UI hiển thị đồng bộ kết quả từ Backend khi Worker báo "Done".

### Phase 4: Assessment & Tracking (Chấm điểm & Theo dõi tiến độ)
- [ ] Task 4.1: Logic làm Quiz - Xây dựng component trắc nghiệm, chấm điểm tức thời. → Verify: Click sai hiện đỏ, đúng hiện xanh, tính tổng điểm cuối bài.
- [ ] Task 4.2: Lưu trữ kết quả - API lưu tiến trình học (completed topics, document progress). → Verify: Tắt web đi bật lại, thấy tiến trình vẫn được lưu.

## Done When
- [ ] User có thể nhập 1 topic, nhận được bài học thu nhỏ và làm bài tập trắc nghiệm hoạt động trơn tru.
- [ ] User có thể upload 1 file PDF, chờ tóm tắt và bóc tách từ vựng, có thể chat để hỏi thêm.
- [ ] Hệ thống hoạt động ổn định, backend không sập khi file PDF lớn.
- [ ] File `edtech-ai-plan.md` đã được user duyệt (phục vụ đồ án).
