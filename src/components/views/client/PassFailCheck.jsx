import React from 'react';

export default function PassFailCheck() {
    const isPassed = true; // Hardcoded for UI demonstration purposes
    const score = 88;
    const requiredScore = 80;

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <style>{`
                @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-up { animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                @keyframes confetti {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(1000px) rotate(720deg); opacity: 0; }
                }
            `}</style>
            
            <div className={`max-w-md w-full rounded-[2.5rem] p-10 sm:p-12 text-center shadow-2xl relative overflow-hidden animate-scale-up border ${isPassed ? 'bg-emerald-50 border-emerald-100 shadow-emerald-500/20' : 'bg-rose-50 border-rose-100 shadow-rose-500/20'}`}>
                
                {/* Decorative blob */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full mix-blend-multiply filter blur-3xl opacity-40 ${isPassed ? 'bg-emerald-300' : 'bg-rose-300'}`}></div>
                <div className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full mix-blend-multiply filter blur-3xl opacity-40 ${isPassed ? 'bg-teal-300' : 'bg-orange-300'}`}></div>

                {isPassed ? (
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 mb-8 ring-8 ring-emerald-100">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Chúc Mừng!</h1>
                        <p className="text-slate-600 font-medium mb-8 leading-relaxed">Bạn đã xuất sắc vượt qua bài kiểm tra và đủ điều kiện để mở khóa chặng tiếp theo.</p>
                        
                        <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 mb-8 flex justify-around">
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Điểm của bạn</p>
                                <p className="text-4xl font-black text-emerald-600">{score}</p>
                            </div>
                            <div className="w-px bg-slate-100 my-2"></div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Điểm yêu cầu</p>
                                <p className="text-4xl font-black text-slate-800">{requiredScore}</p>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/20 transition-all focus:ring-2 focus:ring-slate-900">
                            Tiếp tục Lộ trình
                        </button>
                    </div>
                ) : (
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-rose-500/30 mb-8 ring-8 ring-rose-100">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Chưa đạt Yêu cầu!</h1>
                        <p className="text-slate-600 font-medium mb-8 leading-relaxed">Bạn cần thêm một chút nỗ lực nữa để đạt mức điểm yêu cầu. Đừng nản chí nhé!</p>
                        
                        <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-rose-100 mb-8 flex justify-around">
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Điểm của bạn</p>
                                <p className="text-4xl font-black text-rose-600">{score}</p>
                            </div>
                            <div className="w-px bg-slate-100 my-2"></div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Điểm yêu cầu</p>
                                <p className="text-4xl font-black text-slate-800">{requiredScore}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full">
                            <button className="flex-1 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-bold transition-all">
                                Xem lại bài
                            </button>
                            <button className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-lg shadow-rose-600/20 transition-all focus:ring-2 focus:ring-rose-500">
                                Thử lại
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
