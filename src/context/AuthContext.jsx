import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userRole, setUserRole] = useState(null); // 'client' or 'admin'
    const navigate = useNavigate();

    const login = (role) => {
        setUserRole(role);
        if (role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/client');
        }
    };

    const logout = () => {
        setUserRole(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
