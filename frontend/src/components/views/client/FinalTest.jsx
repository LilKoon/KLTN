import React, { useState, useEffect } from 'react';

export default function FinalTest() {
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
    const [section, setSection] = useState('reading');

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>
            
            {/* Header Wrapper */}
            <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden animate-slide-in" style={{ opacity: 0 }}>
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
                
                <div className="relative z-10 w-full md:w-auto">
                    <span className="bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">Final Exam</span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Bài Kiểm Tra Cuối Khóa</h1>
                    <p className="text-slate-400 font-medium text-sm mt-2 max-w-sm">Hệ thống sẽ tự động nộp bài khi thời gian kết thúc. Hãy chắc chắn bạn đã rà soát kỹ các đáp án.</p>
                </div>
                
                <div className="relative z-10 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-full md:w-auto">
                    <p className="text-slate-300 font-medium text-xs uppercase tracking-wider mb-1">Thời gian còn lại</p>
                    <div className="text-3xl font-mono font-bold text-teal-300 tracking-wider">
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                {/* Sidebar Nav */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-fit sticky top-24">
                    <h3 className="text-sm font-bold text-slate-800 px-4 mb-4 uppercase tracking-wider">Phần thi</h3>
                    <nav className="space-y-1">
                        <button 
                            onClick={() => setSection('reading')}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-colors ${section === 'reading' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <span>Reading Comprehension</span>
                            {section === 'reading' && <div className="w-2 h-2 rounded-full bg-teal-500"></div>}
                        </button>
                        <button 
                            onClick={() => setSection('listening')}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-colors ${section === 'listening' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <span>Listening Practice</span>
                            {section === 'listening' && <div className="w-2 h-2 rounded-full bg-teal-500"></div>}
                        </button>
                        <button 
                            onClick={() => setSection('writing')}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-colors ${section === 'writing' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <span>Writing Task</span>
                            {section === 'writing' && <div className="w-2 h-2 rounded-full bg-teal-500"></div>}
                        </button>
                    </nav>
                    <div className="mt-8 pt-6 border-t border-slate-100 px-2">
                        <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md transition-all focus:ring-2 focus:ring-slate-900">
                            Nộp bài (Thoát)
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 sm:p-10 min-h-[500px]">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-8 border-b border-slate-100 pb-4 capitalize">
                        {section} Section
                    </h2>
                    
                    {/* Placeholder content depending on section */}
                    <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed">
                        <p className="italic text-slate-500 mb-6 bg-slate-50 p-4 rounded-xl">Read the passage carefully and answer the questions that follow.</p>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">The Future of Artificial Intelligence</h3>
                        <p>
                            Artificial Intelligence (AI) is rapidly evolving, reshaping everything from healthcare to education. 
                            As machine learning algorithms become more sophisticated, the boundary between human cognitive capabilities 
                            and machine processing continues to blur. One of the primary applications...
                        </p>
                        <p>
                            (Nội dung bài thi chi tiết sẽ được tải từ Server dựa vào ID của khóa học. Phần giao diện này là khung mẫu để minh họa layout và tính năng đếm ngược.)
                        </p>
                        
                        <div className="mt-10 space-y-6">
                            <h4 className="font-bold text-slate-800">Q1. What is the main idea of the passage?</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-teal-500 cursor-pointer">
                                    <input type="radio" name="q1" className="mt-1 text-teal-600 focus:ring-teal-500" />
                                    <span className="text-sm font-medium text-slate-700">AI is dangerous and should be stopped.</span>
                                </label>
                                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-teal-500 cursor-pointer">
                                    <input type="radio" name="q1" className="mt-1 text-teal-600 focus:ring-teal-500" />
                                    <span className="text-sm font-medium text-slate-700">AI is rapidly evolving and reshaping industries.</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
