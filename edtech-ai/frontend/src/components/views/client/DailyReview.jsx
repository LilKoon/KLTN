import React, { useState } from 'react';

export default function DailyReview() {
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Mock flashcard data
    const cards = [
        {
            id: 1,
            front: "Ubiquitous",
            type: "Từ vựng IELTS",
            back: "Có mặt ở khắp nơi (Present, appearing, or found everywhere)",
            example: "His ubiquitous influence was felt by all the family."
        },
        {
            id: 2,
            front: "Ephemeral",
            type: "Từ vựng IELTS",
            back: "Phù du, chóng tàn (Lasting for a very short time)",
            example: "Fashions are ephemeral."
        },
        {
            id: 3,
            front: "Meticulous",
            type: "Từ vựng IELTS",
            back: "Tỉ mỉ, quá kỹ càng (Showing great attention to detail)",
            example: "He had always been so meticulous about his appearance."
        }
    ];

    const currentCard = cards[currentIndex];
    const progress = ((currentIndex) / cards.length) * 100;

    const handleNextCard = (rating) => {
        // In a real app, you would send the rating (Hard, Good, Easy) to the spaced-repetition algorithms
        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            // Add a small delay for smooth transition
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 150);
        } else {
            alert("Bạn đã hoàn thành phiên ôn tập hôm nay! 🎉");
            setCurrentIndex(0);
            setIsFlipped(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-6 lg:p-12 flex flex-col items-center">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
                
                /* Preserve 3D effect for flip */
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                
                .flip-card-inner {
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
            
            <div className="w-full max-w-2xl flex flex-col items-center">
                
                {/* Header Section */}
                <div className="w-full flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ôn tập hằng ngày</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">Chuỗi học tập: 🔥 12 ngày liên tiếp</p>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Progress Tracking */}
                <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-8 flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-500 w-16">{currentIndex} / {cards.length}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-teal-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Flashcard Container */}
                <div className="w-full aspect-[4/3] sm:aspect-video perspective-1000 cursor-pointer group" onClick={() => !isFlipped && setIsFlipped(true)}>
                    <div className={`relative w-full h-full transform-style-3d flip-card-inner rounded-[2rem] shadow-xl ${isFlipped ? 'rotate-y-180' : ''}`}>
                        
                        {/* Front of Card */}
                        <div className="absolute inset-0 backface-hidden bg-white border border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-8">
                            <span className="absolute top-6 left-6 px-3 py-1 bg-teal-50 text-teal-600 font-bold text-xs uppercase tracking-wider rounded-lg">
                                {currentCard.type}
                            </span>
                            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 text-center">
                                {currentCard.front}
                            </h2>
                            <p className="absolute bottom-8 font-medium text-slate-400 group-hover:text-teal-500 transition-colors flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                                Chạm để lật thẻ
                            </p>
                        </div>

                        {/* Back of Card */}
                        <div className="absolute inset-0 backface-hidden bg-white border border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-8 rotate-y-180">
                            <span className="absolute top-6 left-6 px-3 py-1 bg-teal-50 text-teal-600 font-bold text-xs uppercase tracking-wider rounded-lg">
                                Giải nghĩa
                            </span>
                            <h2 className="text-3xl font-bold text-slate-800 text-center mb-6">
                                {currentCard.back}
                            </h2>
                            <div className="w-full max-w-md bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-sm font-semibold text-slate-500 mb-1">Ví dụ:</p>
                                <p className="text-slate-700 font-medium italic">"{currentCard.example}"</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Rating Actions (Visible only when flipped) */}
                <div className={`w-full mt-8 transition-all duration-300 transform ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <p className="text-center text-sm font-semibold text-slate-500 mb-4">Bạn nhớ từ này ở mức độ nào?</p>
                    <div className="grid grid-cols-4 gap-3">
                        <button onClick={(e) => { e.stopPropagation(); handleNextCard('Lại'); }} className="py-4 bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 rounded-2xl flex flex-col items-center gap-1 transition-colors group">
                            <span className="text-rose-500 font-bold text-sm">Học lại</span>
                            <span className="text-xs font-medium text-slate-400 group-hover:text-rose-400">&lt; 1 phút</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleNextCard('Khó'); }} className="py-4 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50 rounded-2xl flex flex-col items-center gap-1 transition-colors group">
                            <span className="text-orange-500 font-bold text-sm">Khó</span>
                            <span className="text-xs font-medium text-slate-400 group-hover:text-orange-400">6 phút</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleNextCard('Tốt'); }} className="py-4 bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 rounded-2xl flex flex-col items-center gap-1 transition-colors group shadow-sm">
                            <span className="text-teal-600 font-bold text-sm">Tốt</span>
                            <span className="text-xs font-medium text-slate-400 group-hover:text-teal-500">10 phút</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleNextCard('Dễ'); }} className="py-4 bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50 rounded-2xl flex flex-col items-center gap-1 transition-colors group">
                            <span className="text-sky-500 font-bold text-sm">Dễ dàng</span>
                            <span className="text-xs font-medium text-slate-400 group-hover:text-sky-400">4 ngày</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
