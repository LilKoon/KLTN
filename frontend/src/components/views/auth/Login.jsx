import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { startGoogleLogin } from '../../../api.js';

const ERROR_MESSAGES = {
    account_banned: 'Tài khoản của bạn đã bị khoá. Vui lòng liên hệ quản trị viên.',
    google_failed: 'Đăng nhập Google thất bại. Vui lòng thử lại.',
    google_userinfo_failed: 'Không lấy được thông tin từ Google.',
    no_email: 'Tài khoản Google không có email.',
};

const Login = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { loginWithAPI, registerWithAPI } = useAuth();
    const [activeTab, setActiveTab] = useState('login');
    const [loginStyles, setLoginStyles] = useState('relative flex scale-100 opacity-100');
    const [registerStyles, setRegisterStyles] = useState('absolute hidden scale-95 opacity-0');

    const handleGoogleLogin = () => {
        startGoogleLogin();
    };

    // ─── Login form state ───
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Đọc query ?error=... khi BE redirect về (Google OAuth fail / banned ...)
    useEffect(() => {
        const err = searchParams.get('error');
        if (err && ERROR_MESSAGES[err]) {
            setLoginError(ERROR_MESSAGES[err]);
            const next = new URLSearchParams(searchParams);
            next.delete('error');
            setSearchParams(next, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // ─── Register form state ───
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regError, setRegError] = useState('');
    const [regSuccess, setRegSuccess] = useState('');
    const [regLoading, setRegLoading] = useState(false);

    const toggleForm = (type) => {
        // Clear errors when switching
        setLoginError('');
        setRegError('');
        setRegSuccess('');

        if (type === 'register' && activeTab === 'login') {
            setActiveTab('switching');
            setLoginStyles('relative flex scale-95 opacity-0');
            setTimeout(() => {
                setLoginStyles('absolute hidden scale-95 opacity-0');
                setRegisterStyles('relative flex scale-95 opacity-0');
                setTimeout(() => {
                    setRegisterStyles('relative flex scale-100 opacity-100');
                    setActiveTab('register');
                }, 50);
            }, 300);
        } else if (type === 'login' && activeTab === 'register') {
            setActiveTab('switching');
            setRegisterStyles('relative flex scale-95 opacity-0');
            setTimeout(() => {
                setRegisterStyles('absolute hidden scale-95 opacity-0');
                setLoginStyles('relative flex scale-95 opacity-0');
                setTimeout(() => {
                    setLoginStyles('relative flex scale-100 opacity-100');
                    setActiveTab('login');
                }, 50);
            }, 300);
        }
    };

    // ─── Handle Login Submit ───
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);
        try {
            await loginWithAPI(loginEmail, loginPassword);
            // loginWithAPI sẽ tự navigate sang /client
        } catch (err) {
            const msg = err.message || 'Đăng nhập thất bại';
            if (err.errorId === 'AUTH_003' || /chưa xác thực|EMAIL_NOT_VERIFIED/i.test(msg)) {
                navigate(`/verify-email?email=${encodeURIComponent(loginEmail)}`);
                return;
            }
            setLoginError(msg);
        } finally {
            setLoginLoading(false);
        }
    };

    // ─── Handle Register Submit ───
    const handleRegister = async (e) => {
        e.preventDefault();
        setRegError('');
        setRegSuccess('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(regEmail)) {
            setRegError('Email không hợp lệ!!!');
            return;
        }

        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(regPhone)) {
            setRegError('Số điện thoại không hợp lệ!!!');
            return;
        }

        if (regPassword !== regConfirm) {
            setRegError('Mật khẩu nhập lại không khớp');
            return;
        }

        setRegLoading(true);
        try {
            await registerWithAPI(regName, regEmail, regPassword, regPhone);
            navigate(`/verify-email?email=${encodeURIComponent(regEmail)}`);
        } catch (err) {
            setRegError(err.message || 'Đăng ký thất bại');
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <div className="antialiased min-h-screen relative bg-wavy-pattern overflow-x-hidden flex flex-col font-inter">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .font-inter {
                    font-family: 'Inter', sans-serif;
                }
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                ::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                .bg-wavy-pattern {
                    background-color: #f0f9ff;
                    background-image:
                        radial-gradient(at 0% 0%, hsla(202, 100%, 94%, 1) 0px, transparent 50%),
                        radial-gradient(at 100% 0%, hsla(180, 100%, 94%, 1) 0px, transparent 50%),
                        radial-gradient(at 50% 100%, hsla(190, 100%, 92%, 1) 0px, transparent 50%);
                }
            `}</style>

            {/* Decorative Top Background Shape */}
            <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
                <svg viewBox="0 0 1440 320" className="absolute top-0 w-full" preserveAspectRatio="none">
                    <path fill="#e0f2fe" fillOpacity="0.6"
                        d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,144C672,160,768,224,864,229.3C960,235,1056,181,1152,149.3C1248,117,1344,107,1392,101.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z">
                    </path>
                </svg>
            </div>

            {/* Navigation Bar */}
            <nav className="w-full px-6 py-5 lg:px-12 flex items-center justify-between z-20 relative mix-blend-multiply">
                {/* Logo */}
                <div className="flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <span className="text-xl font-extrabold text-slate-800 tracking-tight uppercase">EdTech AI</span>
                </div>

                {/* Desktop Links */}
                {/* <div className="hidden md:flex items-center gap-8">
                    <a href="#" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Trang chủ</a>
                    <a href="#" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Trò chơi</a>
                    <a href="#" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Flash Cards</a>
                    <a href="#" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Mẹo học tập</a>
                    <a href="#" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Về chúng tôi</a>
                </div> */}

                {/* Mobile Menu Button */}
                <button className="md:hidden text-slate-600 hover:text-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2"
                        stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            </nav>

            {/* Main Hero Section */}
            <main
                className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-12 z-10 relative">

                {/* Left Column: Text Content */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6 pt-6 lg:pt-0">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                        Học Tiếng Anh <br />
                        <span className="text-teal-600">Thông Minh</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg mt-2 font-medium">
                        Chúng tôi cam kết mang đến những phương pháp học tập tiên tiến đầy tính sáng tạo giúp truyền cảm hứng và
                        đem lại hiệu quả vượt bậc cho bạn.
                    </p>

                    <div className="flex items-center gap-6 pt-6">
                        <div className="w-20 h-1.5 bg-teal-500 rounded-full"></div>
                    </div>
                </div>

                {/* Right Column: The Auth Form Modal */}
                <div className="w-full lg:w-5/12 flex justify-center lg:justify-end pb-12 lg:pb-0">

                    {/* Form Card Wrapper */}
                    <div className="w-full max-w-[500px] relative">
                        {/* Decorative Blur Blobs behind form */}
                        <div
                            className="absolute -top-8 -right-8 w-32 h-32 bg-sky-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse">
                        </div>
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"
                            style={{ animationDelay: '1.5s' }}></div>

                        {/* The Form Box */}
                        <div className="bg-white rounded-[2rem] shadow-2xl border border-white/60 overflow-hidden relative w-full z-10 transition-all duration-300"
                            id="formContainer">

                            {/* =========================== */}
                            {/* 1. LOGIN FORM               */}
                            {/* =========================== */}
                            <div id="loginForm"
                                className={`p-8 sm:p-10 w-full flex-col transition-all duration-300 transform bg-white z-10 ${loginStyles}`}>
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Đăng nhập tài khoản</h2>
                                    <p className="text-sm text-slate-500">Chào mừng bạn quay trở lại EdTech</p>
                                </div>

                                {/* Login Error Message */}
                                {loginError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium text-center">
                                        {loginError}
                                    </div>
                                )}

                                <form id="login" onSubmit={handleLogin} className="space-y-4">
                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="loginEmail"
                                            className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                            </div>
                                            <input type="email" id="loginEmail"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                                placeholder="name@example.com" required />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                                            <label htmlFor="loginPassword" className="block text-sm font-medium text-slate-700">Mật
                                                khẩu</label>
                                            <Link to="/forgot-password"
                                                className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">Quên
                                                mật khẩu?</Link>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd"
                                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                        clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <input type="password" id="loginPassword"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                                placeholder="••••••••" required />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loginLoading}
                                        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-teal-600/30 hover:shadow-teal-700/40 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 mt-2">
                                        {loginLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Đang đăng nhập...
                                            </span>
                                        ) : 'Đăng nhập'}
                                    </button>
                                </form>

                                <div className="mt-8 mb-6 flex items-center justify-center relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200"></div>
                                    </div>
                                    <div className="relative px-4 bg-white text-xs text-slate-400 font-medium tracking-wide">
                                        Hoặc tiếp tục với
                                    </div>
                                </div>

                                <div className="flex w-full gap-3 mb-8">
                                    <button
                                        onClick={handleGoogleLogin}
                                        type="button"
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-slate-200 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 transition-colors text-sm font-medium text-slate-700">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                fill="#4285F4" />
                                            <path
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                fill="#34A853" />
                                            <path
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                fill="#FBBC05" />
                                            <path
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                fill="#EA4335" />
                                        </svg>
                                        Đăng nhập với Google
                                    </button>
                                </div>

                                <p className="text-center text-sm text-slate-600 mt-auto">
                                    Chưa có tài khoản?
                                    <button onClick={() => toggleForm('register')}
                                        className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-all ml-1">
                                        Đăng ký
                                    </button>
                                </p>
                            </div>

                            {/* =========================== */}
                            {/* 2. REGISTER FORM            */}
                            {/* =========================== */}
                            <div id="registerForm"
                                className={`p-8 sm:p-10 w-full flex-col transition-all duration-300 transform top-0 left-0 bg-white z-10 ${registerStyles}`}>
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Tạo mới tài khoản</h2>
                                    <p className="text-sm text-slate-500">Điền thông tin của bạn để bắt đầu</p>
                                </div>

                                {/* Register Error Message */}
                                {regError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium text-center">
                                        {regError}
                                    </div>
                                )}

                                {/* Register Success Message */}
                                {regSuccess && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600 font-medium text-center">
                                        {regSuccess}
                                    </div>
                                )}

                                <form id="register" onSubmit={handleRegister} className="space-y-4">

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label htmlFor="regName" className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Họ và tên</label>
                                            <input type="text" id="regName"
                                                value={regName}
                                                onChange={(e) => setRegName(e.target.value)}
                                                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-sm"
                                                placeholder="Nguyễn Văn A" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="regEmail" className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Email</label>
                                            <input type="email" id="regEmail"
                                                value={regEmail}
                                                onChange={(e) => setRegEmail(e.target.value)}
                                                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-sm"
                                                placeholder="name@example.com" required />
                                        </div>
                                        <div>
                                            <label htmlFor="regPhone" className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Số điện thoại</label>
                                            <input type="tel" id="regPhone"
                                                value={regPhone}
                                                onChange={(e) => setRegPhone(e.target.value)}
                                                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-sm"
                                                placeholder="0912 345 678" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="regPassword" className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Mật khẩu</label>
                                            <input type="password" id="regPassword"
                                                value={regPassword}
                                                onChange={(e) => setRegPassword(e.target.value)}
                                                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-sm"
                                                placeholder="••••••••" required />
                                        </div>
                                        <div>
                                            <label htmlFor="regConfirm" className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Nhập lại mật khẩu</label>
                                            <input type="password" id="regConfirm"
                                                value={regConfirm}
                                                onChange={(e) => setRegConfirm(e.target.value)}
                                                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-sm"
                                                placeholder="••••••••" required />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={regLoading}
                                        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-600/30 hover:shadow-teal-700/40 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 mt-4">
                                        {regLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Đang đăng ký...
                                            </span>
                                        ) : 'Hoàn tất Đăng ký'}
                                    </button>

                                    <p className="text-[11px] text-center text-slate-500 mt-4 leading-relaxed">
                                        Bằng việc đăng ký, bạn đồng ý với <a href="#"
                                            className="text-teal-600 hover:text-teal-700 hover:underline">Điều khoản dịch vụ</a> &nbsp;&amp;&nbsp;
                                        <a href="#" className="text-teal-600 hover:text-teal-700 hover:underline">Chính sách bảo
                                            mật</a>
                                    </p>
                                </form>

                                <p className="text-center text-sm text-slate-600 mt-auto pt-6">
                                    Đã có tài khoản?
                                    <button onClick={() => toggleForm('login')}
                                        className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-all ml-1">
                                        Đăng nhập ngay
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;