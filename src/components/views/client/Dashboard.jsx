import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-slate-50 font-inter p-4 sm:p-6 lg:p-10 space-y-8">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>

            {/* Hero / Welcome Banner */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 border border-slate-800 p-8 sm:p-12 shadow-xl shadow-slate-900/10">
                {/* Decorative background vectors */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-teal-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                            Online
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                            Sẵn sàng chinh phục <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">mục tiêu hôm nay?</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-lg">
                            Bạn đã duy trì chuỗi học tập được 12 ngày liên tiếp. Hãy hoàn thành thêm 1 bài học để nhận huy hiệu Cần Mẫn nhé!
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/client/learning-materials')}
                        className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold hover:bg-slate-50 hover:scale-105 transition-all duration-300 shadow-xl shadow-white/10"
                    >
                        Tiếp tục học tập
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                {/* Stat 1 */}
                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 flex items-center gap-5 slide-up">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">Chuỗi học tập</p>
                        <h3 className="text-2xl font-bold text-slate-800">12 Ngày</h3>
                    </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 flex items-center gap-5 slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">Thời gian học</p>
                        <h3 className="text-2xl font-bold text-slate-800">24h 15m</h3>
                    </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 flex items-center gap-5 slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">Bài test hoàn thành</p>
                        <h3 className="text-2xl font-bold text-slate-800">8 Bài</h3>
                    </div>
                </div>

                {/* Stat 4 */}
                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 flex items-center gap-5 slide-up" style={{ animationDelay: '0.3s' }}>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">Điểm đánh giá (AVG)</p>
                        <h3 className="text-2xl font-bold text-slate-800">8.5 Đ</h3>
                    </div>
                </div>

            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Continue Learning Course Card */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Khóa học đang theo dõi</h2>
                            <button onClick={() => navigate('/client/learning-materials')} className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1">
                                Xem tất cả
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-6 items-center p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors cursor-pointer group">
                            <div className="w-full md:w-48 h-32 rounded-2xl bg-slate-200 overflow-hidden relative shadow-sm">
                                <img src="https://images.unsplash.com/photo-1546410531-dd4cbac24b25?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Course" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors"></div>
                                {/* Play button overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-teal-600 shadow-lg">
                                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 w-full">
                                <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider rounded-lg mb-2">Đang học</span>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors">Ngữ pháp tiếng Anh cơ bản</h3>
                                <p className="text-sm text-slate-500 font-medium mb-4">Bài 12: Thì Hiện tại hoàn thành (Present Perfect)</p>
                                
                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-600">
                                        <span>Thu thập kiến thức</span>
                                        <span className="text-teal-600">45%</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-teal-500 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div 
                            onClick={() => navigate('/client/daily-review')}
                            className="bg-teal-50 rounded-[2rem] p-8 border border-teal-100 hover:shadow-lg hover:shadow-teal-100 transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white text-teal-600 flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            </div>
                            <h3 className="text-lg font-bold text-teal-900 mb-2">Ôn tập hằng ngày</h3>
                            <p className="text-teal-700/80 font-medium text-sm">Flashcards siêu chuẩn xác để nhồi từ vựng.</p>
                        </div>
                        
                        <div 
                            onClick={() => navigate('/client/placement-test')}
                            className="bg-sky-50 rounded-[2rem] p-8 border border-sky-100 hover:shadow-lg hover:shadow-sky-100 transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white text-sky-600 flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </div>
                            <h3 className="text-lg font-bold text-sky-900 mb-2">Kiểm tra năng lực</h3>
                            <p className="text-sky-700/80 font-medium text-sm">Làm test đầu vào để xác nhận lộ trình học xác.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-8">
                    {/* Recent Tests */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6">Kết quả gần đây</h2>
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="w-12 h-12 rounded-full bg-white flex flex-col items-center justify-center shadow-sm flex-shrink-0">
                                        <span className={`text-sm font-extrabold ${idx === 0 ? 'text-teal-600' : 'text-slate-600'}`}>
                                            {95 - idx * 10}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 truncate text-sm mb-1">Kiểm tra ngữ pháp căn bản</h4>
                                        <p className="text-xs font-semibold text-slate-400">Hôm qua, 14:30</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => navigate('/client/test-results')} className="w-full mt-6 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors border border-slate-200">
                            Xem tất cả kết quả
                        </button>
                    </div>

                    {/* Mini Calendar/Upcoming */}
                    <div className="bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-800 text-white">
                        <h2 className="text-lg font-bold mb-6">Lịch học sắp tới</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Th 3</span>
                                    <span className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white mt-1">26</span>
                                </div>
                                <div className="flex-1 bg-white/10 rounded-xl p-3 border border-white/5">
                                    <p className="font-semibold text-sm">Lớp Giao Tiếp 1-1</p>
                                    <p className="text-xs text-slate-400 mt-1">19:00 - 20:30</p>
                                </div>
                            </div>
                             <div className="flex gap-4 opacity-50">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Th 5</span>
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-400 mt-1">28</span>
                                </div>
                                <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="font-semibold text-sm text-slate-300">Test Giữa Kỳ</p>
                                    <p className="text-xs text-slate-500 mt-1">15:00 - 16:00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .slide-up {
                    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}
