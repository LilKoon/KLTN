import React, { useState, useEffect } from 'react';

export default function StageTest() {
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
    const [currentQ, setCurrentQ] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const questions = [
        { id: 1, text: "If I _____ you, I would study harder.", options: ["am", "was", "were", "been"] },
        { id: 2, text: "She has been working here _____ 2015.", options: ["in", "since", "for", "from"] },
        { id: 3, text: "The book _____ I bought yesterday is very interesting.", options: ["who", "whom", "which", "whose"] },
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>
            
            {/* Header / Timer */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between sticky top-24 z-10 animate-slide-in" style={{ opacity: 0 }}>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Bài kiểm tra Giai đoạn 1</h1>
                    <p className="text-slate-500 font-medium text-sm mt-2">Câu {currentQ + 1} / {questions.length}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${timeLeft < 60 ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'} font-bold`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-slate-200 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed mt-5">
                    <span className="text-teal-600 mr-2">Q{currentQ + 1}.</span> {questions[currentQ].text}
                </h2>

                <div className="space-y-4">
                    {questions[currentQ].options.map((option, idx) => (
                        <label key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50 cursor-pointer transition-all group">
                            <input type="radio" name="answer" className="w-5 h-5 text-teal-600 border-slate-300 focus:ring-teal-500" />
                            <span className="text-lg font-medium text-slate-700 group-hover:text-teal-800">{option}</span>
                        </label>
                    ))}
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
                    <button 
                        disabled={currentQ === 0}
                        onClick={() => setCurrentQ(prev => prev - 1)}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Quay lại
                    </button>

                    {currentQ < questions.length - 1 ? (
                        <button 
                            onClick={() => setCurrentQ(prev => prev + 1)}
                            className="flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-600/20 transition-all focus:ring-2 focus:ring-teal-500"
                        >
                            Câu tiếp theo
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    ) : (
                        <button className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md shadow-slate-900/20 transition-all focus:ring-2 focus:ring-slate-900">
                            Nộp bài
                        </button>
                    )}
                </div>
            </div>

            {/* Question Navigator */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-slide-in" style={{ opacity: 0, animationDelay: '0.2s' }}>
                <p className="text-sm font-bold text-slate-700 mb-4">Danh sách câu hỏi</p>
                <div className="flex flex-wrap gap-2">
                    {questions.map((_, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentQ(idx)}
                            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all focus:outline-none ${currentQ === idx ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 ring-2 ring-teal-600 ring-offset-2' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
