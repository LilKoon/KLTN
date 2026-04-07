import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function ClientSidebar({ isSidebarOpen, toggleSidebar }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const menuGroups = [
        {
            title: "Bảng Điều Khiển",
            items: [
                { id: 'dashboard', label: 'Tổng quan', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
                { id: 'progress-report', label: 'Báo cáo Tiến độ', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> }
            ]
        },
        {
            title: "Hành Trình Học",
            items: [
                { id: 'learning-path', label: 'Lộ trình cá nhân', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg> },
                { id: 'daily-review', label: 'Ôn tập ngắt quãng', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> }
            ]
        },
        {
            title: "Trung Tâm Đánh Giá",
            items: [
                { id: 'placement-test', label: 'Đánh giá năng lực', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
                { id: 'pass-fail', label: 'Lịch sử Pass/Fail', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> }
            ]
        },
        {
            title: "Tài Nguyên & AI Studio",
            items: [
                { id: 'learning-materials', label: 'Thư viện Tài liệu AI', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg> },
                { id: 'flashcard-storage', label: 'Trạm Flashcards', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg> }
            ]
        }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={toggleSidebar}
                ></div>
            )}

            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Logo Area */}
                <div className="flex flex-shrink-0 items-center gap-3 px-8 h-20 border-b border-slate-100 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-xl font-extrabold text-slate-800 tracking-tight uppercase block">EdTech AI</span>
                        <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">Phiên bản Học viên</span>
                    </div>
                </div>

                {/* Navigation Links with Groups */}
                <nav className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
                    {menuGroups.map((group, gIdx) => (
                        <div key={gIdx} className="mb-6">
                            <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map(item => {
                                    const isActive = location.pathname.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                navigate('/client/' + item.id);
                                                if (window.innerWidth < 1024) toggleSidebar();
                                            }}
                                            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 group relative ${
                                                isActive 
                                                ? 'bg-teal-50 text-teal-700 shadow-sm' 
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                            }`}
                                        >
                                            {/* Active indicator line */}
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-teal-600 rounded-r-full shadow-sm shadow-teal-500/50"></div>
                                            )}
                                            
                                            <span className={`${isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-500'} transition-colors duration-200`}>
                                                {item.icon}
                                            </span>
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    
                    {/* Bottom Links (Profile) */}
                    <div className="mt-8 mb-2">
                        <div className="space-y-1">
                            {(() => {
                                const isActive = location.pathname.includes('profile');
                                return (
                                    <button
                                        onClick={() => {
                                            navigate('/client/profile');
                                            if (window.innerWidth < 1024) toggleSidebar();
                                        }}
                                        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 group relative ${
                                            isActive 
                                            ? 'bg-teal-50 text-teal-700 shadow-sm' 
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                        }`}
                                    >
                                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-teal-600 rounded-r-full shadow-sm shadow-teal-500/50"></div>}
                                        <span className={`${isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-500'} transition-colors duration-200`}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                        </span>
                                        Hồ sơ cá nhân
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                </nav>

                {/* Bottom Logout Area */}
                <div className="p-4 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-rose-500 hover:bg-rose-100 transition-colors duration-200">
                        <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                    </button>
                </div>

            </aside>
        </>
    );
}
