import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { apiGetMyRoadmap, apiCompleteNode } from '../../../api';

// --- MOCK DOCUMENT COMPONENT ---
const MockDocumentModal = ({ node, onClose, onComplete }) => {
    if (!node) return null;

    const isCurrent = node.trang_thai === 'UNLOCKED';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-in">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-lg mb-2">
                            {node.loai_bai_hoc}
                        </span>
                        <h2 className="text-2xl font-extrabold text-slate-800">{node.ten_bai_hoc}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content Body (Mock Data) */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {node.loai_bai_hoc === 'GRAMMAR' && (
                            <>
                                <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100">
                                    <h3 className="text-lg font-bold text-sky-900 mb-2">💡 Mục tiêu bài học</h3>
                                    <p className="text-sky-800">Hiểu và sử dụng thành thạo cấu trúc ngữ pháp cơ bản trong giao tiếp hằng ngày và môi trường học thuật.</p>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">1. Cấu trúc cơ bản (Basic Structure)</h3>
                                    <p className="text-slate-600 mb-4 leading-relaxed">
                                        Trong tiếng Anh, một câu hoàn chỉnh thường bao gồm Chủ ngữ (Subject) và Động từ (Verb). 
                                        Đây là nền tảng quan trọng nhất để xây dựng các câu phức tạp hơn.
                                    </p>
                                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 font-mono text-sm text-slate-700">
                                        <p className="mb-2"><span className="text-sky-600 font-bold">S + V + (O)</span></p>
                                        <ul className="list-disc pl-5 space-y-2 mt-3">
                                            <li><strong className="text-slate-800">S (Subject):</strong> I, You, He, She, It, We, They</li>
                                            <li><strong className="text-slate-800">V (Verb):</strong> Động từ chỉ hành động hoặc trạng thái</li>
                                            <li><strong className="text-slate-800">O (Object):</strong> Tân ngữ (có thể có hoặc không)</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">2. Ví dụ minh họa (Examples)</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <span className="text-emerald-500 mt-1">✓</span>
                                            <div>
                                                <p className="font-bold text-emerald-900">She learns English every day.</p>
                                                <p className="text-emerald-700 text-sm mt-1">Cô ấy học tiếng Anh mỗi ngày. (S: She, V: learns, O: English)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <span className="text-emerald-500 mt-1">✓</span>
                                            <div>
                                                <p className="font-bold text-emerald-900">They are playing football.</p>
                                                <p className="text-emerald-700 text-sm mt-1">Họ đang chơi bóng đá.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {node.loai_bai_hoc === 'VOCABULARIES' && (
                            <>
                                <div className="bg-violet-50 rounded-2xl p-6 border border-violet-100">
                                    <h3 className="text-lg font-bold text-violet-900 mb-2">🎯 Mục tiêu từ vựng</h3>
                                    <p className="text-violet-800">Nắm vững 5 từ vựng cốt lõi của chủ đề hôm nay, bao gồm cách phát âm, nghĩa và ngữ cảnh sử dụng.</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { word: "Accomplish", type: "verb", pron: "/əˈkɑːmplɪʃ/", mean: "Hoàn thành, đạt được", ex: "I accomplished my goal today." },
                                        { word: "Significant", type: "adj", pron: "/sɪɡˈnɪfɪkənt/", mean: "Đáng kể, quan trọng", ex: "This is a significant improvement." },
                                        { word: "Establish", type: "verb", pron: "/ɪˈstæblɪʃ/", mean: "Thành lập, thiết lập", ex: "The company was established in 1990." },
                                        { word: "Crucial", type: "adj", pron: "/ˈkruːʃl/", mean: "Cực kỳ quan trọng", ex: "Water is crucial for survival." }
                                    ].map((v, i) => (
                                        <div key={i} className="p-5 border border-slate-200 rounded-2xl hover:border-violet-300 hover:shadow-md transition-all">
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <h4 className="text-xl font-bold text-slate-800">{v.word}</h4>
                                                <span className="text-sm font-medium text-slate-400 italic">{v.type}</span>
                                            </div>
                                            <p className="text-violet-600 font-mono text-sm mb-3">{v.pron}</p>
                                            <p className="font-medium text-slate-700 mb-2">🇻🇳 {v.mean}</p>
                                            <p className="text-sm text-slate-500 italic">"{v.ex}"</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {(node.loai_bai_hoc === 'LISTENING' || node.loai_bai_hoc === 'TONG_HOP') && (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">Tài liệu đang được cập nhật</h3>
                                <p className="text-slate-500 max-w-md mx-auto">Phần nội dung cho dạng bài {node.loai_bai_hoc} này đang được hệ thống AI của chúng tôi tổng hợp. Bạn vẫn có thể đánh dấu hoàn thành để tiếp tục lộ trình.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                        Đóng tài liệu
                    </button>
                    {isCurrent && (
                        <button 
                            onClick={() => {
                                onComplete(node.node_state_id);
                                onClose();
                            }} 
                            className="px-8 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Hoàn thành bài học
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function LearningPath() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null); // Trạng thái mở Modal bài học

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        apiGetMyRoadmap(token)
            .then(data => {
                setRoadmap(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [token]);

    const handleCompleteNode = async (nodeStateId) => {
        try {
            await apiCompleteNode(token, nodeStateId);
            const updatedData = await apiGetMyRoadmap(token);
            setRoadmap(updatedData);
        } catch (err) {
            alert(err.message || 'Lỗi khi cập nhật tiến độ');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="p-8 bg-white rounded-[2rem] shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Chưa có lộ trình học</h2>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <button onClick={() => navigate('/client/placement-test')} className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-colors">
                        Làm bài kiểm tra đầu vào
                    </button>
                </div>
            </div>
        );
    }

    const { khoa_hoc, tien_do, nodes } = roadmap;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}</style>
            
            {/* Mock Document Modal */}
            {selectedNode && (
                <MockDocumentModal 
                    node={selectedNode} 
                    onClose={() => setSelectedNode(null)} 
                    onComplete={handleCompleteNode}
                />
            )}

            <div className="bg-gradient-to-r from-teal-500 to-sky-600 rounded-[2rem] p-8 sm:p-12 text-white shadow-lg animate-slide-in" style={{ opacity: 0 }}>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Lộ trình được Cá nhân hóa</h1>
                <p className="text-teal-50 font-medium max-w-xl">Hệ thống AI đã phân tích trình độ đầu vào của bạn và xây dựng lộ trình học tập tối ưu: <strong className="text-white bg-black/20 px-2 py-1 rounded">{khoa_hoc.ten}</strong></p>
                <div className="mt-6 flex items-center gap-4">
                    <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-sm font-bold border border-white/10">{tien_do.hoan_thanh}/{tien_do.tong} Giai đoạn</div>
                    <div className="flex-1 max-w-xs h-3 bg-black/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${tien_do.phan_tram}%` }}></div>
                    </div>
                    <div className="text-sm font-bold">{tien_do.phan_tram}%</div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-sm border border-slate-200 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                <div className="relative border-l-4 border-slate-100 ml-4 md:ml-8 space-y-12">
                    
                    {nodes.map((node, index) => {
                        const isCompleted = node.trang_thai === 'COMPLETED';
                        const isCurrent = node.trang_thai === 'UNLOCKED';
                        const isLocked = node.trang_thai === 'LOCKED';
                        
                        let bgColor = 'bg-slate-100';
                        let textColor = 'text-slate-400';
                        let borderColor = 'border-slate-200';
                        
                        const icons = {
                            'GRAMMAR': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                            'LISTENING': 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z',
                            'VOCABULARIES': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                            'TONG_HOP': 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                        };
                        const iconPath = icons[node.loai_bai_hoc] || icons['VOCABULARIES'];
                        
                        if (isCompleted) {
                            bgColor = 'bg-emerald-500'; textColor = 'text-white'; borderColor = 'border-emerald-500';
                        } else if (isCurrent) {
                            bgColor = 'bg-sky-500'; textColor = 'text-white'; borderColor = 'border-sky-500 shadow-lg shadow-sky-500/30 animate-pulse';
                        }

                        return (
                            <div key={node.node_state_id} className="relative group pl-8 sm:pl-12">
                                {isCompleted && index !== nodes.length - 1 && (
                                    <div className="absolute top-10 -left-[2px] w-1 h-full bg-emerald-500 z-0"></div>
                                )}

                                <div className={`absolute -left-6 sm:-left-7 top-2 w-12 h-12 flex items-center justify-center rounded-full border-4 border-white ${bgColor} ${borderColor} ${textColor} z-10 transition-transform ${isCurrent ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                                    </svg>
                                </div>

                                <div className={`p-6 rounded-2xl border transition-all ${isCurrent ? 'bg-sky-50/50 border-sky-200 shadow-md' : 'bg-white border-slate-200 hover:shadow-md hover:border-slate-300'} ${isLocked ? 'opacity-50 grayscale select-none' : ''}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                        <h3 className={`text-xl font-bold ${isCurrent ? 'text-sky-900' : 'text-slate-800'}`}>[{node.loai_bai_hoc}] {node.ten_bai_hoc}</h3>
                                        
                                        {!isLocked && (
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                                                {isCompleted ? `Đã hoàn thành` : `Đang học`}
                                            </span>
                                        )}
                                        {isLocked && <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">Chưa mở khóa</span>}
                                    </div>
                                    
                                    <p className="text-slate-500 font-medium text-sm">
                                        {isLocked 
                                            ? 'Hoàn thành các bài học trước để mở khóa nội dung này.' 
                                            : 'Hoàn thành chặng này để củng cố kỹ năng và tiếp tục lộ trình.'
                                        }
                                    </p>
                                    
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {isCurrent && (
                                            <button onClick={() => setSelectedNode(node)} className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-sky-600/20">
                                                Học Bài Ngay
                                            </button>
                                        )}
                                        {isCompleted && (
                                            <button onClick={() => setSelectedNode(node)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors">
                                                Xem Lại Bài
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
}

