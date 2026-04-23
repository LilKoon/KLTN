import React, { useState, useRef } from 'react';
import { ChevronLeft, Layers, Save, Sparkles, CloudUpload, Trash2, Plus, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const FlashcardCreate = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const fileInputRef = useRef(null);

    const location = useLocation();

    const [deckTitle, setDeckTitle] = useState(location.state?.deck?.title ? `Bản sao: ${location.state.deck.title}` : 'Bộ Flashcard Mới');
    
    // Map existing cards or create empty one
    const initialCards = location.state?.deck?.cards?.map((c, i) => ({
        id: Date.now() + i,
        TuVung: c.TuVung || '',
        Nghia: c.Nghia || '',
        ViDuNguCanh: c.ViDuNguCanh || '',
        LoaiTu: c.LoaiTu || '',
        PhienAm: c.PhienAm || ''
    })) || [{ id: Date.now(), TuVung: '', Nghia: '', ViDuNguCanh: '', LoaiTu: '', PhienAm: '' }];

    const [draftCards, setDraftCards] = useState(initialCards);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiTopic, setAiTopic] = useState('');

    const handleUpdateCard = (id, field, value) => {
        setDraftCards(cards => cards.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const handleAddCard = () => {
        setDraftCards([...draftCards, { id: Date.now(), TuVung: '', Nghia: '', ViDuNguCanh: '', LoaiTu: '', PhienAm: '' }]);
    };
    
    const handleRemoveCard = (id) => {
        setDraftCards(cards => cards.filter(c => c.id !== id));
    };

    const handleSaveDeck = async () => {
        const validCards = draftCards.filter(c => c.TuVung.trim() !== '' && c.Nghia.trim() !== '');
        if (validCards.length === 0) {
            alert('Vui lòng nhập ít nhất 1 thẻ hoàn chỉnh (cần cả Thuật ngữ và Định nghĩa).');
            return;
        }

        try {
            const payload = {
                TenBoThe: deckTitle || 'Bộ Flashcard Mới',
                cards: validCards
            };
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post('http://127.0.0.1:8000/flashcards/save/custom', payload, { headers });
            alert("Lưu Bộ thẻ thành công!");
            navigate('/client/flashcards');
        } catch (error) {
            console.error("Lỗi khi lưu thẻ:", error);
            alert("Lỗi lưu dữ liệu. Hãy thử lại.");
        }
    };

    const handleGenerateAiTopic = async () => {
        if(!aiTopic.trim()) return;
        setIsAiLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.post('http://127.0.0.1:8000/flashcards/generate/text', { topic: aiTopic }, { headers });
            
            const newCards = res.data.flashcards.map(c => ({
                id: Date.now() + Math.random(),
                ...c
            }));
            
            setDraftCards(prev => [...prev, ...newCards]);
            setShowAiModal(false);
            setAiTopic('');
        } catch (error) {
            console.error("Lỗi AI:", error);
            alert("Lỗi khi sinh từ bằng AI!");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsAiLoading(true);
        setShowAiModal(false);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' };
            const res = await axios.post('http://127.0.0.1:8000/flashcards/generate/document', formData, { headers });
            
            const newCards = res.data.flashcards.map(c => ({
                id: Date.now() + Math.random(),
                ...c
            }));
            setDraftCards(prev => [...prev, ...newCards]);
        } catch (error) {
            console.error("Lỗi xử lý tài liệu:", error);
            alert("Rất tiếc! AI không thể đọc được file này hoặc đã có lỗi hệ thống.");
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="bg-slate-100 font-sans text-slate-800 h-screen w-full overflow-hidden flex flex-col relative">
            <header className="w-full h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-40 shrink-0 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-teal-600" />
                        <span className="font-bold text-slate-800 text-[15px]">Workspace Tạo Flashcard</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleSaveDeck} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-bold text-[13px] transition-colors shadow-sm">
                        <Save className="w-4 h-4" /> Hoàn Tất & Lưu
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
                <div className="w-full max-w-4xl mx-auto flex-col flex animate-fade-in gap-5 pb-32">
                    
                    <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex-1">
                            <input type="text" value={deckTitle} onChange={e => setDeckTitle(e.target.value)} className="w-full text-2xl font-extrabold bg-transparent border-b-2 border-transparent focus:border-teal-500 outline-none pb-2 text-slate-800 transition-colors" placeholder="Tên Bộ Thẻ..." />
                            <p className="text-[13px] text-slate-400 font-medium mt-1">Bàn làm việc lai. Thêm thẻ bằng tay hoặc nhờ AI tự động sinh.</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => setShowAiModal(true)} className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-600 px-4 py-2.5 rounded-xl font-bold transition-colors">
                                <Sparkles className="w-4 h-4" /> Nhờ AI Điền Thêm
                            </button>
                        </div>
                    </div>
                    
                    {/* Editor list */}
                    {draftCards.map((card, idx) => (
                        <div key={card.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col group transition-colors focus-within:border-teal-300">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100/80 bg-slate-50/50 rounded-t-xl">
                                <span className="font-bold text-slate-400">Card {(idx + 1).toString().padStart(2, '0')}</span>
                                <button onClick={() => handleRemoveCard(card.id)} className="w-7 h-7 rounded-full text-slate-400 hover:bg-slate-200 hover:text-red-500 flex items-center justify-center transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <input type="text" value={card.TuVung} onChange={e => handleUpdateCard(card.id, 'TuVung', e.target.value)} placeholder="Nhập thuật ngữ..." className="w-full outline-none text-lg text-slate-800 bg-transparent py-2 border-b-2 border-slate-200 focus:border-teal-500 transition-colors" />
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Thuật ngữ / Mặt trước</label>
                                </div>
                                <div>
                                    <input type="text" value={card.Nghia} onChange={e => handleUpdateCard(card.id, 'Nghia', e.target.value)} placeholder="Nhập định nghĩa..." className="w-full outline-none text-lg text-slate-800 bg-transparent py-2 border-b-2 border-slate-200 focus:border-teal-500 transition-colors" />
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Định nghĩa / Mặt sau</label>
                                </div>
                                <div className="md:col-span-2">
                                    <textarea value={card.ViDuNguCanh || ''} onChange={e => handleUpdateCard(card.id, 'ViDuNguCanh', e.target.value)} placeholder="Ví dụ ngữ cảnh (Tùy chọn)..." className="w-full outline-none text-[14px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3 resize-none h-14 focus:border-teal-300" />
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <button onClick={handleAddCard} className="w-full py-5 rounded-[16px] border-2 border-dashed border-slate-300 bg-transparent hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer group transition-all">
                        <Plus className="w-6 h-6 text-slate-400 group-hover:text-teal-600 mb-1 transition-colors" />
                        <span className="font-bold text-slate-500 group-hover:text-teal-600">Thêm 1 thẻ trống dưới cùng</span>
                    </button>
                    
                </div>
            </main>

            {/* AI MODAL */}
            {showAiModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-in">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                            <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-500"/> Sinh thẻ bằng AI</h2>
                            <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-red-500"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Sinh từ theo Chủ đề</label>
                                <div className="flex gap-2">
                                    <input type="text" value={aiTopic} onChange={e=>setAiTopic(e.target.value)} placeholder="VD: Động vật biển, IELTS List 1..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-400 focus:bg-white transition-colors"/>
                                    <button onClick={handleGenerateAiTopic} disabled={isAiLoading} className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50">Sinh</button>
                                </div>
                            </div>
                            
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-slate-200"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">Hoặc Quét Tệp</span>
                                <div className="flex-grow border-t border-slate-200"></div>
                            </div>

                            <div 
                                className="w-full rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 transition-colors p-8 flex flex-col items-center cursor-pointer group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <CloudUpload className="w-10 h-10 text-indigo-400 mb-2 group-hover:scale-110 transition-transform"/>
                                <p className="font-bold text-slate-700">Tải lên tệp PDF hoặc Word</p>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.docx" className="hidden" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FULL SCREEN LOADING */}
            {isAiLoading && (
                <div className="fixed inset-0 bg-slate-900/60 z-[60] flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-white font-bold text-xl">AI đang bóc tách kiến thức...</span>
                </div>
            )}

        </div>
    );
};

export default FlashcardCreate;
