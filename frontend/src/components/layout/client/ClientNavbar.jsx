import React from 'react';
import { Search, Flame, Bell, Menu, GraduationCap } from 'lucide-react';

const ClientNavbar = ({ toggleSidebar }) => {
    return (
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar} 
                    className="p-1.5 -ml-2 text-slate-500 hover:text-teal-600 hover:bg-slate-50 rounded-lg lg:hidden transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                
                <span className="font-bold text-xl text-teal-600 flex items-center gap-2 mr-4 lg:hidden">
                    <GraduationCap className="w-6 h-6" />
                </span>
                
                {/* Search */}
                <div className="relative w-[280px] lg:w-[360px] hidden sm:block">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm tài liệu, flashcards..." 
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/60 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[13px] placeholder:text-slate-400 transition-all font-medium text-slate-700" 
                    />
                </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
                {/* Streak Indicator */}
                <div className="flex items-center gap-2 bg-[#fff6e6] hover:bg-orange-50 px-4 py-1.5 rounded-[20px] cursor-pointer transition-colors border border-transparent hover:border-orange-100/50">
                    <div className="relative flex items-center justify-center">
                        <Flame className="w-[20px] h-[20px] text-orange-500 fill-amber-400" />
                        <div className="absolute inset-0 m-auto mt-[10px] w-[5px] h-[5px] bg-white rounded flex items-center justify-center z-10 shadow-sm border border-orange-100/50"></div>
                    </div>
                    <span className="text-[17px] font-extrabold tracking-tight bg-gradient-to-b from-orange-400 to-[#ff6b00] bg-clip-text text-transparent">
                        3
                    </span>
                </div>
                
                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                
                <button className="relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 cursor-pointer">
                    <Bell className="w-[18px] h-[18px]" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>
    );
};

export default ClientNavbar;
