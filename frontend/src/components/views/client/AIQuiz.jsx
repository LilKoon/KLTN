import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { apiGetAIQuiz } from '../../../api.js';

export default function AIQuiz() {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useAuth();
    const stateData = location.state || {};

    const [questions, setQuestions] = useState(stateData.questions || null);
    const [topic, setTopic] = useState(stateData.topic || '');
    const [level, setLevel] = useState(stateData.level || '');
    const [loadError, setLoadError] = useState('');
    const [loading, setLoading] = useState(!stateData.questions && !!stateData.id);

    const [answers, setAnswers] = useState({});
    const [currentIdx, setCurrentIdx] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    // Load từ DB nếu chỉ có id
    useEffect(() => {
        if (questions || !stateData.id || !token) return;
        let cancelled = false;
        (async () => {
            try {
                const data = await apiGetAIQuiz(token, stateData.id);
                if (cancelled) return;
                setQuestions(data.questions || []);
                setTopic(data.topic || data.title || '');
                setLevel(data.level || '');
            } catch (err) {
                if (!cancelled) setLoadError(err.message || 'Không tải được bài test.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [stateData.id, token, questions]);

    const total = questions?.length || 0;

    const result = useMemo(() => {
        if (!submitted || !questions) return null;
        let correct = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.answer) correct += 1;
        });
        return {
            correct,
            wrong: total - correct,
            total,
            score: total > 0 ? Math.round((correct / total) * 100) : 0,
        };
    }, [submitted, questions, answers, total]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="bg-white rounded-3xl shadow-md p-8 max-w-md w-full text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                    <p className="text-slate-700 font-semibold">Đang tải bài test...</p>
                </div>
            </div>
        );
    }

    if (!questions || questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="bg-white rounded-3xl shadow-md p-8 max-w-md w-full text-center">
                    <p className="text-slate-700 font-semibold mb-2">{loadError || 'Không có dữ liệu bài test'}</p>
                    <p className="text-sm text-slate-500 mb-5">Hãy quay lại trang Bài tập & Test và sinh lại bằng AI.</p>
                    <button
                        onClick={() => navigate('/client/exercises-tests', { replace: true })}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl"
                    >
                        Quay về
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIdx];
    const userAnswer = answers[currentIdx];

    const handlePick = (optionIdx) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
    };

    const allAnswered = Object.keys(answers).length === total;

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-6 lg:p-12">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 flex items-center justify-between gap-4 shadow-sm">
                    <button
                        onClick={() => navigate('/client/exercises-tests')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" /> Quay lại
                    </button>
                    <div className="flex items-center gap-2 flex-1 justify-center">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        <span className="font-bold text-slate-800">Bài test AI</span>
                        {topic && <span className="text-sm text-slate-400">— {topic}</span>}
                        {level && (
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                                {level}
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                        {Object.keys(answers).length} / {total}
                    </div>
                </div>

                {!submitted && (
                    <>
                        {/* Question card */}
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Câu {currentIdx + 1} / {total}
                                </span>
                                <div className="flex gap-1.5">
                                    {questions.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentIdx(i)}
                                            className={
                                                'w-2.5 h-2.5 rounded-full transition-colors ' +
                                                (i === currentIdx
                                                    ? 'bg-indigo-600'
                                                    : answers[i] !== undefined
                                                        ? 'bg-indigo-300'
                                                        : 'bg-slate-200')
                                            }
                                            title={`Câu ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-5 leading-relaxed">
                                {currentQ.question}
                            </h2>

                            <div className="space-y-3">
                                {currentQ.options.map((opt, i) => {
                                    const picked = userAnswer === i;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handlePick(i)}
                                            className={
                                                'w-full text-left px-4 py-3 rounded-xl border-2 transition-colors flex items-center gap-3 font-medium ' +
                                                (picked
                                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900'
                                                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300')
                                            }
                                        >
                                            <span className={
                                                'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ' +
                                                (picked ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500')
                                            }>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span className="flex-1">{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Nav */}
                        <div className="flex items-center justify-between gap-3">
                            <button
                                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                                disabled={currentIdx === 0}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" /> Câu trước
                            </button>
                            {currentIdx < total - 1 ? (
                                <button
                                    onClick={() => setCurrentIdx(Math.min(total - 1, currentIdx + 1))}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                >
                                    Câu sau <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setSubmitted(true)}
                                    disabled={!allAnswered}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold"
                                    title={allAnswered ? '' : 'Hãy trả lời tất cả câu trước khi nộp'}
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Nộp bài
                                </button>
                            )}
                        </div>
                    </>
                )}

                {submitted && result && (
                    <>
                        {/* Result summary */}
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-4">
                                <span className="text-3xl font-extrabold text-indigo-700">{result.score}</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-1">Hoàn thành bài test AI</h2>
                            <p className="text-sm text-slate-500">
                                Đúng: <span className="font-bold text-emerald-600">{result.correct}</span>
                                {' '}/ {result.total}
                                {' • '}
                                Sai: <span className="font-bold text-rose-600">{result.wrong}</span>
                            </p>
                            <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
                                <button
                                    onClick={() => { setAnswers({}); setCurrentIdx(0); setSubmitted(false); }}
                                    className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-5 py-2.5 rounded-xl"
                                >
                                    <RefreshCw className="w-4 h-4" /> Làm lại bài này
                                </button>
                                <button
                                    onClick={() => navigate('/client/exercises-tests')}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl"
                                >
                                    Sinh bài test mới
                                </button>
                            </div>
                        </div>

                        {/* Detail */}
                        <div className="space-y-4">
                            {questions.map((q, i) => {
                                const userAns = answers[i];
                                const isCorrect = userAns === q.answer;
                                return (
                                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                        <div className="flex items-start gap-3 mb-3">
                                            {isCorrect ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Câu {i + 1}</p>
                                                <p className="font-semibold text-slate-800">{q.question}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-3">
                                            {q.options.map((opt, j) => {
                                                const isAns = j === q.answer;
                                                const isPicked = j === userAns;
                                                return (
                                                    <div
                                                        key={j}
                                                        className={
                                                            'px-3 py-2 rounded-lg border text-sm flex items-center gap-2 ' +
                                                            (isAns
                                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                                : isPicked
                                                                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                                                                    : 'bg-slate-50 border-slate-100 text-slate-600')
                                                        }
                                                    >
                                                        <span className="font-bold">{String.fromCharCode(65 + j)}.</span>
                                                        <span className="flex-1">{opt}</span>
                                                        {isAns && <span className="text-xs font-bold">Đáp án đúng</span>}
                                                        {isPicked && !isAns && <span className="text-xs font-bold">Bạn chọn</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {q.explanation_vi && (
                                            <div className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-3">
                                                <span className="font-bold text-slate-800">Giải thích: </span>{q.explanation_vi}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
