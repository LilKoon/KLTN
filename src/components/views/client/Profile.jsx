import React, { useState } from 'react';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('personal');

    const menuItems = [
        { id: 'personal', label: 'Thông tin cá nhân', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
        { id: 'security', label: 'Bảo mật & Mật khẩu', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
        { id: 'notifications', label: 'Cài đặt thông báo', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
        { id: 'billing', label: 'Gói thành viên', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
    ];

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

                                {/* Avatar Upload Section */}
                                <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden shadow-inner border-4 border-white">
                                            <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover" />
                                        </div>
                                        <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm hover:bg-teal-700 transition-colors border-2 border-white">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors mb-2">
                                            Thay đổi ảnh đại diện
                                        </button>
                                        <p className="text-xs text-slate-400 font-medium">Định dạng JPG, GIF hoặc PNG. Tối đa 5MB.</p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Họ và tên</label>
                                            <input type="text" defaultValue="Nguyễn Văn A" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-800" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Nickname</label>
                                            <input type="text" defaultValue="nguyen_a123" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-800" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Email</label>
                                            <input type="email" defaultValue="nguyenvana@example.com" disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Số điện thoại</label>
                                            <input type="tel" defaultValue="0912 345 678" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-800" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Giới thiệu ngắn (Tiểu sử)</label>
                                        <textarea rows="4" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-800 resize-none" placeholder="Viết vài dòng giới thiệu về bạn..."></textarea>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button type="submit" className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/30 hover:shadow-teal-700/40 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                            Lưu thay đổi
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Tab Content: Security */}
                        {activeTab === 'security' && (
                            <div className="p-8 sm:p-10 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Bảo mật & Mật khẩu</h2>

                                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                                    {/* Change Password Section */}
                                    <div className="grid grid-cols-1 gap-6 max-w-xl">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Mật khẩu hiện tại</label>
                                            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Mật khẩu mới</label>
                                                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Xác nhận mật khẩu</label>
                                                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div>
                                            <button className="px-6 py-2.5 bg-slate-800 text-white font-semibold text-sm rounded-xl hover:bg-slate-900 transition-all">
                                                Cập nhật mật khẩu
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4">Bảo mật hai lớp (2FA)</h3>
                                        <div className="flex items-center justify-between p-4 bg-teal-50 rounded-2xl border border-teal-100">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3v1m0 0a10.003 10.003 0 014.188 8.423l-.054.09" /></svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-teal-900 text-sm">Xác thực qua Email</p>
                                                    <p className="text-xs text-teal-700 font-medium">Nhận mã xác minh qua email mỗi khi đăng nhập từ thiết bị lạ.</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Tab Content: Notifications */}
                        {activeTab === 'notifications' && (
                            <div className="p-8 sm:p-10 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Cài đặt thông báo</h2>

                                <div className="space-y-6">
                                    {[
                                        { title: 'Nhắc nhở học tập', desc: 'Thông báo khi đến giờ học hàng ngày của bạn.', active: true },
                                        { title: 'Cập nhật nội dung mới', desc: 'Thông báo khi có khóa học hoặc bộ từ vựng mới.', active: true },
                                        { title: 'Bản tin hàng tuần', desc: 'Tóm tắt tiến độ và kết quả học tập trong tuần qua.', active: false },
                                        { title: 'Ưu đãi & Khuyến mãi', desc: 'Thông tin về các gói Premium và sự kiện đặc biệt.', active: false },
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center justify-between py-2">
                                            <div>
                                                <p className="font-bold text-slate-800">{item.title}</p>
                                                <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked={item.active} />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                            </label>
                                        </div>
                                    ))}

                                    <div className="pt-6">
                                        <button className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/30 transition-all">
                                            Lưu cấu hình thông báo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Billing/Premium */}
                        {activeTab === 'billing' && (
                            <div className="p-8 sm:p-10 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Gói thành viên</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Current Plan Card */}
                                    <div className="p-6 rounded-[2rem] border-2 border-teal-600 bg-teal-50/50 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3">
                                            <span className="px-3 py-1 bg-teal-600 text-white text-[10px] font-bold uppercase rounded-full tracking-wider">Đang sử dụng</span>
                                        </div>
                                        <p className="text-sm font-bold text-teal-700 mb-1">Gói hiện tại</p>
                                        <h3 className="text-2xl font-extrabold text-slate-800 mb-4">Premium Pro</h3>
                                        <ul className="space-y-3 mb-8">
                                            {['Học không giới hạn từ vựng', 'AI hỗ trợ phát âm 24/7', 'Mở khóa tất cả mini-games', 'Không quảng cáo'].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                                    <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex items-center justify-between border-t border-teal-100 pt-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Ngày hết hạn</p>
                                                <p className="text-sm font-bold text-slate-700">20/12/2026</p>
                                            </div>
                                            <button className="text-sm font-bold text-teal-600 hover:text-teal-700 underline">Gia hạn ngay</button>
                                        </div>
                                    </div>

                                    {/* Invoices/History */}
                                    <div className="p-6 rounded-[2rem] border border-slate-100 bg-white">
                                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            Lịch sử thanh toán
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { date: '20/11/2025', amount: '499.000đ', status: 'Thành công' },
                                                { date: '20/10/2025', amount: '499.000đ', status: 'Thành công' },
                                            ].map((bill, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{bill.date}</p>
                                                        <p className="text-[10px] font-medium text-slate-500 uppercase">{bill.status}</p>
                                                    </div>
                                                    <p className="font-bold text-slate-700 text-sm">{bill.amount}</p>
                                                </div>
                                            ))}
                                            <button className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider">Xem tất cả hóa đơn</button>
                                        </div>
                                    </div>
                                </div>
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
