import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    apiAdminListReviews,
    apiAdminModerateReview,
    apiAdminDeleteReview,
} from '../../../api';

const STATUS_FILTERS = [
    { value: '', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ duyệt' },
    { value: 'APPROVED', label: 'Đã duyệt' },
    { value: 'REJECTED', label: 'Đã từ chối' },
];

const badgeStyle = (s) => {
    switch (s) {
        case 'APPROVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'REJECTED': return 'bg-rose-100 text-rose-700 border-rose-200';
        default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
};

export default function ManageReviews() {
    const { token } = useAuth();
    const [filter, setFilter] = useState('');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError('');
        try {
            const data = await apiAdminListReviews(token, filter || undefined);
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || 'Không tải được đánh giá');
        } finally {
            setLoading(false);
        }
    }, [token, filter]);

    useEffect(() => { load(); }, [load]);

    const moderate = async (id, status) => {
        try {
            const updated = await apiAdminModerateReview(token, id, status);
            setReviews((prev) => prev.map((r) => (r.MaDanhGia === id ? updated : r)));
        } catch (err) { alert(err?.message || 'Lỗi'); }
    };

    const remove = async (id) => {
        if (!window.confirm('Xoá đánh giá này?')) return;
        try {
            await apiAdminDeleteReview(token, id);
            setReviews((prev) => prev.filter((r) => r.MaDanhGia !== id));
        } catch (err) { alert(err?.message || 'Lỗi'); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Đánh giá</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Duyệt phản hồi từ người dùng</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                filter === f.value
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Người gửi</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Đối tượng</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Điểm</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nội dung</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500 font-medium">Đang tải...</td></tr>
                            ) : reviews.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500 font-medium">Không có đánh giá</td></tr>
                            ) : reviews.map((r) => (
                                <tr key={r.MaDanhGia} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{r.MaNguoiDung?.slice(0, 8)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{r.LoaiDoiTuong || '-'}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-amber-600">{r.DiemDanhGia ?? '-'} / 5</td>
                                    <td className="px-6 py-4 text-sm text-slate-700 max-w-md truncate">{r.NoiDung}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badgeStyle(r.TrangThai)}`}>
                                            {r.TrangThai}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {r.TrangThai !== 'APPROVED' && (
                                                <button onClick={() => moderate(r.MaDanhGia, 'APPROVED')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700">Duyệt</button>
                                            )}
                                            {r.TrangThai !== 'REJECTED' && (
                                                <button onClick={() => moderate(r.MaDanhGia, 'REJECTED')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700">Từ chối</button>
                                            )}
                                            <button onClick={() => remove(r.MaDanhGia)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700">Xoá</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
