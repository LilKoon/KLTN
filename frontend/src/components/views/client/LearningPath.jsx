import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { CheckCircle2, Circle, Lock, PlayCircle, Sparkles, Trophy, ChevronRight, BookOpen, Target } from 'lucide-react';

const LearningPath = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    
    const [pathData, setPathData] = useState(null);
    const [hasPlacement, setHasPlacement] = useState(null); // null = chưa rõ, true/false sau khi check
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const fetchPath = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const res = await fetch('http://127.0.0.1:8000/path/current', { headers });
            if (res.ok) {
                const data = await res.json();
                setPathData(data);
                return;
            }
            // Không có path → check user đã làm placement test chưa
            setPathData(null);
            try {
                const sRes = await fetch('http://127.0.0.1:8000/exam/placement-test/status', { headers });
                if (sRes.ok) {
                    const sData = await sRes.json();
                    setHasPlacement(!!sData.has_completed);
                } else {
                    setHasPlacement(false);
                }
            } catch {
                setHasPlacement(false);
            }
        } catch (err) {
            console.error('Network error fetching path:', err);
            setPathData(null);
            setHasPlacement(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPath();
    }, [token]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await fetch('http://127.0.0.1:8000/path/generate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchPath();
        } catch (err) {
            alert("Không thể tạo lộ trình. Vui lòng thử lại.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                    <span className="text-slate-500 font-medium">Đang tối ưu lộ trình...</span>
                </div>
            </div>
        );
    }

    if (!pathData) {
        // Chưa làm test đầu vào → CTA dẫn sang placement test
        if (hasPlacement === false) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6">
                    <div className="max-w-md w-full bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 text-center">
                        <div className="w-20 h-20 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-100">
                            <Target className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-3">Cần làm bài test đầu vào</h1>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Hệ thống cần điểm Ngữ pháp, Từ vựng và Nghe để xây lộ trình cá nhân hoá. Hãy hoàn thành bài test đầu vào trước nhé!
                        </p>
                        <button
                            onClick={() => navigate('/client/placement-test')}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Làm bài test đầu vào <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            );
        }

        // Đã làm test nhưng không có path (engine fail / dữ liệu cũ) → fallback nút generate
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 text-center">
                    <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Lộ trình của bạn đã sẵn sàng</h1>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Hệ thống sẽ tổng hợp các bài học dựa trên kỹ năng bạn cần cải thiện nhất từ bài kiểm tra đầu vào.
                    </p>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {generating ? "Đang xử lý..." : "Bắt đầu lộ trình ngay"}
                    </button>
                </div>
            </div>
        );
    }

    const nodes = pathData.cac_node || [];
    const completedNodes = nodes.filter(n => n.TrangThai === 'COMPLETED');
    const currentNode = nodes.find(n => n.TrangThai === 'CURRENT') || nodes[nodes.length-1];
    const progress = Math.round((completedNodes.length / nodes.length) * 100);

    return (
        <div className="flex-1 flex h-[calc(100vh-80px)] bg-slate-50 overflow-hidden">
            {/* Main Content: Timeline */}
            <div className="flex-1 overflow-y-auto px-6 py-12 scroll-smooth no-scrollbar">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-12">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Hành trình học tập</h1>
                        <p className="text-slate-500">Mỗi bước đi là một sự tiến bộ mới.</p>
                    </div>

                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-200"></div>

                        {/* Nodes */}
                        <div className="space-y-10">
                            {nodes.map((node, i) => {
                                const isCompleted = node.TrangThai === 'COMPLETED';
                                const isCurrent = node.TrangThai === 'CURRENT';
                                const isLocked = node.TrangThai === 'LOCKED';

                                return (
                                    <div 
                                        key={node.MaNode} 
                                        className={`relative pl-16 group transition-all duration-300 ${isLocked ? 'opacity-60' : 'opacity-100'}`}
                                    >
                                        {/* Icon Node */}
                                        <div className={`absolute left-0 w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-all duration-500 ${
                                            isCompleted ? 'bg-emerald-500 text-white scale-110' : 
                                            isCurrent ? 'bg-slate-900 text-white ring-4 ring-slate-100 scale-125 shadow-lg shadow-slate-200' : 
                                            'bg-slate-100 text-slate-400'
                                        }`}>
                                            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : 
                                             isCurrent ? <PlayCircle className="w-7 h-7" /> : 
                                             <Lock className="w-5 h-5" />}
                                        </div>

                                        {/* Content Card */}
                                        <div 
                                            onClick={() => !isLocked && navigate(`/client/lesson/${node.MaNode}`)}
                                            className={`p-6 rounded-2xl border transition-all duration-300 ${
                                                isCurrent ? 'bg-white border-slate-900 shadow-xl shadow-slate-100 -translate-y-1 cursor-pointer' : 
                                                isCompleted ? 'bg-white border-slate-100 hover:border-emerald-200 cursor-pointer' : 
                                                'bg-slate-50 border-transparent cursor-not-allowed'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                                    node.LoaiNode === 'BOOSTED' ? 'bg-rose-50 text-rose-600' : 
                                                    node.LoaiNode === 'TEST_80' ? 'bg-amber-50 text-amber-600' : 
                                                    'bg-slate-50 text-slate-500'
                                                }`}>
                                                    {node.LoaiNode === 'BOOSTED' ? 'Củng cố AI' : node.LoaiNode === 'TEST_80' ? 'Kiểm tra' : 'Bài học'}
                                                </span>
                                                {isCompleted && <span className="text-[11px] font-bold text-emerald-600">ĐÃ XONG</span>}
                                            </div>
                                            <h3 className={`text-lg font-bold mb-1 ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                                                {node.TieuDe}
                                            </h3>
                                            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                                {node.MoTa || "Bắt đầu bài học này để tiến gần hơn đến mục tiêu của bạn."}
                                            </p>
                                            
                                            {isCurrent && (
                                                <div className="mt-4 flex items-center gap-2 text-slate-900 font-bold text-sm">
                                                    Học ngay <ChevronRight className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Stats: Simple & Optimized */}
            <div className="w-[380px] bg-white border-l border-slate-100 p-10 flex flex-col gap-10">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Tiến trình của bạn</h2>
                    <div className="relative w-32 h-32 mx-auto mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                strokeDasharray={364.4}
                                strokeDashoffset={364.4 - (364.4 * progress) / 100}
                                className="text-slate-900 transition-all duration-1000 ease-out" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-slate-900">{progress}%</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Hoàn tất</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Target className="w-5 h-5 text-slate-900" />
                            </div>
                            <span className="font-bold text-slate-800 text-sm">Mục tiêu hiện tại</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            {currentNode?.TieuDe || "Hoàn thành toàn bộ lộ trình"}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Trophy className="w-5 h-5 text-amber-500" />
                            </div>
                            <span className="font-bold text-slate-800 text-sm">Điểm tích lũy</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900">1,240 <span className="text-xs font-bold text-slate-400 uppercase">XP</span></p>
                    </div>
                </div>

                <div className="mt-auto">
                    <button 
                        onClick={() => currentNode && navigate(`/client/lesson/${currentNode.MaNode}`)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                    >
                        Tiếp tục học ngay
                    </button>
                    <p className="text-center text-[11px] text-slate-400 mt-4 font-medium italic">
                        Lộ trình được cá nhân hóa bởi AI dựa trên kết quả test.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LearningPath;
