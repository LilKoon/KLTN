import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Activity() {
    const { token } = useAuth();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/admin/activity-logs?limit=50`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setLogs(data);
            } catch (err) {
                console.error("Lỗi khi tải nhật ký:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchLogs();
    }, [token]);

    const getLogIcon = (type) => {
        switch(type) {
            case 'LOGIN': return <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></div>;
            case 'DANGER': return <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>;
            case 'COURSE': return <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>;
            default: return <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
        }
    };

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>

            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Theo dõi Hoạt động</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Nhật ký chi tiết các tương tác trên toàn hệ thống</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-slide-in" style={{ opacity: 0 }}>
                <div className="p-6 space-y-6">
                    {isLoading ? (
                        <div className="text-center py-10 text-slate-400 font-bold">Đang tải nhật ký...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-bold">Chưa có hoạt động nào được ghi nhận</div>
                    ) : logs.map((log, idx) => (
                        <div key={log.MaLog} className="flex gap-4 group">
                            {getLogIcon(log.LoaiHoatDong)}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="text-sm font-bold text-slate-800">
                                        {log.TenNguoiDung} <span className="font-medium text-slate-500">— {log.NoiDung}</span>
                                    </h3>
                                    <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                                        {new Date(log.NgayTao).toLocaleString()}
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center gap-3 text-xs font-medium text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"/></svg>
                                        {log.IPAddress || '0.0.0.0'}
                                    </span>
                                    <span>•</span>
                                    <span className="truncate max-w-[200px]">{log.UserAgent || 'Unknown Browser'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
