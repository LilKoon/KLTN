import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { apiGetDailyReview, apiSubmitDailyReview } from '../../../api';
import { ArrowLeft, Check, X, RefreshCw, Plus, Home } from 'lucide-react';

const DailyReview = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [hasDecks, setHasDecks] = useState(true);
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [results, setResults] = useState([]);
    const [isFinished, setIsFinished] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token) {
            fetchReviewData();
        }
    }, [token]);

    const fetchReviewData = async () => {
        try {
            setLoading(true);
            const data = await apiGetDailyReview(token);
            setHasDecks(data.has_decks);
            if (data.has_decks) {
                setCards(data.cards || []);
            }
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu ôn tập:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (quality) => {
        const currentCard = cards[currentIndex];
        
        // Luôn lưu kết quả cuối cùng cho card này (hoặc lưu mọi lần nhấn)
        // Ở đây ta lưu kết quả để nộp lên server
        const newResults = [
            ...results,
            {
                deck_id: currentCard.deck_id,
                card_index: currentCard.card_index,
                quality: quality // 3 for Learned, 0 for Not Learned
            }
        ];
        setResults(newResults);

        if (quality === 0) {
            // Nếu chưa thuộc, đẩy card này xuống cuối danh sách để học lại trong session này
            setCards([...cards, currentCard]);
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
            // Nếu đã thuộc, chuyển sang card tiếp theo
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setIsFlipped(false);
            } else {
                // Đã hết card trong queue
                submitResults(newResults);
            }
        }
    };

    const submitResults = async (finalResults) => {
        try {
            setSubmitting(true);
            await apiSubmitDailyReview(token, finalResults);
            setIsFinished(true);
        } catch (err) {
            console.error("Lỗi khi nộp kết quả:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-10 h-10 text-teal-600 animate-spin" />
                    <p className="text-slate-600 font-medium">Đang chuẩn bị bài ôn tập...</p>
                </div>
            </div>
        );
    }

    if (!hasDecks) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Plus className="w-10 h-10 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Bạn chưa có Flashcard nào</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Hãy tạo bộ Flashcard đầu tiên để bắt đầu hành trình ôn tập thông minh với phương pháp Spaced Repetition.
                    </p>
                    <button
                        onClick={() => navigate('/client/flashcards')}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Tạo Flashcard ngay
                    </button>
                    <button
                        onClick={() => navigate('/client/dashboard')}
                        className="mt-4 w-full py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-lg w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-blue-500"></div>
                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-teal-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Tuyệt vời! 🎉</h2>
                    <p className="text-slate-600 mb-8">Bạn đã hoàn thành mục tiêu ôn tập ngày hôm nay.</p>
                    
                    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-500 font-medium">Số thẻ hoàn thành:</span>
                            <span className="text-teal-600 font-bold">{[...new Set(cards.map(c => `${c.deck_id}-${c.card_index}`))].length} thẻ</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Tổng lượt ôn tập:</span>
                            <span className="text-slate-900 font-bold">{results.length} lượt</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/client/dashboard')}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" /> Về Trang chủ
                    </button>
                </div>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Hôm nay chưa có thẻ nào cần ôn</h2>
                    <p className="text-slate-600 mb-8">
                        Tất cả các thẻ của bạn đều đã được ghi nhớ tốt. Hãy quay lại vào ngày mai hoặc tạo thêm thẻ mới!
                    </p>
                    <button
                        onClick={() => navigate('/client/dashboard')}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-600/30 transition-all"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
            <div className="max-w-xl w-full flex flex-col items-center">
                {/* Header */}
                <div className="w-full flex justify-between items-center mb-8">
                    <button 
                        onClick={() => navigate('/client/dashboard')}
                        className="p-2 hover:bg-white rounded-full transition-colors text-slate-500"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-lg font-bold text-slate-900">Ôn tập hằng ngày</h1>
                        <span className="text-sm font-medium text-slate-400">Thẻ {currentIndex + 1} / {cards.length}</span>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full mb-12 overflow-hidden shadow-inner">
                    <div 
                        className="h-full bg-teal-500 transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Flashcard */}
                <div 
                    className="w-full aspect-[4/5] cursor-pointer group perspective-1000 mb-12"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div className={`relative w-full h-full transition-all duration-500 preserve-3d shadow-xl rounded-[2.5rem] ${isFlipped ? 'rotate-y-180' : ''}`}>
                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] flex flex-col items-center justify-center p-12 border border-slate-100">
                            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-4 bg-teal-50 px-3 py-1 rounded-full">{currentCard.deck_title}</span>
                            <h2 className="text-4xl font-black text-slate-900 text-center mb-4">{currentCard.card.TuVung}</h2>
                            {currentCard.card.PhienAm && (
                                <p className="text-xl text-slate-400 font-medium italic">{currentCard.card.PhienAm}</p>
                            )}
                            <p className="mt-auto text-slate-400 text-sm font-medium">Nhấn để xem nghĩa</p>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-teal-600 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-white border border-teal-500">
                            <h3 className="text-2xl font-bold mb-6 text-teal-50">Nghĩa</h3>
                            <p className="text-3xl font-bold text-center mb-8">{currentCard.card.Nghia}</p>
                            {currentCard.card.ViDuNguCanh && (
                                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl w-full border border-white/20">
                                    <p className="text-sm font-bold text-teal-100 uppercase tracking-widest mb-2">Ví dụ</p>
                                    <p className="text-lg italic leading-relaxed">{currentCard.card.ViDuNguCanh}</p>
                                </div>
                            )}
                            <p className="mt-auto text-teal-200 text-sm font-medium">Nhấn để xem từ vựng</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full grid grid-cols-2 gap-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAnswer(0); // Not Learned
                        }}
                        disabled={submitting}
                        className="flex flex-col items-center justify-center gap-2 p-6 bg-white hover:bg-red-50 border-2 border-slate-200 hover:border-red-200 rounded-3xl transition-all group shadow-sm disabled:opacity-50"
                    >
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                            <X className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-slate-600 group-hover:text-red-700">Chưa thuộc</span>
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAnswer(3); // Learned
                        }}
                        disabled={submitting}
                        className="flex flex-col items-center justify-center gap-2 p-6 bg-white hover:bg-teal-50 border-2 border-slate-200 hover:border-teal-200 rounded-3xl transition-all group shadow-sm disabled:opacity-50"
                    >
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                            <Check className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-slate-600 group-hover:text-teal-700">Đã thuộc</span>
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}} />
        </div>
    );
};

export default DailyReview;
