import React, { useState } from 'react';

export default function CreateFlashcard() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultReady, setResultReady] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        // Mock API delay
        setTimeout(() => {
            setIsGenerating(false);
            setResultReady(true);
        }, 3000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
                .bg-ai-gradient { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
            `}</style>
            
            <div className="bg-ai-gradient rounded-[2.5rem] p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden animate-slide-in" style={{ opacity: 0 }}>
                {/* Decorative Elements */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-teal-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-fuchsia-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="relative z-10 text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-inner border border-white/20">
                        <svg className="w-10 h-10 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">AI Tạo Flashcard Tự Động</h1>
                    <p className="text-slate-300 font-medium text-base sm:text-lg leading-relaxed">
                        Chỉ cần dán một đoạn văn bản hoặc danh sách từ vựng, hệ thống AI sẽ tự động phân tích và trích xuất thành một bộ Flashcard hoàn chỉnh kèm nghĩa và ví dụ.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                {/* Input Section */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm">1</span>
                        Nhập văn bản nguồn
                    </h2>
                    
                    <div className="mb-4">
                        <label className="text-sm font-bold text-slate-700 block mb-2">Chủ đề của bộ thẻ</label>
                        <input type="text" placeholder="VD: Từ vựng Bài báo Khoa học..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium text-slate-700" />
                    </div>

                    <div className="mb-6">
                        <label className="text-sm font-bold text-slate-700 block mb-2 flex justify-between">
                            Nội dung văn bản (để AI trích xuất)
                            <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Tối đa 1500 từ</span>
                        </label>
                        <textarea 
                            rows="8" 
                            placeholder="Dán đoạn văn tiếng Anh, danh sách từ vựng hoặc link bài báo vào đây..." 
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium text-slate-700 resize-none leading-relaxed"
                        ></textarea>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`w-full flex items-center justify-center gap-3 text-white font-bold text-lg py-4 rounded-2xl shadow-lg transition-all focus:ring-2 focus:ring-offset-2 ${isGenerating ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30 focus:ring-teal-500'}`}
                    >
                        {isGenerating ? (
                            <>
                                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Đang phân tích dữ liệu...
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Bắt đầu Trích xuất
                            </>
                        )}
                    </button>
                </div>

                {/* Output Section */}
                <div className={`bg-white rounded-[2rem] p-8 border transition-all duration-500 ${resultReady ? 'border-teal-400 shadow-xl shadow-teal-500/10' : 'border-slate-200 shadow-sm opacity-50 grayscale'}`}>
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm">2</span>
                        Kết quả Mẫu <span className="text-sm font-semibold text-teal-600 ml-auto">{resultReady ? 'Đã tạo 12 thẻ' : 'Đang chờ...'}</span>
                    </h2>

                    {resultReady ? (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {[1, 2, 3].map(item => (
                                <div key={item} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-teal-300 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-teal-700 text-lg">Sophisticated</p>
                                        <button className="text-slate-400 hover:text-rose-500 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800 mb-1">/səˈfɪstɪkeɪtɪd/ - (adj) Phức tạp, tinh vi</p>
                                    <p className="text-sm font-medium text-slate-500 italic border-l-2 border-slate-300 pl-3 mt-2">Ví dụ: The software is highly sophisticated.</p>
                                </div>
                            ))}
                            <div className="pt-4 mt-4 border-t border-slate-100 flex gap-3">
                                <button className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">Sửa thủ công</button>
                                <button className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all">Lưu Bộ Thẻ</button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                             <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <p className="font-semibold text-sm">Kết quả sẽ hiển thị tại đây.</p>
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );
}
