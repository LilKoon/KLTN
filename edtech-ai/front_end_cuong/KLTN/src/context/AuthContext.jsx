import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiLogin, apiLoginGoogle, apiRegister, apiLogout } from '../api';

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

        const userData = { user_name: data.user_name, email };
        setToken(data.access_token);
        setUser(userData);
        setUserRole('client');

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_role', 'client');
        localStorage.setItem('user_data', JSON.stringify(userData));

        navigate('/client');
    };

    // Đăng nhập qua Google API
    const loginWithGoogleAPI = async (googleToken) => {
        const data = await apiLoginGoogle(googleToken);
        const userData = { user_name: data.user_name, email: data.email };
        
        setToken(data.access_token);
        setUser(userData);
        setUserRole('client');

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_role', 'client');
        localStorage.setItem('user_data', JSON.stringify(userData));

        navigate('/client');
    };

    // Đăng ký qua API
    const registerWithAPI = async (name, email, password, phone) => {
        const data = await apiRegister(name, email, password, phone);
        // data = { message, user_id }
        return data;
    };

    // Login dạng cũ (dùng cho admin hoặc mock)
    const login = (role) => {
        setUserRole(role);
        localStorage.setItem('user_role', role);
        if (role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/client');
        }
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
        <AuthContext.Provider value={{ userRole, token, user, login, loginWithAPI, loginWithGoogleAPI, registerWithAPI, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
