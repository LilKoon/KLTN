import React, { useState } from 'react';

export default function Settings() {
    const [settings, setSettings] = useState({
        registration: true,
        maintenance: false,
        emailAlerts: true,
        autoBackup: true,
        darkModeSystem: false
    });

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

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
                        onClick={() => toggleSetting('registration')}
                        className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.registration ? 'bg-teal-500' : 'bg-slate-300'}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.registration ? 'left-7' : 'left-1'}`}></span>
                    </button>
                </div>

                {/* Setting Item */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-rose-600">Chế độ bảo trì (Maintenance Mode)</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Khóa truy cập toàn bộ hệ thống (trừ Admin). Dùng khi cập nhật lớn.</p>
                    </div>
                    <button 
                        onClick={() => toggleSetting('maintenance')}
                        className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.maintenance ? 'bg-rose-500' : 'bg-slate-300'}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.maintenance ? 'left-7' : 'left-1'}`}></span>
                    </button>
                </div>

                {/* Setting Item */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Thông báo Email tự động</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Gửi email chào mừng, nhắc nhở học tập và báo cáo hàng tuần.</p>
                    </div>
                    <button 
                        onClick={() => toggleSetting('emailAlerts')}
                        className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.emailAlerts ? 'bg-teal-500' : 'bg-slate-300'}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.emailAlerts ? 'left-7' : 'left-1'}`}></span>
                    </button>
                </div>

                {/* Setting Item */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Tự động Back-up Dữ liệu</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Sao lưu CSDL tự động vào 02:00 AM mỗi ngày lên Cloud.</p>
                    </div>
                    <button 
                        onClick={() => toggleSetting('autoBackup')}
                        className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.autoBackup ? 'bg-teal-500' : 'bg-slate-300'}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.autoBackup ? 'left-7' : 'left-1'}`}></span>
                    </button>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md shadow-slate-900/20 transition-all focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
                    Lưu toàn bộ cài đặt
                </button>
            </div>
        </div>
    );
}
