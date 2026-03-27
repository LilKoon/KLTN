import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ClientNavbar({ toggleSidebar }) {
    const navigate = useNavigate();
    return (
        <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center justify-between px-4 sm:px-6 lg:px-10">
            
            {/* Left Box: Hamburger menu (Mobile) & Greeting */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                
                <div className="hidden sm:block">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Xin chào, Nguyễn Văn A 👋</h2>
                    <p className="text-sm font-medium text-slate-500">Hôm nay bạn muốn học gì?</p>
                </div>
            </div>

            {/* Right Box: Search, Notifications, User Profile */}
            <div className="flex items-center gap-3 sm:gap-5">
                
                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400 group-focus-within:text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm..." 
                        className="pl-10 pr-4 py-2.5 bg-slate-50 text-sm font-medium text-slate-700 rounded-full border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none w-64 transition-all"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2 border-l border-slate-200 pl-3 sm:pl-5 ml-1">
                    {/* Dark/Light Mode toggle (Mock) */}
                    <button className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    </button>
                    
                    {/* Notifications */}
                    <button className="relative p-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white"></span>
                    </button>
                </div>

                {/* User Dropdown */}
                <button 
                    onClick={() => navigate('/client/profile')}
                    className="flex items-center gap-2 pl-2 sm:pl-4 transition-transform hover:scale-105"
                >
                    <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-200">
                        <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                </button>
                
            </div>
        </header>
    );
}
