import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Settings() {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        allow_signup: true,
        maintenance_mode: false,
        auto_email: true,
        auto_backup: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/admin/settings`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const newSettings = {};
                    if (Array.isArray(data)) {
                        data.forEach(item => {
                            newSettings[item.Khoa] = item.GiaTri === 'true' || item.GiaTri === 'True' || item.GiaTri === '1';
                        });
                    }
                    setSettings(prev => ({ ...prev, ...newSettings }));
                }
            } catch (err) {
                console.error("Lỗi khi tải cài đặt:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchSettings();
    }, [token]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/settings`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    settings: Object.fromEntries(
                        Object.entries(settings).map(([k, v]) => [k, v ? 'true' : 'false'])
                    )
                })
            });
            if (res.ok) {
                alert("Đã lưu cài đặt hệ thống!");
            }
        } catch (err) {
            console.error("Lỗi khi lưu cài đặt:", err);
            alert("Không thể lưu cài đặt. Vui lòng thử lại.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (isLoading) return <div className="p-10 text-center font-bold text-slate-400">Đang tải cấu hình hệ thống...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>
            
            <div className="animate-slide-in" style={{ opacity: 0 }}>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Cài đặt Hệ thống</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Quản lý các thông số cấu hình cốt lõi của EdTech AI</p>
            </div>

            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col gap-6 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                
                {/* Setting Item */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Mở đăng ký học viên mới</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Cho phép khách truy cập tạo tài khoản tự do (client portal).</p>
                    </div>
                    <button 
                        onClick={() => toggleSetting('allow_signup')}
                        className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.allow_signup ? 'bg-teal-500' : 'bg-slate-300'}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.allow_signup ? 'left-7' : 'left-1'}`}></span>
                    </button>
                </div>

                {/* Setting Item */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-rose-600">Chế độ bảo trì (Maintenance Mode)</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Khóa truy cập toàn bộ hệ thống (trừ Admin). Dùng khi cập nhật lớn.</p>
                    </div>
                    <button 
                        onClick={() => toggleSetting('maintenance_mode')}
                        className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.maintenance_mode ? 'bg-rose-500' : 'bg-slate-300'}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.maintenance_mode ? 'left-7' : 'left-1'}`}></span>
                    </button>
                </div>

                {/* Setting Item */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Thông báo Email tự động</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Gửi email chào mừng, nhắc nhở học tập và báo cáo hàng tuần.</p>
                    </div>
                    <button 
                        onClick={() => toggleSetting('auto_email')}
                        className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.auto_email ? 'bg-teal-500' : 'bg-slate-300'}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.auto_email ? 'left-7' : 'left-1'}`}></span>
                    </button>
                </div>

                {/* Setting Item */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Tự động Back-up Dữ liệu</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Sao lưu CSDL tự động vào 02:00 AM mỗi ngày lên Cloud.</p>
                    </div>
                    <button 
                        onClick={() => toggleSetting('auto_backup')}
                        className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.auto_backup ? 'bg-teal-500' : 'bg-slate-300'}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.auto_backup ? 'left-7' : 'left-1'}`}></span>
                    </button>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md shadow-slate-900/20 transition-all focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 flex items-center gap-2"
                >
                    {isSaving && (
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    Lưu toàn bộ cài đặt
                </button>
            </div>
        </div>
    );
}
