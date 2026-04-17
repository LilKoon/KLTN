import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function AdminLogin() {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState('login'); // 'login' hoặc 'forgot'
    const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Pass
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            login('admin');
        }, 800);
    };

    const toggleView = (target) => {
        setView(target);
        setForgotStep(1);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { font-family: 'Inter', sans-serif; }
                .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            
            <div className="w-full max-w-md bg-slate-800 rounded-[2rem] p-8 sm:p-10 shadow-2xl border border-slate-700 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

                <div className="relative z-10 animate-slide-up">
                    <div className="flex justify-center mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                            </svg>
                        </div>
                    </div>

                    {/* --- VIEW: LOGIN --- */}
                    {view === 'login' && (
                        <>
                            <h2 className="text-2xl font-bold text-white text-center mb-2">Hệ thống Quản Trị</h2>
                            <p className="text-slate-400 text-center mb-8 font-medium text-sm">Chào mừng quay trở lại, Admin</p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Email quản trị</label>
                                    <input type="email" required defaultValue="admin@edtech.ai" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2 ml-1">
                                        <label className="block text-sm font-semibold text-slate-300">Mật khẩu</label>
                                        <button type="button" onClick={() => toggleView('forgot')} className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors">Quên mật khẩu?</button>
                                    </div>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} required defaultValue="admin123" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300">
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center mt-4">
                                    {isLoading ? <svg className="animate-spin h-5 w-5 text-slate-900" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Đăng nhập hệ thống"}
                                </button>
                            </form>
                        </>
                    )}

                    {/* --- VIEW: FORGOT PASSWORD --- */}
                    {view === 'forgot' && (
                        <div className="animate-slide-up">
                            <h2 className="text-2xl font-bold text-white text-center mb-2">
                                {forgotStep === 1 && "Khôi phục quyền truy cập"}
                                {forgotStep === 2 && "Xác minh danh tính"}
                                {forgotStep === 3 && "Thiết lập mật khẩu"}
                            </h2>
                            <p className="text-slate-400 text-center mb-8 font-medium text-sm leading-relaxed">
                                {forgotStep === 1 && "Nhập email quản trị để nhận mã xác thực hệ thống."}
                                {forgotStep === 2 && "Mã OTP bảo mật đã được gửi đến email quản trị."}
                                {forgotStep === 3 && "Tạo mật khẩu mới mạnh hơn để bảo vệ hệ thống."}
                            </p>

                            <div className="space-y-5">
                                {forgotStep === 1 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Email khôi phục</label>
                                        <input type="email" placeholder="admin@edtech.ai" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-teal-500" />
                                        <button onClick={() => setForgotStep(2)} className="w-full py-3.5 bg-teal-500 text-slate-900 font-bold rounded-xl mt-6 hover:bg-teal-400 transition-all">Gửi mã bảo mật</button>
                                    </div>
                                )}

                                {forgotStep === 2 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Nhập mã OTP</label>
                                        <input type="text" maxLength="6" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-center tracking-[1em] text-xl font-bold outline-none focus:ring-2 focus:ring-teal-500" placeholder="000000" />
                                        <button onClick={() => setForgotStep(3)} className="w-full py-3.5 bg-teal-500 text-slate-900 font-bold rounded-xl mt-6 hover:bg-teal-400 transition-all">Xác thực mã</button>
                                        <button onClick={() => setForgotStep(1)} className="w-full text-xs text-slate-500 mt-4 hover:text-teal-400">Không nhận được mã? Gửi lại</button>
                                    </div>
                                )}

                                {forgotStep === 3 && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Mật khẩu mới</label>
                                            <input type="password" password className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-teal-500" placeholder="••••••••" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Nhập lại mật khẩu</label>
                                            <input type="password" password className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-teal-500" placeholder="••••••••" />
                                        </div>
                                        <button onClick={() => { alert('Mật khẩu Admin đã được cập nhật!'); toggleView('login'); }} className="w-full py-3.5 bg-teal-500 text-slate-900 font-bold rounded-xl mt-2 hover:bg-teal-400 transition-all">Cập nhật hệ thống</button>
                                    </div>
                                )}

                                <button onClick={() => toggleView('login')} className="w-full text-sm font-medium text-slate-500 hover:text-teal-400 pt-4 flex items-center justify-center gap-2 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    Quay lại Đăng nhập
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}