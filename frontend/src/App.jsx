import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Client Layout & Views
import ClientSidebar from './components/layout/client/ClientSidebar';
import ClientNavbar from './components/layout/client/ClientNavbar';
import ClientDashboard from './components/views/client/Dashboard';
import Login from './components/views/auth/Login';
import OAuthCallback from './components/views/auth/OAuthCallback';
import VerifyEmail from './components/views/auth/VerifyEmail';
import ForgotPassword from './components/views/auth/ForgotPassword';
import PlacementTest from './components/views/client/PlacementTest';
import TestResults from './components/views/client/TestResults';
import LearningMaterials from './components/views/client/LearningMaterials';
import LessonView from './components/views/client/LessonView';
import DailyReview from './components/views/client/DailyReview';
import ClientProfile from './components/views/client/Profile';
import LearningPath from './components/views/client/LearningPath';
import Chatbot from './components/views/client/Chatbot';
import ProgressReport from './components/views/client/ProgressReport';
import StageTest from './components/views/client/StageTest';
import FinalTest from './components/views/client/FinalTest';
import PassFailCheck from './components/views/client/PassFailCheck';
import ExercisesTests from './components/views/client/ExercisesTests';
import SectionTest from './components/views/client/SectionTest';
import AIQuiz from './components/views/client/AIQuiz';
import Flashcard from './components/views/flashcard/Flashcard';
import FlashcardCreate from './components/views/flashcard/FlashcardCreate';
import FlashcardDetail from './components/views/flashcard/FlashcardDetail';
import FlashcardPlay from './components/views/flashcard/FlashcardPlay';

// Admin Auth & Layout & Views
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

// === Protected Route Wrappers ===
const ProtectedRoute = ({ children, allowedRole }) => {
    const { userRole } = useAuth();
    if (userRole !== allowedRole) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// === Client Layout Context ===
const ClientLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    
    return (
        <div className="flex bg-slate-50 h-screen font-inter relative overflow-hidden">
            <ClientSidebar 
                isSidebarOpen={isSidebarOpen} 
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
            <div className="flex-1 flex flex-col h-screen w-full transition-all duration-300 min-w-0">
                <ClientNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 w-full overflow-x-hidden overflow-y-auto no-scrollbar">
                    <Routes>
                        <Route path="/" element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<ClientDashboard />} />
                        <Route path="placement-test" element={<PlacementTest />} />
                        <Route path="test-results" element={<TestResults />} />
                        <Route path="exercises-tests" element={<ExercisesTests />} />
                        <Route path="section-test/:type" element={<SectionTest />} />
                        <Route path="ai-quiz" element={<AIQuiz />} />
                        <Route path="learning-materials" element={<LearningMaterials />} />
                        <Route path="lesson/:maNode" element={<LessonView />} />
                        <Route path="daily-review" element={<DailyReview />} />
                        <Route path="learning-path" element={<LearningPath />} />
                        <Route path="chatbot" element={<Chatbot />} />
                        <Route path="progress-report" element={<ProgressReport />} />
                        <Route path="stage-test" element={<StageTest />} />
                        <Route path="final-test" element={<FinalTest />} />
                        <Route path="pass-fail" element={<PassFailCheck />} />
                        <Route path="flashcards" element={<Flashcard />} />
                        <Route path="flashcards/create" element={<FlashcardCreate />} />
                        <Route path="flashcards/:id" element={<FlashcardDetail />} />
                        <Route path="flashcards/:id/play" element={<FlashcardPlay />} />
                        <Route path="profile" element={<ClientProfile />} />
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
        <div className="bg-slate-100 h-screen font-inter relative overflow-hidden">
            <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex flex-col h-screen w-full lg:pl-64 transition-all duration-300 min-w-0">
                <AdminNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 w-full p-6 overflow-x-hidden overflow-y-auto no-scrollbar">
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
                <Route path="/oauth-callback" element={<OAuthCallback />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Restricted Systems */}
                <Route path="/client/*" element={<ProtectedRoute allowedRole="client"><ClientLayout /></ProtectedRoute>} />
                <Route path="/admin/*" element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>} />
            </Routes>
        </AuthProvider>
    );
}
