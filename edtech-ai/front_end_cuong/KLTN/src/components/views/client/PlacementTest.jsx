import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { apiStartExam, apiSubmitExam } from '../../../api';

export default function PlacementTest() {
    const { token } = useAuth();
    const navigate = useNavigate();

    // ─── State ──────────────────────────────────────────────────────────
    const [phase, setPhase] = useState('intro');   // 'intro' | 'loading' | 'test' | 'submitting' | 'error'
    const [examId, setExamId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timePerQuestion, setTimePerQuestion] = useState({});
    const [questionStartTime, setQuestionStartTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30 * 60);
    const [error, setError] = useState(null);
    const [alreadyCompleted, setAlreadyCompleted] = useState(false);
    const [completedExamId, setCompletedExamId] = useState(null);

    // ─── Check if already completed (silent check) ─────────────────────
    useEffect(() => {
        if (!token) return;
        // Gọi start để check already_completed, nhưng KHÔNG bắt đầu làm bài
        apiStartExam(token)
            .then(data => {
                if (data.already_completed) {
                    setAlreadyCompleted(true);
                    setCompletedExamId(data.exam_id);
                }
                // Nếu chưa làm → giữ phase='intro', không load câu hỏi
            })
            .catch(() => {/* ignore */ });
    }, [token]);

    // ─── Start exam (khi user bấm nút) ──────────────────────────────────
    const handleStartExam = async () => {
        if (alreadyCompleted) {
            navigate(`/client/test-results?examId=${completedExamId}`);
            return;
        }
        try {
            setPhase('loading');
            const data = await apiStartExam(token);
            if (data.already_completed) {
                navigate(`/client/test-results?examId=${data.exam_id}`);
                return;
            }
            setExamId(data.exam_id);
            setQuestions(data.questions);
            setTimeLeft(data.time_limit_minutes * 60);
            setQuestionStartTime(Date.now());
            setPhase('test');
        } catch (err) {
            setError(err.message);
            setPhase('error');
        }
    };

    // ─── Timer countdown ────────────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'test' || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase, timeLeft]);

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // ─── Answer & navigation ─────────────────────────────────────────────
    const handleSelectAnswer = (key) => {
        const qId = questions[currentQuestion]?.question_id;
        setAnswers(prev => ({ ...prev, [qId]: key }));
    };

    const trackTime = useCallback(() => {
        const qId = questions[currentQuestion]?.question_id;
        if (qId && questionStartTime) {
            const elapsed = Math.round((Date.now() - questionStartTime) / 1000);
            setTimePerQuestion(prev => ({ ...prev, [qId]: (prev[qId] || 0) + elapsed }));
        }
    }, [currentQuestion, questionStartTime, questions]);

    const goToQuestion = (index) => {
        trackTime();
        setCurrentQuestion(index);
        setQuestionStartTime(Date.now());
    };

    // ─── Submit ──────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (phase === 'submitting') return;
        trackTime();
        setPhase('submitting');
        try {
            const answersArray = questions.map(q => ({
                question_id: q.question_id,
                selected: answers[q.question_id] || '',
                time_spent: timePerQuestion[q.question_id] || 0,
            }));
            const result = await apiSubmitExam(token, examId, answersArray);
            navigate(`/client/test-results?examId=${result.exam_id}`);
        } catch (err) {
            setError(err.message);
            setPhase('error');
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    //  PHASE: INTRO — Màn hình chào mừng / bắt đầu
    // ═══════════════════════════════════════════════════════════════════
    if (phase === 'intro') {
        return (
            <div className="min-h-screen bg-slate-50 font-inter flex items-center justify-center p-4 sm:p-8">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                    .font-inter { font-family: 'Inter', sans-serif; }
                    @keyframes pt-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
                    .pt-float { animation: pt-float 3s ease-in-out infinite; }
                    @keyframes pt-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                    .pt-fade-1 { animation: pt-fade-up 0.5s 0.1s ease both; }
                    .pt-fade-2 { animation: pt-fade-up 0.5s 0.25s ease both; }
                    .pt-fade-3 { animation: pt-fade-up 0.5s 0.4s ease both; }
                    .pt-start-btn:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(20,184,166,0.4); }
                    .pt-start-btn { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                `}</style>

                <div className="max-w-2xl w-full">
                    {/* Hero card */}
                    <div className="pt-fade-1 bg-white rounded-[2rem] p-8 sm:p-12 shadow-xl shadow-slate-900/8 border border-slate-100 text-center">
                        {/* Icon */}
                        <div className="pt-float inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-sky-500 text-white text-4xl shadow-lg shadow-teal-400/30 mb-6">
                            📝
                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                            Placement Test
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
                            Kiểm tra trình độ <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-sky-500">đầu vào</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
                            Hoàn thành bài test để chúng tôi xây dựng lộ trình học cá nhân hoá phù hợp nhất với trình độ của bạn.
                        </p>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-4 mb-10">
                            {[
                                { icon: '📋', label: '30 câu hỏi', sub: 'Grammar · Vocab · Listening' },
                                { icon: '⏱', label: '30 phút', sub: 'Thời gian làm bài' },
                                { icon: '📊', label: '3 kỹ năng', sub: 'Đánh giá toàn diện' },
                            ].map((s, i) => (
                                <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="text-2xl mb-1">{s.icon}</div>
                                    <p className="font-bold text-slate-800 text-sm">{s.label}</p>
                                    <p className="text-slate-400 text-xs mt-0.5">{s.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* CTA button */}
                        {alreadyCompleted ? (
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold mb-2">
                                    Bạn đã hoàn thành bài test này
                                </div>
                                <br />
                                <button
                                    onClick={() => navigate(`/client/test-results?examId=${completedExamId}`)}
                                    className="pt-start-btn inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-sky-500 text-white font-bold text-lg shadow-lg shadow-teal-400/30"
                                >
                                    Xem kết quả của bạn
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <button
                                id="start-exam-btn"
                                onClick={handleStartExam}
                                className="pt-start-btn inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-sky-500 text-white font-bold text-lg shadow-lg shadow-teal-400/30"
                            >
                                Bắt đầu làm bài
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="pt-fade-2 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { icon: '💡', text: 'Không cần hoàn thành tất cả — cứ làm hết khả năng của bạn.' },
                            { icon: '🎧', text: 'Phần Listening cần tai nghe hoặc loa. Hãy chuẩn bị trước.' },
                        ].map((tip, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-start gap-3 shadow-sm">
                                <span className="text-xl">{tip.icon}</span>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">{tip.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    //  PHASE: LOADING
    // ═══════════════════════════════════════════════════════════════════
    if (phase === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-14 h-14 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-600 font-semibold">Đang chuẩn bị đề thi...</p>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    //  PHASE: ERROR
    // ═══════════════════════════════════════════════════════════════════
    if (phase === 'error') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Có lỗi xảy ra</h3>
                    <p className="text-slate-500 mb-4">{error}</p>
                    <button onClick={() => { setPhase('intro'); setError(null); }}
                        className="px-6 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    //  PHASE: TEST — Đang làm bài
    // ═══════════════════════════════════════════════════════════════════
    if (questions.length === 0) return null;

    const currentQ = questions[currentQuestion];
    const selectedAnswer = answers[currentQ.question_id] || null;
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;
    const isSubmitting = phase === 'submitting';

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-4 sm:p-6 lg:p-12 flex flex-col items-center">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>

            <div className="w-full max-w-3xl space-y-6">
                {/* Top Bar — Exit + Timer */}
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
                    <button onClick={() => setPhase('intro')}
                        className="text-slate-500 hover:text-slate-800 transition-colors font-medium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Thoát
                    </button>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${timeLeft < 60 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                        <svg className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-600' : 'text-teal-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`font-bold text-lg tracking-tight tabular-nums ${timeLeft < 60 ? 'text-red-600' : 'text-slate-800'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                {/* Progress bar + Question nav */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
                        <span>Câu {currentQuestion + 1} / {questions.length}</span>
                        <span className="text-teal-600">{answeredCount}/{questions.length} đã trả lời</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-sky-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                        {questions.map((q, idx) => (
                            <button key={idx} onClick={() => goToQuestion(idx)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
                                    ${idx === currentQuestion
                                        ? 'bg-teal-600 text-white shadow-sm'
                                        : answers[q.question_id]
                                            ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                    }`}>
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question card */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex gap-2 mb-4">
                        <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full">{currentQ.skill}</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full
                            ${currentQ.level === 1 ? 'bg-green-50 text-green-700' :
                                currentQ.level === 2 ? 'bg-yellow-50 text-yellow-700' :
                                    'bg-red-50 text-red-700'}`}>
                            Level {currentQ.level}
                        </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">{currentQ.question}</h2>

                    {currentQ.audio && (
                        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center">
                            <audio controls src={`http://127.0.0.1:8000/static/audios/${currentQ.audio}`} className="w-full max-w-md" />
                        </div>
                    )}

                    <div className="space-y-3">
                        {Object.entries(currentQ.options).map(([key, text]) => {
                            const isSelected = selectedAnswer === key;
                            return (
                                <div key={key} onClick={() => handleSelectAnswer(key)}
                                    className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 group
                                        ${isSelected
                                            ? 'border-teal-500 bg-teal-50 shadow-sm'
                                            : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                                        }`}>
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 transition-colors
                                        ${isSelected
                                            ? 'bg-teal-500 text-white'
                                            : 'bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600'
                                        }`}>
                                        {key}
                                    </div>
                                    <span className={`font-medium flex-1 ${isSelected ? 'text-teal-900' : 'text-slate-700'}`}>{text}</span>
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

                    <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
                        <button disabled={currentQuestion === 0} onClick={() => goToQuestion(currentQuestion - 1)}
                            className="px-6 py-3 font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            ← Câu trước
                        </button>

                        {currentQuestion === questions.length - 1 ? (
                            <button onClick={handleSubmit} disabled={isSubmitting}
                                className={`px-8 py-3 rounded-xl font-bold transition-all shadow-sm
                                    ${isSubmitting
                                        ? 'bg-slate-200 text-slate-400 cursor-wait'
                                        : 'bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white shadow-teal-500/30'
                                    }`}>
                                {isSubmitting ? 'Đang nộp bài...' : `Nộp bài (${answeredCount}/${questions.length})`}
                            </button>
                        ) : (
                            <button onClick={() => goToQuestion(currentQuestion + 1)}
                                className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white shadow-sm shadow-teal-500/30 transition-all">
                                Câu tiếp theo →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
