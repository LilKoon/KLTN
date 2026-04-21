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
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
);

export default function Dashboard() {
    // Mock Chart Data
    const lineData = {
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        datasets: [
            {
                label: 'Lượt truy cập hệ thống',
                data: [1200, 1900, 1500, 2200, 1800, 2400, 2800],
                borderColor: '#0d9488', // Teal-600
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#0d9488',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#0d9488',
                pointRadius: 4,
            }
        ]
    };

    const barData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Học viên đăng ký mới',
                data: [300, 450, 400, 600, 500, 700],
                backgroundColor: '#0ea5e9', // Sky-500
                borderRadius: 6,
                barThickness: 24,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { family: 'Inter', size: 14 },
                bodyFont: { family: 'Inter', size: 13 },
                displayColors: false,
                cornerRadius: 8,
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Inter' }, color: '#64748b' } },
            y: { grid: { color: '#f1f5f9', borderDash: [5, 5] }, ticks: { font: { family: 'Inter' }, color: '#64748b' }, border: { display: false } }
        }
    };

    // Mock Stats
    const stats = [
        { label: 'Tổng Học Viên', value: '14,234', change: '+12%', color: 'text-teal-600', bg: 'bg-teal-50' },
        { label: 'Đang Hoạt Động', value: '2,845', change: '+4.5%', color: 'text-sky-600', bg: 'bg-sky-50' },
        { label: 'Kiểm Tra Mới', value: '1,290', change: '+18%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Thống kê Tổng quan</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Cập nhật lúc {new Date().toLocaleTimeString()} hôm nay</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-teal-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300 animate-slide-in" style={{ opacity: 0, animationDelay: `${idx * 0.1}s` }}>
                        <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1rounded-full ${stat.change.startsWith('+') ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'} rounded-full`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 mt-4">{stat.value}</h3>
                        <p className="text-sm font-semibold text-slate-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-in" style={{ opacity: 0, animationDelay: '0.4s' }}>
                
                {/* Main Line Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Lưu lượng truy cập (Tuần)</h2>
                        <button className="text-sm font-semibold text-slate-500 hover:text-teal-600 transition-colors flex items-center gap-1">
                            Báo cáo chi tiết <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                    <div className="h-72 w-full">
                        <Line data={lineData} options={chartOptions} />
                    </div>
                </div>

                {/* Secondary Bar Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Học viên mới (6 Tháng)</h2>
                    </div>
                    <div className="h-72 w-full">
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </div>
            </div>

             {/* Recent Activities Mini-Feed */}
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-slide-in" style={{ opacity: 0, animationDelay: '0.5s' }}>
                <h2 className="text-lg font-bold text-slate-800 mb-6">Hoạt động mới nhất</h2>
                <div className="space-y-6">
                    {[1, 2, 3].map((item, idx) => (
                        <div key={idx} className="flex gap-4 relative">
                            {idx !== 2 && <div className="absolute top-8 left-5 w-[2px] h-10 bg-slate-100"></div>}
                            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 z-10 border-4 border-white shadow-sm">
                                <span className="font-bold text-sm">U</span>
                            </div>
                            <div className="flex-1 pb-2">
                                <p className="text-sm font-medium text-slate-800"><span className="font-bold">Nguyễn Trần {idx}</span> đã mua khóa học Tiếng Anh Giao Tiếp Nhóm 1.</p>
                                <span className="text-xs font-semibold text-slate-400 mt-1 block">Vài phút trước</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
