import React from 'react';

export default function Activity() {
    const logs = [
        { id: 1, type: 'login', color: 'bg-emerald-500', icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1', title: 'Học viên Nguyễn Văn A đã đăng nhập', time: '10 phút trước', desc: 'Đăng nhập từ IP: 192.168.1.5 (Chrome, Windows)' },
        { id: 2, type: 'system', color: 'bg-teal-500', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: 'Hệ thống tự động đồng bộ Flashcards', time: '45 phút trước', desc: 'Đã đồng bộ 2,504 thuật ngữ cho bộ bài kiểm tra tháng 3.' },
        { id: 3, type: 'danger', color: 'bg-rose-500', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', title: 'Cảnh báo: 5 lần đăng nhập thất bại', time: '2 giờ trước', desc: 'Tài khoản "thib@example.com" bị khóa tạm thời do nhập sai mật khẩu quá số lần quy định.' },
        { id: 4, type: 'course', color: 'bg-indigo-500', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', title: 'Quản trị viên đã cập nhật khóa học', time: 'Hôm qua, 15:30', desc: 'Bổ sung tài liệu PDF cho chương 12: Thì Hiện Tại Hoàn Thành.' },
        { id: 5, type: 'test', color: 'bg-sky-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Hoàn thành bài Test Final', time: 'Hôm qua, 10:15', desc: 'Học viên Hoàng E đã hoàn thành bài test cuối khóa đạt 92/100 điểm.' },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto xl:max-w-none">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>

            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in" style={{ opacity: 0 }}>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Nhật ký Hoạt động</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Hệ thống ghi nhận giám sát theo dõi theo thời gian thực</p>
                </div>
                
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-slate-200">
                        Hôm nay
                    </button>
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm transition-all text-center">
                        <svg className="w-5 h-5 inline-block -mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    </button>
                    <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-500/20 transition-all focus:ring-2 focus:ring-teal-500 flex items-center gap-2">
                        Xuất Log CSV
                    </button>
                </div>
            </div>

            {/* Timeline View */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                <div className="relative border-l-2 border-slate-100 pl-8 ml-4 space-y-12">
                    {logs.map((log) => (
                        <div key={log.id} className="relative group">
                            {/* Marker */}
                            <div className={`absolute -left-[45px] top-1 w-10 h-10 rounded-full flex items-center justify-center text-white ring-8 ring-white shadow-md transition-transform group-hover:scale-110 ${log.color}`}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={log.icon} />
                                </svg>
                            </div>
                            
                            {/* Card Content */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:bg-white hover:border-slate-300 hover:shadow-lg transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                    <h3 className="text-base font-bold text-slate-800 tracking-tight">{log.title}</h3>
                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full w-fit">
                                        {log.time}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-600">{log.desc}</p>
                                
                                {/* Additional context actions logic if needed */}
                                {log.type === 'danger' && (
                                    <div className="mt-4 flex gap-3">
                                        <button className="text-xs font-bold px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors">Yêu cầu xác minh</button>
                                        <button className="text-xs font-bold px-4 py-2 bg-slate-200 text-slate-700 rounded-lg border border-slate-300 hover:bg-slate-300 transition-colors">Bỏ qua</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="relative group pt-4">
                        <div className="absolute -left-[35px] top-4 w-5 h-5 bg-slate-200 border-4 border-white rounded-full"></div>
                        <button className="text-sm font-bold text-slate-500 hover:text-teal-600 bg-slate-50 hover:bg-teal-50 border border-slate-200 py-3 px-6 rounded-xl transition-colors w-full sm:w-auto">
                            Tải thêm lịch sử hoạt động
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
