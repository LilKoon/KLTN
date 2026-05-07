import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiAdminListSystemDecks as apiGetAdminFlashcardStore, apiAdminCreateSystemDeck as apiCreatePublicFlashcardSet, apiAdminUpdateSystemDeck as apiUpdatePublicFlashcardSet, apiAdminDeleteSystemDeck as apiDeletePublicFlashcardSet } from '../../../api';
import { Plus, Book, Trash2, Edit3, Save, X, Layers, Brain, AlertCircle } from 'lucide-react';

export default function SystemFlashcards() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newDeck, setNewDeck] = useState({
        TenBoDe: '',
        MoTa: '',
        CapDo: 'B1',
        DuLieuThe: [{ word: '', meaning_vi: '', phonetic: '', pos: '', example: '' }]
    });

    const { token } = useAuth();

    useEffect(() => {
        fetchDecks();
    }, []);

    const fetchDecks = async () => {
        try {
            setLoading(true);
            const data = await apiGetAdminFlashcardStore(token);
            setDecks(data);
        } catch (err) {
            console.error('Failed to fetch decks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setNewDeck({
            TenBoDe: '',
            MoTa: '',
            CapDo: 'B1',
            DuLieuThe: [{ word: '', meaning_vi: '', phonetic: '', pos: '', example: '' }]
        });
        setShowModal(true);
    };

    const handleOpenEdit = (deck) => {
        setEditingId(deck.MaBoDe);
        // Map backend format back to frontend form format
        const mappedCards = deck.DuLieuThe.map(c => ({
            word: c.TuVung,
            meaning_vi: c.Nghia,
            phonetic: c.PhienAm || '',
            pos: c.LoaiTu || '',
            example: c.ViDuNguCanh || ''
        }));
        setNewDeck({
            TenBoDe: deck.TenBoDe,
            MoTa: deck.MoTa || '',
            CapDo: deck.CapDo,
            DuLieuThe: mappedCards.length > 0 ? mappedCards : [{ word: '', meaning_vi: '', phonetic: '', pos: '', example: '' }]
        });
        setShowModal(true);
    };

    const handleDeleteDeck = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bộ thẻ này không?')) return;
        try {
            await apiDeletePublicFlashcardSet(token, id);
            fetchDecks();
        } catch (err) {
            alert('Lỗi khi xóa: ' + err.message);
        }
    };

    const handleAddCard = () => {
        setNewDeck({
            ...newDeck,
            DuLieuThe: [...newDeck.DuLieuThe, { word: '', meaning_vi: '', phonetic: '', pos: '', example: '' }]
        });
    };

    const handleCardChange = (index, field, value) => {
        const updatedCards = [...newDeck.DuLieuThe];
        updatedCards[index][field] = value;
        setNewDeck({ ...newDeck, DuLieuThe: updatedCards });
    };

    const handleRemoveCard = (index) => {
        if (newDeck.DuLieuThe.length <= 1) return;
        const updatedCards = [...newDeck.DuLieuThe];
        updatedCards.splice(index, 1);
        setNewDeck({ ...newDeck, DuLieuThe: updatedCards });
    };

    const handleSaveDeck = async () => {
        if (!newDeck.TenBoDe.trim()) return alert('Vui lòng nhập tên bộ thẻ');
        try {
            const formattedCards = newDeck.DuLieuThe.map(c => ({
                TuVung: c.word,
                Nghia: c.meaning_vi,
                PhienAm: c.phonetic,
                LoaiTu: c.pos,
                ViDuNguCanh: c.example
            })).filter(c => c.TuVung && c.Nghia);

            if (formattedCards.length === 0) return alert('Cần ít nhất 1 thẻ hợp lệ');

            const payload = {
                ...newDeck,
                DuLieuThe: formattedCards
            };

            if (editingId) {
                await apiUpdatePublicFlashcardSet(token, editingId, payload);
            } else {
                await apiCreatePublicFlashcardSet(token, payload);
            }
            
            setShowModal(false);
            fetchDecks();
        } catch (err) {
            alert('Lỗi khi lưu bộ thẻ: ' + err.message);
        }
    };

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
                <button 
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                    Tạo Bộ Thẻ Mới
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                    {decks.map(deck => (
                        <div key={deck.MaBoDe} className="relative group bg-white rounded-3xl p-1 shadow-sm border border-slate-200 hover:shadow-xl hover:border-teal-200 hover:-translate-y-2 transition-all cursor-pointer">
                            <div className="h-32 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-5 flex flex-col justify-end relative overflow-hidden">
                                <div className="absolute -right-4 -top-8 text-white/20 w-32 h-32">
                                    <Brain className="w-full h-full" />
                                </div>
                                <span className="text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider w-fit mb-2 shadow-sm relative z-10">
                                    {deck.CapDo}
                                </span>
                                <h3 className="text-white font-extrabold text-xl leading-tight drop-shadow-lg z-10 line-clamp-2 relative">{deck.TenBoDe}</h3>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 font-semibold text-xs flex items-center gap-1">
                                            <Layers className="w-3.5 h-3.5" />
                                            {deck.SoLuongThe} thuật ngữ
                                        </span>
                                        <span className="text-slate-400 text-[10px] mt-1 font-medium">Lượt tải: {deck.LuotTai}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(deck); }}
                                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                        >
                                            <Edit3 className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteDeck(deck.MaBoDe); }}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {decks.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Chưa có bộ thẻ hệ thống nào. Hãy tạo bộ thẻ đầu tiên!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Tạo/Sửa */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-teal-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold">{editingId ? 'Chỉnh Sửa Bộ Thẻ' : 'Tạo Bộ Thẻ Flashcard Hệ Thống'}</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Tên Bộ Thẻ</label>
                                    <input 
                                        type="text"
                                        value={newDeck.TenBoDe}
                                        onChange={(e) => setNewDeck({...newDeck, TenBoDe: e.target.value})}
                                        placeholder="Ví dụ: IELTS Vocabulary Essential"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Trình độ (CEFR)</label>
                                    <select 
                                        value={newDeck.CapDo}
                                        onChange={(e) => setNewDeck({...newDeck, CapDo: e.target.value})}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-bold text-slate-700"
                                    >
                                        <option value="A1">A1 - Beginner</option>
                                        <option value="A2">A2 - Elementary</option>
                                        <option value="B1">B1 - Intermediate</option>
                                        <option value="B2">B2 - Upper Intermediate</option>
                                        <option value="C1">C1 - Advanced</option>
                                        <option value="C2">C2 - Mastery</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Mô tả ngắn</label>
                                <textarea 
                                    value={newDeck.MoTa}
                                    onChange={(e) => setNewDeck({...newDeck, MoTa: e.target.value})}
                                    placeholder="Mô tả mục tiêu của bộ thẻ này..."
                                    rows={3}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium resize-none"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-sm font-black text-slate-800 uppercase tracking-wider">Danh sách thẻ ({newDeck.DuLieuThe.length})</label>
                                    <button 
                                        onClick={handleAddCard}
                                        className="flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" /> Thêm thẻ
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    {newDeck.DuLieuThe.map((card, idx) => (
                                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 relative group/card">
                                            <button 
                                                onClick={() => handleRemoveCard(idx)}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all shadow-sm hover:shadow-md z-10"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Từ vựng (English)</label>
                                                    <input 
                                                        type="text"
                                                        value={card.word}
                                                        onChange={(e) => handleCardChange(idx, 'word', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-slate-700"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nghĩa (Tiếng Việt)</label>
                                                    <input 
                                                        type="text"
                                                        value={card.meaning_vi}
                                                        onChange={(e) => handleCardChange(idx, 'meaning_vi', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-slate-700"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <input 
                                                    type="text"
                                                    placeholder="Phiên âm"
                                                    value={card.phonetic}
                                                    onChange={(e) => handleCardChange(idx, 'phonetic', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm font-medium"
                                                />
                                                <input 
                                                    type="text"
                                                    placeholder="Loại từ (n, v, adj...)"
                                                    value={card.pos}
                                                    onChange={(e) => handleCardChange(idx, 'pos', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm font-medium"
                                                />
                                                <input 
                                                    type="text"
                                                    placeholder="Ví dụ ngữ cảnh"
                                                    value={card.example}
                                                    onChange={(e) => handleCardChange(idx, 'example', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm font-medium"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-4">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={handleSaveDeck}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-10 py-3 rounded-2xl font-bold shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                {editingId ? 'Cập Nhật Bộ Thẻ' : 'Lưu Bộ Thẻ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
