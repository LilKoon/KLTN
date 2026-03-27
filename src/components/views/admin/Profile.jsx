import React from 'react';

export default function Profile() {
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
                    <button className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-all focus:ring-2 focus:ring-slate-200">Đổi mật khẩu</button>
                </div>
            </div>
        </div>
    );
}
