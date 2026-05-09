import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiGetPlans, apiGetMySubscription, apiUpgradePlan } from '../../../api';
import { Check, Sparkles, Zap, Crown, X, CreditCard, Building2, Wallet, QrCode, Lock, ShieldCheck } from 'lucide-react';

const PLAN_STYLE = {
  FREE:  { Icon: Sparkles, color: 'slate',   accent: 'bg-slate-600',   ring: 'ring-slate-200' },
  PRO:   { Icon: Zap,      color: 'teal',    accent: 'bg-teal-600',    ring: 'ring-teal-300' },
  ULTRA: { Icon: Crown,    color: 'violet',  accent: 'bg-violet-600',  ring: 'ring-violet-300' },
};

const TIER_RANK = { FREE: 0, PRO: 1, ULTRA: 2 };

const PAYMENT_METHODS = [
  { value: 'CARD',     label: 'Thẻ tín dụng/ghi nợ', Icon: CreditCard, note: 'Visa, Mastercard, JCB' },
  { value: 'MOMO',     label: 'Ví MoMo',            Icon: Wallet,     note: 'Quét QR MoMo' },
  { value: 'ZALOPAY',  label: 'ZaloPay',            Icon: Wallet,     note: 'Quét QR ZaloPay' },
  { value: 'BANK',     label: 'Chuyển khoản',       Icon: Building2,  note: 'QR Code Banking' },
];

const fmtMoney = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';
const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString('vi-VN'); } catch { return iso; } };

