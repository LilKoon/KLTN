import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function PassFailCheck() {
    const { maNode } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/path/node/${maNode}/checkpoint`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Không thể tải bài kiểm tra');
                const data = await res.json();
                setQuestions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [maNode, token]);

    const handleSelectOption = (questionId, option) => {
        setAnswers({
            ...answers,
            [questionId]: option
        });
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQIndex > 0) {
            setCurrentQIndex(currentQIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            alert('Vui lòng trả lời tất cả các câu hỏi trước khi nộp bài!');
            return;
        }

        setSubmitting(true);
        const payload = {
            answers: Object.keys(answers).map(qId => ({
                MaCauHoi: qId,
                CauTraLoi: answers[qId]
            }))
        };

        try {
            const res = await fetch(`http://127.0.0.1:8000/path/node/${maNode}/checkpoint`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Lỗi khi nộp bài');
            const data = await res.json();
            
            // Redirect to test-result with checkpoint flag
            navigate('/client/test-result', { state: { result: data, isCheckpoint: true } });

        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || questions.length === 0) {
        return <div className="p-8 text-center text-rose-500 font-bold">Lỗi: {error || 'Không có câu hỏi'}</div>;
    }

    const currentQ = questions[currentQIndex];
    const answeredCount = Object.keys(answers).length;
    const progressPercent = (answeredCount / questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-4 sm:p-6 lg:p-10 flex flex-col">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>

            <div className="max-w-4xl w-full mx-auto bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12 animate-scale-in relative overflow-hidden flex-1 flex flex-col">
                
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 pointer-events-none"></div>

                {/* Header & Progress */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
                        Bài Giữa Kỳ <span className="text-rose-600">Gatekeeper 80%</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Bắt buộc trắc nghiệm để mở khóa chặng tiếp theo.</p>
                </div>
                
                <div className="mb-12 max-w-xl mx-auto w-full">
                    <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                        <span>Tiến độ hoàn thành</span>
                        <span className="text-rose-600 font-extrabold">{answeredCount}/{questions.length}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Area */}
                <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
                    <div className="mb-8">
                        <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-xs font-extrabold uppercase tracking-wider rounded-lg mb-4">
                            Câu hỏi {currentQIndex + 1}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-snug">
                            {currentQ.NoiDung}
                        </h2>
                    </div>

                    <div className="space-y-4 mb-10">
                        {currentQ.DapAn.map((opt, idx) => {
                            const isSelected = answers[currentQ.MaCauHoi] === opt;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(currentQ.MaCauHoi, opt)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group ${
                                        isSelected 
                                        ? 'border-rose-500 bg-rose-50 shadow-md shadow-rose-100' 
                                        : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 hover:shadow-sm'
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                        isSelected ? 'border-rose-500 bg-rose-500' : 'border-slate-300 group-hover:border-rose-400'
                                    }`}>
                                        {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span className={`text-lg font-medium ${isSelected ? 'text-rose-900 font-bold' : 'text-slate-700'}`}>
                                        {opt}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                    <button 
                        onClick={handlePrev} 
                        disabled={currentQIndex === 0}
                        className={`px-8 py-3.5 rounded-xl font-bold transition-all ${
                            currentQIndex === 0 
                            ? 'text-slate-300 cursor-not-allowed bg-slate-50' 
                            : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200 shadow-sm'
                        }`}
                    >
                        Quay lại
                    </button>

                    {currentQIndex === questions.length - 1 ? (
                        <button 
                            onClick={handleSubmit} 
                            disabled={submitting}
                            className="px-10 py-3.5 rounded-xl font-bold transition-all bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-xl shadow-rose-500/30 flex items-center gap-2 hover:-translate-y-0.5"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : "Nộp bài"}
                        </button>
                    ) : (
                        <button 
                            onClick={handleNext} 
                            className="px-10 py-3.5 rounded-xl font-bold transition-all bg-slate-800 hover:bg-slate-900 text-white shadow-lg hover:-translate-y-0.5"
                        >
                            Tiếp theo
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
