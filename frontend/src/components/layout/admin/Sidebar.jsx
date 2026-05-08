import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Library,
    Activity as ActivityIcon,
    Layers,
    FileBarChart,
    Settings as SettingsIcon,
    Bell,
    MessageSquare,
    LogOut,
    ShieldCheck,
    FolderUp,
    CreditCard,
} from 'lucide-react';

const SECTIONS = [
    {
        title: 'Tổng quan',
        items: [
            { id: 'dashboard', label: 'Thống kê & Phân tích', Icon: LayoutDashboard },
            { id: 'activity',  label: 'Theo dõi hoạt động',   Icon: ActivityIcon },
        ],
    },
    {
        title: 'Quản lý',
        items: [
            { id: 'accounts',       label: 'Người dùng',     Icon: Users },
            { id: 'content',        label: 'Bài học',        Icon: BookOpen },
            { id: 'transactions',   label: 'Giao dịch',      Icon: CreditCard },
            { id: 'manage-reviews', label: 'Đánh giá',       Icon: MessageSquare },
            { id: 'notifications',  label: 'Thông báo',      Icon: Bell },
        ],
    },
    {
        title: 'Tài liệu',
        items: [
            { id: 'system-flashcards', label: 'Flashcards',   Icon: Layers },
            { id: 'system-materials',  label: 'Kho tài liệu', Icon: FolderUp },
            { id: 'export-reports',    label: 'Xuất báo cáo', Icon: FileBarChart },
        ],
    },
    {
        title: 'Hệ thống',
        items: [
            { id: 'settings', label: 'Cài đặt',  Icon: SettingsIcon },
            { id: 'profile',  label: 'Hồ sơ',    Icon: ShieldCheck },
        ],
    },
];

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();

    const isActive = (id) => {
        const path = location.pathname;
        return path === `/admin/${id}` || path.startsWith(`/admin/${id}/`);
    };

    const handleNav = (id) => {
        navigate('/admin/' + id);
        if (window.innerWidth < 1024) toggleSidebar?.();
    };

    const adminName = user?.user_name || 'Administrator';
    const adminEmail = user?.email || 'admin@edtech.ai';
    const initial = (adminName || '?').charAt(0).toUpperCase();

    return (
        <>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-md transition-all"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0F172A] border-r border-slate-800/60 transform transition-transform duration-300 ease-out lg:translate-x-0 flex flex-col shadow-2xl ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo */}
                <div className="flex flex-shrink-0 items-center gap-3 px-5 h-16 border-b border-slate-800/60">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 ring-1 ring-white/10">
                        <ShieldCheck className="w-5 h-5" strokeWidth={2.4} />
                    </div>
                    <div className="min-w-0">
                        <div className="text-[15px] font-black text-white tracking-wide leading-none">EdTech AI</div>
                        <div className="text-[10px] font-bold text-teal-400 tracking-[0.18em] uppercase mt-1">Admin Portal</div>
                    </div>
                </div>

                {/* User card */}
                <div className="px-4 pt-4 pb-3 border-b border-slate-800/60">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 ring-1 ring-slate-700/40">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500/30 to-sky-500/30 ring-1 ring-teal-400/30 flex items-center justify-center text-teal-300 font-black text-sm shrink-0">
                            {initial}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-bold text-white truncate leading-tight">{adminName}</p>
                            <p className="text-[11px] text-slate-400 font-medium truncate">{adminEmail}</p>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20">
                            ADMIN
                        </span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
                    {SECTIONS.map((section) => (
                        <div key={section.title}>
                            <p className="px-3 mb-2 text-[10px] font-black text-slate-500 tracking-[0.18em] uppercase">
                                {section.title}
                            </p>
                            <div className="space-y-0.5">
                                {section.items.map(({ id, label, Icon }) => {
                                    const active = isActive(id);
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => handleNav(id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 group relative ${
                                                active
                                                    ? 'bg-teal-500/10 text-teal-300'
                                                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                                            }`}
                                        >
                                            {active && (
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-400 rounded-r-full shadow-[0_0_10px_rgba(45,212,191,0.6)]" />
                                            )}
                                            <Icon
                                                className={`w-4.5 h-4.5 shrink-0 ${
                                                    active ? 'text-teal-300' : 'text-slate-500 group-hover:text-slate-300'
                                                } transition-colors`}
                                                strokeWidth={active ? 2.4 : 2}
                                            />
                                            <span className="truncate">{label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-800/60">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-[13px] text-slate-400 bg-slate-800/40 ring-1 ring-slate-700/50 hover:bg-rose-500/10 hover:text-rose-300 hover:ring-rose-500/30 transition-all"
                    >
                        <LogOut className="w-4 h-4" strokeWidth={2.4} />
                        Đăng xuất
                    </button>
                </div>
            </aside>
        </>
    );
}
