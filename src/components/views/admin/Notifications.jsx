import React, { useState } from 'react';

export default function Notifications() {
    const initialNotifs = [
        { id: 1, type: 'alert', title: 'Máy chủ CPU hoạt động giới hạn', desc: 'Tải CPU đã vượt quá 90% trong 5 phút qua. Vui lòng kiểm tra quá trình Render Test AI.', time: '10 phút trước', read: false },
        { id: 2, type: 'info', title: 'Sao lưu dữ liệu thành công', desc: 'Hệ thống đã tự động sao lưu 45GB Dữ liệu lúc 02:00 AM.', time: 'Hôm nay, 02:05', read: true },
        { id: 3, type: 'user', title: 'Báo cáo vi phạm từ học viên', desc: 'Học viên Lê Hoàng C đã báo cáo một lỗi sai trong bộ câu hỏi Khóa IELTS. Cần rà soát.', time: 'Hôm qua, 15:30', read: false },
        { id: 4, type: 'system', title: 'Phiên bản cập nhật v1.2.0 có sẵn', desc: 'Bao gồm các cải tiến về tốc độ load Flashcards và fix giao diện Responsive.', time: 'Hôm qua, 08:00', read: true },
    ];

    const [notifs, setNotifs] = useState(initialNotifs);

    const markAsRead = (id) => {
        setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifs(notifs.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifs.filter(n => !n.read).length;

    const getIcon = (type) => {
        switch(type) {
            case 'alert': return <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>;
            case 'info': return <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>;
            case 'user': return <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div>;
            case 'system': return <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>;
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in" style={{ opacity: 0 }}>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        Thông báo Hệ thống
                        {unreadCount > 0 && <span className="bg-rose-500 text-white text-xs px-2.5 py-1 rounded-full">{unreadCount} mới</span>}
                    </h1>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-sm font-bold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-xl transition-colors">
                        Đánh dấu tất cả đã đọc
                    </button>
                )}
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                {notifs.map((n) => (
                    <div key={n.id} className={`p-6 flex gap-4 transition-colors ${n.read ? 'bg-white' : 'bg-slate-50/80 hover:bg-slate-50'}`}>
                        {getIcon(n.type)}
                        <div className="flex-1">
                            <div className="flex justify-between items-start gap-4 mb-1">
                                <h3 className={`text-base font-bold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</h3>
                                <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">{n.time}</span>
                            </div>
                            <p className={`text-sm tracking-wide ${n.read ? 'text-slate-500 font-medium' : 'text-slate-700 font-semibold'}`}>{n.desc}</p>
                            
                            {!n.read && (
                                <div className="mt-4 flex gap-3">
                                    <button onClick={() => markAsRead(n.id)} className="text-xs font-bold text-teal-600 hover:text-teal-700">Đánh dấu đã đọc</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {notifs.length > 0 && (
                <div className="text-center pt-4">
                    <button className="text-sm font-bold text-slate-500 hover:text-slate-700">Tải thêm thông báo cũ hơn</button>
                </div>
            )}
        </div>
    );
}
