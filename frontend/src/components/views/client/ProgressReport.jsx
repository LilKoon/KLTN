import React from 'react';
import { Star, Trophy, ChevronDown, Lock, SkipForward } from 'lucide-react';

const ProgressReport = () => {
    return (
        <div className="max-w-[1100px] w-full p-6 lg:p-8 flex flex-col lg:flex-row items-start gap-8 mx-auto pb-12">
            {/* List Section */}
            <div className="flex-1 w-full min-w-0 flex flex-col gap-5 mt-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Danh sách bài học</h2>
                    <span className="text-[14px] font-semibold text-slate-500">Đã học 1/5 Bài học</span>
                </div>

                {/* Completed Lesson Item */}
                <div className="bg-white rounded-[16px] p-5 border border-slate-200/80 shadow-sm flex items-center justify-between cursor-pointer relative overflow-hidden group hover:border-teal-400 hover:shadow-md transition-all">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#22c55e]"></div>
                    <div className="flex items-center gap-5 ml-2">
                        <div className="w-[52px] h-[58px] bg-green-50 rounded-lg flex flex-col items-center justify-center border-b-[3px] border-[#22c55e] shrink-0 relative">
                            <span className="text-[#22c55e] font-extrabold text-[20px] leading-none mb-0.5">01</span>
                            <span className="text-[#22c55e] text-[9px] font-bold uppercase tracking-wider">Lesson</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-[16px] mb-1.5 group-hover:text-teal-600 transition-colors">Mở đầu khoá Từ vựng</h3>
                            <div className="flex items-center gap-5 text-[13px] text-slate-500 font-medium">
                                <span>3/3 Sections</span>
                                <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 9/9
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1 text-amber-400 hidden sm:flex">
                            <Trophy className="w-5 h-5 fill-amber-400 text-amber-500" />
                            <Trophy className="w-5 h-5 fill-amber-400 text-amber-500" />
                            <Trophy className="w-5 h-5 fill-amber-400 text-amber-500" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-teal-50 transition-colors cursor-pointer text-slate-400">
                            <ChevronDown className="w-5 h-5 group-hover:text-teal-600" />
                        </div>
                    </div>
                </div>

                {/* Active Lesson Item */}
                <div className="bg-white rounded-[16px] p-5 border border-slate-200/80 shadow-sm flex items-center justify-between cursor-pointer relative overflow-hidden group hover:border-teal-400 hover:shadow-md transition-all">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3b82f6]"></div>
                    <div className="flex items-center gap-5 ml-2">
                        <div className="w-[52px] h-[58px] bg-blue-50 rounded-lg flex flex-col items-center justify-center border-b-[3px] border-[#3b82f6] shrink-0 relative">
                            <span className="text-[#3b82f6] font-extrabold text-[20px] leading-none mb-0.5">02</span>
                            <span className="text-[#3b82f6] text-[9px] font-bold uppercase tracking-wider">Lesson</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-[16px] mb-1.5 group-hover:text-blue-600 transition-colors">Thế giới tự nhiên</h3>
                            <div className="flex items-center gap-5 text-[13px] text-slate-500 font-medium">
                                <span>1/3 Sections</span>
                                <span className="flex items-center gap-1.5 text-slate-400 font-bold">
                                    <Star className="w-4 h-4 text-slate-300" /> 3/9
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1 text-slate-300 hidden sm:flex">
                            <Trophy className="w-5 h-5" />
                            <Trophy className="w-5 h-5" />
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors cursor-pointer text-slate-400">
                            <ChevronDown className="w-5 h-5 group-hover:text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Locked Lesson Item */}
                <div className="bg-slate-50/50 rounded-[16px] p-5 border border-slate-200/50 shadow-sm flex items-center justify-between relative overflow-hidden group opacity-80 cursor-not-allowed">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-300"></div>
                    <div className="flex items-center gap-5 ml-2">
                        <div className="w-[52px] h-[58px] bg-slate-100 rounded-lg flex flex-col items-center justify-center border-b-[3px] border-slate-300 shrink-0 relative">
                            <span className="text-slate-400 font-extrabold text-[20px] leading-none mb-0.5">03</span>
                            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Test</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-600 text-[16px] mb-1.5">Bài kiểm tra 1 - Từ vựng</h3>
                            <div className="flex items-center gap-5 text-[13px] text-slate-400 font-medium">
                                <span>1/1 Skill</span>
                                <span className="flex items-center gap-1.5">
                                    <Star className="w-4 h-4" /> 0/3
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 mr-1">
                        <Lock className="w-5 h-5 text-slate-300" />
                    </div>
                </div>
                
            </div>

            {/* Stats Right Sidebar */}
            <div className="w-full lg:w-[340px] xl:w-[360px] shrink-0 lg:sticky top-8 lg:mt-4">
                <div className="bg-white rounded-[24px] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col items-center">
                    
                    <div className="relative w-28 h-28 mb-3 mt-2">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400 drop-shadow-md">
                            <polygon fill="currentColor" points="50,5 95,25 95,75 50,95 5,75 5,25"></polygon>
                            <polygon fill="#fbbf24" points="50,12 88,30 88,70 50,88 12,70 12,30"></polygon>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Star className="w-[45px] h-[45px] text-amber-100 fill-amber-100/50" />
                        </div>
                    </div>

                    <h3 className="font-bold text-slate-800 text-[16px] text-center mb-6 px-4 leading-relaxed tracking-tight">
                        Kéo dài chuỗi học để sưu tập thêm sao nhé!
                    </h3>

                    {/* Stats Lines */}
                    <div className="w-full flex flex-col gap-4">
                        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100/80">
                            <span className="text-[14px] font-bold text-slate-600">Số sao đã đạt</span>
                            <div className="flex items-center gap-1.5 font-bold text-amber-500 text-[15px]">
                                <Star className="w-4 h-4 fill-amber-400" /> 12/30
                            </div>
                        </div>

                        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100/80">
                            <span className="text-[14px] font-bold text-slate-600">Số cúp đã đạt</span>
                            <div className="flex items-center gap-1.5 font-bold text-amber-500 text-[15px]">
                                <Trophy className="w-4 h-4 fill-amber-400 text-amber-500" /> 5/15
                            </div>
                        </div>

                        <div className="w-full mb-1">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[14px] font-bold text-slate-600">Bài học hoàn thành</span>
                                <span className="font-bold text-[#22c55e] text-[14px]">1/5</span>
                            </div>
                            <div className="w-full bg-[#f1f5f9] h-[10px] rounded-full overflow-hidden">
                                <div className="bg-[#22c55e] w-[20%] h-full rounded-full transition-all"></div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-[14px] mt-6 rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]">
                        Làm bài test bỏ qua <SkipForward className="w-4 h-4" />
                    </button>
                    
                </div>
            </div>
            
        </div>
    );
};

export default ProgressReport;
