import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ExportReports() {
    const { token } = useAuth();

    const handleExportUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/export/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'danh_sach_nguoi_dung.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Lỗi khi xuất báo cáo: ' + error.message);
        }
    };

    const handleExportSubscriptions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/export/subscriptions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bao_cao_doanh_thu_goi.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Lỗi khi xuất báo cáo: ' + error.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>
            
            <div className="animate-slide-in" style={{ opacity: 0 }}>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Xuất Báo Cáo</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Xuất dữ liệu hệ thống ra tệp Excel/CSV để phân tích lưu trữ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                
                {/* Export Card 1 */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:border-teal-300 transition-colors group">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 font-bold group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Báo cáo Người Dùng</h3>
                    <p className="text-sm font-medium text-slate-500 mb-6">Danh sách học viên, lịch sử truy cập, điểm số trung bình và trạng thái tài khoản.</p>
                    <button 
                        onClick={handleExportUsers}
                        className="w-full flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm transition-colors border border-slate-200"
                    >
                        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Tải xuống CSV
                    </button>
                </div>

                {/* Export Card 2 */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:border-sky-300 transition-colors group">
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6 font-bold group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Báo cáo Doanh Thu & Gói</h3>
                    <p className="text-sm font-medium text-slate-500 mb-6">Tổng doanh thu, doanh thu tháng này, số tài khoản đang dùng FREE/PRO/ULTRA và doanh thu theo từng gói.</p>

                    <div className="grid grid-cols-2 gap-2 mb-6">
                        <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
                            <p className="text-[11px] font-black text-sky-700 uppercase">Doanh thu</p>
                            <p className="text-xs text-sky-600 mt-1">Tổng + tháng này</p>
                        </div>
                        <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
                            <p className="text-[11px] font-black text-violet-700 uppercase">Gói đăng ký</p>
                            <p className="text-xs text-violet-600 mt-1">PRO / ULTRA</p>
                        </div>
                    </div>

                    <button
                        onClick={handleExportSubscriptions}
                        className="w-full flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm transition-colors border border-slate-200"
                    >
                        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Tải xuống CSV
                    </button>
                </div>

            </div>
        </div>
    );
}
