import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiGetProfile, apiUpdateProfile, apiUploadAvatar } from '../../../api';

export default function Profile() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        avatar: ''
    });

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await apiGetProfile(token);
            setProfile({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                bio: data.bio || '',
                avatar: data.avatar ? (data.avatar.startsWith('http') ? data.avatar : `http://localhost:8000${data.avatar}`) : ''
            });
        } catch (err) {
            setError('Không thể tải thông tin cá nhân.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (profile.phone) {
            const phoneRegex = /^0\d{9}$/;
            if (!phoneRegex.test(profile.phone)) {
                setError('Số điện thoại không hợp lệ.');
                return;
            }
        }

        setSaving(true);
        try {
            await apiUpdateProfile(token, profile);
            setMessage('Lưu thay đổi thành công!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Lưu thay đổi thất bại.');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setSaving(true);
            const data = await apiUploadAvatar(token, file);
            setProfile(prev => ({ ...prev, avatar: 'http://localhost:8000' + data.avatarUrl }));
            setMessage("Cập nhật ảnh đại diện thành công!");
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Cập nhật ảnh đại diện thất bại.');
        } finally {
            setSaving(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const triggerFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const menuItems = [
        { id: 'personal', label: 'Thông tin cá nhân', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
        { id: 'security', label: 'Bảo mật & Mật khẩu', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
        { id: 'notifications', label: 'Cài đặt thông báo', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
        { id: 'billing', label: 'Gói thành viên', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-inter">
                <p className="text-slate-500 font-medium">Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-4 sm:p-6 lg:p-12">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Quản lý hồ sơ</h1>
                    <p className="text-slate-500 font-medium">Cập nhật thông tin tài khoản và cài đặt bảo mật của bạn</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-slate-100 flex flex-col gap-2 sticky top-6">
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === item.id
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

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">

                        {/* Tab Content: Personal Info */}
                        {activeTab === 'personal' && (
                            <div className="p-8 sm:p-10 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Thông tin cá nhân</h2>

                                {message && (
                                    <div className="mb-6 p-4 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl text-sm font-medium">
                                        {message}
                                    </div>
                                )}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                {/* Avatar Upload Section */}
                                <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden shadow-inner border-4 border-white">
                                            <img src={profile.avatar || "https://i.pravatar.cc/150?img=11"} alt="Avatar" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".jpg,.jpeg,.png,.gif"
                                            onChange={handleFileChange}
                                        />
                                        <button
                                            onClick={triggerFileSelect}
                                            disabled={saving}
                                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors mb-2 disabled:opacity-50">
                                            {saving ? "Đang tải ảnh..." : "Thay đổi ảnh đại diện"}
                                        </button>
                                        <p className="text-xs text-slate-400 font-medium">Định dạng JPG, GIF hoặc PNG. Tối đa 5MB.</p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <form className="space-y-6" onSubmit={handleSave}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="sm:col-span-2 text-left">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Họ và tên</label>
                                            <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-800" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Email</label>
                                            <input type="email" value={profile.email} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Số điện thoại</label>
                                            <input type="tel" name="phone" value={profile.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-800" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Giới thiệu ngắn (Tiểu sử)</label>
                                        <textarea rows="4" name="bio" value={profile.bio} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-800 resize-none" placeholder="Viết vài dòng giới thiệu về bạn..."></textarea>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button type="submit" disabled={saving} className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-teal-600/30 hover:shadow-teal-700/40 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Tab Content: Placeholder for others */}
                        {activeTab !== 'personal' && (
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

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
