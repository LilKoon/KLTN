import React from 'react';

export default function SystemFlashcards() {
    const decks = [
        { id: 1, title: '3000 Từ vựng Tiếng Anh Thông Dụng', terms: 3000, category: 'Từ vựng Căn bản', color: 'from-sky-400 to-indigo-500' },
        { id: 2, title: 'Động Từ Bất Quy Tắc', terms: 360, category: 'Ngữ Pháp', color: 'from-amber-400 to-orange-500' },
        { id: 3, title: 'Thành Ngữ (Idioms) Cực Chất', terms: 150, category: 'Giao Tiếp', color: 'from-rose-400 to-pink-500' },
        { id: 4, title: 'IELTS Academic Vocabulary List', terms: 1200, category: 'Luyện Thi', color: 'from-teal-400 to-emerald-500' },
    ];

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in" style={{ opacity: 0 }}>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Thư viện Flashcards Hệ thống</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Quản lý các bộ thẻ Flashcards mặc định chia sẻ cho toàn bộ học viên</p>
                </div>
                <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none focus:ring-offset-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                    Tạo Bộ Thẻ Mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                {decks.map(deck => (
                    <div key={deck.id} className="relative group bg-white rounded-3xl p-1 shadow-sm border border-slate-200 hover:shadow-xl hover:border-teal-200 hover:-translate-y-2 transition-all cursor-pointer">
                        <div className={`h-32 rounded-2xl bg-gradient-to-br ${deck.color} p-5 flex flex-col justify-end relative overflow-hidden`}>
                            <div className="absolute -right-4 -top-8 text-white/20 w-32 h-32">
                                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v2H8v-2z" /></svg>
                            </div>
                            <span className="text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider w-fit mb-2 shadow-sm">
                                {deck.category}
                            </span>
                            <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md z-10">{deck.title}</h3>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 font-semibold text-sm flex items-center gap-1">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    {deck.terms} thuật ngữ
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-slate-400 hover:text-teal-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
