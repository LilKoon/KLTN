import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { apiGetProfile, apiUpdateProfile, apiUploadAvatar, apiChangePassword, apiGetMySubscription, apiMyTransactions } from '../../../api';

export default function Profile() {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [isLoading, setIsLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState(null);
    const [alertType, setAlertType] = useState('success');
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [billingLoading, setBillingLoading] = useState(false);

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
            fetchStats();
            fetchBilling();
        }
    }, [token]);

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/path/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setStats(await res.json());
        } finally { setStatsLoading(false); }
    };

    const fetchBilling = async () => {
        setBillingLoading(true);
        try {
            const [sub, txns] = await Promise.all([
                apiGetMySubscription(token),
                apiMyTransactions(token),
            ]);
            setSubscription(sub);
            setTransactions(Array.isArray(txns) ? txns : []);
        } catch (error) {
            showAlert(error.message, 'error');
        } finally {
            setBillingLoading(false);
        }
    };

    const fmtMoney = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';
    const fmtDate = (iso) => {
        if (!iso) return 'Không giới hạn';
        try { return new Date(iso).toLocaleDateString('vi-VN'); } catch { return iso; }
    };
    const txnBadge = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
            case 'PENDING': return 'bg-amber-100 text-amber-700';
            case 'FAILED':
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

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
        { id: 'progress', label: 'Tiến độ học tập', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
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

                        {activeTab === 'progress' && (
                            <div className="p-8 sm:p-10 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 mb-2">Tiến độ học tập</h2>
                                <p className="text-slate-400 text-sm mb-8">Theo dõi hành trình chinh phục tiếng Anh của bạn</p>

                                {statsLoading ? (
                                    <div className="flex items-center justify-center h-48">
                                        <div className="w-10 h-10 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin" />
                                    </div>
                                ) : !stats ? (
                                    <div className="text-center py-16 text-slate-400">
                                        <p className="text-4xl mb-3">📊</p>
                                        <p className="font-medium">Chưa có dữ liệu. Hãy tạo lộ trình học tập!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">

                                        {/* KPI Cards */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Trạm hoàn thành', value: stats.path.completed, total: stats.path.total, icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                                { label: 'Tiến độ', value: `${stats.path.progress_pct}%`, icon: '🎯', color: 'text-sky-600', bg: 'bg-sky-50' },
                                                { label: 'Cấp độ', value: stats.path.level || '—', icon: '📈', color: 'text-amber-600', bg: 'bg-amber-50' },
                                                { label: 'Bài test đã làm', value: stats.total_quiz_attempts, icon: '📝', color: 'text-rose-600', bg: 'bg-rose-50' },
                                            ].map((kpi, i) => (
                                                <div key={i} className={`${kpi.bg} rounded-2xl p-5 flex flex-col gap-2`}>
                                                    <span className="text-2xl">{kpi.icon}</span>
                                                    <span className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</span>
                                                    {kpi.total && <span className="text-xs text-slate-400 font-medium">/ {kpi.total} trạm</span>}
                                                    <span className="text-xs font-bold text-slate-500">{kpi.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Overall Progress Bar */}
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="font-bold text-slate-700">Tiến độ tổng thể lộ trình</h3>
                                                <span className="text-sm font-bold text-slate-500">{stats.path.completed}/{stats.path.total} trạm</span>
                                            </div>
                                            <div className="w-full bg-white rounded-full h-4 border border-slate-200 overflow-hidden">
                                                <div
                                                    className="h-4 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-1000"
                                                    style={{ width: `${stats.path.progress_pct}%` }}
                                                />
                                            </div>
                                            <div className="flex gap-6 mt-4 text-xs font-medium text-slate-500">
                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Hoàn thành: {stats.path.completed}</span>
                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />Đang học: {stats.path.current}</span>
                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />Chưa mở: {stats.path.locked}</span>
                                            </div>
                                        </div>

                                        {/* Skill Breakdown */}
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            <h3 className="font-bold text-slate-700 mb-5">Phân tích từng kỹ năng</h3>
                                            <div className="space-y-5">
                                                {[
                                                    { key: 'GRAMMAR',    label: 'Ngữ pháp',   icon: '📝', bar: 'bg-rose-500',    light: 'bg-rose-100' },
                                                    { key: 'VOCABULARY', label: 'Từ vựng',    icon: '📚', bar: 'bg-emerald-500', light: 'bg-emerald-100' },
                                                    { key: 'LISTENING',  label: 'Kỹ năng nghe', icon: '🎧', bar: 'bg-sky-500',   light: 'bg-sky-100' },
                                                ].map(({ key, label, icon, bar, light }) => {
                                                    const d = stats.skill_breakdown[key] || { completed: 0, total: 0 };
                                                    const pct = d.total > 0 ? Math.round(d.completed / d.total * 100) : 0;
                                                    return (
                                                        <div key={key}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-base">{icon}</span>
                                                                    <span className="font-semibold text-slate-700 text-sm">{label}</span>
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-500">{d.completed}/{d.total} bài</span>
                                                            </div>
                                                            <div className={`w-full ${light} rounded-full h-3 overflow-hidden`}>
                                                                <div className={`h-3 ${bar} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Placement Scores */}
                                        {Object.keys(stats.placement_scores).length > 0 && (
                                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                                <h3 className="font-bold text-slate-700 mb-5">Điểm Test Đầu Vào</h3>
                                                <div className="grid grid-cols-3 gap-4">
                                                    {[
                                                        { key: 'GRAMMAR',    label: 'Ngữ pháp',   icon: '📝', color: 'text-rose-600',    bg: 'bg-rose-50',    bar: 'bg-rose-500' },
                                                        { key: 'VOCABULARY', label: 'Từ vựng',    icon: '📚', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
                                                        { key: 'LISTENING',  label: 'Nghe',       icon: '🎧', color: 'text-sky-600',     bg: 'bg-sky-50',     bar: 'bg-sky-500' },
                                                    ].map(({ key, label, icon, color, bg, bar }) => {
                                                        const score = stats.placement_scores[key] ?? null;
                                                        if (score === null) return null;
                                                        return (
                                                            <div key={key} className={`${bg} rounded-2xl p-4 text-center`}>
                                                                <p className="text-2xl mb-1">{icon}</p>
                                                                <p className={`text-3xl font-black ${color}`}>{score}<span className="text-sm text-slate-400">/10</span></p>
                                                                <p className="text-xs font-bold text-slate-500 mt-1">{label}</p>
                                                                <div className="mt-2 w-full bg-white rounded-full h-1.5">
                                                                    <div className={`h-1.5 rounded-full ${bar}`} style={{ width: `${score * 10}%` }} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Review History */}
                                        {stats.review_history.length > 0 && (
                                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                                <h3 className="font-bold text-slate-700 mb-5">Lịch sử Ôn tập & Kiểm tra</h3>
                                                <div className="space-y-3">
                                                    {stats.review_history.map((r, i) => (
                                                        <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-slate-100">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                                                                r.loai === 'FINAL_TEST' ? 'bg-slate-900' : 'bg-amber-100'
                                                            }`}>
                                                                {r.loai === 'FINAL_TEST' ? '🏆' : '🔄'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-slate-800 text-sm truncate">{r.tieu_de}</p>
                                                                <p className="text-xs text-slate-400">Số lần thử: {r.so_lan_thu}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                                <div className="text-right">
                                                                    <span className={`text-lg font-black ${
                                                                        r.diem >= 80 ? 'text-emerald-600' : 'text-amber-600'
                                                                    }`}>{r.diem}%</span>
                                                                </div>
                                                                <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                                                    r.trang_thai === 'COMPLETED'
                                                                        ? 'bg-emerald-100 text-emerald-700'
                                                                        : 'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                    {r.trang_thai === 'COMPLETED' ? 'Đạt' : 'Đang học'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'billing' && (
                            <div className="p-8 sm:p-10 animate-fade-in">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 mb-2">Gói thành viên</h2>
                                        <p className="text-slate-400 text-sm">Theo dõi gói hiện tại và lịch sử thanh toán</p>
                                    </div>
                                    <button onClick={() => navigate('/client/subscription')} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/20 transition-colors">
                                        Nâng cấp gói
                                    </button>
                                </div>

                                {billingLoading ? (
                                    <div className="flex items-center justify-center h-48">
                                        <div className="w-10 h-10 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="rounded-3xl p-6 bg-gradient-to-br from-teal-50 to-white border border-teal-100 shadow-sm">
                                            <p className="text-xs font-black text-teal-700 uppercase tracking-wider">Gói hiện tại</p>
                                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
                                                <div>
                                                    <h3 className="text-3xl font-black text-slate-900">{subscription?.info?.ten_goi || subscription?.plan || 'FREE'}</h3>
                                                    <p className="text-sm text-slate-500 mt-1">Hết hạn: {fmtDate(subscription?.expires_at)}</p>
                                                </div>
                                                <span className="inline-flex w-fit px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black uppercase">
                                                    {subscription?.plan || 'FREE'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {Object.entries(subscription?.usage || {}).map(([feat, usage]) => {
                                                const pct = usage.limit > 0 ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;
                                                const labelMap = { chatbot: 'Chatbot AI', ai_test: 'Tạo bài test', ai_flashcard: 'Tạo flashcard', learning_path: 'Lộ trình AI' };
                                                return (
                                                    <div key={feat} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <p className="text-sm font-bold text-slate-700">{labelMap[feat] || feat}</p>
                                                            <span className="text-xs font-bold text-slate-500">{usage.used}/{usage.limit}</span>
                                                        </div>
                                                        <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-100">
                                                            <div className={`h-full ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
                                                <h3 className="font-bold text-slate-800">Lịch sử giao dịch</h3>
                                            </div>
                                            {transactions.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400 font-medium">Chưa có giao dịch</div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left whitespace-nowrap">
                                                        <thead className="bg-white text-xs font-bold text-slate-500 uppercase">
                                                            <tr>
                                                                <th className="px-5 py-3">Ngày</th>
                                                                <th className="px-5 py-3">Gói</th>
                                                                <th className="px-5 py-3">Tháng</th>
                                                                <th className="px-5 py-3">Số tiền</th>
                                                                <th className="px-5 py-3">Trạng thái</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {transactions.map((txn) => (
                                                                <tr key={txn.MaGiaoDich} className="hover:bg-slate-50">
                                                                    <td className="px-5 py-3 text-sm text-slate-500">{fmtDate(txn.NgayTao)}</td>
                                                                    <td className="px-5 py-3 text-sm font-bold text-slate-800">{txn.Goi}</td>
                                                                    <td className="px-5 py-3 text-sm text-slate-600">{txn.SoThang}</td>
                                                                    <td className="px-5 py-3 text-sm font-bold text-slate-800">{fmtMoney(txn.SoTien)}</td>
                                                                    <td className="px-5 py-3">
                                                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${txnBadge(txn.TrangThai)}`}>{txn.TrangThai}</span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Other tabs placeholder */}
                        {activeTab !== 'personal' && activeTab !== 'security' && activeTab !== 'progress' && activeTab !== 'billing' && (
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