const formatCardNum = (v) => (v || '').replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
const formatExpiry = (v) => {
    const d = (v || '').replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export default function Subscription() {
    const { token } = useAuth();
    const [plans, setPlans] = useState({});
    const [my, setMy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [openPlan, setOpenPlan] = useState(null);
    const [months, setMonths] = useState(1);
    const [method, setMethod] = useState('CARD');
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

    const loadAll = useCallback(async () => {
        if (!token) return;
        setLoading(true); setError('');
        try {
            const [p, m] = await Promise.all([
                apiGetPlans(),
                apiGetMySubscription(token),
            ]);
            setPlans(p || {});
            setMy(m);
        } catch (err) {
            setError(err?.message || 'Không tải được dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { loadAll(); }, [loadAll]);

    const closeModal = () => {
        setOpenPlan(null);
        setMethod('CARD');
        setMonths(1);
        setCard({ number: '', name: '', expiry: '', cvv: '' });
        setError('');
    };

    const validateBeforeSubmit = () => {
        if (method === 'CARD') {
            const num = card.number.replace(/\s/g, '');
            if (num.length < 13) return 'Số thẻ không hợp lệ';
            if (!card.name.trim()) return 'Vui lòng nhập tên chủ thẻ';
            if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return 'Hạn thẻ phải dạng MM/YY';
            if (!/^\d{3,4}$/.test(card.cvv)) return 'CVV không hợp lệ';
        }
        return null;
    };

    const submitUpgrade = async () => {
        if (!openPlan) return;
        const v = validateBeforeSubmit();
        if (v) { setError(v); return; }
        setSubmitting(true); setError(''); setSuccessMsg('');
        try {
            const res = await apiUpgradePlan(token, {
                goi: openPlan,
                so_thang: months,
                phuong_thuc: method,
            });
            if (res.TrangThai === 'COMPLETED') {
                setSuccessMsg(`Thanh toán thành công! Đã nâng cấp lên gói ${res.Goi}.`);
            } else {
                setSuccessMsg(`Đã ghi nhận giao dịch (${res.TrangThai}). Vui lòng chờ admin xác nhận sau khi chuyển khoản.`);
            }
            closeModal();
            loadAll();
        } catch (err) {
            setError(err?.message || 'Lỗi nâng cấp');
        } finally {
            setSubmitting(false);
        }
    };

    const currentTier = my?.plan || 'FREE';
    const currentRank = TIER_RANK[currentTier] || 0;

    const totalAmount = (plans[openPlan]?.gia_thang || 0) * months;
    const qrPayload = openPlan ? `EDTECH-${openPlan}-${months}M-${totalAmount}-${(my?.info?.ten_goi || '')}` : '';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrPayload)}`;

    return (
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-8">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Nâng cấp Gói Học Tập</h1>
                <p className="text-slate-500 text-sm mt-1">Chọn gói phù hợp để mở rộng giới hạn AI: chatbot, tạo bài test, flashcard, lộ trình</p>
            </div>

            {error && !openPlan && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>}
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
                    const isCurrent = currentTier === key;
                    const planRank = TIER_RANK[key] || 0;
                    const isLowerThanCurrent = planRank > 0 && planRank < currentRank; // PRO khi user là ULTRA
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
                                onClick={() => key !== 'FREE' && !isCurrent && !isLowerThanCurrent && setOpenPlan(key)}
                                disabled={key === 'FREE' || isCurrent || isLowerThanCurrent}
                                className={`w-full mt-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                    isCurrent
                                        ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                        : isLowerThanCurrent
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : key === 'FREE'
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                : `${meta.accent} text-white hover:brightness-110 shadow-lg`
                                }`}
                            >
                                {isCurrent
                                    ? '✓ Đang sử dụng'
                                    : isLowerThanCurrent
                                        ? <><Lock className="w-4 h-4" /> Đã có gói cao hơn</>
                                        : key === 'FREE'
                                            ? 'Gói mặc định'
                                            : 'Nâng cấp ngay'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Transaction history */}
            {/* Upgrade modal */}
            {openPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-8">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-800">Nâng cấp lên {openPlan}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
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
                                            <button key={value} type="button" onClick={() => { setMethod(value); setError(''); }}
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

                            {/* CARD form inline */}
                            {method === 'CARD' && (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        <span className="text-xs font-bold">Thông tin thẻ được mã hoá an toàn</span>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 block mb-1">Số thẻ</label>
                                        <input
                                            type="text" inputMode="numeric"
                                            placeholder="1234 5678 9012 3456"
                                            value={card.number}
                                            onChange={(e) => setCard({ ...card, number: formatCardNum(e.target.value) })}
                                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono tracking-wider focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 block mb-1">Tên chủ thẻ</label>
                                        <input
                                            type="text"
                                            placeholder="NGUYEN VAN A"
                                            value={card.name}
                                            onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })}
                                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 block mb-1">Hạn thẻ</label>
                                            <input
                                                type="text" inputMode="numeric"
                                                placeholder="MM/YY"
                                                value={card.expiry}
                                                onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 block mb-1">CVV/CVC</label>
                                            <input
                                                type="password" inputMode="numeric" maxLength={4}
                                                placeholder="123"
                                                value={card.cvv}
                                                onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* QR for MOMO/ZALOPAY/BANK */}
                            {method !== 'CARD' && (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-slate-700 mb-3">
                                        <QrCode className="w-4 h-4 text-teal-600" />
                                        <span className="text-xs font-bold">
                                            {method === 'BANK' ? 'Quét QR để chuyển khoản' :
                                             method === 'MOMO' ? 'Mở app MoMo và quét QR' :
                                             'Mở app ZaloPay và quét QR'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="bg-white p-3 rounded-xl border-2 border-slate-200">
                                            <img src={qrUrl} alt="QR thanh toán" className="w-48 h-48" />
                                        </div>
                                        {method === 'BANK' && (
                                            <div className="text-xs text-slate-600 space-y-0.5 text-center">
                                                <p><span className="font-bold">Ngân hàng:</span> Vietcombank</p>
                                                <p><span className="font-bold">Số tài khoản:</span> 0123 456 789</p>
                                                <p><span className="font-bold">Chủ TK:</span> EDTECH AI VN</p>
                                                <p className="text-amber-700"><span className="font-bold">Nội dung:</span> {qrPayload}</p>
                                            </div>
                                        )}
                                        {method !== 'BANK' && (
                                            <p className="text-xs text-slate-500">
                                                Sau khi thanh toán, nhấn nút "Tôi đã thanh toán" để xác nhận
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="bg-teal-50 rounded-xl p-4 flex items-center justify-between border border-teal-100">
                                <span className="text-sm font-bold text-slate-600">Tổng cộng</span>
                                <span className="text-xl font-black text-teal-700">
                                    {fmtMoney(totalAmount)}
                                </span>
                            </div>

                            {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-sm font-semibold">{error}</div>}

                            <button
                                onClick={submitUpgrade}
                                disabled={submitting}
                                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting
                                    ? 'Đang xử lý...'
                                    : method === 'CARD'
                                        ? <><Lock className="w-4 h-4" /> Xác nhận thanh toán {fmtMoney(totalAmount)}</>
                                        : 'Tôi đã thanh toán'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
