import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiVerifyEmail, apiResendOtp } from '../../../api.js';
import { useAuth } from '../../../context/AuthContext';

const VerifyEmail = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { setSessionFromOAuth } = useAuth();
    const email = params.get('email') || '';

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="bg-white rounded-2xl shadow-md px-8 py-10 max-w-md w-full text-center">
                    <p className="text-rose-600 font-semibold mb-3">Thiếu địa chỉ email</p>
                    <Link to="/login" className="text-teal-600 hover:underline">Quay lại đăng nhập</Link>
                </div>
            </div>
        );
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (otp.length !== 6) {
            setError('Mã xác nhận gồm 6 chữ số.');
            return;
        }
        setLoading(true);
        try {
            const data = await apiVerifyEmail(email, otp);
            setSuccess(data.message || 'Xác thực thành công!');
            if (data.access_token) {
                setTimeout(() => setSessionFromOAuth(data.access_token, 'USER'), 800);
            } else {
                setTimeout(() => navigate('/login', { replace: true }), 1200);
            }
        } catch (err) {
            setError(err.message || 'Mã xác nhận không đúng.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0) return;
        setError('');
        setSuccess('');
        setResending(true);
        try {
            await apiResendOtp(email);
            setSuccess('Đã gửi lại mã xác nhận.');
            setCooldown(60);
        } catch (err) {
            setError(err.message || 'Không thể gửi lại mã.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-inter">
            <div className="bg-white rounded-2xl shadow-xl px-8 py-10 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 mx-auto rounded-full bg-teal-100 flex items-center justify-center mb-3">
                        <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Xác thực email</h2>
                    <p className="text-sm text-slate-500">Nhập mã 6 chữ số đã gửi tới</p>
                    <p className="text-sm font-semibold text-slate-700">{email}</p>
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

                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-center text-2xl font-mono tracking-[0.5em] focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        placeholder="••••••"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-3 rounded-2xl shadow transition-colors"
                    >
                        {loading ? 'Đang xác thực...' : 'Xác nhận'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Không nhận được mã?{' '}
                    <button
                        onClick={handleResend}
                        disabled={cooldown > 0 || resending}
                        className="font-semibold text-teal-600 hover:text-teal-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                        {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : (resending ? 'Đang gửi...' : 'Gửi lại')}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <Link to="/login" className="text-sm text-slate-500 hover:text-teal-600">
                        ← Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
