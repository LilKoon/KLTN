import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Client Layout & Views
import ClientSidebar from './components/layout/client/ClientSidebar';
import ClientNavbar from './components/layout/client/ClientNavbar';
import ClientDashboard from './components/views/client/Dashboard';
import Login from './components/views/client/Login';
import PlacementTest from './components/views/client/PlacementTest';
import TestResults from './components/views/client/TestResults';
import LearningMaterials from './components/views/client/LearningMaterials';
import DailyReview from './components/views/client/DailyReview';
import ClientProfile from './components/views/client/Profile';
import LearningPath from './components/views/client/LearningPath';
import AutoDocument from './components/views/client/AutoDocument';
import ProgressReport from './components/views/client/ProgressReport';
import StageTest from './components/views/client/StageTest';
import FinalTest from './components/views/client/FinalTest';
import PassFailCheck from './components/views/client/PassFailCheck';
import CreateFlashcard from './components/views/client/CreateFlashcard';
import FlashcardStorage from './components/views/client/FlashcardStorage';
import Premium from './components/views/client/Premium';
import Payment from './components/views/client/Payment';

// Admin Auth & Layout & Views
import AdminLogin from './components/views/admin/AdminLogin';
import AdminSidebar from './components/layout/admin/Sidebar';
import AdminNavbar from './components/layout/admin/Navbar';
import AdminDashboard from './components/views/admin/Dashboard';
import Accounts from './components/views/admin/Accounts';
import Content from './components/views/admin/Content';
import Activity from './components/views/admin/Activity';
import Profile from './components/views/admin/Profile';
import Settings from './components/views/admin/Settings';
import Notifications from './components/views/admin/Notifications';
import ManageReviews from './components/views/admin/ManageReviews';
import SystemFlashcards from './components/views/admin/SystemFlashcards';
import ExportReports from './components/views/admin/ExportReports';

import './App.css';

// === Protected Route Wrappers ===
const ProtectedRoute = ({ children, allowedRole }) => {
    const { userRole } = useAuth();
    if (userRole !== allowedRole) {
        return <Navigate to={allowedRole === 'admin' ? '/admin-login' : '/login'} replace />;
    }
    return children;
};

// === Client Layout Context ===
const ClientLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    
    return (
        <div className="flex bg-slate-50 min-h-screen font-inter relative overflow-hidden">
            <ClientSidebar 
                isSidebarOpen={isSidebarOpen} 
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
            <div className="flex-1 flex flex-col min-h-screen w-full lg:pl-72 transition-all duration-300">
                <ClientNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 w-full overflow-x-hidden">
                    <Routes>
                        <Route path="/" element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<ClientDashboard />} />
                        <Route path="placement-test" element={<PlacementTest />} />
                        <Route path="test-results" element={<TestResults />} />
                        <Route path="learning-materials" element={<LearningMaterials />} />
                        <Route path="daily-review" element={<DailyReview />} />
                        <Route path="learning-path" element={<LearningPath />} />
                        <Route path="auto-document" element={<AutoDocument />} />
                        <Route path="progress-report" element={<ProgressReport />} />
                        <Route path="stage-test" element={<StageTest />} />
                        <Route path="final-test" element={<FinalTest />} />
                        <Route path="pass-fail" element={<PassFailCheck />} />
                        <Route path="create-flashcard" element={<CreateFlashcard />} />
                        <Route path="flashcard-storage" element={<FlashcardStorage />} />
                        <Route path="profile" element={<ClientProfile />} />
                        <Route path="premium" element={<Premium />} />
                        <Route path="payment" element={<Payment />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                </main>
                <footer className="w-full bg-white border-t border-slate-100 py-6 px-6 lg:px-12 mt-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm font-medium text-slate-400">&copy; 2026 EdTech AI. Mọi bản quyền thuộc hệ thống giáo dục.</p>
                        <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
                            <a href="#" className="hover:text-teal-600 transition-colors">Hỗ trợ</a>
                            <a href="#" className="hover:text-teal-600 transition-colors">Điều khoản</a>
                            <a href="#" className="hover:text-teal-600 transition-colors">Bảo mật</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

// === Admin Layout Context ===
const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    
    return (
        <div className="flex bg-slate-100 min-h-screen font-inter relative overflow-hidden">
            <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex-1 flex flex-col min-h-screen w-full lg:pl-64 transition-all duration-300">
                <AdminNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 w-full p-6 overflow-x-hidden">
                    <Routes>
                        <Route path="/" element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="accounts" element={<Accounts />} />
                        <Route path="content" element={<Content />} />
                        <Route path="activity" element={<Activity />} />
                        <Route path="manage-reviews" element={<ManageReviews />} />
                        <Route path="system-flashcards" element={<SystemFlashcards />} />
                        <Route path="export-reports" element={<ExportReports />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

// === Main Application Entry ===
export default function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public Auth Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin-login" element={<AdminLogin />} />

                {/* Restricted Systems */}
                <Route path="/client/*" element={<ProtectedRoute allowedRole="client"><ClientLayout /></ProtectedRoute>} />
                <Route path="/admin/*" element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>} />
            </Routes>
        </AuthProvider>
    );
}
