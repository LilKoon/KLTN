import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    BookOpen, Edit3, Headphones, Award, ChevronRight, Sparkles, X, Loader2,
    RefreshCw, Trash2, Calendar
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { apiSaveAIQuiz, apiListAIQuizzes, apiDeleteAIQuiz } from '../../../api.js';

const LEVEL_OPTIONS = [
    { value: 'A1', label: 'A1 — Căn bản' },
    { value: 'A2', label: 'A2 — Sơ cấp' },
    { value: 'B1', label: 'B1 — Trung cấp' },
    { value: 'B2', label: 'B2 — Trung cấp trên' },
    { value: 'C1', label: 'C1 — Nâng cao' },
    { value: 'C2', label: 'C2 — Thành thạo' },
];

function formatDate(s) {
    try {
        const d = new Date(s);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return ''; }
}

export default function ExercisesTests() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [showAiModal, setShowAiModal] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiLevel, setAiLevel] = useState('B1');
    const [aiCount, setAiCount] = useState(10);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    const [savedQuizzes, setSavedQuizzes] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    const fetchSaved = async () => {
        if (!token) return;
        setLoadingList(true);
        try {
            const list = await apiListAIQuizzes(token);
            setSavedQuizzes(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error('Lỗi tải danh sách bài test AI:', err);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => { fetchSaved(); }, [token]);

    const handleGenerateAiQuiz = async () => {
        const topic = aiTopic.trim() || 'Grammar & Vocabulary';
        if (aiCount < 1 || aiCount > 15) {
            setAiError('Số câu phải từ 1 đến 15.');
            return;
        }
        setAiError('');
        setAiLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.post(
                'http://127.0.0.1:8000/ai/quiz/generate',
                { topic, level: aiLevel, count: aiCount },
                { headers }
            );
            const questions = res.data;
            if (!Array.isArray(questions) || questions.length === 0) {
                setAiError('AI không trả về câu hỏi nào. Hãy thử lại.');
                return;
            }

            // Auto-save vào DB ngay sau khi sinh
            let savedId = null;
            try {
                const saved = await apiSaveAIQuiz(token, {
                    title: `${topic} (${aiLevel})`,
                    topic,
                    level: aiLevel,
                    questions,
                });
                savedId = saved?.id;
            } catch (saveErr) {
                console.error('Không lưu được vào DB, vẫn cho làm bài:', saveErr);
            }

            setShowAiModal(false);
            setAiTopic('');
            fetchSaved();
            navigate('/client/ai-quiz', {
                state: { id: savedId, questions, topic, level: aiLevel },
            });
        } catch (err) {
            const detail = err.response?.data?.error?.message || err.response?.data?.detail || 'Lỗi sinh bài test.';
            setAiError(typeof detail === 'string' ? detail : JSON.stringify(detail));
        } finally {
            setAiLoading(false);
        }
    };

    const handleRetake = (quiz) => {
        navigate('/client/ai-quiz', { state: { id: quiz.id } });
    };

    const handleDelete = async (quiz) => {
        if (!window.confirm(`Xoá bài test "${quiz.title}"?`)) return;
        try {
            await apiDeleteAIQuiz(token, quiz.id);
            setSavedQuizzes(qs => qs.filter(q => q.id !== quiz.id));
        } catch (err) {
            alert(err.message || 'Không xoá được bài test.');
        }
    };

    const tests = [
        { id: 'vocabulary', title: 'Bài test Từ Vựng', description: 'Đánh giá vốn từ vựng của bạn theo nhiều cấp độ khác nhau. Giúp bạn xác định những khoảng trống từ vựng.', icon: <BookOpen className="w-8 h-8 text-blue-500" />, bgColor: 'bg-blue-50', borderColor: 'border-blue-100', buttonColor: 'bg-blue-600 hover:bg-blue-700' },
        { id: 'grammar', title: 'Bài test Ngữ Pháp', description: 'Kiểm tra độ vững chắc của cấu trúc ngữ pháp. Những cấu trúc nào bạn hay nhầm lẫn?', icon: <Edit3 className="w-8 h-8 text-orange-500" />, bgColor: 'bg-orange-50', borderColor: 'border-orange-100', buttonColor: 'bg-orange-600 hover:bg-orange-700' },
        { id: 'listening', title: 'Bài test Kỹ năng Nghe', description: 'Luyện tập kỹ năng nghe qua các đoạn hội thoại thực tế. Đánh giá khả năng bắt âm.', icon: <Headphones className="w-8 h-8 text-purple-500" />, bgColor: 'bg-purple-50', borderColor: 'border-purple-100', buttonColor: 'bg-purple-600 hover:bg-purple-700' },
        { id: 'final', title: 'Bài Test Cuối Khóa', description: 'Bài kiểm tra tổng hợp kiến thức tương tự bài test đầu vào. Đánh giá sự tiến bộ của bạn!', icon: <Award className="w-8 h-8 text-teal-500" />, bgColor: 'bg-teal-50', borderColor: 'border-teal-100', buttonColor: 'bg-teal-600 hover:bg-teal-700' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-6 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full mix-blend-overlay filter blur-3xl opacity-50"></div>
                    <div className="relative z-10 w-full text-center md:text-left space-y-3">
                        <span className="bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-block">Trung tâm bài tập</span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Bài tập & Test</h1>
                        <p className="text-slate-500 font-medium max-w-xl">
                            Luyện tập thường xuyên là chìa khóa để thành thạo. Hãy chọn bài test bạn muốn thực hiện để đánh giá năng lực hiện tại của mình!
                        </p>
                    </div>
                    <div className="hidden md:block relative z-10">
                        <div className="w-32 h-32 bg-teal-50 rounded-full flex items-center justify-center">
                            <span className="text-6xl">🎯</span>
                        </div>
                    </div>
                </div>

                {/* AI generate banner */}
                <div className="rounded-[1.75rem] p-6 sm:p-8 border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                            <Sparkles className="w-7 h-7 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Sinh bài test bằng AI</h3>
                            <p className="text-sm text-slate-600 max-w-xl">
                                Nhập chủ đề bất kỳ + chọn cấp độ — AI tạo bài trắc nghiệm có giải thích tiếng Việt. Bài sẽ tự lưu vào kho cá nhân để bạn ôn lại.
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setShowAiModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl shadow flex items-center gap-2 transition-colors shrink-0">
                        <Sparkles className="w-4 h-4" /> Sinh bài test mới
                    </button>
                </div>

                {/* Saved AI quizzes */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-indigo-500" />
                            Bài test AI đã lưu
                        </h2>
                        {savedQuizzes.length > 0 && (
                            <span className="text-sm text-slate-500 font-medium">{savedQuizzes.length} bài</span>
                        )}
                    </div>

                    {loadingList ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        </div>
                    ) : savedQuizzes.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-sm">
                            Chưa có bài test AI nào. Bấm "Sinh bài test mới" để bắt đầu.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {savedQuizzes.map(q => (
                                <div key={q.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 truncate" title={q.title}>{q.title}</h3>
                                            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap">
                                                {q.level && (
                                                    <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                                                        {q.level}
                                                    </span>
                                                )}
                                                <span>{q.count} câu</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />{formatDate(q.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(q)}
                                            className="w-8 h-8 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors shrink-0"
                                            title="Xoá bài test"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleRetake(q)}
                                        className="mt-auto w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Làm lại
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Grid Tests */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tests.map(test => (
                        <div key={test.id} className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex gap-4 mb-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${test.bgColor} border ${test.borderColor}`}>
                                    {test.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">{test.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{test.description}</p>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-50">
                                <button onClick={() => navigate(`/client/section-test/${test.id}`)} className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${test.buttonColor}`}>
                                    Làm bài ngay <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI MODAL */}
            {showAiModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                            <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-500" /> Sinh bài test bằng AI
                            </h2>
                            <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-red-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-5">
                            {aiError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium text-center">
                                    {aiError}
                                </div>
                            )}

                            <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4">
                                <label className="flex items-center gap-2 text-sm font-bold text-indigo-900 mb-3">
                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                    Cấp độ CEFR — chọn trước khi sinh
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {LEVEL_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setAiLevel(opt.value)}
                                            className={
                                                'px-3 py-2 rounded-xl text-sm font-bold border-2 transition-colors ' +
                                                (aiLevel === opt.value
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300')
                                            }
                                            title={opt.label}
                                        >
                                            {opt.value}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-2">
                                    Đang chọn: <span className="font-bold text-indigo-700">{LEVEL_OPTIONS.find(o => o.value === aiLevel)?.label}</span>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Chủ đề</label>
                                <input
                                    type="text"
                                    value={aiTopic}
                                    onChange={e => setAiTopic(e.target.value)}
                                    placeholder="VD: Past Perfect, Business Vocabulary, Phrasal Verbs..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Để trống để AI tự chọn chủ đề ngữ pháp & từ vựng tổng quát.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Số câu (1–15)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={15}
                                    value={aiCount}
                                    onChange={e => {
                                        const n = parseInt(e.target.value, 10);
                                        setAiCount(Number.isNaN(n) ? 10 : Math.max(1, Math.min(15, n)));
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                                />
                            </div>

                            <button
                                onClick={handleGenerateAiQuiz}
                                disabled={aiLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl shadow flex items-center justify-center gap-2 transition-colors"
                            >
                                {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang sinh & lưu...</> : <><Sparkles className="w-4 h-4" /> Sinh bài test</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {aiLoading && (
                <div className="fixed inset-0 bg-slate-900/60 z-[60] flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-white font-bold text-xl">AI đang biên soạn bài test...</span>
                </div>
            )}
        </div>
    );
}
