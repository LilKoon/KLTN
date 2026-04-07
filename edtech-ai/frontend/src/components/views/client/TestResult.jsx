import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

export default function TestResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const resultData = location.state?.result;
    const isCheckpoint = location.state?.isCheckpoint;

    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (!resultData) {
            navigate('/client');
            return;
        }

        // Bắn pháo hoa nếu điểm qua 7
        if (resultData.DiemSo >= 7) {
            setShowConfetti(true);
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
        }
    }, [resultData, navigate]);

    if (!resultData) return null;

    // Define styling per level
    let bgGradient = 'from-teal-400 to-sky-500';
    let iconColor = 'text-sky-500';
    let titleBadge = 'BEGINNER';

    if (isCheckpoint) {
        if (resultData.XepLoai === 'PASS') {
            bgGradient = 'from-emerald-400 to-teal-500';
            iconColor = 'text-emerald-500';
            titleBadge = 'PASSED CHECKPOINT';
        } else {
            bgGradient = 'from-rose-400 to-red-500';
            iconColor = 'text-rose-500';
            titleBadge = 'CHECKPOINT FAILED';
        }
    } else {
        if (resultData.XepLoai === 'Advanced') {
            bgGradient = 'from-emerald-400 to-teal-500';
            iconColor = 'text-emerald-500';
            titleBadge = 'ADVANCED MASTER';
        } else if (resultData.XepLoai === 'Intermediate') {
            bgGradient = 'from-amber-400 to-orange-500';
            iconColor = 'text-amber-500';
            titleBadge = 'INTERMEDIATE';
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <style>{`
                @keyframes scaleUp { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                .animate-scale { animation: scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
            
            <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-scale relative z-10">
                {/* Header Banner */}
                <div className={`pt-12 pb-24 px-8 text-center bg-gradient-to-br ${bgGradient} text-white relative`}>
                    
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md mb-6 border border-white/20 text-xs font-black tracking-widest uppercase">
                        {titleBadge}
                    </div>
                    
                    <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
                        {isCheckpoint ? 'KẾT QUẢ CHECKPOINT' : 'KẾT QUẢ ĐỊNH VỊ'}
                    </h1>
                    <p className="text-white/80 font-medium max-w-sm mx-auto">
                        {isCheckpoint ? 'AI đã chấm điểm bài làm của bạn.' : 'AI đã phân tích xong ma trận năng lực của bạn.'}
                    </p>

                    {/* Score Circle Avatar overlapping bottom edge */}
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-white rounded-full p-2 shadow-xl shadow-slate-200">
                        <div className={`w-full h-full rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden`}>
                            <span className={`text-4xl font-black ${iconColor}`}>{resultData.DiemSo}</span>
                            <span className="text-slate-400 font-bold text-[10px] mt-1 tracking-wider uppercase">Điểm số</span>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="pt-24 pb-12 px-8 sm:px-12 text-center">
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 mb-8 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 border border-slate-200 uppercase tracking-widest">
                            Lời nhắn từ AI
                        </div>
                        <p className="text-slate-700 text-base sm:text-lg font-medium italic leading-relaxed">
                            "{resultData.TinNhan}"
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={() => navigate('/client/learning-path')} 
                            className={`w-full py-4 px-6 rounded-2xl font-bold text-white shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-r ${bgGradient}`}
                        >
                            {isCheckpoint 
                                ? (resultData.XepLoai === 'PASS' ? 'Tiếp tục Lộ Trình' : 'Học lại phần lý thuyết') 
                                : 'Khám phá Lộ trình của bạn'
                            }
                        </button>
                    </div>

                    <p className="text-xs text-slate-400 mt-6 font-medium">Bản quyền thuật toán phân loại thuộc EdTech AI Framework 2026.</p>
                </div>
            </div>
        </div>
    );
}
