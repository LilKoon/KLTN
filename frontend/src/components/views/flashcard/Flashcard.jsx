import React, { useState, useEffect } from 'react';
import { Plus, Search, Star, Bookmark, History, Layers, Boxes, Copy, Play, Download, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const Flashcard = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [myDecks, setMyDecks] = useState([]);
    const [publicDecks, setPublicDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);

    const [showCreateDropdown, setShowCreateDropdown] = useState(false);

    useEffect(() => {
        try {
            const recent = JSON.parse(localStorage.getItem('recent_flashcards') || '[]');
            setRecentActivities(recent);
        } catch (e) {}
    }, []);

    const fetchDecks = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const resPublic = await axios.get('http://127.0.0.1:8000/flashcards/public-decks', { headers });
            setPublicDecks(resPublic.data);
            
            const resPrivate = await axios.get('http://127.0.0.1:8000/flashcards/decks', { headers });
            setMyDecks(resPrivate.data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu flashcards:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(token) fetchDecks();
    }, [token]);

    const handleClone = async (e, deckId) => {
        e.stopPropagation();
        try {
            await axios.post('http://127.0.0.1:8000/flashcards/clone', { MaBoTheGoc: deckId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Đã lưu bộ flashcard vào kho cá nhân thành công!");
            fetchDecks(); // Refresh
        } catch (err) {
            alert("Lỗi khi lưu bộ flashcard!");
        }
    };

    return (
        <div className="flex-1 h-full flex flex-col relative z-20 overflow-x-hidden overflow-y-auto no-scrollbar scroll-smooth" style={{ backgroundColor: '#fcfcfc' }}>
            
            {/* Unified Header and Hero Gradient Section */}
            <div className="w-full relative bg-gradient-to-b from-teal-100/80 via-teal-50/30 to-[#fcfcfc] flex flex-col">
                {/* Deco circles behind */}
                <div className="absolute top-0 right-[20%] w-64 h-64 bg-emerald-300 rounded-full blur-[80px] opacity-20 pointer-events-none z-0"></div>
                <div className="absolute top-10 left-[20%] w-48 h-48 bg-teal-400 rounded-full blur-[70px] opacity-10 pointer-events-none z-0"></div>

                {/* Hero Section Inner */}
                <section className="w-full relative pt-8 pb-20 px-6 lg:px-8 flex flex-col items-center z-10 mt-8">
                    
                    {/* Function floating cards */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 relative z-50 mx-auto">
                        {/* Tạo Flashcard */}
                        <div className="relative group">
                            <div onClick={() => setShowCreateDropdown(!showCreateDropdown)} className="bg-white rounded-[24px] w-[220px] h-[140px] px-6 py-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(20,184,166,0.15)] shadow-sm border border-slate-100/80">
                                <div className="w-12 h-12 rounded-[14px] bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors group-hover:shadow-md group-hover:rotate-6">
                                    <Plus className="w-6 h-6 stroke-[2.5]" />
                                </div>
                                <div className="flex flex-col items-center mt-1">
                                    <span className="font-bold text-slate-800 text-[15px] group-hover:text-teal-700 transition">Tạo mới</span>
                                    <span className="text-[12px] text-slate-400 font-medium">bộ flashcard</span>
                                </div>
                            </div>
                            
                            {/* Dropdown Options */}
                            {showCreateDropdown && (
                                <div className="absolute top-[110%] left-0 w-full bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 flex flex-col gap-1 origin-top">
                                    <div onClick={() => navigate('/client/flashcards/create?mode=manual')} className="flex items-center gap-3 px-3 py-2.5 hover:bg-teal-50 rounded-lg cursor-pointer transition-colors group/item relative overflow-hidden">
                                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 group-hover/item:scale-110 transition-transform"><Layers className="w-4 h-4" /></div>
                                        <div className="flex flex-col relative z-10">
                                            <span className="font-bold text-slate-700 text-[13px] group-hover/item:text-teal-700">Tạo thủ công</span>
                                            <span className="text-[10px] text-slate-400">Tự nhập từ vựng</span>
                                        </div>
                                    </div>
                                    <div onClick={() => navigate('/client/flashcards/create?mode=ai')} className="flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors group/item relative overflow-hidden">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover/item:scale-110 transition-transform"><Boxes className="w-4 h-4" /></div>
                                        <div className="flex flex-col relative z-10">
                                            <span className="font-bold text-slate-700 text-[13px] group-hover/item:text-indigo-700">Tạo bằng AI</span>
                                            <span className="text-[10px] text-slate-400">Tự động scan tài liệu</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tìm kiếm chủ đề */}
                        <div className="bg-white rounded-[24px] w-[220px] h-[140px] px-6 py-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(244,63,94,0.15)] shadow-sm group border border-slate-100/80">
                            <div className="w-12 h-12 rounded-[14px] bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors group-hover:shadow-md group-hover:scale-110">
                                <Search className="w-[22px] h-[22px] stroke-[2.5]" />
                            </div>
                            <div className="flex flex-col items-center mt-1">
                                <span className="font-bold text-rose-500 text-[15px]">Tìm kiếm</span>
                                <span className="text-[12px] text-slate-400 font-medium">trong thư viện</span>
                            </div>
                        </div>
                    </div>

                    {/* Global Search bar */}
                    <div className="mt-14 w-full max-w-[700px] relative z-20 px-4">
                        <div className="bg-white rounded-[24px] p-2 pl-6 pr-3 shadow-md border border-slate-200/60 flex items-center gap-3 focus-within:shadow-[0_12px_40px_rgba(20,184,166,0.15)] focus-within:border-teal-300 transition-all group">
                            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                            <input type="text" placeholder="Tìm bộ flashcard, quiz, tài liệu học..." className="flex-1 bg-transparent py-3 border-none focus:outline-none text-slate-700 font-medium text-[15px] placeholder:text-slate-400" />
                            <button className="bg-teal-500 hover:bg-teal-600 text-white w-12 h-12 rounded-[16px] flex items-center justify-center transition-all shadow-sm active:scale-95">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto px-6 lg:px-8 mt-2 pb-16 gap-10">
                
                {/* Left Side: Flashcard Collections */}
                <div className="flex-1 flex flex-col gap-12 min-w-0">
                    
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>
                    ) : (
                        <>
                            {/* Bộ sưu tập Flashcard */}
                            <section>
                                <div className="flex items-center justify-between mb-5 px-1">
                                    <h2 className="text-[18px] sm:text-xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                                        <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> Bộ sưu tập flashcard đại trà
                                    </h2>
                                    <button className="text-[13px] font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap">Xem thêm</button>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {publicDecks.length === 0 && <p className="text-slate-500 text-sm">Chưa có bộ sưu tập nào.</p>}
                                    {publicDecks.map((deck, index) => {
                                        const gradients = [
                                            'linear-gradient(to bottom right, #581c87, #7e22ce)', 
                                            'linear-gradient(to bottom right, #881337, #be123c)', 
                                            'linear-gradient(to bottom right, #134e4a, #0f766e)'
                                        ];
                                        const bgGradient = gradients[index % gradients.length];
                                        
                                        return (
                                        <div key={deck.id} onClick={() => navigate(`/client/flashcards/${deck.id}`)} className="bg-white rounded-[20px] shadow-sm border border-slate-100/80 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all group flex flex-col">
                                            <div className="h-[145px] relative p-3" style={{ backgroundImage: bgGradient }}>
                                                <h3 className="text-white font-extrabold text-[18px] absolute bottom-3 left-4 z-10 w-3/4 leading-tight drop-shadow-md">{deck.title}</h3>
                                                <div className="absolute bottom-3 right-3 text-[10px] text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded font-extrabold flex items-center gap-1 z-10"><Copy className="w-3 h-3" /> {deck.terms} Qs</div>
                                            </div>
                                            <div className="p-4 flex flex-col justify-between items-start gap-3 flex-1 relative">
                                                <p className="text-[14px] font-bold text-slate-700 leading-snug">{deck.description || "Bộ flashcard mặc định của hệ thống"}</p>
                                                <div className="w-full flex items-center justify-between mt-auto pt-2">
                                                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded flex items-center gap-1"><Play className="w-3 h-3" /> System</span>
                                                    <button onClick={(e) => handleClone(e, deck.id)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-teal-100 hover:text-teal-600 text-slate-500 flex items-center justify-center transition-colors" title="Lưu về kho">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </section>

                            {/* Flashcard của tôi */}
                            <section>
                                <div className="flex items-center justify-between mb-5 px-1">
                                    <h2 className="text-[18px] sm:text-xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                                        <Bookmark className="w-6 h-6 text-indigo-500 fill-indigo-500/20" /> Flashcard của tôi
                                    </h2>
                                    <button className="text-[13px] font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap">Xem thiết lập</button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {myDecks.length === 0 && (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-200 rounded-[20px]">
                                            <Bookmark className="w-12 h-12 text-slate-300 mb-3" />
                                            <p className="text-slate-500 font-medium">Bạn chưa lưu bộ Flashcard nào cá nhân.</p>
                                            <p className="text-[13px] text-slate-400 mt-1 mb-4">Hãy tải từ kho đại trà hoặc tự tạo mới bằng AI nhé!</p>
                                            <button onClick={() => navigate('/client/flashcards/create')} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-[13px]">
                                                Bắt đầu tạo
                                            </button>
                                        </div>
                                    )}
                                    {myDecks.map((deck, idx) => {
                                        const myGradients = [
                                            'linear-gradient(to bottom right, #115e59, #14b8a6)', 
                                            'linear-gradient(to bottom right, #075985, #0ea5e9)', 
                                            'linear-gradient(to bottom right, #3730a3, #6366f1)'
                                        ];
                                        const myGradient = myGradients[idx % myGradients.length];

                                        return (
                                        <div key={deck.id} onClick={() => navigate(`/client/flashcards/${deck.id}`)} className="bg-white rounded-[20px] shadow-sm border border-slate-100/80 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all group flex flex-col">
                                            <div className="h-[145px] relative p-3" style={{ backgroundImage: myGradient }}>
                                                <h3 className="text-white font-extrabold text-[18px] absolute bottom-3 left-4 z-10 w-3/4 leading-tight drop-shadow-md">{deck.title}</h3>
                                                <div className="absolute bottom-3 right-3 text-[10px] text-teal-900 bg-white/90 backdrop-blur-sm px-2 py-1 rounded font-extrabold flex items-center gap-1 z-10"><Copy className="w-3 h-3" /> {deck.terms} Qs</div>
                                            </div>
                                            <div className="p-4 flex flex-col justify-between items-start gap-4 flex-1">
                                                <p className="text-[14px] font-bold text-slate-700">Chủ đề: {deck.title}</p>
                                                <div className="w-full flex items-center justify-between mt-auto pt-2">
                                                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded flex items-center gap-1"><Play className="w-3 h-3" /> Bắt đầu học</span>
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </section>
                        </>
                    )}
                </div>

                {/* Right Column Widget - Hoạt động gần đây */}
                <div className="w-full lg:w-[320px] xl:w-[350px] flex-shrink-0 flex flex-col relative">
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col gap-4 relative">
                        <div className="flex flex-col items-center border-b border-slate-100/80 pb-5 mb-2 mt-2">
                            <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-4 rotate-3 shadow-inner transition-transform hover:rotate-6">
                                <History className="w-8 h-8 stroke-[2px]" />
                            </div>
                            <h2 className="text-[19px] font-bold text-slate-900 tracking-tight text-center leading-tight">Hoạt động gần đây</h2>
                            <p className="text-[12px] text-slate-400 mt-1">Các phiên học đang dang dở</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            {recentActivities.length === 0 ? (
                                <p className="text-[13px] text-center text-slate-500 py-4">Chưa có hoạt động nào gần đây.</p>
                            ) : (
                                recentActivities.map((activity, index) => (
                                    <div key={index} onClick={() => navigate(`/client/flashcards/${activity.id}`)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-colors group">
                                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="font-bold text-slate-700 text-[13px] truncate group-hover:text-teal-600 transition-colors">{activity.title}</span>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                                <span>{activity.terms} thẻ</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span>{new Date(activity.lastStudied).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>
                                        <Play className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Flashcard;
