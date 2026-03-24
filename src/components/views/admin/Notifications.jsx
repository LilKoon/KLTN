import { CheckCheck, Bot, UserPlus, AlertCircle } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="content-view active">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="heading-font fw-bold mb-1">Thông báo</h2>
          <p className="text-secondary mb-0">Cập nhật mới nhất về các tiến trình hệ thống.</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 rounded-3 px-3">
          <CheckCheck size={16} /> Đánh dấu đã đọc
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="list-group list-group-flush">
          <a href="#" className="list-group-item list-group-item-action p-4 bg-primary-subtle border-start border-4 border-primary border-top-0">
            <div className="d-flex w-100 justify-content-between mb-1">
              <h6 className="mb-0 fw-bold text-dark d-flex align-items-center"><Bot size={16} className="me-2 text-primary" /> AI Tóm Tắt Hoàn Tất</h6>
              <small className="text-primary fw-medium">Vừa xong</small>
            </div>
            <p className="mb-1 text-secondary small">Tài liệu "Cấu trúc Câu Khẳng định IELTS" đã được AI tóm tắt thành công.</p>
          </a>
          <a href="#" className="list-group-item list-group-item-action p-4 border-start border-4 border-transparent">
            <div className="d-flex w-100 justify-content-between mb-1">
              <h6 className="mb-0 fw-medium text-dark d-flex align-items-center"><UserPlus size={16} className="me-2 text-secondary" /> Học viên mới</h6>
              <small className="text-muted">2 giờ trước</small>
            </div>
            <p className="mb-1 text-secondary small">Học viên Lê Văn C đã tham gia. Cần phân công giáo trình phù hợp.</p>
          </a>
          <a href="#" className="list-group-item list-group-item-action p-4 border-start border-4 border-transparent">
            <div className="d-flex w-100 justify-content-between mb-1">
              <h6 className="mb-0 fw-medium text-dark d-flex align-items-center"><AlertCircle size={16} className="me-2 text-danger" /> Gia hạn Server</h6>
              <small className="text-muted">Hôm qua</small>
            </div>
            <p className="mb-1 text-secondary small">Hệ thống lưu trữ nội dung đang dùng đạt 85% dung lượng.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
