import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Search, Edit3, Lock, Unlock, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Accounts() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('Tất cả');
    
    // State cho Modal Chỉnh sửa
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        TenNguoiDung: '',
        Email: '',
        MatKhau: '',
        VaiTro: '',
        TrangThai: ''
    });

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users?search=${searchTerm}&role=${roleFilter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error("Lỗi khi tải người dùng:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchUsers();
    }, [token, roleFilter]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') fetchUsers();
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setEditForm({
            TenNguoiDung: user.TenNguoiDung,
            Email: user.Email,
            MatKhau: '', // Không hiển thị mật khẩu cũ
            VaiTro: user.VaiTro,
            TrangThai: user.TrangThai
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users/${editingUser.MaNguoiDung}`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                setIsEditModalOpen(false);
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.detail || "Cập nhật thất bại");
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật người dùng:", err);
        }
    };

    const toggleUserStatus = async (user) => {
        const newStatus = user.TrangThai === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users/${user.MaNguoiDung}`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ TrangThai: newStatus })
            });
            if (res.ok) fetchUsers();
        } catch (err) {
            console.error("Lỗi khi thay đổi trạng thái:", err);
        }
    };

    const getStatusStyles = (status) => {
        switch(status) {
            case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'BLOCKED': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Người Dùng</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Danh sách tất cả tài khoản hiện có trên hệ thống</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-in" style={{ opacity: 0 }}>
                <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Tìm tên hoặc email... (Enter)" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                        className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer w-full sm:w-auto"
                    >
                        <option value="Tất cả">Tất cả vai trò</option>
                        <option value="USER">Học viên</option>
                        <option value="QuanLy">Quản trị viên</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người dùng</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gói</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hoạt động cuối</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-bold">Đang tải danh sách...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-bold">Không tìm thấy người dùng</td></tr>
                            ) : users.map((user) => (
                                <tr key={user.MaNguoiDung} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
                                                {user.TenNguoiDung.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{user.TenNguoiDung}</p>
                                                <p className="text-xs font-medium text-slate-500">{user.Email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                        {user.VaiTro === 'QuanLy' || user.VaiTro === 'ADMIN' ? 'Quản trị viên' : 'Học viên'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const goi = (user.GoiDangKy || 'FREE').toUpperCase();
                                            const expired = user.GoiHetHan && new Date(user.GoiHetHan) < new Date();
                                            const eff = expired ? 'FREE' : goi;
                                            const cls = eff === 'ULTRA' ? 'bg-violet-100 text-violet-700' : eff === 'PRO' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600';
                                            return (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${cls}`}>{eff}</span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyles(user.TrangThai)}`}>
                                            {user.TrangThai}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-500">
                                            {user.LastActive ? new Date(user.LastActive).toLocaleString() : 'Chưa có dữ liệu'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openEditModal(user)}
                                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa chi tiết"
                                            >
                                                <Edit3 className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => toggleUserStatus(user)}
                                                className={`p-2 rounded-lg transition-colors ${user.TrangThai === 'ACTIVE' ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                title={user.TrangThai === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                            >
                                                {user.TrangThai === 'ACTIVE' ? (
                                                    <Lock className="w-5 h-5" />
                                                ) : (
                                                    <Unlock className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Chỉnh sửa */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative z-10 animate-slide-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Chỉnh sửa người dùng</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Họ và tên</label>
                                <input 
                                    type="text" 
                                    required
                                    value={editForm.TenNguoiDung}
                                    onChange={(e) => setEditForm({...editForm, TenNguoiDung: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email</label>
                                <input 
                                    type="email" 
                                    required
                                    value={editForm.Email}
                                    onChange={(e) => setEditForm({...editForm, Email: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Mật khẩu mới (để trống nếu không đổi)</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={editForm.MatKhau}
                                    onChange={(e) => setEditForm({...editForm, MatKhau: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Vai trò</label>
                                    <select 
                                        value={editForm.VaiTro}
                                        onChange={(e) => setEditForm({...editForm, VaiTro: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                                    >
                                        <option value="USER">Học viên</option>
                                        <option value="QuanLy">Quản trị viên</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Trạng thái</label>
                                    <select 
                                        value={editForm.TrangThai}
                                        onChange={(e) => setEditForm({...editForm, TrangThai: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                                    >
                                        <option value="ACTIVE">Hoạt động</option>
                                        <option value="BLOCKED">Đã khóa</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/20 transition-all mt-4"
                            >
                                Lưu thay đổi
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
