import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ExportReports() {
    const { token } = useAuth();
    const [activityPeriod, setActivityPeriod] = React.useState('all');

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

    const handleExportActivities = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/export/activities?period=${activityPeriod}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const filename = `lich_su_hoat_dong_${activityPeriod}.csv`;
            a.download = filename;
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
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Báo cáo Hoạt Động</h3>
                    <p className="text-sm font-medium text-slate-500 mb-4">Lịch sử tương tác của tất cả người dùng, các thao tác hệ thống và cảnh báo bảo mật.</p>
                    
                    <div className="flex flex-col gap-3 mb-6">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời gian báo cáo</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['all', 'week', 'month', 'year'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setActivityPeriod(p)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${activityPeriod === p ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                                >
                                    {p === 'all' ? 'Tất cả' : p === 'week' ? 'Tuần này' : p === 'month' ? 'Tháng này' : 'Năm nay'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleExportActivities}
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
