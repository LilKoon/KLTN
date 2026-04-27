import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const OAuthCallback = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { setSessionFromOAuth } = useAuth();
    const handledRef = useRef(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (handledRef.current) return;
        handledRef.current = true;

        const token = params.get('token');
        const role = params.get('role');
        const error = params.get('error');

        if (error) {
            setErrorMsg('Đăng nhập Google thất bại. Vui lòng thử lại.');
            setTimeout(() => navigate('/login', { replace: true }), 1500);
            return;
        }

        if (!token) {
            setErrorMsg('Thiếu token đăng nhập.');
            setTimeout(() => navigate('/login', { replace: true }), 1500);
            return;
        }

        setSessionFromOAuth(token, role);
    }, [params, navigate, setSessionFromOAuth]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-inter">
            <div className="bg-white rounded-2xl shadow-md px-8 py-10 text-center max-w-sm w-full">
                {errorMsg ? (
                    <>
                        <div className="text-rose-600 font-semibold mb-2">Đăng nhập thất bại</div>
                        <p className="text-sm text-slate-500">{errorMsg}</p>
                    </>
                ) : (
                    <>
                        <svg className="animate-spin h-8 w-8 text-teal-600 mx-auto mb-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-slate-700 font-medium">Đang hoàn tất đăng nhập...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OAuthCallback;
