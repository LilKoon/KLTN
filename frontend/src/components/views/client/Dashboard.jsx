import React, { useRef, useState, useEffect } from 'react';
import { CloudUpload, FilePlus, Zap, Plus, BookOpen, Bot, Target, Clock, Map, Layers, ArrowRight, Sparkles, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { apiGetProfile } from '../../../api';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const fileInputRef = useRef(null);
    const [isNewUser, setIsNewUser] = useState(false);
    const [showNewUserModal, setShowNewUserModal] = useState(false);

    useEffect(() => {
        if (token) {
            apiGetProfile(token).then(profile => {
                const isNew = !profile.HasCompletedPlacementTest;
                setIsNewUser(isNew);

                if (isNew && !sessionStorage.getItem('dismissedNewUserModal')) {
                    setShowNewUserModal(true);
                }
            }).catch(err => console.error("Could not fetch profile:", err));
        }
    }, [token]);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            navigate('/client/chatbot', {
                state: {
                    initialFile: file,
                    initialMessage: 'bạn có thể giúp gì cho tôi'
                }
            });
        }
    };

    const actions = [
        {
            title: 'Lộ trình học tập',
            desc: 'Theo dõi trạm học và bài cần hoàn thành hôm nay.',
            Icon: Map,
            to: '/client/learning-path',
            color: 'teal',
        },
        {
            title: 'Bài tập & Test',
            desc: 'Luyện kỹ năng bằng đề kiểm tra và quiz AI.',
            Icon: Target,
            to: '/client/exercises-tests',
            color: 'sky',
        },
        {
            title: 'Kho flashcard',
            desc: 'Ôn từ vựng nhanh bằng thẻ ghi nhớ thông minh.',
            Icon: Layers,
            to: '/client/flashcards',
            color: 'violet',
        },
        {
            title: 'Chatbot AI',
            desc: 'Hỏi bài, tóm tắt tài liệu, giải thích điểm khó.',
            Icon: Bot,
            to: '/client/chatbot',
            color: 'amber',
        },
    ];

    const colorMap = {
        teal: 'bg-teal-50 text-teal-700 border-teal-100 group-hover:bg-teal-600 group-hover:text-white',
        sky: 'bg-sky-50 text-sky-700 border-sky-100 group-hover:bg-sky-600 group-hover:text-white',
        violet: 'bg-violet-50 text-violet-700 border-violet-100 group-hover:bg-violet-600 group-hover:text-white',
        amber: 'bg-amber-50 text-amber-700 border-amber-100 group-hover:bg-amber-500 group-hover:text-white',
    };

    return (
        <div className="max-w-7xl w-full mx-auto p-5 sm:p-6 lg:p-10 space-y-8 pb-12 cursor-default">
            {showNewUserModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-teal-400 via-sky-400 to-violet-500" />
                        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                            <Sparkles className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Bắt đầu học đúng trình độ</h2>
                        <p className="text-slate-500 mb-7 leading-relaxed">Làm test đầu vào để hệ thống tạo lộ trình phù hợp, hoặc vào flashcard nếu muốn học nhanh trước.</p>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => navigate('/client/placement-test')}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-2xl flex items-center justify-between transition-colors text-left group shadow-lg shadow-teal-600/20"
                            >
                                <span>
                                    <span className="block font-black text-lg">Làm test đầu vào</span>
                                    <span className="text-teal-50 text-sm">Tạo lộ trình cá nhân hóa</span>
                                </span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => navigate('/client/flashcards')}
                                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-4 rounded-2xl flex items-center justify-between transition-colors text-left group"
                            >
                                <span>
                                    <span className="block font-bold text-slate-900">Khám phá flashcard</span>
                                    <span className="text-slate-500 text-sm">Ôn từ vựng trước khi test</span>
                                </span>
                                <Layers className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setShowNewUserModal(false);
                                sessionStorage.setItem('dismissedNewUserModal', 'true');
                            }}
                            className="mt-5 w-full py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Để sau
                        </button>
                    </div>
                </div>
            )}

            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-teal-900 to-sky-900 p-6 sm:p-8 lg:p-10 text-white shadow-2xl shadow-teal-900/20">
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-teal-400/20 blur-3xl" />
                <div className="absolute right-24 bottom-0 w-48 h-48 rounded-full bg-sky-400/10 blur-3xl" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-teal-50 mb-5">
                            <Sparkles className="w-3.5 h-3.5" /> Học thông minh hơn mỗi ngày
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                            Xin chào, {user?.user_name || 'Học viên'}
                        </h1>
                        <p className="text-teal-50/85 mt-4 max-w-2xl leading-relaxed">
                            {isNewUser
                                ? 'Hoàn thành test đầu vào để nhận lộ trình học phù hợp với trình độ hiện tại.'
                                : 'Tiếp tục lộ trình, ôn tập kiến thức cũ và dùng AI khi cần giải thích nhanh.'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 mt-8">
                            <button
                                onClick={() => navigate(isNewUser ? '/client/placement-test' : '/client/learning-path')}
                                className="px-6 py-3.5 rounded-2xl bg-white text-teal-700 font-black hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
                            >
                                {isNewUser ? 'Làm test đầu vào' : 'Tiếp tục lộ trình'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => navigate(isNewUser ? '/client/flashcards' : '/client/daily-review')}
                                className="px-6 py-3.5 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/15 transition-colors border border-white/15 flex items-center justify-center gap-2"
                            >
                                {isNewUser ? <Layers className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                {isNewUser ? 'Học flashcard' : 'Ôn tập hôm nay'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/10 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                                <PlayCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-black">Học nhanh hôm nay</p>
                                <p className="text-xs text-teal-50/70">3 bước gọn để bắt nhịp</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                isNewUser ? 'Làm test đầu vào' : 'Mở lộ trình học tập',
                                'Ôn flashcard 10 phút',
                                'Hỏi chatbot phần chưa hiểu',
                            ].map((item, index) => (
                                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                                    <span className="w-7 h-7 rounded-full bg-white text-teal-700 text-xs font-black flex items-center justify-center">{index + 1}</span>
                                    <span className="text-sm font-semibold text-white/90">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-6">
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Tác vụ chính</h2>
                            <p className="text-sm text-slate-500 mt-1">Chọn nhanh tính năng bạn cần dùng</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {actions.map(({ title, desc, Icon, to, color }) => (
                            <button
                                key={title}
                                onClick={() => navigate(to)}
                                className="group text-left rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-lg hover:shadow-slate-200/70 hover:-translate-y-0.5 transition-all p-5"
                            >
                                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors ${colorMap[color]}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-black text-slate-900 mt-4">{title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed mt-1">{desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Học với tài liệu</h2>
                            <p className="text-sm text-slate-500 mt-1">Tải file lên để AI tóm tắt hoặc giải thích nội dung</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                            <CloudUpload className="w-6 h-6" />
                        </div>
                    </div>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 min-h-[220px] border-2 border-dashed border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 rounded-3xl flex flex-col items-center justify-center text-center p-6 transition-colors cursor-pointer"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
                            <FilePlus className="w-7 h-7" />
                        </div>
                        <h3 className="font-black text-slate-800">Nhấn để chọn file</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm">Hỗ trợ PDF, ảnh, DOC, DOCX. File sẽ mở trực tiếp trong Chatbot AI.</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    />
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <button onClick={() => navigate('/client/daily-review')} className="bg-amber-50 hover:bg-amber-100 rounded-3xl p-6 text-left border border-amber-100 transition-colors">
                    <Clock className="w-7 h-7 text-amber-600 mb-4" />
                    <h3 className="font-black text-slate-900">Ôn tập hằng ngày</h3>
                    <p className="text-sm text-slate-600 mt-1">Giữ nhịp học bằng spaced repetition.</p>
                </button>
                <button onClick={() => navigate('/client/learning-materials')} className="bg-sky-50 hover:bg-sky-100 rounded-3xl p-6 text-left border border-sky-100 transition-colors">
                    <BookOpen className="w-7 h-7 text-sky-600 mb-4" />
                    <h3 className="font-black text-slate-900">Kho tài liệu</h3>
                    <p className="text-sm text-slate-600 mt-1">Đọc thêm tài liệu đã được hệ thống lưu.</p>
                </button>
                <button onClick={() => navigate('/client/flashcards/create')} className="bg-violet-50 hover:bg-violet-100 rounded-3xl p-6 text-left border border-violet-100 transition-colors">
                    <Zap className="w-7 h-7 text-violet-600 mb-4" />
                    <h3 className="font-black text-slate-900">Tạo flashcard</h3>
                    <p className="text-sm text-slate-600 mt-1">Tạo bộ thẻ mới cho chủ đề đang học.</p>
                </button>
            </section>
        </div>
    );
};

export default Dashboard;
