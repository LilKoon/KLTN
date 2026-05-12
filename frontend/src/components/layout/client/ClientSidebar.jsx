import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { apiGetMySubscription } from '../../../api';
import { LogOut, Home, Map, BookOpen, Layers, Bot, Settings, Flame, ChevronRight, Zap, MessageSquare } from 'lucide-react';

const ClientSidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [currentPlan, setCurrentPlan] = useState('FREE');

    useEffect(() => {
        if (!token) return;
        apiGetMySubscription(token)
            .then((data) => setCurrentPlan(data?.plan || 'FREE'))
            .catch(() => setCurrentPlan('FREE'));
    }, [token]);

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={toggleSidebar}
                />
            )}
            
            {/* Sidebar container */}
            <aside 
                className={`fixed lg:static inset-y-0 left-0 w-64 h-full bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* User Profile & Streak */}
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col gap-4 relative overflow-hidden bg-white hover:bg-slate-50 transition-colors">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-50 rounded-full blur-xl z-0 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/client/profile')}>
                            <div className="relative">
                                <img 
                                    src="https://i.pravatar.cc/150?u=a042581f4e29026024d" 
                                    alt="User Avatar"
                                    className="w-10 h-10 rounded-full shadow-sm object-cover border border-slate-200 group-hover:border-teal-300 transition-all"
                                />
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-[14px] leading-tight group-hover:text-teal-600 transition-colors">
                                    {user?.user_name || 'Học viên'} 
                                </h3>
                            </div>
                        </div>
                        <Settings className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors hidden group-hover:block" />
                    </div>

                    <div className="relative z-10 flex items-center justify-between bg-orange-50/80 px-3 py-2 rounded-lg border border-orange-100/50 mt-1 cursor-pointer hover:border-orange-200 transition-all">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20" />
                            <span className="text-xs font-semibold text-orange-600">
                                Streak: <span className="font-bold text-orange-700">3 Ngày</span>
                            </span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-orange-400" />
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex flex-col gap-1 p-3 overflow-y-auto no-scrollbar flex-1">

                    {/* ── MENU CHÍNH ── */}
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-3 mt-2">Menu chính</div>
                    
                    <NavLink 
                        to="/client/dashboard" 
                        end
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${isActive ? 'bg-teal-50 text-teal-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                    >
                        <Home className="w-[18px] h-[18px]" /> Trang chủ
                    </NavLink>

                    {/* ── HỌC TẬP ── */}
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-3 mt-6">Học tập</div>

                    <NavLink 
                        to="/client/learning-path" 
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${isActive ? 'bg-teal-50 text-teal-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                    >
                        <Map className="w-[18px] h-[18px]" /> Lộ trình học tập
                    </NavLink>

                    <NavLink 
                        to="/client/exercises-tests" 
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${isActive ? 'bg-teal-50 text-teal-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                    >
                        <Bot className="w-[18px] h-[18px]" /> Bài tập &amp; Test
                    </NavLink>

                    <NavLink 
                        to="/client/learning-materials" 
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${isActive ? 'bg-teal-50 text-teal-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                    >
                        <BookOpen className="w-[18px] h-[18px]" /> Kho tài liệu
                    </NavLink>

                    <NavLink 
                        to="/client/flashcards" 
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${isActive ? 'bg-teal-50 text-teal-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                    >
                        <Layers className="w-[18px] h-[18px]" /> Kho flashcard
                    </NavLink>

                    {/* ── AI ── */}
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-3 mt-6">AI</div>

                    <NavLink
                        to="/client/chatbot" 
                        className={({ isActive }) => `flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${isActive ? 'bg-teal-50 text-teal-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                    >
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-[18px] h-[18px]" /> Chatbot AI
                        </div>
                        <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-100">MỚI</span>
                    </NavLink>

                </nav>

                {/* Bottom: Upgrade Card + Logout */}
                <div className="mt-auto p-4 border-t border-slate-100">
                    {currentPlan === 'FREE' && (
                        <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-4 border border-teal-100 shadow-sm relative overflow-hidden group hover:border-teal-200 transition-colors mb-4">
                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-teal-100 rounded-full blur-2xl group-hover:bg-teal-200 transition-colors"></div>
                            <h4 className="font-bold text-slate-900 text-[13px] mb-1 relative z-10 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-teal-500" /> Pro Plan
                            </h4>
                            <p className="text-[11px] text-slate-500 mb-3 relative z-10 leading-tight">Mở khóa tính năng AI không giới hạn</p>
                            <button onClick={() => navigate('/client/subscription')}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-[12px] font-semibold py-2 rounded-lg transition-colors relative z-10 cursor-pointer">
                                Nâng cấp ngay
                            </button>
                        </div>
                    )}
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 font-medium transition-all cursor-pointer"
                    >
                        <LogOut className="w-[18px] h-[18px]" /> Đăng xuất
                    </button>
                </div>
            </aside>
        </>
    );
};

export default ClientSidebar;
