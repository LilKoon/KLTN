import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiGetProfile, apiUpdateProfile, apiUploadAvatar, apiChangePassword } from '../../../api';

export default function Profile() {
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [isLoading, setIsLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState(null);
    const [alertType, setAlertType] = useState('success');
    
    // Personal Info State
    const [profile, setProfile] = useState({
        TenNguoiDung: '',
        Email: '',
        SoDienThoai: '',
        TieuSu: '',
        AvatarUrl: ''
    });
    
    // Password State
    const [passwords, setPasswords] = useState({
        current: '',
        newPass: '',
        confirm: ''
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const fileInputRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const data = await apiGetProfile(token);
            setProfile(data);
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };

    const showAlert = (msg, type = 'success') => {
        setAlertMsg(msg);
        setAlertType(type);
        setTimeout(() => setAlertMsg(null), 3000);
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            setIsLoading(true);
            const data = await apiUploadAvatar(token, file);
            setProfile(prev => ({ ...prev, AvatarUrl: data.AvatarUrl }));
            showAlert("Cập nhật ảnh đại diện thành công!");
        } catch (error) {
            showAlert(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await apiUpdateProfile(token, {
                TenNguoiDung: profile.TenNguoiDung,
                SoDienThoai: profile.SoDienThoai,
                TieuSu: profile.TieuSu
            });
            showAlert("Cập nhật thông tin thành công!");
        } catch (error) {
            showAlert(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwords.newPass !== passwords.confirm) {
            showAlert("Mật khẩu xác nhận không khớp", "error");
            return;
        }
        setShowConfirmModal(true);
    };

    const confirmChangePassword = async () => {
        setShowConfirmModal(false);
        try {
            setIsLoading(true);
            await apiChangePassword(token, passwords.current, passwords.newPass);
            showAlert("Đổi mật khẩu thành công!");
            setPasswords({ current: '', newPass: '', confirm: '' });
        } catch (error) {
            showAlert(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const menuItems = [
        { id: 'personal', label: 'Thông tin cá nhân', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
        { id: 'security', label: 'Bảo mật & Mật khẩu', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
        { id: 'notifications', label: 'Cài đặt thông báo', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
        { id: 'billing', label: 'Gói thành viên', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
    ];

    const getAvatarSrc = () => {
        if (profile.AvatarUrl) {
            return `${API_URL}${profile.AvatarUrl}`;
        }
        return "https://i.pravatar.cc/150?u=a042581f4e29026024d";
    };

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-4 sm:p-6 lg:p-12 relative">
            
            {/* Global Alert */}
            {alertMsg && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg border animate-fade-in ${alertType === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {alertType === 'success' ? (
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    <span className="font-semibold">{alertMsg}</span>
                </div>
            )}

            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Quản lý hồ sơ</h1>
                    <p className="text-slate-500 font-medium">Cập nhật thông tin tài khoản và cài đặt bảo mật của bạn</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-slate-100 flex flex-col gap-2 sticky top-6">
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                        activeTab === item.id
                                        ? 'bg-teal-50 text-teal-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                    }`}
                                >
                                    <span className={activeTab === item.id ? 'text-teal-600' : 'text-slate-400'}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        
                        {activeTab === 'personal' && (
                            <div className="p-8 sm:p-10 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Thông tin cá nhân</h2>
                                
                                <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden shadow-inner border-4 border-white">
                                            <img src={getAvatarSrc()} alt="Avatar" className="w-full h-full object-cover" />
                                        </div>
                                        <button onClick={handleAvatarClick} disabled={isLoading} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm hover:bg-teal-700 transition-colors border-2 border-white cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <button onClick={handleAvatarClick} disabled={isLoading} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors mb-2 cursor-pointer">
                                            Thay đổi ảnh đại diện
                                        </button>
                                        <p className="text-xs text-slate-400 font-medium">Định dạng JPG, GIF hoặc PNG. Tối đa 5MB.</p>
                                    </div>
                                </div>

                                <form className="space-y-6" onSubmit={handleSaveProfile}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Họ và tên</label>
                                            <input type="text" value={profile.TenNguoiDung} onChange={(e) => setProfile({...profile, TenNguoiDung: e.target.value})} required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-800" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Số điện thoại</label>
                                            <input type="tel" value={profile.SoDienThoai || ''} onChange={(e) => setProfile({...profile, SoDienThoai: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-800" />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Email (Không thể thay đổi)</label>
                                        <input type="email" value={profile.Email} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Giới thiệu ngắn (Tiểu sử)</label>
                                        <textarea rows="4" value={profile.TieuSu || ''} onChange={(e) => setProfile({...profile, TieuSu: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-800 resize-none" placeholder="Viết vài dòng giới thiệu về bạn..."></textarea>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button type="submit" disabled={isLoading} className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/30 hover:shadow-teal-700/40 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 cursor-pointer disabled:opacity-70">
                                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="p-8 sm:p-10 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Bảo mật & Mật khẩu</h2>
                                
                                <form className="space-y-6 max-w-md" onSubmit={handleChangePasswordSubmit}>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Mật khẩu hiện tại</label>
                                        <input type="password" required value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-800" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Mật khẩu mới</label>
                                        <input type="password" required minLength={6} value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-800" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Xác nhận mật khẩu mới</label>
                                        <input type="password" required minLength={6} value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-800" />
                                    </div>

                                    <div className="pt-4">
                                        <button type="submit" disabled={isLoading} className="px-8 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl shadow-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 cursor-pointer disabled:opacity-70">
                                            Cập nhật mật khẩu
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Other tabs placeholder */}
                        {activeTab !== 'personal' && activeTab !== 'security' && (
                            <div className="p-8 sm:p-10 h-64 flex flex-col items-center justify-center text-center animate-fade-in">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Tính năng đang phát triển</h3>
                                <p className="text-sm font-medium text-slate-500">Mục cài đặt này đang được cập nhật và sẽ sớm ra mắt.</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Confirm Password Change Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-fade-in">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-5 mx-auto">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Xác nhận đổi mật khẩu</h3>
                        <p className="text-slate-500 text-center mb-6 text-sm">
                            Bạn có chắc chắn muốn thay đổi mật khẩu? Bạn sẽ phải sử dụng mật khẩu mới trong những lần đăng nhập sau.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer">
                                Hủy bỏ
                            </button>
                            <button onClick={confirmChangePassword} disabled={isLoading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-70">
                                {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
