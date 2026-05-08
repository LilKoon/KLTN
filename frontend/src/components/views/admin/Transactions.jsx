import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiAdminListTransactions, apiAdminConfirmTransaction } from '../../../api';

const STATUS_OPTS = [
    { value: '',          label: 'Tất cả' },
    { value: 'PENDING',   label: 'Chờ duyệt' },
    { value: 'COMPLETED', label: 'Đã thanh toán' },
    { value: 'FAILED',    label: 'Thất bại' },
    { value: 'CANCELLED', label: 'Huỷ' },
];

const badge = (s) => {
    switch (s) {
        case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'PENDING':   return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'FAILED':
        case 'CANCELLED': return 'bg-rose-100 text-rose-700 border-rose-200';
        default:          return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};

const fmtMoney = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';

export default function Transactions() {
    const { token } = useAuth();
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true); setError('');
        try {
            const data = await apiAdminListTransactions(token, { status: filter || undefined, limit: 200 });
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || 'Lỗi tải giao dịch');
        } finally {
            setLoading(false);
        }
    }, [token, filter]);

    useEffect(() => { load(); }, [load]);

    const update = async (id, status) => {
        try {
            await apiAdminConfirmTransaction(token, id, status);
            load();
        } catch (err) {
            alert(err?.message || 'Lỗi cập nhật');
        }
    };

    const total = items
        .filter(t => t.TrangThai === 'COMPLETED')
        .reduce((sum, t) => sum + (t.SoTien || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Giao dịch & Doanh thu</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Tổng đã thanh toán (theo bộ lọc): <span className="font-black text-slate-800">{fmtMoney(total)}</span></p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {STATUS_OPTS.map(o => (
                        <button key={o.value} onClick={() => setFilter(o.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === o.value ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                            {o.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ngày</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Người dùng</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Gói</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tháng</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Số tiền</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Phương thức</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-500 font-medium">Đang tải...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-500 font-medium">Không có giao dịch</td></tr>
                            ) : items.map((t) => (
                                <tr key={t.MaGiaoDich} className="hover:bg-slate-50/80">
                                    <td className="px-6 py-3 text-xs text-slate-500">{t.NgayTao ? new Date(t.NgayTao).toLocaleString('vi-VN') : ''}</td>
                                    <td className="px-6 py-3">
                                        <p className="text-sm font-bold text-slate-800">{t.TenNguoiDung}</p>
                                        <p className="text-xs text-slate-500">{t.Email}</p>
                                    </td>
                                    <td className="px-6 py-3 font-bold text-slate-700">{t.Goi}</td>
                                    <td className="px-6 py-3 text-slate-600">{t.SoThang}</td>
                                    <td className="px-6 py-3 font-bold text-slate-800">{fmtMoney(t.SoTien)}</td>
                                    <td className="px-6 py-3 text-xs font-bold uppercase text-slate-500">{t.PhuongThuc}</td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badge(t.TrangThai)}`}>{t.TrangThai}</span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        {t.TrangThai === 'PENDING' && (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button onClick={() => update(t.MaGiaoDich, 'COMPLETED')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700">Duyệt</button>
                                                <button onClick={() => update(t.MaGiaoDich, 'CANCELLED')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700">Huỷ</button>
                                            </div>
                                        )}
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
