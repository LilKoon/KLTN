import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { apiGetSectionTest, apiSubmitSectionTest } from '../../../api.js';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

export default function SectionTest() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { type } = useParams();

    // screen: 'start' | 'test' | 'result' | 'completed-summary'
    const [screen, setScreen] = useState('start');

    // Test data
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});

    // Filter state for Results
    const [filter, setFilter] = useState('ALL');

    // Loading/Submitting
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Results
    const [resultData, setResultData] = useState(null);

    // Timer
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    useEffect(() => {
        if (screen !== 'test' || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [screen, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Start Test
    const handleStartTest = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiGetSectionTest(token, type);
            setQuestions(data.questions);
            if (data.time_limit_minutes) {
                setTimeLeft(data.time_limit_minutes * 60);
            }
            setScreen('test');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Answer Selection
    const handleSelectAnswer = (qId, optionText) => {
        setAnswers(prev => ({ ...prev, [qId]: optionText }));
    };

    // Submit Test
    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError(null);

            // map answers state to array
            const answersArray = Object.entries(answers).map(([qId, ans]) => ({
                MaCauHoi: qId,
                CauTraLoi: ans
            }));

            const result = await apiSubmitSectionTest(token, type, answersArray);
            setResultData(result);
            setScreen('completed-summary');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const testTitles = {
        vocabulary: 'Bài test Từ Vựng',
        grammar: 'Bài test Ngữ Pháp',
        listening: 'Bài test Kỹ năng Nghe',
        final: 'Bài Test Cuối Khóa'
    };

    const title = testTitles[type] || 'Bài Test';

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Đang tải bài kiểm tra...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Lỗi</h3>
                    <p className="text-slate-500">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors">Thử lại</button>
                    <button onClick={() => navigate('/client/exercises-tests')} className="mt-4 ml-2 px-6 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors">Quay lại</button>
                </div>
            </div>
        );
    }

    // ─── START SCREEN ──────────────────────────────────────────────────
    if (screen === 'start') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 max-w-2xl w-full text-center">
                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl text-teal-600">📝</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">{title}</h1>
                    <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                        {type === 'final' 
                            ? 'Bài kiểm tra tổng hợp cuối khóa giúp đánh giá sự tiến bộ của bạn so với bài test đầu vào. Hãy chuẩn bị kỹ lưỡng nhé!' 
                            : 'Luyện tập kỹ năng này sẽ giúp bạn nhận ra những phần kiến thức cần trau dồi thêm. Thời gian làm bài là 15 phút.'}
                    </p>

                    <button
                        onClick={handleStartTest}
                        className="w-full md:w-auto px-10 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/30 transition-all text-lg"
                    >
                        Bắt đầu làm bài
                    </button>
                </div>
            </div>
        );
    }

    // ─── TEST SCREEN ───────────────────────────────────────────────────
    if (screen === 'test' && questions.length > 0) {
        const currentQ = questions[currentQuestion];
        const progress = ((currentQuestion + 1) / questions.length) * 100;
        const selectedAns = answers[currentQ.MaCauHoi];

        return (
            <div className="min-h-screen bg-slate-50 p-6 lg:p-12">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-slate-500">Câu hỏi {currentQuestion + 1} / {questions.length}</span>
                            <div className={`px-4 py-1.5 rounded-lg border font-bold text-lg ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
                                ⏱ {formatTime(timeLeft)}
                            </div>
                            <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full">{currentQ.KyNang}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                        {/* Question Navigator */}
                        <div className="flex flex-wrap gap-2">
                            {questions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentQuestion(i)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentQuestion === i
                                        ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-200'
                                        : answers[q.MaCauHoi]
                                            ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
                        {currentQ.KyNang === 'LISTENING' ? (
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Hãy nghe đoạn audio sau và chọn đáp án chính xác nhất.</h2>
                        ) : (
                            <h2 className="text-xl font-bold text-slate-800 mb-6">{currentQ.NoiDung}</h2>
                        )}

                        {currentQ.KyNang === 'LISTENING' && currentQ.FileAudio && (
                            <div className="mb-6 bg-slate-50 p-4 rounded-xl">
                                <audio controls src={`http://127.0.0.1:8000/static/audios/${currentQ.FileAudio}`} className="w-full" />
                            </div>
                        )}

                        <div className="space-y-4 flex-1">
                            {currentQ.DSDapAn.map((ans, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectAnswer(currentQ.MaCauHoi, ans)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAns === ans ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300'}`}
                                >
                                    <span className={`font-medium ${selectedAns === ans ? 'text-teal-900' : 'text-slate-700'}`}>{ans}</span>
                                </div>
                            ))}
                        </div>

                        {/* Navigation Footer */}
                        <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
                            <button
                                disabled={currentQuestion === 0}
                                onClick={() => setCurrentQuestion(current => current - 1)}
                                className="px-6 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl disabled:opacity-50"
                            >
                                Quay lại
                            </button>

                            {currentQuestion === questions.length - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-8 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                                >
                                    {submitting ? 'Đang nộp...' : 'Nộp bài'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentQuestion(current => current + 1)}
                                    className="px-8 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-md"
                                >
                                    Tiếp theo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── COMPLETED SUMMARY SCREEN ─────────────────────────────────────
    if (screen === 'completed-summary' && resultData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-2xl w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-blue-500"></div>
                    
                    <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🏆</span>
                    </div>
                    
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Bạn đã hoàn thành bài test!</h1>
                    <p className="text-slate-500 mb-8">Kết quả của bạn đã được ghi nhận. Dưới đây là phân tích chi tiết.</p>
                    
                    <div className="bg-slate-50 rounded-3xl p-8 mb-8 border border-slate-100">
                        <div className="text-5xl font-black text-teal-600 mb-2">{resultData.total_score}%</div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Tổng điểm đạt được</div>
                        
                        {resultData.progress && resultData.progress.overall !== undefined && (
                            <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm mb-6 ${resultData.progress.overall >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {resultData.progress.overall >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {resultData.progress.overall >= 0 ? 'Tăng' : 'Giảm'} {Math.abs(resultData.progress.overall)}% so với Test đầu vào
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {Object.entries(resultData.stats).map(([k, v]) => {
                                if (v.total === 0) return null; // Only show sections that have questions
                                const progress = resultData.progress ? resultData.progress[k] : 0;
                                return (
                                    <div key={k} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                                        <div className="text-xs font-bold text-slate-400 mb-1 uppercase">{k}</div>
                                        <div className="text-xl font-bold text-slate-800">{resultData.percentages[k]}%</div>
                                        {progress !== undefined && (
                                            <div className={`mt-2 text-[10px] font-bold ${progress >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {progress >= 0 ? '▲' : '▼'} {Math.abs(progress)}%
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => setScreen('result')}
                            className="flex-1 px-8 py-4 bg-white hover:bg-slate-50 text-teal-600 font-bold rounded-2xl shadow-sm border-2 border-teal-600 transition-all"
                        >
                            Chi tiết làm bài
                        </button>
                        <button
                            onClick={() => navigate('/client/exercises-tests')}
                            className="flex-1 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/30 transition-all"
                        >
                            Về TT Bài Tập
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── RESULT SCREEN ─────────────────────────────────────────────────
    if (screen === 'result' && resultData) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 lg:p-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Overview */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-blue-500"></div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2 mt-4">Kết quả chi tiết</h2>
                        <div className="text-5xl font-extrabold text-teal-600 my-6">{resultData.total_score}%</div>
                        <div className="text-lg font-semibold text-slate-500 mb-2">
                            Đúng: <span className="text-teal-600 font-bold">{resultData.total_correct}</span> / {resultData.total_questions} câu
                        </div>

                        {resultData.progress && resultData.progress.overall !== undefined && (
                            <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm mb-6 ${resultData.progress.overall >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {resultData.progress.overall >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {resultData.progress.overall >= 0 ? 'Tăng' : 'Giảm'} {Math.abs(resultData.progress.overall)}% so với Test đầu vào
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            {Object.entries(resultData.stats).map(([k, v]) => {
                                if (v.total === 0) return null;
                                const progress = resultData.progress ? resultData.progress[k] : 0;
                                return (
                                    <div key={k} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                                        <h4 className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">{k}</h4>
                                        <div className="text-2xl font-bold text-slate-800 mb-1">{resultData.percentages[k]}%</div>
                                        <div className="text-xs font-semibold text-slate-400">
                                            Đúng: <span className="text-slate-600">{v.correct}/{v.total}</span>
                                        </div>
                                        {progress !== undefined && (
                                            <div className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded ${progress >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {progress >= 0 ? '▲' : '▼'} {Math.abs(progress)}%
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Detail Questions */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Chi tiết từng câu</h3>

                        {/* Filter Bar */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {[
                                { id: 'ALL', label: 'Tất cả' },
                                { id: 'LISTENING', label: 'Nghe' },
                                { id: 'VOCABULARY', label: 'Từ vựng' },
                                { id: 'GRAMMAR', label: 'Ngữ pháp' },
                                { id: 'CORRECT', label: 'Đúng' },
                                { id: 'INCORRECT', label: 'Sai' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === f.id
                                        ? 'bg-teal-600 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            {resultData.details.map((item, idx) => ({ ...item, originalIdx: idx })).filter(item => {
                                if (filter === 'ALL') return true;
                                if (filter === 'CORRECT') return item.IsCorrect;
                                if (filter === 'INCORRECT') return !item.IsCorrect;
                                return item.KyNang.toUpperCase() === filter;
                            }).map((item) => (
                                <div key={item.MaCauHoi} className={`p-6 rounded-2xl border ${item.IsCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                                    <div className="flex gap-2 mb-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded text-white ${item.IsCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {item.IsCorrect ? 'ĐÚNG' : 'SAI'}
                                        </span>
                                        <span className="text-xs font-bold px-2 py-1 rounded bg-slate-200 text-slate-700">Câu {item.originalIdx + 1} - {item.KyNang}</span>
                                    </div>
                                    <p className="font-semibold text-slate-800 mb-4">{item.NoiDung}</p>

                                    <div className="space-y-2 mb-4">
                                        <div className="text-xs font-bold text-slate-400 mb-2">DANH SÁCH ĐÁP ÁN:</div>
                                        {item.DSDapAn && item.DSDapAn.map((opt, o_idx) => {
                                            const isSelected = item.UserAnswer?.toLowerCase() === opt.toLowerCase();
                                            const isCorrect = item.CorrectAnswer?.toLowerCase() === opt.toLowerCase();

                                            // Default style
                                            let style = "p-3 rounded-lg border border-slate-200 bg-white text-slate-600";
                                            if (isSelected && isCorrect) {
                                                style = "p-3 rounded-lg border-2 border-green-500 bg-green-50 text-green-700 font-bold";
                                            } else if (isSelected && !isCorrect) {
                                                style = "p-3 rounded-lg border-2 border-red-500 bg-red-50 text-red-700 font-bold";
                                            } else if (isCorrect && !isSelected) {
                                                style = "p-3 rounded-lg border-2 border-green-500 bg-green-50/50 text-green-700 font-bold";
                                            }

                                            return (
                                                <div key={o_idx} className={`flex items-center text-sm ${style}`}>
                                                    <span className="flex-1">{opt}</span>
                                                    {isSelected && isCorrect && <span className="text-green-600 font-bold ml-2">✓ Bạn chọn đúng</span>}
                                                    {isSelected && !isCorrect && <span className="text-red-600 font-bold ml-2">✗ Bạn chọn sai</span>}
                                                    {!isSelected && isCorrect && <span className="text-green-600 font-bold ml-2">← Đáp án đúng</span>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {!item.IsCorrect && item.GiaiThich && (
                                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-sm">
                                            <span className="font-bold text-yellow-800 block mb-1">Giải thích:</span>
                                            <span className="text-yellow-700">{item.GiaiThich}</span>
                                        </div>
                                    )}

                                    {item.KyNang === 'LISTENING' && item.Transcript && (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm">
                                            <span className="font-bold text-blue-800 block mb-1">Transcript (Bài Nghe):</span>
                                            <span className="text-blue-700 block mb-3">{item.Transcript}</span>
                                            {item.FileAudio && (
                                                <audio controls src={`http://127.0.0.1:8000/static/audios/${item.FileAudio}`} className="w-full h-10" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center pt-4 flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => navigate('/client/exercises-tests')}
                            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl shadow-sm border border-slate-200 transition-colors"
                        >
                            Về TT Bài Tập
                        </button>
                        <button
                            onClick={() => navigate('/client/learning-path')}
                            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-colors"
                        >
                            Tiếp tục lộ trình
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
