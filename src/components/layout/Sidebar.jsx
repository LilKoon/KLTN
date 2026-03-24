import { BookOpen, LayoutDashboard, Users, Library, Activity } from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, isToggled }) {
  const navItems = [
    { id: 'view-dashboard', icon: LayoutDashboard, label: 'Trang Chủ' },
    { id: 'view-accounts', icon: Users, label: 'Quản lý Tài khoản' },
    { id: 'view-content', icon: Library, label: 'Nội dung Học tập' },
    { id: 'view-activity', icon: Activity, label: 'Hoạt động Người dùng' }
  ];

  return (
    <>
      <div className="sidebar bg-white shadow-sm border-end" id="sidebar-wrapper">
        <div className="sidebar-heading d-flex align-items-center gap-2 px-4 py-4 border-bottom">
          <div className="logo-box">
            <BookOpen className="text-white" />
          </div>
          <span className="heading-font fs-4 fw-bold text-dark mb-0">EDTECH AI</span>
        </div>
        <div className="list-group list-group-flush mt-3 px-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`list-group-item list-group-item-action bg-transparent border-0 rounded-3 mb-1 nav-link-custom text-start d-flex align-items-center ${activeView === item.id ? 'active' : ''}`}
            >
              <item.icon className="me-2" size={20} /> {item.label}
            </button>
          ))}
        </div>
      </div>
      {isToggled && <div className="sidebar-overlay"></div>}
    </>
  );
}
