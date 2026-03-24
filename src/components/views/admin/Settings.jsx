export default function Settings() {
  return (
    <div className="content-view active">
      <h2 className="heading-font fw-bold mb-1">Cài đặt Hệ thống</h2>
      <p className="text-secondary mb-4">Tùy chỉnh trải nghiệm và giao diện của bạn.</p>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h5 className="fw-semibold mb-4">Tùy chọn Chung</h5>
          
          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <div>
              <h6 className="fw-medium mb-1">Ngôn ngữ Hiển thị</h6>
              <p className="small text-muted mb-0">Chọn ngôn ngữ mặc định cho giao diện</p>
            </div>
            <select className="form-select w-auto rounded-3" defaultValue="vi">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English (US)</option>
            </select>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <div>
              <h6 className="fw-medium mb-1">Nhận email thông báo</h6>
              <p className="small text-muted mb-0">Khuyến nghị bật để nhận cảnh báo về học viên</p>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" role="switch" defaultChecked style={{ transform: 'scale(1.2)' }} />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h6 className="fw-medium mb-1">Giao diện (Sáng/Tối)</h6>
              <p className="small text-muted mb-0">Chủ đề sáng được khuyên dùng cho Edtech.</p>
            </div>
            <select className="form-select w-auto rounded-3" defaultValue="light" disabled>
              <option value="light">Giao diện Sáng</option>
              <option value="dark">Giao diện Tối</option>
            </select>
          </div>

        </div>
      </div>
    </div>
  );
}
