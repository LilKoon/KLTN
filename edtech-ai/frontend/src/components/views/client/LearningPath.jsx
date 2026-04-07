import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function LearningPath() {
    const { token } = useAuth();
    const navigate = useNavigate();
    
    const [pathData, setPathData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isResetting, setIsResetting] = useState(false);

    const fetchPath = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/path/current', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 404) {
                setPathData(null);
                return;
            }
            if (!res.ok) throw new Error('Không thể tải lộ trình');
            const data = await res.json();
            setPathData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPath();
    }, [token]);

    const handleReset = async () => {
        if (!window.confirm("CẢNH BÁO: Hành động này sẽ xóa sổ toàn bộ tiến độ học tập hiện tại. Bạn sẽ phải làm lại bài Test định vị từ đầu. Bạn có chắc chắn?")) {
            return;
        }
        setIsResetting(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/path/reset', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                navigate('/client/placement-test');
            } else {
                alert('Lỗi khi hủy lộ trình');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsResetting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-rose-500 font-bold">Lỗi: {error}</div>;
    }

    // EMPTY STATE: User hasn't taken the placement test yet
    if (!pathData) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">Lộ trình AI bị khóa</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                    Hệ thống chưa thu thập đủ dữ liệu năng lực của bạn. Hãy hoàn thành bài kiểm tra đầu vào ngắn để AI tự động đúc ra lộ trình học cá nhân hóa cho riêng bạn.
                </p>
                <button 
                    onClick={() => navigate('/client/placement-test')}
                    className="px-8 py-4 bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-600 hover:to-sky-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                    Đến làm bài Đánh giá năng lực ngay
                </button>
            </div>
        );
    }

    const { cac_node } = pathData;
    
    // Tính toán tỷ lệ hoàn thành
    const completedNodes = cac_node.filter(n => n.TrangThai === 'COMPLETED').length;
    const progressPercent = Math.round((completedNodes / cac_node.length) * 100);

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-8 lg:py-12">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>
            
            {/* Header / Hero Section */}
            <div className="bg-gradient-to-r from-teal-500 to-sky-600 rounded-[2rem] p-8 sm:p-12 text-white shadow-lg animate-slide-in relative overflow-hidden" style={{ opacity: 0 }}>
                {/* Reset Button */}
                <div className="absolute top-6 right-6">
                    <button 
                        onClick={handleReset}
                        disabled={isResetting}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        {isResetting ? "Đang hủy..." : "Hủy & Thi lại"}
                    </button>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 select-none">Lộ trình Hybrid AI</h1>
                        <p className="text-teal-50 font-medium max-w-xl text-sm leading-relaxed">
                            Hệ thống đã phân tích năng lực của bạn và cấu trúc lại Cây Lộ Trình. 
                            Các bài dễ đã được <strong>BỎ QUA (Skip)</strong>.
                        </p>
                    </div>
                </div>

                <div className="mt-10 flex items-center gap-4">
                    <div className="flex-1 h-3 bg-black/20 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-white rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <span className="text-sm font-bold opacity-90">{progressPercent}% Hoàn thành</span>
                </div>
            </div>

            {/* Path Nodes Container */}
            <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-sm border border-slate-200 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                <div className="relative border-l-[3px] border-slate-100 ml-5 md:ml-8 space-y-12">
                    
                    {cac_node.map((node, index) => {
                        const isCompleted = node.TrangThai === 'COMPLETED';
                        const isCurrent = node.TrangThai === 'CURRENT';
                        const isLocked = node.TrangThai === 'LOCKED';

                        const isSkipped = node.LoaiNode === 'SKIPPED';
                        const isBoosted = node.LoaiNode === 'BOOSTED';
                        const isCheckpoint = node.LoaiNode === 'TEST_80';
                        const isCore = node.LoaiNode === 'CORE';
                        
                        // Xử lý Giao diện Tag Card (như bản Fake API cũ)
                        let badge = 'Khung Chuẩn';
                        let badgeColor = 'bg-indigo-100 text-indigo-700 font-extrabold';
                        let icon = 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253';
                        
                        let bgColor = 'bg-slate-100';
                        let textColor = 'text-slate-400';
                        let borderColor = 'border-slate-200';
                        let cardStyle = 'bg-white border-slate-200 opacity-60 grayscale select-none'; // default for locked

                        if (isSkipped) {
                            badge = 'AI Bỏ Qua (SKIP)';
                            badgeColor = 'bg-slate-200 text-slate-500 border border-slate-300';
                            icon = 'M13 10V3L4 14h7v7l9-11h-7z';
                        } else if (isBoosted) {
                            badge = 'AI Tăng Cường (BOOST)';
                            badgeColor = 'bg-amber-100 text-amber-700 font-extrabold border border-amber-300';
                            icon = 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z';
                        } else if (isCheckpoint) {
                            badge = 'Điều kiện: Yêu cầu 80% Pass';
                            badgeColor = 'bg-rose-100 text-rose-700 font-bold border border-rose-200';
                            icon = 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z';
                        }

                        // Style State
                        if (isCompleted) {
                            bgColor = 'bg-emerald-500'; textColor = 'text-white'; borderColor = 'border-emerald-500';
                            cardStyle = 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer';
                            if (isSkipped) {
                                bgColor = 'bg-slate-200'; textColor = 'text-slate-500'; borderColor = 'border-slate-300 border-dashed';
                                cardStyle = 'bg-slate-50 border-slate-200 border-dashed opacity-75';
                            }
                        } else if (isCurrent) {
                            bgColor = 'bg-sky-500'; textColor = 'text-white'; borderColor = 'border-sky-500 shadow-lg shadow-sky-500/30 animate-pulse';
                            cardStyle = 'bg-sky-50/50 border-sky-200 shadow-md ring-2 ring-sky-100 scale-[1.02] transform transition-all cursor-pointer';
                        }

                        // Progress line logic
                        const showGreenLine = isCompleted;

                        return (
                            <div key={node.MaNode} className="relative group pl-10 sm:pl-14">
                                {showGreenLine && index !== cac_node.length - 1 && (
                                    <div className="absolute top-12 -left-[3px] w-[3px] h-[calc(100%+3rem)] bg-emerald-400 z-0 opacity-80"></div>
                                )}

                                <div className={`absolute -left-[27px] sm:-left-[28px] top-4 w-14 h-14 flex items-center justify-center rounded-full border-[4px] border-white ${bgColor} ${borderColor} ${textColor} z-10 transition-transform ${isCurrent ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                                    </svg>
                                </div>

                                <div className={`p-6 sm:p-7 rounded-2xl border ${cardStyle}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-lg ${badgeColor}`}>
                                                    {badge}
                                                </span>
                                                {isCompleted && !isSkipped && (
                                                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Đã Học
                                                    </span>
                                                )}
                                                {isSkipped && (
                                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Đã Vượt
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className={`text-xl font-bold ${isCurrent ? 'text-sky-900' : 'text-slate-800'}`}>
                                                {node.TieuDe}
                                            </h3>
                                        </div>
                                        
                                        {isLocked && <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg whitespace-nowrap">Chưa Mở Khóa</span>}
                                    </div>
                                    
                                    <p className={`text-sm ${isSkipped ? 'text-slate-400 italic' : 'text-slate-500'} leading-relaxed`}>
                                        {node.MoTa || 'Hệ thống AI không có mô tả cho bài học này.'}
                                    </p>
                                    
                                    {isCurrent && !isCheckpoint && (
                                        <div className="mt-5 pt-5 border-t border-sky-100">
                                            <button 
                                                onClick={() => navigate(`/client/lesson/${node.MaNode}`)}
                                                className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-sky-600/30 hover:shadow-sky-700/40 hover:-translate-y-0.5 w-full sm:w-auto"
                                            >
                                                Vào Bài Học
                                            </button>
                                        </div>
                                    )}

                                    {isCurrent && isCheckpoint && (
                                        <div className="mt-5 pt-5 border-t border-rose-200 border-dashed">
                                            <button 
                                                onClick={() => navigate(`/client/pass-fail/${node.MaNode}`)}
                                                className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-rose-600/30 hover:shadow-rose-700/40 hover:-translate-y-0.5 w-full sm:w-auto"
                                            >
                                                Thi Checkpoint
                                            </button>
                                        </div>
                                    )}

                                    {isCompleted && !isSkipped && (
                                        <div className="mt-5 pt-5 border-t border-emerald-100">
                                            <button 
                                                onClick={() => navigate(`/client/lesson/${node.MaNode}`)}
                                                className="px-8 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 justify-center sm:justify-start w-full sm:w-auto"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                Ôn Tập Lại
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
}
