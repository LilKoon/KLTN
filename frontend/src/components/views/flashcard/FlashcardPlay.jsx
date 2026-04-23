import React, { useState, useEffect } from 'react';
import { X, Zap, Settings, Maximize, RotateCcw, Loader2, Award, ArrowRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const FlashcardPlay = () => {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [deck, setDeck] = useState(null);
    const [loading, setLoading] = useState(true);

    const [playQueue, setPlayQueue] = useState([]);
    const [learningQueue, setLearningQueue] = useState([]);
    const [knownQueue, setKnownQueue] = useState([]);

    const [isFlipped, setIsFlipped] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const fetchDeck = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                // URL: /client/flashcards/:id/play
                const targetId = deckId || window.location.pathname.split('/')[3];
                const res = await axios.get(`http://127.0.0.1:8000/flashcards/decks/${targetId}`, { headers });
                
                if (res.data && res.data.cards.length > 0) {
                    setDeck(res.data);
                    setPlayQueue(res.data.cards);
                    
                    // Save to Recent Activity
                    try {
                        let recent = JSON.parse(localStorage.getItem('recent_flashcards') || '[]');
                        recent = recent.filter(item => item.id !== res.data.id);
                        recent.unshift({ 
                            id: res.data.id, 
                            title: res.data.title, 
                            terms: res.data.terms || res.data.cards.length,
                            lastStudied: new Date().toISOString() 
                        });
                        if (recent.length > 6) recent = recent.slice(0, 6);
                        localStorage.setItem('recent_flashcards', JSON.stringify(recent));
                    } catch(e) { console.error("Error saving recent to local storage", e) }

                } else {
                    alert("Bộ thẻ này hiện chưa có thẻ nào.");
                    navigate(-1);
                }
            } catch (error) {
                console.error("Lỗi lấy flashcard play:", error);
                alert("Không thể tải bộ thẻ để học!");
                navigate('/client/flashcards');
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchDeck();
    }, [deckId, token, navigate]);

    const activeCard = playQueue[currentIndex] || {};
    const progressPercent = playQueue.length > 0 ? (currentIndex / playQueue.length) * 100 : 0;

    const flipCard = () => {
        if (isFinished) return;
        setIsFlipped(prev => !prev);
    };

    const nextCard = (status, e) => {
        if (e) e.stopPropagation();
        if (isFinished) return;
        
        if (status === 'learning') {
            setLearningQueue(prev => [...prev, activeCard]);
        } else if (status === 'know') {
            setKnownQueue(prev => [...prev, activeCard]);
        }

        if (currentIndex < playQueue.length - 1) {
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 300);
        } else {
            setIsFlipped(false);
            setTimeout(() => {
                setIsFinished(true);
            }, 300);
        }
    };

    const handleRestartMode = (mode) => {
        if (mode === 'all') {
            setPlayQueue(deck.cards);
        } else if (mode === 'learning') {
            if (learningQueue.length === 0) return;
            setPlayQueue(learningQueue);
        } else if (mode === 'know') {
            if (knownQueue.length === 0) return;
            setPlayQueue(knownQueue);
        }

        setCurrentIndex(0);
        setLearningQueue([]);
        setKnownQueue([]);
        setIsFinished(false);
        setIsFlipped(false);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isFinished || loading) return;
            
            if (e.code === 'Space') {
                e.preventDefault();
                flipCard();
            } else if (isFlipped && e.key === '1') {
                nextCard('learning');
            } else if (isFlipped && e.key === '2') {
                nextCard('know');
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFlipped, currentIndex, isFinished, loading]);

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Lỗi fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    if (loading) {
        return (
            <div className="bg-teal-500 h-screen w-full flex items-center justify-center flex-col z-50 absolute inset-0">
                <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                <span className="text-white font-bold text-lg">Đang nạp thẻ ghi nhớ...</span>
            </div>
        );
    }

    if (!deck) return null;

    return (
        <div className="bg-teal-500 font-sans text-white h-screen w-full overflow-hidden flex flex-col relative selection:bg-white/30">
            {/* Decorative Game Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-600 z-0 pointer-events-none"></div>
            <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 to-transparent z-0 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_2px,transparent_2px)] [background-size:30px_30px] z-0 pointer-events-none opacity-20 mix-blend-overlay"></div>

            {/* Top Navigation Bar */}
            <header className="w-full px-6 py-4 flex items-center justify-between z-40 relative">
                {/* Left: Logo/Back */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 group cursor-pointer transition-colors text-white/70 hover:text-white">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                        <X className="w-5 h-5" />
                    </div>
                    <span className="font-bold hidden sm:inline-block">Thoát</span>
                </button>

                {/* Center: Progress */}
                <div className="flex-1 flex justify-center max-w-xl px-4">
                    <div className="w-full flex items-center gap-4 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-sm">
                        <span className="text-xs font-bold text-white w-8 text-right">{isFinished ? 100 : Math.round(progressPercent)}%</span>
                        <div className="flex-1 h-2.5 bg-black/20 rounded-full overflow-hidden relative shadow-inner">
                            <div className="h-full bg-white rounded-full transition-all duration-500 relative shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ width: `${Math.max(isFinished ? 100 : progressPercent, 5)}%` }}>
                                <div className="absolute inset-0 bg-white blur-[2px]"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full shadow-sm font-bold">
                            <span className="text-[12px]">{knownQueue.length}</span>
                            <Zap className="w-3.5 h-3.5 fill-amber-900 text-amber-900" />
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <button className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
                        <Settings className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all" onClick={handleFullscreen}>
                        <Maximize className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main Play Area */}
            <main className="flex-1 w-full flex flex-col items-center justify-center relative z-10 px-4 sm:px-8 pb-10">
                <div className="w-full max-w-[800px] flex flex-col items-center relative h-full justify-center">
                    
                    {!isFinished && (
                        <>
                            {/* Stats Header */}
                            <div className="w-full flex items-center justify-between mb-6 px-2 absolute top-0 lg:-top-12 left-0 right-0">
                                <div className="flex items-center gap-2 bg-white/20 border border-white/30 text-white px-3 py-1.5 rounded-lg backdrop-blur-md shadow-sm">
                                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">{learningQueue.length}</span>
                                    <span className="text-[13px] font-bold text-white drop-shadow-sm hidden sm:block">Đang học</span>
                                </div>
                                
                                <div className="text-[14px] font-bold text-white uppercase tracking-widest drop-shadow-md">
                                    {currentIndex + 1} / {playQueue.length}
                                </div>

                                <div className="flex items-center gap-2 bg-white/20 border border-white/30 text-white px-3 py-1.5 rounded-lg backdrop-blur-md shadow-sm">
                                    <span className="text-[13px] font-bold text-white drop-shadow-sm hidden sm:block">Đã thuộc</span>
                                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">{knownQueue.length}</span>
                                </div>
                            </div>

                            {/* Flashcard Container (3D Context) */}
                            <div className="perspective w-full aspect-[4/3] sm:aspect-[16/10] max-h-[60vh] cursor-pointer group mt-10" onClick={flipCard}>
                                {/* Inner Animated Container */}
                                <div className={`relative w-full h-full transform-style-3d transition-transform duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[24px] ${isFlipped ? 'rotate-y-180' : ''}`}>
                                    
                                    {/* Front Face */}
                                    <div className="absolute inset-0 w-full h-full backface-hidden bg-white border border-teal-100 rounded-[24px] flex flex-col items-center justify-center p-8 sm:p-16 text-center shadow-xl">
                                        <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                                            {activeCard.LoaiTu && (
                                              <span className="text-teal-600 font-bold mb-3 uppercase tracking-wider text-sm bg-teal-50 px-3 py-1 rounded-full">{activeCard.LoaiTu}</span>
                                            )}
                                            <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-slate-800 leading-tight tracking-tight transition-all text-balance">
                                                {activeCard.TuVung}
                                            </h2>
                                            {activeCard.PhienAm && (
                                                <p className="text-slate-400 mt-3 font-medium text-lg">/{activeCard.PhienAm}/</p>
                                            )}
                                        </div>
                                        <div className="mt-auto pt-6 flex items-center gap-2 text-slate-400 text-[13px] font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                                            <span>Bấm chuột hoặc ấn</span>
                                            <kbd className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-sans shadow-sm font-bold">Space</kbd>
                                            <span>để lật</span>
                                        </div>
                                    </div>

                                    {/* Back Face */}
                                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white border border-teal-100 rounded-[24px] flex flex-col items-center justify-center p-8 sm:p-12 text-center shadow-[0_0_40px_rgba(20,184,166,0.3)]">
                                        <div className="flex-1 flex flex-col items-center justify-center w-full gap-4 overflow-y-auto no-scrollbar py-4">
                                            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-extrabold text-teal-900 leading-relaxed text-balance max-w-2xl">
                                                {activeCard.Nghia}
                                            </h2>
                                            
                                            {activeCard.ViDuNguCanh && activeCard.ViDuNguCanh.trim() !== '' && (
                                                <div className="bg-teal-50 px-6 py-4 rounded-xl border border-teal-100 w-full max-w-xl mt-2">
                                                    <p className="text-teal-800 text-[15px] sm:text-[16px] font-medium italic mb-1 text-left">
                                                        <span className="font-bold text-teal-600 block text-[11px] uppercase not-italic mb-1">Ví dụ:</span> 
                                                        "{activeCard.ViDuNguCanh}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Action choices when revealed */}
                                        <div className={`w-full mt-auto pt-4 flex items-center gap-4 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                                            <button className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-3 sm:py-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-orange-200" onClick={(e) => nextCard('learning', e)}>
                                                <span className="w-6 h-6 rounded bg-orange-500 text-white flex items-center justify-center text-[12px] hidden sm:flex">1</span>
                                                Đang học
                                            </button>
                                            <button className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 sm:py-4 rounded-xl transition-colors shadow-[0_8px_20px_rgba(20,184,166,0.25)] flex items-center justify-center gap-2 border border-teal-400" onClick={(e) => nextCard('know', e)}>
                                                <span className="w-6 h-6 rounded bg-teal-700 text-white flex items-center justify-center text-[12px] hidden sm:flex">2</span>
                                                Đã thuộc
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Finished Screen */}
                    {isFinished && (
                        <div className="w-full max-w-[500px] bg-white rounded-[32px] p-8 sm:p-12 shadow-2xl flex flex-col items-center text-center animate-fade-in border border-emerald-100 mt-10">
                            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <Award className="w-10 h-10 text-amber-500" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Tuyệt vời!</h2>
                            <p className="text-slate-500 font-medium mb-8">Bạn vừa đi qua lượng thẻ của vòng này</p>

                            <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200/60">
                                    <span className="font-bold text-emerald-600 flex items-center gap-2"><Zap className="w-4 h-4 fill-emerald-600" /> Đã thuộc (Nhớ ngay)</span>
                                    <span className="font-extrabold text-slate-800 text-xl">{knownQueue.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-orange-500 flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Đang học (Cần ôn lại)</span>
                                    <span className="font-extrabold text-slate-800 text-xl">{learningQueue.length}</span>
                                </div>
                            </div>

                            <div className="flex flex-col w-full gap-3">
                                {learningQueue.length > 0 && (
                                    <button className="w-full bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-3 rounded-xl transition-colors border border-orange-200" onClick={() => handleRestartMode('learning')}>
                                        Học lại thẻ chưa thuộc ({learningQueue.length})
                                    </button>
                                )}
                                {knownQueue.length > 0 && (
                                    <button className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-3 rounded-xl transition-colors border border-emerald-200" onClick={() => handleRestartMode('know')}>
                                        Ôn lại thẻ đã thuộc ({knownQueue.length})
                                    </button>
                                )}
                                <div className="flex flex-col sm:flex-row w-full gap-3 mt-2 pt-4 border-t border-slate-100">
                                    <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors" onClick={() => handleRestartMode('all')}>
                                        Học lại tất cả
                                    </button>
                                    <button className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors shadow-md flex justify-center items-center gap-2" onClick={() => navigate(-1)}>
                                        Thoát ra <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Style for 3D Flips */}
            <style>{`
                .perspective { perspective: 1200px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default FlashcardPlay;
