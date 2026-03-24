import { FolderPlus, Clock, Users } from 'lucide-react';

export default function Content() {
  return (
    <div className="content-view active">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="heading-font fw-bold mb-1">Quản lý Nội dung Học tập</h2>
          <p className="text-secondary mb-0">Giáo trình, bài giảng và tài liệu AI sinh tự động.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 rounded-3 shadow-sm px-4">
          <FolderPlus size={18} /> Tạo Khóa Mới
        </button>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card course-card border-0 shadow-sm h-100 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1499506440149-85816d0033cb?w=600&auto=format&fit=crop" className="card-img-top" alt="Course" style={{ height: '160px', objectFit: 'cover' }} />
            <div className="card-body p-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">Ngữ Pháp Cơ Bản</span>
                <span className="text-muted small d-flex align-items-center"><Clock size={14} className="me-1" /> 12h 30m</span>
              </div>
              <h5 className="fw-bold mb-2">IELTS Foundation - Level 1</h5>
              <p className="text-muted small mb-3">Nắm vững ngữ pháp cốt lõi cho kỳ thi IELTS với tài liệu được tóm tắt bởi AI.</p>
              <div className="progress mb-2" style={{ height: '6px' }}>
                <div className="progress-bar bg-success" role="progressbar" style={{ width: '75%' }} aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <p className="small text-muted mb-0">Tiến độ khóa học: 75% hoàn thành (TB)</p>
            </div>
            <div className="card-footer bg-white px-4 py-3 border-top d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 text-muted small">
                <Users size={16} /> 1,204 Học viên
              </div>
              <button className="btn btn-sm btn-outline-primary rounded-pill px-3">Quản lý</button>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card course-card border-0 shadow-sm h-100 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1546410531-bea5aadcb6ce?w=600&auto=format&fit=crop" className="card-img-top" alt="Course" style={{ height: '160px', objectFit: 'cover' }} />
            <div className="card-body p-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="badge bg-info-subtle text-info border border-info-subtle">Luyện Nói</span>
                <span className="text-muted small d-flex align-items-center"><Clock size={14} className="me-1" /> 8h 15m</span>
              </div>
              <h5 className="fw-bold mb-2">Speak Like A Native</h5>
              <p className="text-muted small mb-3">Kho bài tập phản xạ ứng dụng AI để phân tích và đánh giá phát âm.</p>
              <div className="progress mb-2" style={{ height: '6px' }}>
                <div className="progress-bar bg-primary" role="progressbar" style={{ width: '45%' }} aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <p className="small text-muted mb-0">Tiến độ khóa học: 45% hoàn thành (TB)</p>
            </div>
            <div className="card-footer bg-white px-4 py-3 border-top d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 text-muted small">
                <Users size={16} /> 849 Học viên
              </div>
              <button className="btn btn-sm btn-outline-primary rounded-pill px-3">Quản lý</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
