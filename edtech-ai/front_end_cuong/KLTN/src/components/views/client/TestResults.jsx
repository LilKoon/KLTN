import React from 'react';

export default function TestResults() {
    // Mock data for the UI
    const score = 85;
    const totalQuestions = 20;
    const correctCount = 17;
    const timeSpent = "24:15";

    const answers = [
        { id: 1, question: "What is the capital of France?", givenAnswer: "Paris", correctAnswer: "Paris", isCorrect: true },
        { id: 2, question: "Identify the odd one out.", givenAnswer: "A", correctAnswer: "C", isCorrect: false },
        { id: 3, question: "Solve for x: 2x = 10", givenAnswer: "5", correctAnswer: "5", isCorrect: true },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-6 lg:p-12">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-2 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Kết quả bài kiểm tra</h1>
                        <p className="text-slate-500 font-medium">Placement Test - Tiếng Anh Cơ Bản</p>
                    </div>

                    {/* Score Circle */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-100"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-teal-500"
                                strokeDasharray={`${score}, 100`}
                                strokeWidth="3"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-extrabold text-slate-800">{score}%</span>
                        </div>
                    </div>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Số câu đúng</p>
                            <p className="text-2xl font-bold text-slate-800">{correctCount} <span className="text-sm font-medium text-slate-400">/ {totalQuestions}</span></p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Số câu sai</p>
                            <p className="text-2xl font-bold text-slate-800">{totalQuestions - correctCount}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Thời gian làm bài</p>
                            <p className="text-2xl font-bold text-slate-800">{timeSpent}</p>
                        </div>
                    </div>
                </div>

                {/* Detailed Answers */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Chi tiết bài làm</h2>
                    
                    <div className="space-y-4">
                        {answers.map((ans, idx) => (
                            <div key={ans.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow duration-200">
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-800 mb-1">
                                        <span className="text-slate-400 mr-2">Câu {idx + 1}.</span> 
                                        {ans.question}
                                    </p>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500">Bạn chọn:</span>
                                            <span className={`font-medium px-2.5 py-1 rounded-md ${ans.isCorrect ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'}`}>
                                                {ans.givenAnswer}
                                            </span>
                                        </div>
                                        {!ans.isCorrect && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500">Đáp án đúng:</span>
                                                <span className="font-medium bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md">
                                                    {ans.correctAnswer}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start md:items-center justify-end">
                                    {ans.isCorrect ? (
                                        <div className="flex items-center gap-1.5 text-teal-600 font-semibold text-sm bg-teal-50 px-3 py-1.5 rounded-full">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Đúng
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-sm bg-rose-50 px-3 py-1.5 rounded-full">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Sai
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-teal-600/30 hover:shadow-teal-700/40 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                            Trở về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
