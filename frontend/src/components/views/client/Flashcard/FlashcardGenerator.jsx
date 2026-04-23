import React, { useState } from 'react';
import axios from 'axios';
import FlashcardItem from './FlashcardItem';

export default function FlashcardGenerator({ onBack }) {
    const [topic, setTopic] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('text'); // 'text' or 'file'

    const handleGenerateText = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('http://localhost:8000/flashcards/generate/text', { topic });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateFile = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await axios.post('http://localhost:8000/flashcards/generate/document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDeck = async () => {
        if (!result) return;
        try {
            await axios.post('http://localhost:8000/flashcards/save', {
                MaChuDe: result.MaChuDe,
                TenBoThe: `Bộ từ vựng: ${result.TenChuDe}`
            });
            alert('Đã lưu vào bộ sưu tập cá nhân!');
            if (onBack) onBack(); // Quay lại trang Storage sau khi lưu thành công
        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra khi lưu thẻ.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen">
            {onBack && (
                <button onClick={onBack} className="mb-6 flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-medium">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Trở về Kho Thẻ
                </button>
            )}
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 text-center tracking-tight">AI Flashcards</h1>
            <p className="text-slate-500 mb-8 text-center max-w-2xl mx-auto">
                Khám phá kho tàng từ vựng mới bằng sức mạnh của Trí tuệ Nhân tạo. Nhập một chủ đề bạn thích hoặc tải lên tài liệu PDF/Word để hệ thống tự động bóc tách từ khoá quan trọng nhất.
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12 max-w-3xl mx-auto">
                <div className="flex border-b border-slate-100">
                    <button 
                        className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'text' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
                        onClick={() => setActiveTab('text')}
                    >
                        Nhập Chủ Đề Tự Do
                    </button>
                    <button 
                        className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'file' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
                        onClick={() => setActiveTab('file')}
                    >
                        Phân Tích File (PDF/DOCX)
                    </button>
                </div>

                <div className="p-8">
                    {activeTab === 'text' ? (
                        <div className="flex flex-col gap-4">
                            <label className="text-sm font-semibold text-slate-700">Chủ đề mong muốn</label>
                            <div className="flex gap-3">
                                <input 
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Ví dụ: sân bay, ẩm thực, marketing..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateText()}
                                />
                                <button 
                                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleGenerateText}
                                    disabled={loading || !topic.trim()}
                                >
                                    {loading ? 'Đang tạo...' : 'Khởi tạo'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <label className="text-sm font-semibold text-slate-700">Tải lên tài liệu</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-3 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                        </svg>
                                        <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Nhấn để chọn file</span> hoặc kéo thả</p>
                                        <p className="text-xs text-slate-400">PDF, DOCX (Max 10MB)</p>
                                    </div>
                                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
                                </label>
                            </div>
                            {file && <div className="text-sm text-indigo-600 font-medium">Đã chọn: {file.name}</div>}
                            <button 
                                className="w-full mt-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleGenerateFile}
                                disabled={loading || !file}
                            >
                                {loading ? 'Máy AI đang đọc và phân tích tài liệu...' : 'Rút trích Flashcard từ tài liệu'}
                            </button>
                        </div>
                    )}
                    
                    {error && (
                        <div className="mt-4 p-4 text-sm text-red-800 bg-red-100 rounded-lg">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Hệ thống đang giao tiếp với AI...</p>
                </div>
            )}

            {result && !loading && (
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-8 px-4">
                        <div>
                            <h2 className="text-2xl font-bold border-l-4 border-indigo-500 pl-4 text-slate-800">
                                Chủ đề tổng hợp: <span className="capitalize text-indigo-600">{result.TenChuDe}</span>
                            </h2>
                            {result.is_from_cache && (
                                <span className="ml-5 mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                    Đã lấy từ Cache thư viện
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={handleSaveDeck}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                            Save Deck
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {result.flashcards.map((item, index) => (
                            <FlashcardItem key={index} item={item} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
