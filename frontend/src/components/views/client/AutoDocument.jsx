import React from 'react';

export default function AutoDocument() {
    return (
        <div className="max-w-4xl mx-auto space-y-6 flex flex-col items-center justify-center min-h-[80vh]">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>
            
            <div className="text-center animate-slide-in" style={{ opacity: 0 }}>
                <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm border border-teal-200">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tạo Tài Liệu Bằng AI</h1>
                <p className="text-slate-500 font-medium text-base mt-3 max-w-lg mx-auto">Chỉ định chủ đề và trình độ, hệ thống AI sẽ tổng hợp và xuất ra một tệp PDF chứa lý thuyết và bài tập cá nhân hóa dành riêng cho bạn.</p>
            </div>

            <div className="w-full bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-200 animate-slide-in relative overflow-hidden" style={{ opacity: 0, animationDelay: '0.1s' }}>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-sky-500"></div>
                
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Chủ đề bài học / Từ khóa</label>
                        <input type="text" placeholder="VD: Câu điều kiện loại 2, Từ vựng Logistics..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium text-slate-700" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Trình độ hiện tại</label>
                            <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium text-slate-700 cursor-pointer">
                                <option>A1 - Căn bản</option>
                                <option>A2 - Sơ cấp</option>
                                <option>B1 - Trung cấp</option>
                                <option>B2 - Trung cấp trên</option>
                                <option>C1 - Tiếng Anh nâng cao</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Định dạng tập tin xuất</label>
                            <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium text-slate-700 cursor-pointer">
                                <option>PDF (Khuyên dùng)</option>
                                <option>Microsoft Word (.docx)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Yêu cầu thêm cho AI (Không bắt buộc)</label>
                        <textarea placeholder="VD: Hãy tạo nhiều bài tập trắc nghiệm thay vì điền từ..." rows="3" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium text-slate-700 resize-none"></textarea>
                    </div>

                    <div className="pt-2">
                        <button className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-slate-900/20 transition-all focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
                            <svg className="w-6 h-6 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            Tạo Tài Liệu Tự Động
                        </button>
                    </div>
                </form>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-4"><span className="text-teal-600">Lưu ý:</span> Việc tạo file có thể mất 15-30 giây tùy thuộc vào độ dài của chủ đề.</p>
        </div>
    );
}
