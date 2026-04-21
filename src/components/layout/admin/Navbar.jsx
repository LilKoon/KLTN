import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ toggleSidebar }) {
    const navigate = useNavigate();
    const [showNoti, setShowNoti] = useState(false);
    const notifications = [
        { id: 1, text: "Người dùng mới đăng ký: Nguyễn Văn A", time: "2 phút trước" },
        { id: 2, text: "Yêu cầu rút tiền mới từ đối tác", time: "1 giờ trước" },
        { id: 3, text: "Hệ thống vừa cập nhật phiên bản mới", time: "5 giờ trước" },
    ];
    return (
        <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <div className="hidden sm:block">
                    <h2 className="text-lg font-bold text-slate-800">Hệ Thống</h2>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
                <div className="relative">
                    <button
                        onClick={() => setShowNoti(!showNoti)}
                        className={`relative p-2 rounded-xl transition-all ${showNoti ? 'bg-slate-100 text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-rose-500 border-2 border-white"></span>
                    </button>

                    {/* Dropdown Menu */}
                    {showNoti && (
                        <>
                            {/* Click ra ngoài để đóng */}
                            <div className="fixed inset-0 z-10" onClick={() => setShowNoti(false)}></div>

                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <span className="font-bold text-slate-800">Thông báo</span>
                                    <button className="text-xs font-bold text-teal-600 uppercase">Đã đọc tất cả</button>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map((n) => (
                                        <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                                            <p className="text-sm font-semibold text-slate-700 leading-snug">{n.text}</p>
                                            <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase">{n.time}</p>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full py-3 text-xs font-bold text-slate-500 hover:text-teal-600 transition-colors bg-slate-50/50">
                                    Xem tất cả
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <div className="h-8 border-l border-slate-200"></div>
                <button onClick={() => navigate('/admin/profile')} className="flex items-center gap-3 group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-teal-600 transition-colors">Super Admin</p>
                        <p className="text-[11px] font-medium text-slate-400">admin@edtech.ai</p>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 border-2 border-slate-100 shadow-sm overflow-hidden group-hover:border-teal-400 transition-colors flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                    </div>
                </button>
            </div>

        </header>
    );
}
