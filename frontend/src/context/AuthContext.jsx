import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiLogin, apiRegister, apiLogout, apiGetProfile } from '../api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Khởi tạo state đồng bộ từ localStorage để tránh bị văng ra ngoài khi F5
    const initialToken = localStorage.getItem('access_token') || null;
    const initialRole = localStorage.getItem('user_role') || null;
    let initialUser = null;
    try {
        const savedUser = localStorage.getItem('user_data');
        if (savedUser) initialUser = JSON.parse(savedUser);
    } catch {}

    const [userRole, setUserRole] = useState(initialRole); // 'client' or 'admin'
    const [token, setToken] = useState(initialToken);
    const [user, setUser] = useState(initialUser); // { user_name, email, ... }
    const navigate = useNavigate();

    // Đăng nhập qua API
    const loginWithAPI = async (email, password) => {
        const data = await apiLogin(email, password);
        // data = { access_token, token_type, user_name }

        const profile = await apiGetProfile(data.access_token);
        const role = (profile?.VaiTro || '').toUpperCase() === 'ADMIN' ? 'admin' : 'client';

        const userData = { user_name: data.user_name || profile?.TenNguoiDung, email };
        setToken(data.access_token);
        setUser(userData);
        setUserRole(role);

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_data', JSON.stringify(userData));

        if (role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/client');
        }
    };

    // Đăng nhập admin qua API + kiểm tra VaiTro=ADMIN
    const loginAdmin = async (email, password) => {
        try {
            const data = await apiLogin(email, password);
            const profile = await apiGetProfile(data.access_token);
            if ((profile?.VaiTro || '').toUpperCase() !== 'ADMIN') {
                return { success: false, error: 'Tài khoản không có quyền quản trị' };
            }
            const userData = { user_name: data.user_name || profile.TenNguoiDung, email };
            setToken(data.access_token);
            setUser(userData);
            setUserRole('admin');
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user_role', 'admin');
            localStorage.setItem('user_data', JSON.stringify(userData));
            navigate('/admin');
            return { success: true };
        } catch (err) {
            return { success: false, error: err?.message || 'Đăng nhập thất bại' };
        }
    };

    // Lưu phiên đăng nhập sau khi backend chuyển hướng về với token (Google OAuth code flow)
    const setSessionFromOAuth = (accessToken, role) => {
        const normalizedRole = (role || '').toLowerCase() === 'admin' ? 'admin' : 'client';
        const userData = {};
        setToken(accessToken);
        setUser(userData);
        setUserRole(normalizedRole);

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user_role', normalizedRole);
        localStorage.setItem('user_data', JSON.stringify(userData));

        navigate(normalizedRole === 'admin' ? '/admin' : '/client');
    };

    // Đăng ký qua API
    const registerWithAPI = async (name, email, password, phone) => {
        const data = await apiRegister(name, email, password, phone);
        // data = { message, user_id }
        return data;
    };

    // Login đa mục đích: dùng cho cả client (gọi API) và admin (kiểm tra role).
    // Signature mới: login(role, email?, password?)
    const login = async (role, email, password) => {
        if (role === 'admin') {
            return await loginAdmin(email, password);
        }
        if (email && password) {
            try {
                await loginWithAPI(email, password);
                return { success: true };
            } catch (err) {
                return { success: false, error: err?.message || 'Đăng nhập thất bại' };
            }
        }
        // Fallback (mock) khi không có credentials
        setUserRole(role);
        localStorage.setItem('user_role', role);
        navigate(role === 'admin' ? '/admin' : '/client');
        return { success: true };
    };

    const logout = async () => {
        if (token) {
            try {
                await apiLogout(token);
            } catch (err) {
                console.error("Lỗi khi gọi API đăng xuất:", err);
            }
        }
        setUserRole(null);
        setToken(null);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ userRole, token, user, login, loginAdmin, loginWithAPI, setSessionFromOAuth, registerWithAPI, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
