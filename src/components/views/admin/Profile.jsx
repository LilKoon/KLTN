export default function Profile() {
  return (
    <div className="content-view active">
      <h2 className="heading-font fw-bold mb-1">Hồ sơ Cá nhân</h2>
      <p className="text-secondary mb-4">Quản lý thông tin và bảo mật tài khoản.</p>
      
      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm text-center p-4">
            <img src="https://i.pravatar.cc/150?img=11" className="rounded-circle mx-auto mb-3 border border-3 border-white shadow-sm" style={{ width: '120px', height: '120px', objectFit: 'cover' }} alt="Profile Picture" />
            <h5 className="fw-bold mb-1">Nguyễn Văn A</h5>
            <p className="text-muted small mb-3">Quản trị viên Hệ thống</p>
            <button className="btn btn-outline-primary btn-sm rounded-pill w-100 mb-2">Đổi Ảnh Đại Diện</button>
            <button className="btn btn-light btn-sm rounded-pill w-100 text-danger">Xóa Ảnh</button>
          </div>
        </div>
        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-semibold mb-3 pb-2 border-bottom">Thông tin cá nhân</h5>
            <form onSubmit={e => e.preventDefault()}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium text-dark">Họ và tên</label>
                  <input type="text" className="form-control px-3 py-2 rounded-3" defaultValue="Nguyễn Văn A" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium text-dark">Số điện thoại</label>
                  <input type="tel" className="form-control px-3 py-2 rounded-3" defaultValue="+84 123 456 789" />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-medium text-dark">Email</label>
                <input type="email" className="form-control px-3 py-2 rounded-3" defaultValue="admin@auralearn.com" disabled />
                <div className="form-text small mt-1">Email được quản lý bởi hệ thống, không thể thay đổi.</div>
              </div>
              <h5 className="fw-semibold mb-3 pb-2 border-bottom">Đổi mật khẩu</h5>
              <div className="mb-3">
                <label className="form-label small fw-medium text-dark">Mật khẩu hiện tại</label>
                <input type="password" className="form-control px-3 py-2 rounded-3" placeholder="••••••••" />
              </div>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-medium text-dark">Mật khẩu mới</label>
                  <input type="password" className="form-control px-3 py-2 rounded-3" placeholder="••••••••" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium text-dark">Xác nhận mật khẩu</label>
                  <input type="password" className="form-control px-3 py-2 rounded-3" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 fw-medium">Lưu thay đổi</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
