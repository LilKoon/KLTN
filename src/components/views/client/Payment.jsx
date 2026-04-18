import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { plan, cycle } = location.state || { plan: 'pro', cycle: 'monthly' };

    const [paymentMethod, setPaymentMethod] = useState('qr'); // 'qr' or 'card'
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Order Details logic based on passed state
    const planDetails = {
        pro: {
            name: 'Pro',
            monthly: 149000,
            yearly: 1490000,
            color: 'teal'
        },
        premium: {
            name: 'Premium',
            monthly: 299000,
            yearly: 2990000,
            color: 'amber'
        }
    };

    const selectedPlan = planDetails[plan] || planDetails['pro'];
    const amount = cycle === 'monthly' ? selectedPlan.monthly : selectedPlan.yearly;
    const formattedAmount = new Intl.NumberFormat('vi-VN').format(amount);

    useEffect(() => {
        // If they navigate directly without state, we might want to redirect back to premium
        if (!location.state) {
            // Uncomment next line to enforce redirect if accessed directly
            // navigate('/client/premium');
        }
    }, [location.state, navigate]);

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate network request
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            
            // Redirect after success
            setTimeout(() => {
                navigate('/client/dashboard', { state: { upgradeSuccess: true, upgradedPlan: selectedPlan.name } });
            }, 3000);
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 font-inter">
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Thanh toán thành công!</h2>
                <p className="text-slate-500 mb-8 text-center max-w-md">
                    Cảm ơn bạn đã nâng cấp gói <span className="font-bold text-slate-800">{selectedPlan.name}</span>. Hành trình học tập ưu việt của bạn đã sẵn sàng.
                </p>
                <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400 mt-4">Đang chuyển hướng về trang chủ...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full font-inter">
            <button 
                onClick={() => navigate('/client/premium')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 text-sm font-medium"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại chọn gói
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Side: Order Summary */}
                <div className="lg:col-span-5 order-2 lg:order-1">
                    <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Tóm tắt đơn hàng</h3>
                        
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="font-bold text-slate-800 text-lg">
                                    Gói {selectedPlan.name} 
                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-md ${selectedPlan.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>
                                        {cycle === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}
                                    </span>
                                </p>
                                <p className="text-sm text-slate-500 mt-1">Truy cập toàn bộ tính năng</p>
                            </div>
                            <span className="font-bold text-slate-800">{formattedAmount} đ</span>
                        </div>

                        <div className="border-t border-slate-200 my-4 pt-4 flex justify-between items-center text-slate-500 text-sm">
                            <span>Thuế (0%)</span>
                            <span>0 đ</span>
                        </div>

                        <div className="border-t border-slate-200 my-4 pt-4 flex justify-between items-center">
                            <span className="font-bold text-slate-800">Tổng thanh toán</span>
                            <span className={`text-2xl font-black ${selectedPlan.color === 'amber' ? 'text-amber-600' : 'text-teal-600'}`}>
                                {formattedAmount} đ
                            </span>
                        </div>

                        {selectedPlan.name === 'Premium' && (
                            <div className="mt-8 bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
                                <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                                <p className="text-xs text-amber-700">
                                    <span className="font-bold">Đặc quyền Premium:</span> Sau khi thanh toán, tài khoản của bạn sẽ ngay lập tức mở khóa AI tạo Flashcard không giới hạn và tính năng tóm tắt độc quyền.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Payment Methods */}
                <div className="lg:col-span-7 order-1 lg:order-2">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Phương thức thanh toán</h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button 
                            onClick={() => setPaymentMethod('qr')}
                            className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
                                paymentMethod === 'qr' 
                                ? `border-${selectedPlan.color}-500 bg-${selectedPlan.color}-50 text-${selectedPlan.color}-700` 
                                : 'border-slate-200 hover:border-slate-300 text-slate-500'
                            }`}
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                            <span className="font-semibold text-sm">Chuyển khoản QR</span>
                        </button>
                        
                        <button 
                            onClick={() => setPaymentMethod('card')}
                            className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
                                paymentMethod === 'card' 
                                ? `border-${selectedPlan.color}-500 bg-${selectedPlan.color}-50 text-${selectedPlan.color}-700` 
                                : 'border-slate-200 hover:border-slate-300 text-slate-500'
                            }`}
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="font-semibold text-sm">Thẻ tín dụng</span>
                        </button>
                    </div>

                    {/* Payment Form Content */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                        {paymentMethod === 'qr' ? (
                            <div className="text-center py-4 relative z-10">
                                <p className="text-slate-600 mb-6 text-sm">Mở ứng dụng ngân hàng và quét mã để thanh toán tự động</p>
                                <div className="inline-block p-4 bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">
                                    <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300">
                                        <span className="text-slate-400 text-sm font-semibold">Mã QR Giả lập</span>
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <p className="text-slate-500 mb-1">Chủ tài khoản: <span className="font-bold text-slate-800">EDTECH AI JSC</span></p>
                                    <p className="text-slate-500 mb-1">Số tài khoản: <span className="font-bold text-slate-800">0123456789</span></p>
                                    <p className="text-slate-500">Ngân hàng: <span className="font-bold text-slate-800">Techcombank</span></p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <div className="mb-5">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 label-required">Số thẻ</label>
                                    <div className="relative">
                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" />
                                        <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mb-5 relative">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 label-required">Tên in trên thẻ</label>
                                    <input type="text" placeholder="NGUYEN VAN A" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all uppercase" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 label-required">Ngày hết hạn</label>
                                        <input type="text" placeholder="MM/YY" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 label-required">Mã CVC</label>
                                        <input type="text" placeholder="123" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 relative z-10 ${
                                isProcessing 
                                ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                                : selectedPlan.color === 'amber' 
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 shadow-amber-500/30 text-slate-900 border-0' 
                                    : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30'
                            }`}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    Xác nhận thanh toán {formattedAmount} đ
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
