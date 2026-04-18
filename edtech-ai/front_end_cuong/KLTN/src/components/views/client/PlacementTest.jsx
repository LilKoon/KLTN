import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { apiStartExam, apiSubmitExam } from '../../../api';

export default function PlacementTest() {
    const { token } = useAuth();
    const navigate = useNavigate();

    // ─── State ──────────────────────────────────────────────────────────
    const [examId, setExamId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});       // { questionId: "A" }
    const [timePerQuestion, setTimePerQuestion] = useState({}); // track time per question
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [timeLeft, setTimeLeft] = useState(30 * 60); // default 30 min
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // ─── Fetch questions from API ───────────────────────────────────────
    useEffect(() => {
        const startExam = async () => {
            try {
                setLoading(true);
                const data = await apiStartExam(token);
                
                // Nếu user đã làm test đầu vào rồi, chuyển thẳng sang trang kết quả
                if (data.already_completed) {
                    navigate(`/client/test-results?examId=${data.exam_id}`);
                    return;
                }

                setExamId(data.exam_id);
                setQuestions(data.questions);
                setTimeLeft(data.time_limit_minutes * 60);
                setQuestionStartTime(Date.now());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (token) startExam();
    }, [token, navigate]);

    // ─── Timer countdown ────────────────────────────────────────────────
    useEffect(() => {
        if (loading || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto-submit khi hết giờ
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // ─── Answer selection ───────────────────────────────────────────────
    const handleSelectAnswer = (optionKey) => {
        const qId = questions[currentQuestion]?.question_id;
        setAnswers(prev => ({ ...prev, [qId]: optionKey }));
    };

    // Track time when changing question
    const trackTime = useCallback(() => {
        const qId = questions[currentQuestion]?.question_id;
        if (qId) {
            const elapsed = Math.round((Date.now() - questionStartTime) / 1000);
            setTimePerQuestion(prev => ({
                ...prev,
                [qId]: (prev[qId] || 0) + elapsed
            }));
        }
    }, [currentQuestion, questionStartTime, questions]);

    const goToQuestion = (index) => {
        trackTime();
        setCurrentQuestion(index);
        setQuestionStartTime(Date.now());
    };

    // ─── Submit exam ────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (submitting) return;
        trackTime();
        setSubmitting(true);

        try {
            // Build answers array
            const answersArray = questions.map(q => ({
                question_id: q.question_id,
                selected: answers[q.question_id] || "",
                time_spent: timePerQuestion[q.question_id] || 0,
            }));

            const result = await apiSubmitExam(token, examId, answersArray);
            
            // Navigate to results page
            navigate(`/client/test-results?examId=${result.exam_id}`);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    // ─── Loading & Error states ─────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 font-inter flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-600 font-medium">Đang tải câu hỏi...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 font-inter flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Lỗi</h3>
                    <p className="text-slate-500">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) return null;

    const currentQ = questions[currentQuestion];
    const selectedAnswer = answers[currentQ.question_id] || null;
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-4 sm:p-6 lg:p-12 flex flex-col items-center">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>
            
            <div className="w-full max-w-3xl space-y-6">
                {/* Top Navigation & Timer */}
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
                    <button 
                        onClick={() => navigate('/client/dashboard')}
                        className="text-slate-500 hover:text-slate-800 transition-colors font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Thoát
                    </button>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${timeLeft < 60 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                        <svg className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-600' : 'text-teal-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`font-semibold text-lg tracking-tight ${timeLeft < 60 ? 'text-red-600' : 'text-slate-800'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                {/* Progress Bar & Question Navigator */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
                        <span>Câu hỏi {currentQuestion + 1} / {questions.length}</span>
                        <span>{answeredCount}/{questions.length} đã trả lời</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    {/* Question number dots */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {questions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToQuestion(idx)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
                                    ${idx === currentQuestion
                                        ? 'bg-teal-600 text-white shadow-sm'
                                        : answers[q.question_id]
                                            ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    {/* Skill & Level badge */}
                    <div className="flex gap-2 mb-4">
                        <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full">
                            {currentQ.skill}
                        </span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full
                            ${currentQ.level === 1 ? 'bg-green-50 text-green-700' :
                              currentQ.level === 2 ? 'bg-yellow-50 text-yellow-700' :
                              'bg-red-50 text-red-700'}`}>
                            Level {currentQ.level}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-6 leading-relaxed">
                        {currentQ.question}
                    </h2>

                    {currentQ.audio && (
                        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center">
                            <audio controls src={`http://127.0.0.1:8000/static/audios/${currentQ.audio}`} className="w-full max-w-md" />
                        </div>
                    )}

                    {/* Options */}
                    <div className="space-y-4">
                        {Object.entries(currentQ.options).map(([key, text]) => {
                            const isSelected = selectedAnswer === key;
                            return (
                                <div 
                                    key={key}
                                    onClick={() => handleSelectAnswer(key)}
                                    className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                                        ${isSelected 
                                            ? 'border-teal-500 bg-teal-50 shadow-sm' 
                                            : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-4 transition-colors
                                        ${isSelected 
                                            ? 'bg-teal-500 text-white' 
                                            : 'bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600'
                                        }`}>
                                        {key}
                                    </div>
                                    <span className={`font-medium flex-1 ${isSelected ? 'text-teal-900' : 'text-slate-700'}`}>
                                        {text}
                                    </span>
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
                            onClick={() => goToQuestion(currentQuestion - 1)}
                            className="px-6 py-3 font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Câu trước
                        </button>

                        {currentQuestion === questions.length - 1 ? (
                            <button 
                                onClick={handleSubmit}
                                disabled={submitting}
                                className={`px-8 py-3 rounded-xl font-semibold transition-all shadow-sm
                                    ${submitting
                                        ? 'bg-slate-200 text-slate-400 cursor-wait'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 hover:shadow-teal-700/40'
                                    }`}
                            >
                                {submitting ? 'Đang nộp bài...' : `Nộp bài (${answeredCount}/${questions.length})`}
                            </button>
                        ) : (
                            <button 
                                onClick={() => goToQuestion(currentQuestion + 1)}
                                className="px-8 py-3 rounded-xl font-semibold transition-all shadow-sm bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 hover:shadow-teal-700/40"
                            >
                                Câu tiếp theo
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
