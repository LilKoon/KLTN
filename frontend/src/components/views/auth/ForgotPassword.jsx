import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiForgotPassword, apiVerifyResetOtp, apiResetPassword } from '../../../api.js';

const STEP = { EMAIL: 1, OTP: 2, RESET: 3 };

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(STEP.EMAIL);

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const submitEmail = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Email không hợp lệ.');
            return;
        }
        setLoading(true);
        try {
            await apiForgotPassword(email);
            setSuccess('Mã xác nhận đã được gửi tới email của bạn.');
            setCooldown(60);
            setStep(STEP.OTP);
        } catch (err) {
            setError(err.message || 'Không thể gửi mã.');
        } finally {
            setLoading(false);
        }
    };

    const submitOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (otp.length !== 6) {
            setError('Mã xác nhận gồm 6 chữ số.');
            return;
        }
        setLoading(true);
        try {
            await apiVerifyResetOtp(email, otp);
            setStep(STEP.RESET);
        } catch (err) {
            setError(err.message || 'Sai mã xác nhận.');
        } finally {
            setLoading(false);
        }
    };

    const submitReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu nhập lại không khớp.');
            return;
        }
        setLoading(true);
        try {
            await apiResetPassword(email, otp, newPassword);
            setSuccess('Đặt lại mật khẩu thành công! Đang chuyển tới đăng nhập...');
            setTimeout(() => navigate('/login', { replace: true }), 1500);
        } catch (err) {
            setError(err.message || 'Không thể đặt lại mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        if (cooldown > 0) return;
        setError('');
        setSuccess('');
        try {
            await apiForgotPassword(email);
            setSuccess('Đã gửi lại mã xác nhận.');
            setCooldown(60);
        } catch (err) {
            setError(err.message || 'Không thể gửi lại mã.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-inter">
            <div className="bg-white rounded-2xl shadow-xl px-8 py-10 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 flex items-center justify-center mb-3">
                        <svg className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.74 5.74L13 14l-1.5 1.5L9 13H7v2H5v2H3v-2.59c0-.53.21-1.04.59-1.41l5.17-5.17A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Quên mật khẩu</h2>
                    <p className="text-sm text-slate-500">
                        {step === STEP.EMAIL && 'Nhập email để nhận mã xác nhận'}
                        {step === STEP.OTP && `Nhập mã 6 chữ số đã gửi tới ${email}`}
                        {step === STEP.RESET && 'Đặt mật khẩu mới cho tài khoản'}
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3].map(n => (
                        <div key={n} className={`h-1.5 flex-1 rounded-full ${step >= n ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    ))}
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium text-center">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600 font-medium text-center">
                        {success}
                    </div>
                )}

                {step === STEP.EMAIL && (
                    <form onSubmit={submitEmail} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="name@example.com"
                                autoFocus
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-3 rounded-2xl shadow">
                            {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                        </button>
                    </form>
                )}

                {step === STEP.OTP && (
                    <form onSubmit={submitOtp} className="space-y-4">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-center text-2xl font-mono tracking-[0.5em] focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="••••••"
                            autoFocus
                        />
                        <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-3 rounded-2xl shadow">
                            {loading ? 'Đang kiểm tra...' : 'Xác nhận mã'}
                        </button>
                        <div className="text-center text-sm text-slate-500">
                            Không nhận được mã?{' '}
                            <button
                                type="button"
                                onClick={resendOtp}
                                disabled={cooldown > 0}
                                className="font-semibold text-teal-600 hover:text-teal-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại'}
                            </button>
                        </div>
                    </form>
                )}

                {step === STEP.RESET && (
                    <form onSubmit={submitReset} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="••••••••"
                                autoFocus
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nhập lại mật khẩu</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-3 rounded-2xl shadow">
                            {loading ? 'Đang lưu...' : 'Đặt mật khẩu mới'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-slate-500 hover:text-teal-600">
                        ← Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
