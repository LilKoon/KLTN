import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Attempt to load role/token from local storage on init
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const navigate = useNavigate();

    const login = async (role, email, password) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            // Connect to FastAPI Backend
            const response = await fetch('http://127.0.0.1:8000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Sai tài khoản hoặc mật khẩu');
            }

            const data = await response.json();
            
            // Save Token and State
            setToken(data.access_token);
            setUserRole(role);
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('userRole', role);

            if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/client');
            }
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    const registerAccount = async (name, email, password) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    TenNguoiDung: name,
                    MatKhau: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Email đã tồn tại hoặc lỗi đăng ký!');
            }
            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUserRole(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ userRole, token, login, logout, registerAccount }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
