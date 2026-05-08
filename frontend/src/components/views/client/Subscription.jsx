import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiGetPlans, apiGetMySubscription, apiUpgradePlan, apiMyTransactions } from '../../../api';
import { Check, Sparkles, Zap, Crown, X, CreditCard, Building2, Wallet } from 'lucide-react';

const PLAN_STYLE = {
  FREE:  { Icon: Sparkles, color: 'slate',   accent: 'bg-slate-600',   ring: 'ring-slate-200' },
  PRO:   { Icon: Zap,      color: 'teal',    accent: 'bg-teal-600',    ring: 'ring-teal-300' },
  ULTRA: { Icon: Crown,    color: 'violet',  accent: 'bg-violet-600',  ring: 'ring-violet-300' },
};

const PAYMENT_METHODS = [
  { value: 'CARD',     label: 'Thẻ tín dụng/ghi nợ', Icon: CreditCard, note: 'Thanh toán ngay (sandbox)' },
  { value: 'MOMO',     label: 'Ví MoMo',            Icon: Wallet,     note: 'Thanh toán qua MoMo' },
  { value: 'ZALOPAY',  label: 'ZaloPay',            Icon: Wallet,     note: 'Thanh toán qua ZaloPay' },
  { value: 'BANK',     label: 'Chuyển khoản',       Icon: Building2,  note: 'Admin xác nhận thủ công' },
];

const fmtMoney = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';
const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString('vi-VN'); } catch { return iso; } };

