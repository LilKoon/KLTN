import React, { useState } from 'react';
import { Trophy, Filter, ChevronDown, Search, CheckCircle2, Sparkles } from 'lucide-react';

const LearningMaterials = () => {
    const [activeTab, setActiveTab] = useState('main');

    return (
        <div className="flex-1 h-full flex flex-col relative z-10 overflow-x-hidden overflow-y-auto w-full no-scrollbar" style={{
            backgroundColor: '#f8fafc',
            backgroundImage: `
                radial-gradient(at 0% 0%, hsla(171, 80%, 94%, 0.6) 0px, transparent 50%),
                radial-gradient(at 100% 100%, hsla(171, 75%, 90%, 0.5) 0px, transparent 50%),
                radial-gradient(at 100% 0%, hsla(0, 0%, 100%, 1) 0px, transparent 50%)
            `,
            backgroundAttachment: 'fixed'
        }}>
            
            <div className="w-full mx-auto p-6 lg:p-10 pb-16 max-w-[1400px]">
                {/* Page Header */}
                <div className="mb-8 mt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                        <h1 className="text-[28px] lg:text-3xl font-bold text-slate-900 tracking-tight">Khoá học của tôi</h1>
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-600">Tổng số cúp đã đạt</span>
                                <div className="flex items-center gap-1 font-bold text-amber-500">
                                    <Trophy className="w-4 h-4 fill-amber-500" /> 317/543
                                </div>
                            </div>
                            <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer text-sm font-medium text-slate-700 shadow-sm">
                                <Filter className="w-4 h-4 text-slate-500" /> Khóa học hiện tại
                            </button>
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm">Các khóa học bạn đang sở hữu đã được chia theo từng cấp trình độ, tương ứng với mỗi chặng mục tiêu. Hãy chọn trình độ mà bạn muốn bắt đầu nhé.</p>
                </div>

                {/* Tabs and Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 mb-8 gap-4">
                    <div className="flex items-center gap-6">
                        <button 
                            className={`pb-3 text-[15px] px-1 transition-all ${activeTab === 'main' ? 'text-teal-600 border-b-2 border-teal-600 font-semibold' : 'text-slate-500 border-b-2 border-transparent font-medium hover:text-slate-800 hover:border-slate-300'}`}
                            onClick={() => setActiveTab('main')}
                        >
                            Khoá học chính
                        </button>
                        <button 
                            className={`pb-3 text-[15px] px-1 transition-all ${activeTab === 'recommended' ? 'text-teal-600 border-b-2 border-teal-600 font-semibold' : 'text-slate-500 border-b-2 border-transparent font-medium hover:text-slate-800 hover:border-slate-300'}`}
                            onClick={() => setActiveTab('recommended')}
                        >
                            Khoá học đề xuất
                        </button>
                    </div>

                    <div className="flex items-center gap-4 pb-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500">Lọc theo</span>
                            <div className="relative group cursor-pointer">
                                <div className="flex items-center gap-1 font-medium text-slate-800">
                                    Tất cả trình độ
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tab Content: Main Courses */}
                {activeTab === 'main' && (
                    <div className="block space-y-10 animate-fade-in">
                        
                        {/* Category 1 */}
                        <div>
                            <div className="flex items-end justify-between mb-4 px-1">
                                <div>
                                    <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">IELTS Nền tảng</h2>
                                    <p className="text-[13px] text-slate-500 mt-0.5">4 courses</p>
                                </div>
                                <div className="flex items-center gap-1.5 font-bold text-amber-500 text-sm bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100/50">
                                    <Trophy className="w-[15px] h-[15px] fill-amber-500" /> 192/195
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Card 1 */}
                                <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer flex flex-col h-full">
                                    <div className="h-[140px] bg-gradient-to-r from-blue-50 to-indigo-50 relative flex items-center justify-center p-4">
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className="font-black text-blue-900 text-lg leading-tight w-24">TỪ VỰNG IELTS CƠ BẢN</div>
                                            <img src="https://i.pravatar.cc/150?img=32" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" alt="Teacher" />
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-slate-900 text-[16px] mb-4">Nền Tảng Từ Vựng</h3>
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-1.5 text-green-600 font-medium text-[13px]">
                                                <CheckCircle2 className="w-[15px] h-[15px] fill-green-600 text-white" /> Đã hoàn thành
                                            </div>
                                            <div className="flex items-center gap-1 font-bold text-amber-500 text-[13px]">
                                                <Trophy className="w-[14px] h-[14px] fill-amber-500" /> 45/30
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer flex flex-col h-full">
                                    <div className="h-[140px] bg-gradient-to-r from-blue-50 to-indigo-50 relative flex items-center justify-center p-4">
                                        <div className="flex items-center gap-3 relative z-10 w-full justify-center">
                                            <div className="font-black text-blue-900 text-lg leading-tight w-24 text-right">NGỮ PHÁP IELTS CƠ BẢN</div>
                                            <img src="https://i.pravatar.cc/150?img=5" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" alt="Teacher" />
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-slate-900 text-[16px] mb-4">Nền Tảng Ngữ Pháp</h3>
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-1.5 text-green-600 font-medium text-[13px]">
                                                <CheckCircle2 className="w-[15px] h-[15px] fill-green-600 text-white" /> Đã hoàn thành
                                            </div>
                                            <div className="flex items-center gap-1 font-bold text-amber-500 text-[13px]">
                                                <Trophy className="w-[14px] h-[14px] fill-amber-500" /> 50/34
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3 & 4 can be added similarly */}
                            </div>
                        </div>

                        {/* Category 2 */}
                        <div>
                            <div className="flex items-end justify-between mb-4 px-1">
                                <div>
                                    <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">IELTS Cơ bản</h2>
                                    <p className="text-[13px] text-slate-500 mt-0.5">7 courses</p>
                                </div>
                                <div className="flex items-center gap-1.5 font-bold text-amber-500 text-sm bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100/50">
                                    <Trophy className="w-[15px] h-[15px] fill-amber-500" /> 125/348
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Card 5 */}
                                <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer flex flex-col h-full">
                                    <div className="h-[140px] bg-gradient-to-r from-blue-50 to-indigo-50 relative flex items-center justify-center p-4">
                                        <div className="flex items-center gap-3 relative z-10 border border-white/40 p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                                            <div className="font-black text-blue-900 text-[15px] leading-tight w-24 text-center">TỪ VỰNG IELTS TRUNG CẤP</div>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-slate-900 text-[16px] mb-4">Từ Vựng Cơ Bản Plus</h3>
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mr-3">
                                                <div className="bg-teal-500 w-[45%] h-full rounded-full"></div>
                                            </div>
                                            <div className="flex items-center gap-1 font-bold text-amber-500 text-[13px] flex-shrink-0">
                                                <Trophy className="w-[14px] h-[14px] fill-amber-500" /> 20/45
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Tab Content: Recommended Courses */}
                {activeTab === 'recommended' && (
                    <div className="block space-y-10 animate-fade-in">
                        <div className="text-center py-16 bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6">
                                <Sparkles className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Đề xuất khóa học phù hợp với bạn</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">Dựa trên bài đánh giá năng lực gần nhất, AI của chúng tôi xây dựng sẵn lộ trình các khóa học tối ưu cho bạn.</p>
                            <button className="bg-teal-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-teal-700 transition-[background,transform] active:scale-95 flex items-center gap-2">
                                <Search className="w-4 h-4" /> Khám phá khóa học
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default LearningMaterials;
