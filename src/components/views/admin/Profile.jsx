import React, { useState } from 'react';

export default function Profile() {

    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>

            <div className="animate-slide-in" style={{ opacity: 0 }}>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Hồ sơ Quản Trị Viên</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                <div className="h-32 bg-gradient-to-r from-teal-500 to-sky-600"></div>

                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-16 mb-8">
                        <div className="flex items-end gap-6">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white relative group cursor-pointer">
                                <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff&size=256" alt="Avatar" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                            </div>
                            <div className="pb-2">
                                <h2 className="text-2xl font-bold text-slate-800">Super Admin</h2>
                                <p className="text-teal-600 font-bold text-sm">Quản trị viên cấp cao</p>
                            </div>
                        </div>
                    </div>

                    <form className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên</label>
                                <input type="text" defaultValue="Super Admin" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                <input type="email" defaultValue="admin@edtech.ai" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại</label>
                                <input type="tel" defaultValue="0987 654 321" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Khu vực</label>
                                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm font-medium">
                                    <option>Hà Nội, Việt Nam</option>
                                    <option>TP. Hồ Chí Minh, Việt Nam</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex gap-3">
                            <button type="button" className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 transition-all focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">Lưu thay đổi</button>
                            <button type="button" className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all">Hủy</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-rose-100 animate-slide-in" style={{ opacity: 0, animationDelay: '0.2s' }}>
                <h2 className="text-lg font-bold text-rose-600 mb-2">Vùng nguy hiểm</h2>
                <p className="text-slate-500 text-sm font-medium mb-6">Đổi mật khẩu hoặc vô hiệu hóa tài khoản quản trị.</p>

                <div className="flex gap-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-all focus:ring-2 focus:ring-slate-200"
                    >
                        Đổi mật khẩu
                    </button>
                </div>

            </div>
            {/* MODAL ĐỔI MẬT KHẨU */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Lớp nền mờ mịn hơn */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsModalOpen(false)}
                    ></div>

                    {/* Nội dung Modal */}
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-8 border border-white animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

                        {/* Header với Icon */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Cập nhật bảo mật</h3>
                                <p className="text-slate-500 text-sm font-medium">Thay đổi mật khẩu quản trị</p>
                            </div>
                        </div>

                        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
                            {/* Field: Current Password */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
                                <div className="relative group">
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all duration-200 text-slate-800 placeholder-slate-300"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Field: New Password */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all duration-200 text-slate-800 placeholder-slate-300"
                                    required
                                />
                            </div>

                            {/* Field: Confirm Password */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all duration-200 text-slate-800 placeholder-slate-300"
                                    required
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-6 flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-2xl font-bold text-sm shadow-[0_10px_20px_-5px_rgba(13,148,136,0.3)] transition-all duration-200"
                                >
                                    Xác nhận đổi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 rounded-2xl font-bold text-sm transition-all duration-200"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
