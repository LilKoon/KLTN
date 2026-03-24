import { Users, BookCheck, Clock, Zap } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, ArcElement);

export default function Dashboard() {
  const lineData = {
    labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
    datasets: [{
      label: 'Lượt truy cập',
      data: [1200, 1900, 1500, 2200, 1800, 2900, 3100],
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true
    }]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
      x: { grid: { display: false } }
    }
  };

  const doughnutData = {
    labels: ['Đang học', 'Hoàn thành', 'Bỏ dở'],
    datasets: [{
      data: [55, 30, 15],
      backgroundColor: ['#2563EB', '#10B981', '#F59E0B'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
    }
  };

  return (
    <div className="content-view active">
      <h2 className="heading-font fw-bold mb-1">Thống kê và Báo cáo</h2>
      <p className="text-secondary mb-4">Tổng quan hoạt động trên hệ thống Edtech.</p>
      
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card stat-card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="stat-icon bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <Users />
                </div>
                <span className="badge bg-success-subtle text-success border border-success-subtle">+12.5%</span>
              </div>
              <h6 className="text-muted fw-normal mb-1">Tổng Học Viên</h6>
              <h3 className="fw-bold mb-0">8,249</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card stat-card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="stat-icon bg-success-subtle text-success rounded-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <BookCheck />
                </div>
                <span className="badge bg-success-subtle text-success border border-success-subtle">+5.2%</span>
              </div>
              <h6 className="text-muted fw-normal mb-1">Khóa Học Hoàn Thành</h6>
              <h3 className="fw-bold mb-0">1,432</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card stat-card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="stat-icon bg-warning-subtle text-warning rounded-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <Clock />
                </div>
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle">-2.1%</span>
              </div>
              <h6 className="text-muted fw-normal mb-1">Giờ Học Trung Bình</h6>
              <h3 className="fw-bold mb-0">12.5h</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card stat-card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="stat-icon bg-info-subtle text-info rounded-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <Zap />
                </div>
                <span className="badge bg-success-subtle text-success border border-success-subtle">+18.0%</span>
              </div>
              <h6 className="text-muted fw-normal mb-1">Tài Liệu AI Tạo Xuống</h6>
              <h3 className="fw-bold mb-0">3,721</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h5 className="fw-semibold mb-4">Lưu Lượng Hoạt Động (Tuần này)</h5>
              <div style={{ height: '300px' }}>
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h5 className="fw-semibold mb-4">Trạng Thái Học Tập</h5>
              <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
