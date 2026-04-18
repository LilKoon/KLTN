import React from 'react';

export default function LearningPath() {
    const mapNodes = [
        { id: 1, title: 'Đánh giá Năng lực', status: 'completed', score: '85/100', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 2, title: 'Ngữ pháp Nền tảng', status: 'completed', score: '92/100', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { id: 3, title: 'Luyện nghe phản xạ (Đang học)', status: 'in-progress', progress: '45%', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' },
        { id: 4, title: 'Giao tiếp chủ đề Công sở', status: 'locked', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { id: 5, title: 'Bài Test Tổng Kết (Final Test)', status: 'locked', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>
            
            <div className="bg-gradient-to-r from-teal-500 to-sky-600 rounded-[2rem] p-8 sm:p-12 text-white shadow-lg animate-slide-in" style={{ opacity: 0 }}>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Lộ trình được Cá nhân hóa</h1>
                <p className="text-teal-50 font-medium max-w-xl">Hệ thống AI đã phân tích trình độ đầu vào của bạn và xây dựng một kế hoạch học tập tối ưu nhằm đạt mục tiêu IELTS 7.0 trong 6 tháng.</p>
                <div className="mt-6 flex items-center gap-4">
                    <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-sm font-bold border border-white/10">3/5 Giai đoạn</div>
                    <div className="flex-1 max-w-xs h-3 bg-black/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '60%' }}></div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-sm border border-slate-200 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                <div className="relative border-l-4 border-slate-100 ml-4 md:ml-8 space-y-12">
                    
                    {mapNodes.map((node, index) => {
                        const isCompleted = node.status === 'completed';
                        const isCurrent = node.status === 'in-progress';
                        const isLocked = node.status === 'locked';
                        
                        let bgColor = 'bg-slate-100';
                        let textColor = 'text-slate-400';
                        let borderColor = 'border-slate-200';
                        
                        if (isCompleted) {
                            bgColor = 'bg-emerald-500'; textColor = 'text-white'; borderColor = 'border-emerald-500';
                        } else if (isCurrent) {
                            bgColor = 'bg-sky-500'; textColor = 'text-white'; borderColor = 'border-sky-500 shadow-lg shadow-sky-500/30 animate-pulse';
                        }

                        return (
                            <div key={node.id} className="relative group pl-8 sm:pl-12">
                                {/* Connector line override for completed items */}
                                {isCompleted && index !== mapNodes.length - 1 && (
                                    <div className="absolute top-10 -left-[2px] w-1 h-full bg-emerald-500 z-0"></div>
                                )}

                                {/* Circle Indicator */}
                                <div className={`absolute -left-6 sm:-left-7 top-2 w-12 h-12 flex items-center justify-center rounded-full border-4 border-white ${bgColor} ${borderColor} ${textColor} z-10 transition-transform ${isCurrent ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={node.icon} />
                                    </svg>
                                </div>

                                {/* Content Card */}
                                <div className={`p-6 rounded-2xl border transition-all ${isCurrent ? 'bg-sky-50/50 border-sky-200 shadow-md' : 'bg-white border-slate-200 hover:shadow-md hover:border-slate-300'} ${isLocked ? 'opacity-50 grayscale select-none' : ''}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                        <h3 className={`text-xl font-bold ${isCurrent ? 'text-sky-900' : 'text-slate-800'}`}>{node.title}</h3>
                                        
                                        {!isLocked && (
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                                                {isCompleted ? `Điểm: ${node.score}` : `${node.progress} Hoàn thành`}
                                            </span>
                                        )}
                                        {isLocked && <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">Chưa mở khóa</span>}
                                    </div>
                                    
                                    <p className="text-slate-500 font-medium text-sm">Hoàn thành chặng này để củng cố kỹ năng và mở khóa các thử thách tiếp theo trong lộ trình.</p>
                                    
                                    {isCurrent && (
                                        <button className="mt-4 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-sky-600/20">
                                            Tiếp tục học ngay
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
}
