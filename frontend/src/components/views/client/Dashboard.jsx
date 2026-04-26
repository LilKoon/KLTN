import React, { useRef, useState, useEffect } from 'react';
import { CloudUpload, FilePlus, Zap, Plus, BookOpen, Code2, Headphones, Mic, Trophy, PlayCircle, ArrowRight, Target, Clock, FileText, PlaySquare } from 'lucide-react';
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
                
                // Show modal if they haven't completed the test and haven't dismissed it this session
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

    return (
        <div className="max-w-[1240px] w-full p-6 lg:p-8 flex items-start gap-8 mx-auto pb-12 cursor-default">
            {showNewUserModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-blue-500"></div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Chào mừng bạn mới! 🎉</h2>
                        <p className="text-slate-600 mb-8">Hãy chọn bước tiếp theo để bắt đầu hành trình học tập của bạn.</p>
                        
                        <div className="flex flex-col gap-4">
                            <button 
                                onClick={() => navigate('/client/placement-test')}
                                className="w-full bg-teal-50 hover:bg-teal-100 border border-teal-200 p-4 rounded-xl flex items-center gap-4 transition-colors text-left group"
                            >
                                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-teal-900 text-lg">Test đầu vào</h3>
                                    <p className="text-teal-700 text-sm">Cải thiện trình độ Tiếng Anh</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => navigate('/client/flashcards')}
                                className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 p-4 rounded-xl flex items-center gap-4 transition-colors text-left group"
                            >
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900 text-lg">Học Từ Vựng Flashcard</h3>
                                    <p className="text-blue-700 text-sm">Xây dựng vốn từ vựng cơ bản</p>
                                </div>
                            </button>
                        </div>
                        <button 
                            onClick={() => {
                                setShowNewUserModal(false);
                                sessionStorage.setItem('dismissedNewUserModal', 'true');
                            }} 
                            className="mt-6 w-full py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Bỏ qua lúc này
                        </button>
                    </div>
                </div>
            )}
            
            {/* Left Column */}
            <div className="flex-1 w-full min-w-0 flex flex-col gap-8">
                
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 pt-2">
                    {isNewUser ? 'Chào mừng học viên mới' : 'Chào mừng quay trở lại'}, {user?.user_name || 'Học viên'}! 
                    <span className="origin-bottom-right animate-bounce">👋</span>
                </h2>

                {/* Main Actions: Upload & Flashcard */}
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative z-10 w-full">
                    {!isNewUser ? (
                        <div 
                            onClick={() => navigate('/client/daily-review')}
                            className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-[24px] p-6 shadow-lg border border-amber-300/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group flex flex-col pb-6 relative overflow-hidden xl:col-span-2"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center mb-5 text-white shadow-inner relative z-10 transition-transform duration-300 group-hover:scale-110">
                                <Clock className="w-6 h-6 text-white text-opacity-95" />
                            </div>
                            <h3 className="text-[19px] font-bold text-white mb-2 relative z-10">Ôn tập hằng ngày</h3>
                            <p className="text-amber-50 text-[13px] mb-6 leading-relaxed opacity-95 relative z-10">Chống quên từ vựng bằng Spaced Repetition.</p>
                            <button className="w-full bg-white text-amber-600 hover:bg-slate-50 font-bold py-3 rounded-xl transition-colors relative z-10 flex items-center justify-center gap-2 mt-auto shadow-sm">
                                Bắt đầu ôn tập
                            </button>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-400 rounded-full blur-2xl opacity-50 z-0 pointer-events-none group-hover:animate-pulse"></div>
                        </div>
                    ) : (
                        <>
                            {/* Action 1: Upload */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md cursor-pointer group flex flex-col pb-8">
                                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-5 text-teal-600 group-hover:scale-105 transition-transform">
                                    <CloudUpload className="w-6 h-6" />
                                </div>
                                <h3 className="text-[18px] font-bold text-slate-900 mb-2">Upload tài liệu</h3>
                                <p className="text-slate-500 text-[13px] mb-6 leading-relaxed">Kéo thả PDF hoặc DOCX. AI sẽ tự động tóm tắt và trích xuất điểm chính.</p>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border border-dashed border-slate-200 group-hover:border-teal-300 group-hover:bg-slate-50 rounded-xl py-6 flex flex-col items-center text-slate-500 transition-colors cursor-pointer"
                                >
                                    <FilePlus className="w-6 h-6 text-slate-400 mb-2" />
                                    <span className="text-[14px] font-bold text-slate-600 mb-1">Nhấn hoặc kéo thả file</span>
                                    <span className="text-[12px] font-medium text-slate-400">Hỗ trợ tối đa 50MB</span>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileSelect} 
                                    className="hidden" 
                                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                />
                            </div>

                            {/* Action 2: Create Flashcard */}
                            <div className="bg-gradient-to-br from-[#20e9b9] to-[#01a682] rounded-[24px] p-6 shadow-lg border border-teal-300/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group flex flex-col pb-6 relative overflow-hidden">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center mb-5 text-white shadow-inner relative z-10 transition-transform duration-300 group-hover:scale-110">
                                    <Zap className="w-6 h-6 text-white text-opacity-95" />
                                </div>
                                <h3 className="text-[19px] font-bold text-white mb-2 relative z-10">Tạo Flashcard siêu tốc</h3>
                                <p className="text-teal-50 text-[13px] mb-6 leading-relaxed opacity-95 relative z-10">Biến ghi chú bài giảng thành bộ thẻ học thông minh với AI chỉ sau vài giây.</p>
                                <button 
                                    onClick={() => navigate('/client/flashcards')}
                                    className="w-full bg-white text-teal-600 hover:bg-slate-50 font-bold py-3 rounded-xl transition-colors relative z-10 flex items-center justify-center gap-2 mt-auto shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Bắt đầu tạo mới
                                </button>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-400 rounded-full blur-2xl opacity-50 z-0 pointer-events-none group-hover:animate-pulse"></div>
                            </div>
                        </>
                    )}
                </section>

                {/* Tiếp tục học tập */}
                <section>
                    <div className="mb-4 px-1">
                        <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Tiếp tục học tập</h2>
                        <p className="text-[13px] text-slate-500 mt-1">Dựa trên hoạt động gần đây của bạn</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-5 hover:shadow-md transition-shadow relative cursor-pointer group">
                            <div className="w-16 h-16 rounded-[14px] bg-amber-50 flex items-center justify-center relative flex-shrink-0 border border-amber-100/50">
                                <svg className="absolute inset-0 w-full h-full -rotate-90 opacity-90" viewBox="0 0 64 64">
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="#fef3c7" strokeWidth="4"></circle>
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="175" strokeDashoffset="42" className="group-hover:stroke-amber-400 transition-colors"></circle>
                                </svg>
                                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center relative z-10 group-hover:scale-105 transition-transform">
                                    <BookOpen className="w-5 h-5 text-amber-500" />
                                </div>
                            </div>
                            <div className="flex-1 w-full min-w-0 pr-2">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-slate-900 text-[15px] truncate">IELTS Reading Masterclass</h3>
                                    <span className="text-[13px] font-bold text-amber-500">76%</span>
                                </div>
                                <p className="text-[13px] text-slate-500 mb-3 truncate">Bài 4: Matching Headings - Kỹ năng quét từ khóa</p>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 w-[76%] h-full rounded-full transition-all duration-500"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-5 hover:shadow-md transition-shadow relative cursor-pointer group">
                            <div className="w-16 h-16 rounded-[14px] bg-indigo-50 flex items-center justify-center relative flex-shrink-0 border border-indigo-100/50">
                                <svg className="absolute inset-0 w-full h-full -rotate-90 opacity-90" viewBox="0 0 64 64">
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="#e0e7ff" strokeWidth="4"></circle>
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="175" strokeDashoffset="105" className="group-hover:stroke-indigo-400 transition-colors"></circle>
                                </svg>
                                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center relative z-10 group-hover:scale-105 transition-transform">
                                    <Code2 className="w-5 h-5 text-indigo-500" />
                                </div>
                            </div>
                            <div className="flex-1 w-full min-w-0 pr-2">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-slate-900 text-[15px] truncate">Data Science với Python</h3>
                                    <span className="text-[13px] font-bold text-indigo-500">40%</span>
                                </div>
                                <p className="text-[13px] text-slate-500 mb-3 truncate">Chương 2: Thao tác dữ liệu với Pandas</p>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 w-[40%] h-full rounded-full transition-all duration-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* My Courses */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">Khoá học của tôi</h2>
                        <span className="text-[12px] font-semibold text-slate-500 hover:text-teal-600 transition-colors cursor-pointer">Xem tất cả</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Course 1 */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center relative pointer-events-auto h-full">
                            <div className="absolute top-0 right-0 left-0 h-16 bg-gradient-to-b from-blue-50 to-transparent rounded-t-2xl z-0 pointer-events-none"></div>
                            
                            <div className="w-[72px] h-[72px] bg-white rounded-full flex items-center justify-center relative mb-4 z-10 shadow-sm border border-slate-50">
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-blue-50" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                                    <path className="text-blue-600" strokeDasharray="60, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                                </svg>
                                <Headphones className="w-7 h-7 text-blue-600 relative z-10" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-[15px] mb-1 z-10">IELTS - Listening Cơ bản</h3>
                            <p className="text-[11px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-auto mt-2">Đang học</p>
                            
                            <div className="w-full flex justify-between items-center text-[12px] pt-4 mt-4 border-t border-slate-100/60 z-10">
                                <span className="text-slate-500 font-medium tracking-tight">Đã học 1/9 Units</span>
                                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                                    <Trophy className="w-[14px] h-[14px] fill-amber-500/20" /> 5/18
                                </div>
                            </div>
                        </div>

                        {/* Course 2 */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center relative h-full">
                            <div className="absolute top-0 right-0 left-0 h-16 bg-gradient-to-b from-orange-50 to-transparent rounded-t-2xl z-0 pointer-events-none"></div>
                            
                            <div className="w-[72px] h-[72px] bg-white rounded-full flex items-center justify-center relative mb-4 z-10 shadow-sm border border-slate-50">
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-orange-50" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                                    <path className="text-orange-500" strokeDasharray="15, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                                </svg>
                                <Mic className="w-7 h-7 text-orange-500 relative z-10" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-[15px] mb-1 z-10 leading-tight">IELTS Speaking Cơ bản Plus</h3>
                            <div className="w-full flex justify-between items-center text-[12px] pt-4 mt-auto border-t border-slate-100/60 z-10">
                                <span className="text-slate-400 font-medium tracking-tight">Đã học 2/24 Units</span>
                                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                                    <Trophy className="w-[14px] h-[14px] fill-amber-500/20" /> 6/48
                                </div>
                            </div>
                        </div>

                        {/* Course 3 */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center relative h-full">
                            <div className="absolute top-0 right-0 left-0 h-16 bg-gradient-to-b from-teal-50 to-transparent rounded-t-2xl z-0 pointer-events-none"></div>
                            
                            <div className="w-[72px] h-[72px] bg-white rounded-full flex items-center justify-center relative mb-4 z-10 shadow-sm border border-slate-50">
                                <svg className="absolute inset-0 w-full h-full -rotate-90 opacity-20" viewBox="0 0 36 36">
                                    <path className="text-teal-50" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                                </svg>
                                <BookOpen className="w-7 h-7 text-teal-600 relative z-10" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-[15px] mb-1 z-10">IELTS - Reading Cơ bản</h3>
                            <div className="w-full flex justify-between items-center text-[12px] pt-4 mt-auto border-t border-slate-100/60 z-10">
                                <span className="text-slate-400 font-medium tracking-tight">Đã học 0/10 Units</span>
                                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                                    <Trophy className="w-[14px] h-[14px] fill-amber-500/20" /> 1/20
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Test Practice */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">Test Practice</h2>
                        <span className="text-[12px] font-semibold text-slate-500 hover:text-teal-600 transition-colors cursor-pointer">Xem tất cả</span>
                    </div>

                    <div className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex items-center gap-5 w-full">
                            <div className="w-[88px] h-[116px] rounded-xl bg-gradient-to-b from-[#df3030] to-[#b81d1d] text-white flex flex-col p-3 relative overflow-hidden shadow-md flex-shrink-0 border border-red-800/20">
                                <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                                <div className="absolute -bottom-4 -left-4 font-bold text-[60px] opacity-20 leading-none">1</div>
                                <span className="text-[8px] font-bold uppercase tracking-widest opacity-80 mb-0.5">IELTS</span>
                                <div className="text-[14px] font-bold leading-[1.1] mb-1">SPEAKING<br/><span className="text-[10px] font-medium opacity-90 tracking-normal">Essentials</span></div>
                                <div className="mt-auto self-end text-[7px] opacity-70 bg-black/20 px-1 py-0.5 rounded">Part 1</div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 mb-1.5 bg-blue-50 w-fit px-2 py-0.5 rounded">
                                    <PlayCircle className="w-3.5 h-3.5" /> Đề đang làm
                                </div>
                                <h3 className="font-bold text-slate-900 text-[16px] mb-2 leading-tight">Bộ đề IELTS Speaking Essentials 1</h3>
                                <div className="w-full max-w-[200px] bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3 shadow-inner">
                                    <div className="bg-blue-600 w-[30%] h-full rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all text-[14px] shrink-0 flex items-center justify-center gap-2">
                            Tiếp tục <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </section>

            </div>

            {/* Right Column: Learning Profile */}
            <div className="w-[300px] xl:w-[320px] flex-shrink-0 hidden lg:block sticky top-24 pt-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">Learning Profile</h2>
                    <span className="text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Xem tất cả</span>
                </div>

                <div className="bg-[#fcfdfd] rounded-[1.25rem] border border-blue-50/80 shadow-sm p-6 relative">
                    <h3 className="font-semibold text-slate-800 text-[15px] mb-8 relative z-10">Your IELTS Level</h3>

                    <div className="relative pt-2 pb-6 px-1 mb-2 z-10 border-b border-slate-100">
                        <div className="absolute top-[16px] left-4 right-4 h-[2px] border-t-2 border-dashed border-blue-100"></div>
                        <div className="absolute top-[16px] left-4 right-1/2 h-[2px] border-t-2 border-dashed border-blue-200"></div>
                        
                        <div className="flex items-center justify-between relative">
                            {/* Entry */}
                            <div className="flex flex-col items-center">
                                <div className="w-[14px] h-[14px] bg-white border-[3.5px] border-blue-600 rounded-full z-10 mb-2"></div>
                                <span className="text-[12px] text-slate-500 font-medium mb-1">Entry</span>
                                <span className="text-[18px] font-bold text-slate-900 leading-none">0.0</span>
                            </div>
                            {/* Predicted */}
                            <div className="flex flex-col items-center relative -top-px left-1">
                                <div className="w-[14px] h-[14px] bg-white border-[3.5px] border-blue-600 rounded-full z-10 mb-2"></div>
                                <span className="text-[12px] text-slate-500 font-medium mb-1">Predicted</span>
                                <span className="text-[18px] font-bold text-blue-600 leading-none">4.0</span>
                            </div>
                            {/* Target */}
                            <div className="flex flex-col items-center relative gap">
                                <div className="w-6 h-6 bg-blue-50/50 flex items-center justify-center rounded-full z-10 mb-[3px] relative -top-1">
                                    <Target className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-[12px] text-slate-500 font-medium mb-1">Target</span>
                                <span className="text-[18px] font-bold text-slate-900 leading-none">5.0</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 relative z-10">
                        <h3 className="font-bold text-slate-800 text-[15px] mb-5">Learning summary</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-blue-100/50 flex items-center justify-center"><Clock className="w-[14px] h-[14px] text-blue-500" /></div>
                                    <span className="text-[14px] text-slate-600">Tổng thời lượng</span>
                                </div>
                                <span className="text-[14px] font-bold text-blue-600">0 min</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center"><Trophy className="w-[14px] h-[14px] text-amber-500 fill-amber-500/20" /></div>
                                    <span className="text-[14px] text-slate-600">Tổng số cúp đã đạt</span>
                                </div>
                                <span className="text-[14px] font-bold text-amber-500">317</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center"><FileText className="w-[14px] h-[14px] text-rose-500" /></div>
                                    <span className="text-[14px] text-slate-600">Tổng số bài test</span>
                                </div>
                                <span className="text-[14px] font-bold text-rose-600">24</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center"><PlaySquare className="w-[14px] h-[14px] text-emerald-500" /></div>
                                    <span className="text-[14px] text-slate-600">Tổng số bài học</span>
                                </div>
                                <span className="text-[14px] font-bold text-emerald-500">85</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