export default function Subscription() {
    const { token } = useAuth();
    const [plans, setPlans] = useState({});
    const [my, setMy] = useState(null);
    const [txns, setTxns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal upgrade
    const [openPlan, setOpenPlan] = useState(null);
    const [months, setMonths] = useState(1);
    const [method, setMethod] = useState('CARD');
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const loadAll = useCallback(async () => {
        if (!token) return;
        setLoading(true); setError('');
        try {
            const [p, m, t] = await Promise.all([
                apiGetPlans(),
                apiGetMySubscription(token),
                apiMyTransactions(token),
            ]);
            setPlans(p || {});
            setMy(m);
            setTxns(Array.isArray(t) ? t : []);
        } catch (err) {
            setError(err?.message || 'Không tải được dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { loadAll(); }, [loadAll]);

    const submitUpgrade = async () => {
        if (!openPlan) return;
        setSubmitting(true); setError(''); setSuccessMsg('');
        try {
            const res = await apiUpgradePlan(token, {
                goi: openPlan,
                so_thang: months,
                phuong_thuc: method,
            });
            if (res.TrangThai === 'COMPLETED') {
                setSuccessMsg(`Đã nâng cấp lên ${res.Goi} thành công!`);
            } else {
                setSuccessMsg(`Đã ghi nhận giao dịch (${res.TrangThai}). Vui lòng chờ admin xác nhận.`);
            }
            setOpenPlan(null);
            loadAll();
        } catch (err) {
            setError(err?.message || 'Lỗi nâng cấp');
        } finally {
            setSubmitting(false);
        }
    };

    const txnBadge = (s) => {
        switch (s) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
            case 'PENDING':   return 'bg-amber-100 text-amber-700';
            case 'FAILED':
            case 'CANCELLED': return 'bg-rose-100 text-rose-700';
            default:          return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-8">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Nâng cấp Gói Học Tập</h1>
                <p className="text-slate-500 text-sm mt-1">Chọn gói phù hợp để mở rộng giới hạn AI: chatbot, tạo bài test, flashcard, lộ trình</p>
            </div>

            {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>}
            {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold">{successMsg}</div>}

            {/* Current plan + usage */}
            {my && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gói hiện tại</p>
                            <h2 className="text-2xl font-black text-slate-800 mt-1">{my.info?.ten_goi || my.plan}</h2>
                            {my.expires_at && <p className="text-xs text-slate-500 mt-1">Hết hạn: {fmtDate(my.expires_at)}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                        {Object.entries(my.usage || {}).map(([feat, u]) => {
                            const pct = u.limit > 0 ? Math.min(100, Math.round(u.used / u.limit * 100)) : 0;
                            const labelMap = { chatbot: 'Chatbot', ai_test: 'Bài test', ai_flashcard: 'Flashcard', learning_path: 'Lộ trình' };
                            return (
                                <div key={feat} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-500">{labelMap[feat] || feat}</p>
                                    <p className="text-lg font-black text-slate-800">{u.used}<span className="text-sm font-medium text-slate-400">/{u.limit}</span></p>
                                    <div className="h-1.5 mt-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className={`h-full ${pct >= 90 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['FREE', 'PRO', 'ULTRA'].map((key) => {
                    const plan = plans[key];
                    if (!plan) return null;
                    const meta = PLAN_STYLE[key];
                    const Icon = meta.Icon;
                    const isCurrent = my?.plan === key;
                    const popular = key === 'PRO';
                    return (
                        <div key={key} className={`relative bg-white rounded-3xl p-7 border-2 transition-all ${isCurrent ? `${meta.ring} ring-4` : 'border-slate-100 hover:border-slate-200'} ${popular ? 'shadow-2xl shadow-teal-200/40 -translate-y-1' : 'shadow-sm'}`}>
                            {popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                    Phổ biến
                                </div>
                            )}
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${meta.accent} text-white shadow-md`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mt-4">{plan.ten_goi}</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1 min-h-[40px]">{plan.mo_ta}</p>
                            <div className="mt-4">
                                <span className="text-3xl font-black text-slate-900">{fmtMoney(plan.gia_thang)}</span>
                                <span className="text-sm font-medium text-slate-400"> / tháng</span>
                            </div>
                            <ul className="mt-5 space-y-2.5">
                                {plan.tinh_nang.map((t, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                        <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" strokeWidth={3} />
                                        <span>{t}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => key !== 'FREE' && !isCurrent && setOpenPlan(key)}
                                disabled={key === 'FREE' || isCurrent}
                                className={`w-full mt-6 py-3 rounded-xl font-bold text-sm transition-all ${
                                    isCurrent
                                        ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                        : key === 'FREE'
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : `${meta.accent} text-white hover:brightness-110 shadow-lg`
                                }`}
                            >
                                {isCurrent ? 'Đang sử dụng' : key === 'FREE' ? 'Gói mặc định' : 'Nâng cấp ngay'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Transaction history */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Lịch sử giao dịch</h3>
                </div>
                {loading ? (
                    <div className="p-10 text-center text-slate-500 font-medium">Đang tải...</div>
                ) : txns.length === 0 ? (
                    <div className="p-10 text-center text-slate-500 font-medium">Chưa có giao dịch</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr className="text-xs font-bold text-slate-500 uppercase">
                                <th className="px-6 py-3">Ngày</th>
                                <th className="px-6 py-3">Gói</th>
                                <th className="px-6 py-3">Tháng</th>
                                <th className="px-6 py-3">Số tiền</th>
                                <th className="px-6 py-3">Phương thức</th>
                                <th className="px-6 py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {txns.map((t) => (
                                <tr key={t.MaGiaoDich} className="hover:bg-slate-50/80">
                                    <td className="px-6 py-3 text-sm text-slate-500">{fmtDate(t.NgayTao)}</td>
                                    <td className="px-6 py-3 font-bold text-slate-800">{t.Goi}</td>
                                    <td className="px-6 py-3 text-slate-600">{t.SoThang}</td>
                                    <td className="px-6 py-3 font-bold text-slate-800">{fmtMoney(t.SoTien)}</td>
                                    <td className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">{t.PhuongThuc}</td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${txnBadge(t.TrangThai)}`}>
                                            {t.TrangThai}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Upgrade modal */}
            {openPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-800">Nâng cấp lên {openPlan}</h2>
                            <button onClick={() => setOpenPlan(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="text-sm font-bold text-slate-700">Số tháng</label>
                                <div className="mt-2 grid grid-cols-4 gap-2">
                                    {[1, 3, 6, 12].map(n => (
                                        <button key={n} type="button" onClick={() => setMonths(n)}
                                            className={`px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${months === n ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                            {n} tháng
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700">Phương thức thanh toán</label>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {PAYMENT_METHODS.map(({ value, label, Icon, note }) => {
                                        const active = method === value;
                                        return (
                                            <button key={value} type="button" onClick={() => setMethod(value)}
                                                className={`p-3 rounded-xl border-2 text-left transition-all ${active ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`w-5 h-5 ${active ? 'text-teal-700' : 'text-slate-500'}`} />
                                                    <span className={`font-bold text-sm ${active ? 'text-teal-700' : 'text-slate-700'}`}>{label}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-1">{note}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-600">Tổng cộng</span>
                                <span className="text-xl font-black text-slate-900">
                                    {fmtMoney((plans[openPlan]?.gia_thang || 0) * months)}
                                </span>
                            </div>
                            <button
                                onClick={submitUpgrade}
                                disabled={submitting}
                                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-600/30 disabled:opacity-50"
                            >
                                {submitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
