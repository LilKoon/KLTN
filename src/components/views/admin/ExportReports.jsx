import React from 'react';

export default function ExportReports() {
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
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:border-teal-300 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 font-bold group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Báo cáo Người Dùng</h3>
                    <p className="text-sm font-medium text-slate-500 mb-6">Danh sách học viên, lịch sử truy cập, điểm số trung bình và trạng thái tài khoản.</p>
                    <button className="w-full flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm transition-colors border border-slate-200">
                        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Tải xuống CSV
                    </button>
                </div>

                {/* Export Card 2 */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:border-sky-300 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6 font-bold group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Kết quả Học tập</h3>
                    <p className="text-sm font-medium text-slate-500 mb-6">Thống kê điểm số, tiến độ hoàn thành bài kiểm tra và đánh giá năng lực của học viên.</p>
                    <button className="w-full flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm transition-colors border border-slate-200">
                        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Tải xuống Excel
                    </button>
                </div>

            </div>
        </div>
    );
}
