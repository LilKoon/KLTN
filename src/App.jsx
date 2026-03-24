import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/views/admin/Dashboard';
import Accounts from './components/views/admin/Accounts';
import Content from './components/views/admin/Content';
import Activity from './components/views/admin/Activity';
import Profile from './components/views/admin/Profile';
import Settings from './components/views/admin/Settings';
import Notifications from './components/views/admin/Notifications';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('view-dashboard');
  const [isToggled, setIsToggled] = useState(false);

  const toggleSidebar = () => {
    setIsToggled(!isToggled);
  };

  const renderView = () => {
    switch (activeView) {
      case 'view-dashboard':
        return <Dashboard />;
      case 'view-accounts':
        return <Accounts />;
      case 'view-content':
        return <Content />;
      case 'view-activity':
        return <Activity />;
      case 'view-profile':
        return <Profile />;
      case 'view-settings':
        return <Settings />;
      case 'view-notifications':
        return <Notifications />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`d-flex ${isToggled ? 'toggled' : ''}`} id="wrapper">
      <Sidebar activeView={activeView} setActiveView={setActiveView} isToggled={isToggled} />
      <div id="page-content-wrapper" className="flex-grow-1 bg-light">
        <Navbar toggleSidebar={toggleSidebar} setActiveView={setActiveView} />
        <div className="container-fluid p-4 p-md-5 main-content-container">
          {renderView()}
        </div>
        <footer className="bg-white border-top py-4 mt-auto w-100 px-4 px-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <p className="mb-0 text-muted small">&copy; 2026 Aura Edtech Platform. All rights reserved.</p>
            <div className="d-flex gap-3 text-muted small">
              <a href="#" className="text-decoration-none text-muted hover-primary" style={{ transition: 'color 0.2s' }}>Chính sách bảo mật</a>
              <a href="#" className="text-decoration-none text-muted hover-primary" style={{ transition: 'color 0.2s' }}>Điều khoản dịch vụ</a>
              <a href="#" className="text-decoration-none text-muted hover-primary" style={{ transition: 'color 0.2s' }}>Trợ giúp</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
