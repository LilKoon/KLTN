import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Premium() {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

    const plans = [
        {
            id: 'basic',
            name: 'Cơ Bản',
            description: 'Phù hợp cho học viên mới bắt đầu, tính năng tiêu chuẩn.',
            monthlyPrice: '0',
            yearlyPrice: '0',
            currency: 'VNĐ',
            features: [
                'Truy cập khóa học cơ bản',
                'Ôn tập hàng ngày giới hạn',
                'Làm test đầu vào',
                'Hỗ trợ cộng đồng'
            ],
            notIncluded: [
                'Kho tài liệu độc quyền',
                'AI tự động tạo Flashcard',
                'AI Tóm tắt nội dung học',
                'Báo cáo phân tích chuyên sâu'
            ],
            buttonText: 'Đang sử dụng',
            buttonAction: () => navigate('/client/dashboard'),
            buttonClass: 'bg-slate-100 text-slate-800 hover:bg-slate-200 cursor-default',
            popular: false,
            premium: false
        },
        {
            id: 'pro',
            name: 'Pro',
            description: 'Gói phổ biến và tối ưu nhất cho học viên nghiêm túc.',
            monthlyPrice: '149.000',
            yearlyPrice: '1.490.000',
            currency: 'VNĐ',
            features: [
                'Trọn bộ khóa học & mọi tính năng Cơ Bản',
                'Truy cập kho tài liệu số lượng lớn',
                'Sử dụng AI tự động tạo Flashcard (50 thẻ/ngày)',
                'Báo cáo tiến độ chuẩn xác'
            ],
            notIncluded: [
                'AI Tóm tắt không giới hạn',
                'Học viên ưu tiên phản hồi 1-1'
            ],
            buttonText: 'Nâng cấp Pro',
            buttonAction: () => navigate('/client/payment', { state: { plan: 'pro', cycle: billingCycle } }),
            buttonClass: 'bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/30',
            popular: true,
            premium: false
        },
        {
            id: 'premium',
            name: 'Premium',
            description: 'Trải nghiệm học tập thượng lưu, không giới hạn AI.',
            monthlyPrice: '299.000',
            yearlyPrice: '2.990.000',
            currency: 'VNĐ',
            features: [
                'Mọi tính năng của gói Pro',
                'AI tạo Flashcard KHÔNG GIỚI HẠN',
                'AI Tóm tắt mọi tài liệu học tập',
                'Báo cáo phân tích chuyên sâu bằng AI',
                'Hỗ trợ 1-1 chuyên sâu nhanh chóng'
            ],
            notIncluded: [],
            buttonText: 'Mở khóa Premium',
            buttonAction: () => navigate('/client/payment', { state: { plan: 'premium', cycle: billingCycle } }),
            buttonClass: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 hover:from-amber-400 hover:to-yellow-300 shadow-lg shadow-amber-500/40 font-bold border-0',
            popular: false,
            premium: true
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto font-inter">
            {/* Header Area */}
            <div className="text-center max-w-4xl mx-auto mb-16">
                <h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight mb-8 leading-[1.15]"
                    style={{ fontFamily: "'Times New Roman', Times, serif" }}
                >
                    Nâng cấp hành trình <br className="hidden sm:block" /> học tập cùng <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 drop-shadow-sm">Premium</span>
                </h1>
                <p className="text-slate-500 text-base lg:text-lg mb-8">
                    Khám phá toàn bộ tiềm năng của bạn với các gói công nghệ AI độc quyền. Không giới hạn, không rào cản.
                </p>

                {/* Billing Toggle */}
                <div className="inline-flex items-center justify-center p-1 bg-slate-100 rounded-full border border-slate-200">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${billingCycle === 'monthly' ? 'bg-white text-slate-800 shadow shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Tháng
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-slate-800 shadow shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Năm <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">-16%</span>
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto pt-4 pb-8">
                {plans.map((plan) => (
                    <div 
                        key={plan.id} 
                        className={`relative w-full rounded-3xl bg-white border h-full ${plan.premium ? 'border-amber-400 shadow-2xl shadow-amber-500/10 scale-100 md:scale-105 z-10' : plan.popular ? 'border-teal-500 shadow-xl shadow-teal-600/10 bg-teal-50/10' : 'border-slate-200 shadow-sm'} p-6 sm:p-8 flex flex-col transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg`}
                    >
                        {plan.premium && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                KHUYÊN DÙNG NHẤT
                            </div>
                        )}
                        {plan.popular && !plan.premium && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-teal-200">
                                PHỔ BIẾN
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className={`text-xl font-bold ${plan.premium ? 'text-amber-600' : 'text-slate-800'}`}>{plan.name}</h3>
                            <p className="mt-2 text-sm text-slate-500 h-10">{plan.description}</p>
                        </div>
                        
                        <div className="mb-6 flex items-baseline gap-1">
                            <span className="text-4xl font-extrabold text-slate-800">
                                {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                            </span>
                            {plan.id !== 'basic' && <span className="text-lg font-medium text-slate-400">đ</span>}
                            <span className="text-sm text-slate-500 ml-1">/ {billingCycle === 'monthly' ? 'tháng' : 'năm'}</span>
                        </div>

                        <button 
                            onClick={plan.buttonAction}
                            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all duration-200 ${plan.buttonClass}`}
                        >
                            {plan.buttonText}
                        </button>

                        <div className="mt-8 space-y-4 flex-1">
                            {/* Included features */}
                            {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className={`mt-0.5 rounded-full p-0.5 flex-shrink-0 ${plan.premium ? 'bg-amber-100 text-amber-600' : 'bg-teal-100 text-teal-600'}`}>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-slate-700">{feature}</span>
                                </div>
                            ))}

                            {/* Not included features */}
                            {plan.notIncluded.map((feature, index) => (
                                <div key={`not-${index}`} className="flex items-start gap-3 opacity-50">
                                    <div className="mt-0.5 rounded-full p-0.5 flex-shrink-0 bg-slate-100 text-slate-400">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-slate-400 line-through decoration-slate-300">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* FAQ / Trust section */}
            <div className="mt-20 border-t border-slate-200 pt-10 text-center">
                <p className="text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Bảo mật thanh toán 100%. Đảm bảo hoàn tiền trong 7 ngày nếu không hài lòng.
                </p>
            </div>
        </div>
    );
}
