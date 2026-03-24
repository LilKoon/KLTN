import { Plus, MoreVertical } from 'lucide-react';

export default function Accounts() {
  return (
    <div className="content-view active">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="heading-font fw-bold mb-1">Quản lý Tài khoản</h2>
          <p className="text-secondary mb-0">Danh sách người dùng và phân quyền.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 rounded-3 shadow-sm px-4">
          <Plus size={18} /> Thêm
        </button>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small fw-medium text-uppercase">
                <tr>
                  <th className="py-3 px-4">Người Dùng</th>
                  <th className="py-3">Vai Trò</th>
                  <th className="py-3">Trạng Thái</th>
                  <th className="py-3">Gia Nhập</th>
                  <th className="py-3 text-end px-4">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                <tr>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <img src="https://i.pravatar.cc/150?img=32" className="rounded-circle" width="40" height="40" alt="User" />
                      <div>
                        <p className="mb-0 fw-medium">Trần Thị B</p>
                        <p className="mb-0 small text-muted">b.tran@example.com</p>
                      </div>
                    </div>
                  </td>
                  <td>Học viên</td>
                  <td><span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill">Hoạt động</span></td>
                  <td className="text-muted small">01/03/2026</td>
                  <td className="text-end px-4">
                    <button className="btn btn-sm btn-light rounded-circle"><MoreVertical size={16} /></button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <img src="https://i.pravatar.cc/150?img=12" className="rounded-circle" width="40" height="40" alt="User" />
                      <div>
                        <p className="mb-0 fw-medium">Lê Văn C</p>
                        <p className="mb-0 small text-muted">c.le@example.com</p>
                      </div>
                    </div>
                  </td>
                  <td>Giảng viên</td>
                  <td><span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill">Hoạt động</span></td>
                  <td className="text-muted small">15/02/2026</td>
                  <td className="text-end px-4">
                    <button className="btn btn-sm btn-light rounded-circle"><MoreVertical size={16} /></button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <img src="https://i.pravatar.cc/150?img=5" className="rounded-circle" width="40" height="40" alt="User" />
                      <div>
                        <p className="mb-0 fw-medium">Phạm Thị D</p>
                        <p className="mb-0 small text-muted">d.pham@example.com</p>
                      </div>
                    </div>
                  </td>
                  <td>Học viên</td>
                  <td><span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded-pill">Ngoại tuyến</span></td>
                  <td className="text-muted small">20/01/2026</td>
                  <td className="text-end px-4">
                    <button className="btn btn-sm btn-light rounded-circle"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white py-3 px-4 border-top d-flex justify-content-between align-items-center">
          <span className="text-muted small">Hiển thị 1 đến 3 của 1,024 mục</span>
          <nav aria-label="Page navigation">
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled"><a className="page-link" href="#">Trước</a></li>
              <li className="page-item active"><a className="page-link" href="#">1</a></li>
              <li className="page-item"><a className="page-link" href="#">2</a></li>
              <li className="page-item"><a className="page-link" href="#">3</a></li>
              <li className="page-item"><a className="page-link" href="#">Sau</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
