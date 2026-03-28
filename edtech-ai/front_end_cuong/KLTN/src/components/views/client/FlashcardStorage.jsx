import React, { useState } from 'react';

export default function FlashcardStorage() {
    const [viewMode, setViewMode] = useState('grid');
    const [selectedDeck, setSelectedDeck] = useState(null);

    const decks = [
        { id: 1, title: 'IELTS Vocabulary Core', terms: 120, lastStudied: 'Hôm qua', color: 'from-emerald-400 to-teal-600' },
        { id: 2, title: 'English for IT', terms: 45, lastStudied: '3 ngày trước', color: 'from-sky-400 to-indigo-600' },
        { id: 3, title: 'Phrasal Verbs (Part 1)', terms: 50, lastStudied: '1 tuần trước', color: 'from-rose-400 to-orange-500' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 min-h-[80vh]">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
                
                .flip-card-inner { transition: transform 0.6s; transform-style: preserve-3d; }
                .flip-card.flipped .flip-card-inner { transform: rotateY(180deg); }
                .flip-card-front, .flip-card-back { backface-visibility: hidden; }
                .flip-card-back { transform: rotateY(180deg); }
            `}</style>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in" style={{ opacity: 0 }}>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Kho Flashcards</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Lưu trữ, học tập và ôn luyện các bộ từ vựng cá nhân hóa.</p>
                </div>
                <div className="flex gap-3">
                     <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Tạo thẻ trống
                    </button>
                    <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center gap-2">
                        <svg className="w-5 h-5 text-teal-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Tạo bằng AI
                    </button>
                </div>
            </div>

            {/* Dashboard List View */}
            {!selectedDeck ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                    {decks.map(deck => (
                        <div key={deck.id} onClick={() => setSelectedDeck(deck)} className="bg-white rounded-[2rem] p-2 shadow-sm border border-slate-200 cursor-pointer hover:shadow-xl hover:-translate-y-2 hover:border-teal-200 transition-all group">
                            <div className={`h-40 rounded-3xl bg-gradient-to-br ${deck.color} p-6 flex flex-col justify-between relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full mix-blend-overlay filter blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
                                <div className="flex justify-between items-start">
                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white uppercase tracking-wider">{deck.terms} Thuật ngữ</span>
                                    <button className="text-white/70 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></button>
                                </div>
                                <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{deck.title}</h3>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <p className="text-xs font-semibold text-slate-400">Ôn tập lần cuối: {deck.lastStudied}</p>
                                <div className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">Học ngay</div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Add new placeholder */}
                    <div className="bg-slate-50 rounded-[2rem] p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50 transition-colors cursor-pointer min-h-[240px]">
                        <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        <p className="font-bold">Tạo Bộ Thẻ Mới</p>
                    </div>
                </div>
            ) : (
                /* Study Mode UI */
                <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-10 shadow-2xl border border-slate-800 animate-slide-in relative overflow-hidden flex flex-col pb-20 sm:pb-10" style={{ opacity: 0 }}>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 pointer-events-none"></div>

                    {/* Nav */}
                    <div className="flex justify-between items-center mb-10 z-10">
                        <button onClick={() => setSelectedDeck(null)} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 font-semibold">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Quay lại
                        </button>
                        <h2 className="text-white font-bold text-lg">{selectedDeck.title} <span className="text-slate-500 font-medium ml-2">1 / {selectedDeck.terms}</span></h2>
                        <button className="text-slate-400 hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></button>
                    </div>

                    {/* Interaction Area (The Card) */}
                    <div className="flex-1 flex flex-col items-center justify-center z-10 w-full perspective-1000">
                        {/* Wrapper for flip constraint */}
                        <div 
                            className={`flip-card w-full max-w-2xl h-80 sm:h-96 cursor-pointer ${viewMode === 'back' ? 'flipped' : ''}`}
                            onClick={() => setViewMode(viewMode === 'front' ? 'back' : 'front')}
                        >
                            <div className="flip-card-inner relative w-full h-full shadow-2xl">
                                {/* Front */}
                                <div className="flip-card-front absolute w-full h-full bg-white rounded-[2rem] p-10 flex items-center justify-center border border-slate-200">
                                    <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 text-center">Sophisticated</h2>
                                    <p className="absolute bottom-6 text-slate-400 font-semibold text-sm">Chạm để xem đáp án</p>
                                </div>
                                {/* Back */}
                                <div className="flip-card-back absolute w-full h-full bg-teal-50 rounded-[2rem] p-10 flex flex-col items-center justify-center border-2 border-teal-200 shadow-teal-500/20 shadow-xl">
                                    <p className="text-teal-600 font-bold mb-2">/səˈfɪstɪkeɪtɪd/</p>
                                    <h2 className="text-3xl sm:text-4xl font-extrabold text-teal-900 text-center mb-6">Phức tạp, Tinh vi</h2>
                                    <p className="text-slate-600 font-medium text-center text-lg max-w-md italic relative">
                                        <span className="text-teal-200 text-4xl absolute -left-4 -top-2">"</span>
                                        These are highly sophisticated weapons.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="mt-12 flex items-center justify-center gap-4 sm:gap-8 z-10 w-full max-w-md mx-auto">
                        <button className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <button className="p-4 rounded-2xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all font-bold tracking-widest uppercase text-sm border border-white/10 px-8">
                            Space / Lật mặt
                        </button>
                        <button className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-110">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </button>
                    </div>

                </div>
            )}

        </div>
    );
}
