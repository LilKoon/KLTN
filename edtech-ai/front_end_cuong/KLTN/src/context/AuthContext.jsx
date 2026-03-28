import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiLogin, apiRegister } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userRole, setUserRole] = useState(null); // 'client' or 'admin'
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null); // { user_name, email, ... }
    const navigate = useNavigate();

    // Khôi phục session từ localStorage khi load trang
    useEffect(() => {
        const savedToken = localStorage.getItem('access_token');
        const savedRole = localStorage.getItem('user_role');
        const savedUser = localStorage.getItem('user_data');
        if (savedToken && savedRole) {
            setToken(savedToken);
            setUserRole(savedRole);
            if (savedUser) {
                try { setUser(JSON.parse(savedUser)); } catch {}
            }
        }
    }, []);

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

    // Đăng ký qua API
    const registerWithAPI = async (name, email, password) => {
        const data = await apiRegister(name, email, password);
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

    const logout = () => {
        setUserRole(null);
        setToken(null);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ userRole, token, user, login, loginWithAPI, registerWithAPI, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
