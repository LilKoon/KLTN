import { Menu, Search, Bell, User, Settings, LogOut } from 'lucide-react';

export default function Navbar({ toggleSidebar, setActiveView }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm px-4 py-4">
      <div className="d-flex align-items-center w-100">
        <button 
          className="btn btn-light d-md-none me-3" 
          onClick={toggleSidebar}
        >
          <Menu />
        </button>
        <div className="input-group search-bar d-none d-md-flex" style={{ maxWidth: '500px' }}>
          <span className="input-group-text bg-transparent border-end-0 text-muted">
            <Search width={18} />
          </span>
          <input type="text" className="form-control border-start-0 shadow-none ps-0 bg-transparent" placeholder="Tìm kiếm tài nguyên..." />
        </div>

        <div className="ms-auto d-flex align-items-center gap-4">
          <div className="position-relative cursor-pointer" onClick={() => setActiveView('view-notifications')}>
            <Bell className="text-secondary" />
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">Thông báo mới</span>
            </span>
          </div>
          
          <div className="dropdown">
            <button className="btn btn-link text-decoration-none dropdown-toggle text-dark d-flex align-items-center gap-2 p-0 border-0" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="https://i.pravatar.cc/150?img=11" alt="Admin Default" className="rounded-circle border" width="36" height="36" />
              <div className="d-none d-lg-block text-start">
                <p className="mb-0 fw-medium small">Nguyễn Văn A</p>
                <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>Quản trị viên</p>
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="userDropdown">
              <li><button className="dropdown-item d-flex align-items-center" onClick={() => setActiveView('view-profile')}><User className="me-2" size={18} />Hồ sơ</button></li>
              <li><button className="dropdown-item d-flex align-items-center" onClick={() => setActiveView('view-settings')}><Settings className="me-2" size={18} />Cài đặt</button></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item text-danger d-flex align-items-center"><LogOut className="me-2" size={18} />Đăng xuất</button></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
