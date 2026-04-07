import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function LessonView() {
    const { maNode } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    
    const [data, setData] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [exercisePassed, setExercisePassed] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                // Fetch Content
                const res = await fetch(`http://127.0.0.1:8000/path/node/${maNode}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Không thể tải nội dung bài học');
                const result = await res.json();
                setData(result);
                
                // Fetch Exercises
                const exRes = await fetch(`http://127.0.0.1:8000/path/node/${maNode}/exercises`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (exRes.ok) {
                    const exData = await exRes.json();
                    setExercises(exData);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [maNode, token]);

    const handleComplete = async () => {
        setSaving(true);
        try {
            const res = await fetch(`http://127.0.0.1:8000/path/node/${maNode}/complete`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Lỗi khi lưu tiến độ');
            
            // Redirect back to path
            navigate('/client/learning-path');
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSelectOption = (questionId, option) => {
        setAnswers({
            ...answers,
            [questionId]: option
        });
    };

    const handleCheckAnswers = () => {
        let correct = 0;
        exercises.forEach(ex => {
            if (answers[ex.MaCauHoi] === ex.DapAnDung) {
                correct++;
            }
        });
        const currentScore = correct;
        setScore(currentScore);
        
        // Cần 4/5 câu đúng (80%) để pass
        const threshold = Math.ceil(exercises.length * 0.8);
        if (currentScore >= threshold) {
            setExercisePassed(true);
        } else {
            setExercisePassed(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !data) {
        return <div className="p-8 text-center text-rose-500 font-bold">Lỗi: {error || 'Không tìm thấy dữ liệu'}</div>;
    }

    const { node, bai_hoc } = data;

    return (
        <div className="min-h-[80vh] font-inter p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/client/learning-path')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Trở lại Lộ Trình
                </button>
                <div className="px-4 py-1.5 bg-sky-100 text-sky-700 font-bold rounded-lg text-sm border border-sky-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                    Đang Học
                </div>
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                {/* Hero / Title Area */}
                <div className="bg-slate-900 px-8 py-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded border border-white/20">
                                {node.LoaiNode === 'CORE' ? 'Bài học Cốt Lõi' : 'AI Bổ Trợ'}
                            </span>
                            <span className="text-slate-400 font-medium text-sm">Trạm thứ {node.ThuTu}</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                            {node.TieuDe}
                        </h1>
                        <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
                            {node.MoTa || 'Học thuyết chuyên sâu tích hợp hệ thống đo lường Hybrid.'}
                        </p>
                    </div>
                </div>

                {/* Lesson Body */}
                <div className="p-8 sm:p-12 space-y-10">
                    
                    {/* Video Mockup */}
                    <div className="w-full aspect-video bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 relative overflow-hidden group hover:border-teal-300 transition-colors cursor-pointer">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-teal-50 text-teal-600 transition-all">
                            <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                        <p className="mt-4 font-semibold text-sm">PLAY VIDEO BÀI GIẢNG</p>
                    </div>

                    {/* Theory Text */}
                    <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-p:leading-relaxed">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">1. Định nghĩa và cách dùng</h2>
                        <p className="mb-6">
                            Bài học này sẽ cung cấp cho bạn cấu trúc nền tảng và cách ứng dụng thực chiến vào kỳ thi. 
                            Hãy chắc chắn bạn đã ghi chép lại các Keywords quan trọng. Dưới đây là nội dung hệ thống xuất ra cho bạn:
                        </p>
                        
                        <div className="bg-sky-50 p-6 rounded-2xl border border-sky-100 mb-6">
                            <h3 className="font-bold text-sky-800 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Tip cực hay
                            </h3>
                            <p className="text-sky-700 text-sm m-0">
                                Nếu gặp dạng câu đối lập nghĩa, hãy tìm các từ nối như "However", "Although", "But".
                            </p>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">2. Ví dụ minh họa thực tế</h2>
                        <ul className="list-disc pl-5 space-y-3 mb-6 text-slate-600">
                            <li><strong className="text-slate-800">I have played</strong> soccer since I was a child.</li>
                            <li>She <strong className="text-slate-800">has already finished</strong> her homework.</li>
                        </ul>
                        
                        {/* Dump JSON for debugging real data if available */}
                        {bai_hoc && bai_hoc.NoiDungLyThuyet && (
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8">
                                <h3 className="font-bold text-slate-700 mb-3">Nội dung JSON trích xuất từ CSDL:</h3>
                                <pre className="text-xs text-slate-500 whitespace-pre-wrap">{JSON.stringify(bai_hoc.NoiDungLyThuyet, null, 2)}</pre>
                            </div>
                        )}
                    </div>

                    {/* Adaptive Practice Area */}
                    {exercises.length > 0 && node.TrangThai !== 'COMPLETED' && (
                        <div className="mt-16 pt-12 border-t-2 border-dashed border-slate-200">
                            <div className="mb-8">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                                    <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    Bài Tập Củng Cố
                                </h2>
                                <p className="text-slate-500 mt-2 font-medium">Bắt buộc đạt tối thiểu 80% (4/5 câu) để mở khóa trạm kế tiếp.</p>
                            </div>

                            <div className="space-y-8">
                                {exercises.map((ex, idx) => (
                                    <div key={ex.MaCauHoi} className="bg-white border-2 border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                                        <h3 className="font-bold text-slate-800 text-lg mb-5">
                                            <span className="text-rose-500 mr-2">Câu {idx + 1}:</span>
                                            {ex.NoiDung}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {ex.DapAn.map((opt, i) => {
                                                const isSelected = answers[ex.MaCauHoi] === opt;
                                                const showCorrectness = score !== null;
                                                const isCorrectAns = opt === ex.DapAnDung;
                                                
                                                let btnClass = isSelected 
                                                    ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-md' 
                                                    : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50/50';
                                                    
                                                // Đổ màu đúng sai sau khi chấm
                                                if (showCorrectness) {
                                                    if (isCorrectAns) {
                                                        btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                                                    } else if (isSelected && !isCorrectAns) {
                                                        btnClass = 'border-red-400 bg-red-50 text-red-700 opacity-60 line-through';
                                                    } else {
                                                        btnClass = 'border-slate-200 text-slate-400 opacity-50';
                                                    }
                                                }

                                                return (
                                                    <button
                                                        key={i}
                                                        disabled={showCorrectness}
                                                        onClick={() => handleSelectOption(ex.MaCauHoi, opt)}
                                                        className={`p-4 rounded-xl border-2 text-left transition-all font-medium ${btnClass}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Score Display & Check Button */}
                            <div className="mt-10 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div>
                                    {score === null ? (
                                        <p className="text-slate-600 font-medium">Bạn chưa chấm điểm.</p>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <div className={`p-4 rounded-full flex items-center justify-center text-xl font-black ${exercisePassed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                {score}/{exercises.length}
                                            </div>
                                            <div>
                                                <p className={`font-bold ${exercisePassed ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {exercisePassed ? '🎉 Tuyệt vời! Bạn đã vượt qua.' : '⚠️ Cố lên! Đọc kỹ lại và thử phân tích lần nữa nhé.'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={handleCheckAnswers}
                                    disabled={Object.keys(answers).length < exercises.length || exercisePassed}
                                    className={`px-8 py-4 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${
                                        exercisePassed 
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-none'
                                        : (Object.keys(answers).length < exercises.length
                                            ? 'bg-rose-200 text-rose-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:shadow-rose-500/30 hover:-translate-y-0.5'
                                          )
                                    }`}
                                >
                                    {score !== null && !exercisePassed ? 'Làm lại & Chấm điểm' : 'Chấm Điểm'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="bg-slate-50 p-8 sm:p-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-slate-500 text-sm font-medium text-center sm:text-left max-w-sm leading-relaxed">
                        Hãy đảm bảo bạn đã nắm vững kiến thức trước khi chốt hạ thẻ này. Hành động không thể hoàn tác.
                    </p>
                    {node.TrangThai === 'COMPLETED' ? (
                        <button disabled className="px-10 py-4 bg-emerald-100 text-emerald-700 font-bold rounded-2xl shadow-sm border border-emerald-200 flex items-center gap-2 cursor-not-allowed w-full sm:w-auto justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Bạn đã hoàn thành
                        </button>
                    ) : (
                        <button 
                            onClick={handleComplete}
                            disabled={saving || (exercises.length > 0 && !exercisePassed)}
                            className={`px-10 py-4 rounded-2xl shadow-xl transition-all font-bold text-lg text-center flex items-center justify-center gap-2 w-full sm:w-auto ${
                                (exercises.length > 0 && !exercisePassed)
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 hover:-translate-y-1'
                            }`}
                        >
                            {saving ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    Đánh Dấu Hoàn Thành
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
