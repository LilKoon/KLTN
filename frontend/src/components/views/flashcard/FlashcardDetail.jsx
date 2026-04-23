import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { Layers, Flame, Bell, GraduationCap, Check, MoreVertical, Bookmark, Eye, Play, Copy, Loader2, ChevronLeft } from 'lucide-react';

const FlashcardDetail = () => {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [deck, setDeck] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveDeck = async () => {
        setIsSaving(true);
        try {
            await axios.post('http://127.0.0.1:8000/flashcards/clone', { MaBoTheGoc: deck.id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Đã lưu bộ flashcard vào kho cá nhân thành công!");
        } catch (err) {
            alert("Lỗi khi lưu bộ flashcard!");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const fetchDeck = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                // Lấy ID từ URL param, backend có API: GET /flashcards/decks/{deckId}
                // Nếu path là /client/flashcards/:deckId thì biến param sẽ lấy từ App route setup
                const targetId = deckId || window.location.pathname.split('/').pop();
                
                const res = await axios.get(`http://127.0.0.1:8000/flashcards/decks/${targetId}`, { headers });
                setDeck(res.data);
            } catch (error) {
                console.error("Lỗi lấy chi tiết flashcard:", error);
                alert("Không thể tải chi tiết bộ thẻ!");
                navigate('/client/flashcards');
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchDeck();
    }, [deckId, token, navigate]);

    if (loading) {
        return (
            <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#fdfdfd]">
                <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
                <span className="font-bold text-slate-500">Đang tải bộ thẻ...</span>
            </div>
        );
    }
    if (!deck) return null;

    return (
        <div className="flex-1 h-full flex flex-col relative z-20 overflow-x-hidden overflow-y-auto no-scrollbar scroll-smooth bg-[#fdfdfd]">
            
            {/* Top Navigation Header */}
            <header className="w-full px-6 lg:px-8 py-4 flex items-center justify-between z-40 relative bg-white sticky top-0 border-b border-slate-200/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/client/flashcards')} className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition-colors font-bold text-sm hidden md:flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Quay lại
                    </button>
                    <span className="font-bold text-xl text-teal-600 flex items-center gap-2 mr-4 lg:hidden">
                        <ChevronLeft onClick={() => navigate('/client/flashcards')} className="w-6 h-6 hover:text-teal-700 cursor-pointer" />
                    </span>
                    {/* Breadcrumbs */}
                    <nav className="hidden md:flex text-[13px] font-semibold text-slate-500">
                        <span onClick={() => navigate('/client/flashcards')} className="hover:text-teal-600 transition-colors cursor-pointer">Kho Flashcard</span>
                        <span className="mx-2 text-slate-300">/</span>
                        <span className="text-slate-800 line-clamp-1 max-w-[200px]">{deck.title}</span>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#fff6e6] hover:bg-orange-50 px-4 py-1.5 rounded-[20px] cursor-pointer transition-colors border border-transparent hover:border-orange-100/50">
                        <div className="relative flex items-center justify-center">
                            <Flame className="w-[20px] h-[20px] text-orange-500 fill-amber-400" />
                            <div className="absolute inset-0 m-auto mt-[10px] w-[5px] h-[5px] bg-white rounded flex items-center justify-center z-10 shadow-sm border border-orange-100/50"></div>
                        </div>
                        <span className="text-[17px] font-extrabold tracking-tight bg-gradient-to-b from-orange-400 to-[#ff6b00] bg-clip-text text-transparent">3</span>
                    </div>
                    <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                    <button className="relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer text-slate-400 shadow-sm border border-slate-200/60">
                        <Bell className="w-[18px] h-[18px]" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                </div>
            </header>

            {/* Detail Layout Container */}
            <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-8 py-8 flex flex-col gap-8">
                
                {/* Top Section: Header Info */}
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
                    {/* Info Row */}
                    <div className="flex items-start gap-6">
                        {/* Image */}
                        <div className="w-[120px] h-[120px] rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-200/60 bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center">
                            <Layers className="w-12 h-12 text-white/50" />
                        </div>
                        
                        {/* Text Details */}
                        <div className="flex flex-col flex-1 min-w-0">
                            <h1 className="text-[26px] font-extrabold text-slate-800 tracking-tight leading-tight mb-3">
                                {deck.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md font-bold">
                                    <Layers className="w-4 h-4" /> Flashcard
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-700">
                                    <div className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px] font-bold"><Check className="w-3 h-3" /></div>
                                    Nội dung chất lượng
                                </span>
                                <span className="text-slate-300">•</span>
                                <span>{deck.terms} Thẻ</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-100">
                        {/* Left Tools */}
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate('/client/flashcards/create?mode=manual', { state: { deck: deck } })} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-[13px] hover:bg-slate-50 transition-colors shadow-sm bg-white">
                                <Copy className="w-4 h-4" /> Sao chép & Chỉnh sửa
                            </button>
                            <button onClick={handleSaveDeck} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-[13px] hover:bg-slate-50 transition-colors shadow-sm bg-white disabled:opacity-50">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" />} Lưu
                            </button>
                        </div>

                        {/* Right Main Actions */}
                        <div className="flex items-center gap-3">
                            <button onClick={() => document.getElementById('cards-list')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-[13px] hover:bg-slate-50 transition-colors shadow-sm bg-white">
                                <Eye className="w-4 h-4 text-slate-400" /> Xem trước
                            </button>
                            {/* Primary Action (Solid Color) */}
                            <button onClick={() => navigate(`/client/flashcards/${deck.id}/play`)} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-teal-500 text-white font-bold text-[13px] hover:bg-teal-600 transition-colors shadow-sm">
                                <Play className="w-4 h-4 fill-white" /> Bắt đầu ngay
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Questions List */}
                <div id="cards-list" className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col mb-10">
                    {/* List Header */}
                    <div className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
                        <span className="text-[14px] font-bold text-slate-700">{deck.terms} Flashcards trong bộ thẻ này</span>
                    </div>

                    {/* List Items Container */}
                    <div className="flex flex-col">
                        
                        {deck.cards.map((card, index) => (
                            <div key={card.id || index} className="flex flex-col p-6 border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{index + 1}</span>
                                    {card.LoaiTu && <span className="italic normal-case text-indigo-400">({card.LoaiTu})</span>}
                                    {card.PhienAm && <span className="normal-case text-slate-400">/{card.PhienAm}/</span>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                    {/* Front */}
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[12px] font-semibold text-slate-400">Mặt trước (Thuật ngữ)</span>
                                        <p className="text-[17px] font-bold text-slate-800 leading-relaxed">{card.TuVung}</p>
                                    </div>
                                    {/* Back */}
                                    <div className="flex flex-col gap-2 relative md:pl-12">
                                        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-slate-100"></div>
                                        <span className="text-[12px] font-semibold text-slate-400">Mặt sau (Định nghĩa)</span>
                                        <p className="text-[16px] font-medium text-slate-800 leading-relaxed mb-2">{card.Nghia}</p>
                                        
                                        {card.ViDuNguCanh && card.ViDuNguCanh.trim() !== '' && (
                                            <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100/50">
                                                <span className="text-[11px] font-bold text-yellow-600 block mb-1">Ví dụ ngữ cảnh:</span>
                                                <p className="text-[14px] text-slate-600 italic">"{card.ViDuNguCanh}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {deck.terms === 0 && (
                            <div className="p-10 text-center text-slate-500 font-medium">
                                Bộ thẻ này chưa có flashcard nào.
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default FlashcardDetail;
