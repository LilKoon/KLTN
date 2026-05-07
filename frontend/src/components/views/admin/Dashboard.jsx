import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../../../context/AuthContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Dashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [trafficData, setTrafficData] = useState({ labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'], data: [0, 0, 0, 0, 0, 0, 0] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                
                const [res, resLogs] = await Promise.all([
                    fetch(`${API_BASE_URL}/admin/dashboard/stats`, { headers }),
                    fetch(`${API_BASE_URL}/admin/activity?limit=5`, { headers })
                ]);

                const data = await res.json();
                const logsData = await resLogs.json();

                setStats(data);
                // Hoạt động mới nhất có thể nằm trong mảng `logsData.items` hoặc trực tiếp `logsData`
                setRecentActivities(Array.isArray(logsData) ? logsData : (logsData.items || []));
                
                // Mock traffic data since there is no backend endpoint yet
                setTrafficData({ 
                    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'], 
                    data: [120, 250, 180, 300, 450, 380, 520] 
                });
            } catch (err) {
                console.error("Lỗi khi tải thống kê:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchStats();
            // Thiết lập polling mỗi 10 giây để cập nhật realtime
            const interval = setInterval(fetchStats, 10000);
            return () => clearInterval(interval);
        }
    }, [token]);

    const lineData = {
        labels: trafficData.labels,
        datasets: [
            {
                label: 'Lượt tương tác hệ thống',
                data: trafficData.data,
                borderColor: '#0d9488', 
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#1e293b', padding: 12 }
        },
        scales: {
            x: { grid: { display: false } },
            y: { grid: { color: '#f1f5f9' }, border: { display: false } }
        }
    };

    const statCards = [
        { label: 'Tổng Học Viên', value: stats?.total_users || '0', change: stats?.new_users_today ? `+${stats.new_users_today}` : '0', color: 'text-teal-600', bg: 'bg-teal-50' },
        { label: 'Đang Trực Tuyến', value: stats?.online_users || '0', change: 'Live', color: 'text-sky-600', bg: 'bg-sky-50' },
        { label: 'Khóa Học', value: stats?.total_courses || '0', change: 'Total', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Hoạt Động', value: stats?.activity_count || '0', change: 'Logs', color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    if (isLoading) return <div className="flex items-center justify-center h-full text-slate-500 font-bold">Đang tải thống kê...</div>;

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>

            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Thống kê Tổng quan</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Cập nhật lúc {new Date().toLocaleTimeString()} hôm nay</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-teal-400 transition-colors animate-slide-in" style={{ opacity: 0, animationDelay: `${idx * 0.1}s` }}>
                        <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.label === 'Đang Trực Tuyến' ? 'bg-sky-100 text-sky-700' : 'text-emerald-700 bg-emerald-100'} rounded-full`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 mt-4">{stat.value.toLocaleString()}</h3>
                        <p className="text-sm font-semibold text-slate-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-in" style={{ opacity: 0, animationDelay: '0.4s' }}>
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Lưu lượng truy cập (Tuần)</h2>
                    </div>
                    <div className="h-72 w-full">
                        <Line data={lineData} options={chartOptions} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Hoạt động mới nhất</h2>
                    <div className="space-y-6">
                        {recentActivities.map((log, idx) => (
                            <div key={log.MaLog} className="flex gap-4 relative">
                                {idx !== recentActivities.length - 1 && <div className="absolute top-8 left-5 w-[2px] h-10 bg-slate-100"></div>}
                                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 z-10 border-4 border-white shadow-sm">
                                    <span className="font-bold text-sm">{log.TenNguoiDung.charAt(0)}</span>
                                </div>
                                <div className="flex-1 pb-2">
                                    <p className="text-sm font-medium text-slate-800 leading-tight">
                                        <span className="font-bold">{log.TenNguoiDung}</span> {log.NoiDung}
                                    </p>
                                    <span className="text-xs font-semibold text-slate-400 mt-1 block">
                                        {new Date(log.NgayTao).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
