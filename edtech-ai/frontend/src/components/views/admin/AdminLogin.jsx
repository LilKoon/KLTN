import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function AdminLogin() {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('admin@edtech.ai');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        const res = await login('admin', email, password);
        if (!res?.success) {
            setError(res?.error || 'Lỗi kết nối máy chủ');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { font-family: 'Inter', sans-serif; }
            `}</style>
            
            <div className="w-full max-w-md bg-slate-800 rounded-[2rem] p-8 sm:p-10 shadow-2xl border border-slate-700 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white text-center mb-2">Hệ thống Quản Trị</h2>
                    <p className="text-slate-400 text-center mb-6 font-medium text-sm">Vui lòng đăng nhập để truy cập Admin Portal</p>

                    {error && (
                        <div className="mb-4 bg-rose-500/10 border border-rose-500/50 text-rose-500 p-3 rounded-xl text-sm font-semibold text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Email quản trị</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" 
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2 ml-1">
                                <label className="block text-sm font-semibold text-slate-300">Mật khẩu</label>
                                <a href="#" className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors">Quên mật khẩu?</a>
                            </div>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" 
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center mt-4"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-slate-900" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : "Đăng nhập hệ thống"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
