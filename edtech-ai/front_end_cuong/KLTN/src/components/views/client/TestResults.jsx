import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { apiGetExamResult } from '../../../api';

export default function TestResults() {
    const { token } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const examId = searchParams.get('examId');

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ─── Fetch results from API ─────────────────────────────────────────
    useEffect(() => {
        const fetchResult = async () => {
            if (!examId || !token) return;
            try {
                setLoading(true);
                const data = await apiGetExamResult(token, examId);
                setResult(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [examId, token]);

    // ─── Loading state ──────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 font-inter flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-600 font-medium">Đang tải kết quả...</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-slate-50 font-inter flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Không thể tải kết quả</h3>
                    <p className="text-slate-500">{error || "Không tìm thấy bài kiểm tra"}</p>
                    <button 
                        onClick={() => navigate('/client/dashboard')}
                        className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const { score, correct_count, wrong_count, total_questions, details } = result;

    // Calculate total time spent
    const totalTimeSeconds = details.reduce((sum, d) => sum + (d.time_spent || 0), 0);
    const totalTimeFormatted = `${Math.floor(totalTimeSeconds / 60)}:${(totalTimeSeconds % 60).toString().padStart(2, '0')}`;

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-6 lg:p-12">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-2 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Kết quả bài kiểm tra</h1>
                        <p className="text-slate-500 font-medium">Bài kiểm tra đầu vào — Placement Test</p>
                    </div>

                    {/* Score Circle */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-100"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className={score >= 70 ? 'text-teal-500' : score >= 40 ? 'text-yellow-500' : 'text-red-500'}
                                strokeDasharray={`${score}, 100`}
                                strokeWidth="3"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-extrabold text-slate-800">{Math.round(score)}%</span>
                        </div>
                    </div>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Số câu đúng</p>
                            <p className="text-2xl font-bold text-slate-800">{correct_count} <span className="text-sm font-medium text-slate-400">/ {total_questions}</span></p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Số câu sai</p>
                            <p className="text-2xl font-bold text-slate-800">{wrong_count}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Thời gian làm bài</p>
                            <p className="text-2xl font-bold text-slate-800">{totalTimeFormatted}</p>
                        </div>
                    </div>
                </div>

                {/* Detailed Answers */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Chi tiết bài làm</h2>
                    
                    <div className="space-y-4">
                        {details.map((item, idx) => (
                            <div key={idx} className={`p-5 rounded-2xl border ${item.is_correct ? 'border-teal-100 bg-teal-50/30' : 'border-rose-100 bg-rose-50/30'} flex flex-col gap-3 hover:shadow-md transition-shadow duration-200`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-800 mb-1">
                                            <span className="text-slate-400 mr-2">Câu {item.index}.</span> 
                                            {item.question}
                                        </p>
                                        
                                        {/* Skill & Level tags */}
                                        <div className="flex gap-2 mt-2 mb-3">
                                            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full">{item.skill}</span>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full
                                                ${item.level === 1 ? 'bg-green-50 text-green-700' :
                                                  item.level === 2 ? 'bg-yellow-50 text-yellow-700' :
                                                  'bg-red-50 text-red-700'}`}>
                                                Level {item.level}
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500">Bạn chọn:</span>
                                                <span className={`font-medium px-2.5 py-1 rounded-md ${item.is_correct ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'}`}>
                                                    {item.selected || '(Chưa trả lời)'}
                                                    {item.selected && item.options[item.selected] ? ` - ${item.options[item.selected]}` : ''}
                                                </span>
                                            </div>
                                            {!item.is_correct && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-500">Đáp án đúng:</span>
                                                    <span className="font-medium bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md">
                                                        {item.correct_answer} - {item.options[item.correct_answer]}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Explanation */}
                                        {item.explanation && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-800 border border-blue-100">
                                                <span className="font-semibold">Giải thích: </span>
                                                {item.explanation}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start ml-4">
                                        {item.is_correct ? (
                                            <div className="flex items-center gap-1.5 text-teal-600 font-semibold text-sm bg-teal-50 px-3 py-1.5 rounded-full">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Đúng
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-sm bg-rose-50 px-3 py-1.5 rounded-full">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Sai
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={() => navigate('/client/dashboard')}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-teal-600/30 hover:shadow-teal-700/40 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        >
                            Trở về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
