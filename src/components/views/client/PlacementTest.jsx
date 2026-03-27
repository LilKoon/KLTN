import React, { useState, useEffect } from 'react';

export default function PlacementTest() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

    const questions = [
        {
            id: 1,
            text: "Complete the sentence: 'By the time we arrived, the movie _______.'",
            options: [
                { id: 'A', text: "has already started" },
                { id: 'B', text: "had already started" },
                { id: 'C', text: "already starts" },
                { id: 'D', text: "was already started" }
            ]
        },
        {
            id: 2,
            text: "Which of the following sentences is grammatically correct?",
            options: [
                { id: 'A', text: "If I would have known, I would have come." },
                { id: 'B', text: "If I had known, I would have come." },
                { id: 'C', text: "If I have known, I will come." },
                { id: 'D', text: "If I knew, I came." }
            ]
        },
        {
            id: 3,
            text: "Choose the word that has the closest meaning to 'Enormous':",
            options: [
                { id: 'A', text: "Tiny" },
                { id: 'B', text: "Average" },
                { id: 'C', text: "Gigantic" },
                { id: 'D', text: "Weak" }
            ]
        }
    ];

    // Format time remaining
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const currentQ = questions[currentQuestion];

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null); // Reset selection for next question
        } else {
            alert("Đã nộp bài!");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-4 sm:p-6 lg:p-12 flex flex-col items-center">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>
            
            <div className="w-full max-w-3xl space-y-6">
                {/* Top Navigation & Timer */}
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
                    <button className="text-slate-500 hover:text-slate-800 transition-colors font-medium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Thoát
                    </button>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-slate-800 text-lg tracking-tight">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                {/* Progress Bar Area */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
                        <span>Câu hỏi {currentQuestion + 1} / {questions.length}</span>
                        <span>{Math.round(progress)}% Hoàn thành</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
                        {currentQ.text}
                    </h2>

                    {/* Options Grid */}
                    <div className="space-y-4">
                        {currentQ.options.map((option) => {
                            const isSelected = selectedAnswer === option.id;
                            return (
                                <div 
                                    key={option.id}
                                    onClick={() => setSelectedAnswer(option.id)}
                                    className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                                        ${isSelected 
                                            ? 'border-teal-500 bg-teal-50 shadow-sm' 
                                            : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                                        }`}
                                >
                                    {/* Option Label (A, B, C, D) */}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-4 transition-colors
                                        ${isSelected 
                                            ? 'bg-teal-500 text-white' 
                                            : 'bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600'
                                        }`}>
                                        {option.id}
                                    </div>
                                    
                                    {/* Option Text */}
                                    <span className={`font-medium flex-1 ${isSelected ? 'text-teal-900' : 'text-slate-700'}`}>
                                        {option.text}
                                    </span>

                                    {/* Selected Indicator */}
                                    {isSelected && (
                                        <div className="absolute right-4 text-teal-600">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-100">
                        <button 
                            disabled={currentQuestion === 0}
                            onClick={() => {
                                setCurrentQuestion(p => p - 1);
                                setSelectedAnswer(null);
                            }}
                            className="px-6 py-3 font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Câu trước
                        </button>

                        <button 
                            onClick={handleNext}
                            disabled={!selectedAnswer}
                            className={`px-8 py-3 rounded-xl font-semibold transition-all shadow-sm
                                ${selectedAnswer 
                                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 hover:shadow-teal-700/40' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {currentQuestion === questions.length - 1 ? 'Nộp bài hoàn tất' : 'Câu tiếp theo'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
