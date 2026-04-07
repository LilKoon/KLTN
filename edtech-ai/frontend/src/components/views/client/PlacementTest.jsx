import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function PlacementTest() {
    const { token } = useAuth();
    const navigate = useNavigate();
    
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { [MaCauHoi]: 'selected answer' }
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/test/placement', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error('Không thể tải bộ đề');
                const data = await res.json();
                setQuestions(data.questions);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [token]);

    const handleSelectOption = (answer) => {
        const currentQ = questions[currentIndex];
        setAnswers({
            ...answers,
            [currentQ.MaCauHoi]: answer
        });
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                answers: Object.keys(answers).map(qid => ({
                    MaCauHoi: qid,
                    CauTraLoi: answers[qid]
                }))
            };

            const res = await fetch('http://127.0.0.1:8000/test/placement/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Lỗi khi nộp bài');
            const data = await res.json();
            
            // Gọi AI Build Tree lộ trình ngầm
            try {
                await fetch('http://127.0.0.1:8000/path/generate', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (ignore) {}

            // Chuyển hướng sang màn hình kết quả kèm data (DiemSo, XepLoai, TinNhan)
            navigate('/client/test-result', { state: { result: data } });

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium animate-pulse">AI đang xáo đề, xếp bài cho bạn...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center border border-rose-100">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Lỗi Tải Đề</h2>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">Thử Lại</button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) return <div>Không có câu hỏi nào.</div>;

    const currentQ = questions[currentIndex];
    const hasAnsweredCurrent = !!answers[currentQ.MaCauHoi];
    const isLastQuestion = currentIndex === questions.length - 1;
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                
                {/* Header & Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => navigate('/client')} className="text-slate-400 hover:text-slate-700 font-bold text-sm flex items-center gap-1 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            Thoát bài trắc nghiệm
                        </button>
                        <span className="text-teal-600 font-bold bg-teal-50 px-3 py-1 rounded-full text-xs">
                            Kỹ năng: {currentQ.KyNang}
                        </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                        <div className="bg-teal-500 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <p className="text-right text-xs font-bold text-slate-400">Câu hỏi {currentIndex + 1} / {questions.length}</p>
                </div>

                {/* Question Box */}
                <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-sm border border-slate-200 mb-6 transition-all">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight mb-10">
                        {currentQ.NoiDung}
                    </h2>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        {currentQ.DSDapAn.map((opt, idx) => {
                            const isSelected = answers[currentQ.MaCauHoi] === opt;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(opt)}
                                    className={`relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                                        isSelected 
                                            ? 'border-teal-500 bg-teal-50 text-teal-900 shadow-sm shadow-teal-100 scale-[1.01]' 
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 transition-colors ${
                                            isSelected ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="font-semibold text-lg">{opt}</span>
                                    </div>
                                    
                                    {/* Selected Checkmark */}
                                    {isSelected && (
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-teal-500">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation Bar */}
                <div className="flex items-center justify-between">
                    <button 
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className={`px-6 py-3.5 rounded-xl font-bold transition-colors ${
                            currentIndex === 0 
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed hidden sm:block' 
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                    >
                        Quay lại
                    </button>

                    {isLastQuestion ? (
                        <button 
                            onClick={handleSubmit}
                            disabled={!hasAnsweredCurrent || submitting}
                            className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-10 py-3.5 rounded-[1.14rem] font-bold text-white transition-all shadow-lg ${
                                !hasAnsweredCurrent || submitting 
                                    ? 'bg-slate-300 shadow-none cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:shadow-teal-500/30 hover:-translate-y-0.5'
                            }`}
                        >
                            {submitting ? (
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : "Nộp Bài Ngay"}
                        </button>
                    ) : (
                        <button 
                            onClick={handleNext}
                            disabled={!hasAnsweredCurrent}
                            className={`flex-1 sm:flex-none px-10 py-3.5 rounded-xl font-bold transition-all ${
                                !hasAnsweredCurrent 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20'
                            }`}
                        >
                            Câu tiếp theo
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
