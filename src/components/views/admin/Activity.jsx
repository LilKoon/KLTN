import { Flame } from 'lucide-react';

export default function Activity() {
  return (
    <div className="content-view active">
      <h2 className="heading-font fw-bold mb-1">Theo dõi Hoạt động Người dùng</h2>
      <p className="text-secondary mb-4">Ghi nhận tiến trình học tập và hành vi tương tác.</p>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white p-4 border-bottom-0">
              <h5 className="fw-semibold mb-0">Dòng Sự Kiện Gần Đây</h5>
            </div>
            <div className="card-body px-4 pt-0 pb-4">
              <div className="timeline position-relative ps-3 border-start py-2" style={{ marginLeft: '10px', borderLeft: '2px solid #e2e8f0' }}>
                
                <div className="timeline-item mb-4 position-relative">
                  <div className="position-absolute bg-primary rounded-circle border border-2 border-white" style={{ width: '14px', height: '14px', left: '-21px', top: '4px' }}></div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-medium">Trần Thị B đã hoàn thành bài thi: <a href="#" className="text-decoration-none">Test 1 - Reading</a></span>
                    <span className="text-muted small">10 phút trước</span>
                  </div>
                  <p className="text-muted small mb-0">Điểm: 8.5/10. AI đã tự động tạo danh sách từ vựng từ bài thi này cho học viên.</p>
                </div>

                <div className="timeline-item mb-4 position-relative">
                  <div className="position-absolute bg-success rounded-circle border border-2 border-white" style={{ width: '14px', height: '14px', left: '-21px', top: '4px' }}></div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-medium">Hệ thống tạo thành công tài liệu: <a href="#" className="text-decoration-none text-success">Grammar Summary Unit 5</a></span>
                    <span className="text-muted small">1 giờ trước</span>
                  </div>
                  <p className="text-muted small mb-0">24 học viên đã tải tài liệu này kể từ khi tạo.</p>
                </div>

                <div className="timeline-item position-relative">
                  <div className="position-absolute bg-secondary rounded-circle border border-2 border-white" style={{ width: '14px', height: '14px', left: '-21px', top: '4px' }}></div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-medium">Phạm Thị D đăng nhập sau 15 ngày vắng mặt.</span>
                    <span className="text-muted small">3 giờ trước</span>
                  </div>
                  <p className="text-muted small mb-0">AI đã gửi email gợi ý ôn tập kiến thức cũ.</p>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="fw-semibold mb-3">Học Viên Tích Cực Nhất</h5>
              
              <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                <img src="https://i.pravatar.cc/150?img=47" className="rounded-circle" width="45" height="45" alt="Top User" />
                <div className="flex-grow-1">
                  <p className="mb-0 fw-medium">Nguyễn Tuấn E</p>
                  <p className="mb-0 small text-muted">24 giờ học (Tuần này)</p>
                </div>
                <div className="text-warning d-flex align-items-center gap-1">
                  <Flame width={20} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                  <span className="small fw-bold text-dark">12</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                <img src="https://i.pravatar.cc/150?img=32" className="rounded-circle" width="45" height="45" alt="Top User" />
                <div className="flex-grow-1">
                  <p className="mb-0 fw-medium">Trần Thị B</p>
                  <p className="mb-0 small text-muted">18 giờ học</p>
                </div>
                <div className="text-warning d-flex align-items-center gap-1">
                  <Flame width={20} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                  <span className="small fw-bold text-dark">8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
