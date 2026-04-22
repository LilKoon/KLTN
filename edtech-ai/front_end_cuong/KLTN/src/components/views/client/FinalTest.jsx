import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { apiStartExam, apiSubmitExam, apiGetFinalTestInfo } from '../../../api';

// Tùy chỉnh màu sắc, icon cho từng skill
const SKILL_META = {
    GRAMMAR: { icon: '📖', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
    VOCABULARY: { icon: '💡', color: 'text-sky-600', bg: 'bg-sky-50', bar: 'bg-sky-500' },
    LISTENING: { icon: '🎧', color: 'text-violet-600', bg: 'bg-violet-50', bar: 'bg-violet-500' },
};

export default function FinalTest() {
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

    // Thông tin đầu vào từ Placement Test
    const [baselineSkills, setBaselineSkills] = useState([]);
    const [hasDauVao, setHasDauVao] = useState(false);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isFetchingInfo, setIsFetchingInfo] = useState(true);

    // ─── Fetch Baseline ─────────────────────────────────────────────────
    useEffect(() => {
        if (!token) return;
        apiGetFinalTestInfo(token)
            .then(data => {
                if (data.has_dau_vao) {
                    setHasDauVao(true);
                    
                    // Convert object skills into array if it's an object now
                    if (data.skills && !Array.isArray(data.skills)) {
                        const skillsArr = Object.keys(data.skills).map(k => ({
                            skill: k,
                            percentage: data.skills[k]
                        }));
                        setBaselineSkills(skillsArr);
                    } else if (Array.isArray(data.skills)) {
                        setBaselineSkills(data.skills);
                    }
                }
                setHistory(data.history || []);
            })
            .catch(err => {
                console.error("Lỗi khi tải kết quả đầu vào:", err);
            })
            .finally(() => {
                setIsFetchingInfo(false);
            });
    }, [token]);

    // ─── Start exam ─────────────────────────────────────────────────────
    const handleStartExam = async () => {
        if (phase === 'loading') return;
        try {
            setPhase('loading');
            // Gọi apiStartExam truyền examType là "FINAL"
            const data = await apiStartExam(token, "FINAL");
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
    //  PHASE: INTRO 
    // ═══════════════════════════════════════════════════════════════════
    if (phase === 'intro') {
        return (
            <div className="min-h-screen bg-slate-50 font-inter flex flex-col items-center justify-center p-4 sm:p-8">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                    .font-inter { font-family: 'Inter', sans-serif; }
                    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                    .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
                `}</style>

                <div className="max-w-3xl w-full animate-slide-up">
                    <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
                        {/* Decorative circle */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-16 -mt-16"></div>

                        <div className="relative z-10 text-center mb-10">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-orange-400 text-white text-4xl shadow-lg mb-6">
                                🎓
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
                                Bài Kiểm Tra <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Cuối Khóa</span>
                            </h1>
                            <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                                Đã đến lúc đánh giá lại toàn bộ kiến thức bạn đã tích lũy được!
                            </p>
                        </div>

                        {/* Baseline Box */}
                        {hasDauVao && baselineSkills.length > 0 && (
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-center mb-10 mx-auto max-w-2xl shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Kết quả Bài Kiểm Tra Đầu Vào</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {baselineSkills.map((sk, idx) => {
                                        const meta = SKILL_META[sk.skill] || { icon: '📋', color: 'text-slate-600', bg: 'bg-slate-100', bar: 'bg-slate-500' };
                                        return (
                                            <div key={idx} className="flex flex-col">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`font-bold flex items-center gap-1.5 text-sm ${meta.color}`}>
                                                        <span>{meta.icon}</span> {sk.skill}
                                                    </span>
                                                    <span className="font-extrabold text-slate-700">{sk.percentage}%</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${sk.percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-slate-400 mt-6 font-medium italic">Hãy làm phần Test Cuối Khóa này thật tốt để xem sự tiến bộ của bạn.</p>
                            </div>
                        )}

                        <div className="min-h-[100px]">
                            {isFetchingInfo ? (
                                <div className="text-center p-8">
                                    <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-slate-500 mt-4 font-medium">Đang kiểm tra dữ liệu...</p>
                                </div>
                            ) : hasDauVao ? (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                                    <button onClick={handleStartExam} disabled={phase === 'loading'}
                                        className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-lg shadow-xl shadow-rose-500/30 hover:-translate-y-1 transition-transform min-w-[240px]">
                                        {phase === 'loading' ? 'Đang chuẩn bị...' : 'Bắt đầu Test Final 🚀'}
                                    </button>
                                    <button onClick={() => setShowHistory(!showHistory)}
                                        className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-lg hover:bg-slate-50 transition-colors min-w-[240px]">
                                        Lịch sử bài làm
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-rose-50 border border-rose-100 rounded-3xl mx-auto max-w-xl shadow-sm animate-slide-up">
                                    <div className="text-4xl mb-4">⚠️</div>
                                    <h3 className="text-xl font-bold text-rose-700 mb-2">Bạn chưa làm Bài Test Đầu Vào!</h3>
                                    <p className="text-rose-600 mb-8 font-medium">Hệ thống cần dữ liệu từ bài đánh giá năng lực ban đầu để đánh giá chính xác sự tiến bộ của bạn.</p>
                                    <button onClick={() => navigate('/client/placement-test')}
                                        className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-lg shadow-xl shadow-rose-500/30 hover:-translate-y-1 transition-transform min-w-[240px]">
                                        Làm Placement Test ngay ➡️
                                    </button>
                                </div>
                            )}
                        </div>

                        {showHistory && (
                            <div className="mt-8 text-left animate-slide-up">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Lịch sử bài Test (Gần nhất)</h3>
                                {history.length === 0 ? (
                                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center text-slate-500 italic">
                                        Bạn chưa có bài thi cuối khóa nào. Hãy làm bài test để xem sự tiến bộ nhé!
                                    </div>
                                ) : (
                                    <div className="grid gap-3 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                                        {history.map((h, i) => (
                                            <div key={i} onClick={() => navigate(`/client/test-results?examId=${h.exam_id}`)} 
                                                 className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-rose-300 hover:shadow-md cursor-pointer transition-all">
                                                <div>
                                                    <p className="font-bold text-slate-700">Lần thi: {new Date(h.created_at).toLocaleDateString()}</p>
                                                    <p className="text-sm text-slate-500">{new Date(h.created_at).toLocaleTimeString()}</p>
                                                </div>
                                                <div className="text-right flex items-center gap-3">
                                                    <div>
                                                        <div className="font-extrabold text-rose-500 text-lg">{h.score}%</div>
                                                        <div className="text-xs text-slate-400">Điểm số</div>
                                                    </div>
                                                    <span className="text-slate-400">→</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    //  PHASE: LOADING & ERROR
    // ═══════════════════════════════════════════════════════════════════
    if (phase === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-14 h-14 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (phase === 'error') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Có lỗi xảy ra</h3>
                    <p className="text-slate-500 mb-4">{error}</p>
                    <button onClick={() => { setPhase('intro'); setError(null); }} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-medium">Thử lại</button>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    //  PHASE: TEST
    // ═══════════════════════════════════════════════════════════════════
    if (questions.length === 0) return null;

    const currentQ = questions[currentQuestion];
    const selectedAnswer = answers[currentQ.question_id] || null;
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;
    const isSubmitting = phase === 'submitting';

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-4 sm:p-6 lg:p-12 flex flex-col items-center">
            <div className="w-full max-w-3xl space-y-6">
                {/* Top Bar */}
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
                    <button onClick={() => setPhase('intro')} className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2">
                        ← Thoát
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="font-bold tracking-tight text-slate-800">
                            ⏳ {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                {/* Progress bar + Question nav */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
                        <span>Câu {currentQuestion + 1} / {questions.length}</span>
                        <span className="text-rose-600">{answeredCount}/{questions.length} đã trả lời</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                        {questions.map((q, idx) => (
                            <button key={idx} onClick={() => goToQuestion(idx)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
                                    ${idx === currentQuestion
                                        ? 'bg-rose-600 text-white shadow-sm'
                                        : answers[q.question_id]
                                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
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
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full min-w-[60px] text-center">Level {currentQ.level}</span>
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
                                        ${isSelected ? 'border-rose-500 bg-rose-50 shadow-sm' : 'border-slate-200 hover:border-rose-300 hover:bg-slate-50'}`}>
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 transition-colors
                                        ${isSelected ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-rose-100 group-hover:text-rose-600'}`}>
                                        {key}
                                    </div>
                                    <span className={`font-medium flex-1 ${isSelected ? 'text-rose-900' : 'text-slate-700'}`}>{text}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
                        <button disabled={currentQuestion === 0} onClick={() => goToQuestion(currentQuestion - 1)}
                            className="px-6 py-3 font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl disabled:opacity-40"><span className="hidden sm:inline">← Câu trước</span><span className="sm:hidden">←</span></button>

                        {currentQuestion === questions.length - 1 ? (
                            <button onClick={handleSubmit} disabled={isSubmitting}
                                className={`px-8 py-3 rounded-xl font-bold transition-all shadow-sm text-white ${isSubmitting ? 'bg-slate-300 cursor-wait' : 'bg-gradient-to-r from-rose-500 to-orange-500 shadow-rose-500/30'}`}>
                                {isSubmitting ? 'Đang nộp bài...' : `Nộp bài (${answeredCount}/${questions.length})`}
                            </button>
                        ) : (
                            <button onClick={() => goToQuestion(currentQuestion + 1)}
                                className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-sm shadow-rose-500/30">
                                Câu tiếp theo →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
