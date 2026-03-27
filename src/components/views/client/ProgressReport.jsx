import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    RadialLinearScale,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, RadialLinearScale, Filler
);

export default function ProgressReport() {
    
    // Line chart config
    const progressData = {
        labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6'],
        datasets: [
            {
                label: 'Điểm đánh giá TB',
                data: [65, 70, 68, 80, 85, 92],
                borderColor: '#0284c7', // Sky 600
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
            }
        ]
    };

    // Bar chart config
    const timeData = {
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        datasets: [
            {
                label: 'Phút học tập',
                data: [45, 60, 30, 90, 45, 120, 60],
                backgroundColor: '#14b8a6', // Teal 500
                borderRadius: 8,
                barThickness: 24,
            }
        ]
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: { grid: { color: '#f1f5f9', borderDash: [5, 5] }, border: { display: false } }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-4 sm:p-6 lg:p-10 space-y-8">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in" style={{ opacity: 0 }}>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Báo Cáo Tiến Độ</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Phân tích chuyên sâu về chỉ số học tập của bạn qua các tuần</p>
                </div>
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">
                    Tải PDF Báo Cáo
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col items-center text-center shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-4"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Tổng thời gian học</p>
                    <h2 className="text-3xl font-extrabold text-slate-800">45<span className="text-lg text-slate-500">h</span> 20<span className="text-lg text-slate-500">m</span></h2>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col items-center text-center shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-4"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Bài test hoàn thành</p>
                    <h2 className="text-3xl font-extrabold text-slate-800">18</h2>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col items-center text-center shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg></div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Điểm đánh giá TB</p>
                    <h2 className="text-3xl font-extrabold text-slate-800">8.5<span className="text-lg text-slate-500">/10</span></h2>
                </div>
            </div>

            {/* Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in" style={{ opacity: 0, animationDelay: '0.2s' }}>
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Sự phát triển Điểm số</h3>
                    <div className="h-72 w-full">
                        <Line data={progressData} options={commonOptions} />
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Biểu đồ Giờ học (Tuần này)</h3>
                    <div className="h-72 w-full">
                        <Bar data={timeData} options={commonOptions} />
                    </div>
                </div>
            </div>

        </div>
    );
}
