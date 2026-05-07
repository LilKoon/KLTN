import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiGetAdminMaterials, apiUploadMaterial, apiDeleteMaterial, API_BASE_URL } from '../../../api';
import { Plus, FileText, Trash2, Download, Search, X, UploadCloud, CheckCircle2, FileUp, MoreVertical, Save } from 'lucide-react';

export default function SystemMaterials() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [newMaterial, setNewMaterial] = useState({
        ten: '',
        moTa: '',
        file: null
    });
    const [uploading, setUploading] = useState(false);

    const { token } = useAuth();

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const data = await apiGetAdminMaterials(token);
            setMaterials(data);
        } catch (err) {
            console.error('Failed to fetch materials:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setNewMaterial({ ...newMaterial, file: e.target.files[0] });
    };

    const handleUpload = async () => {
        if (!newMaterial.ten.trim() || !newMaterial.file) {
            return alert('Vui lòng nhập tên và chọn file');
        }

        try {
            setUploading(true);
            await apiUploadMaterial(token, newMaterial);
            setShowUploadModal(false);
            setNewMaterial({ ten: '', moTa: '', file: null });
            fetchMaterials();
        } catch (err) {
            alert('Lỗi khi tải lên: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận xóa tài liệu này?')) return;
        try {
            await apiDeleteMaterial(token, id);
            fetchMaterials();
        } catch (err) {
            alert('Lỗi khi xóa: ' + err.message);
        }
    };
    
    const handleDownload = async (material) => {
        try {
            const response = await fetch(`${API_BASE_URL}${material.DuongDan}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const ext = material.DuongDan.split('.').pop();
            const fileName = material.TenTaiLieu.includes('.') 
                ? material.TenTaiLieu 
                : `${material.TenTaiLieu}.${ext}`;
            
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            window.open(`${API_BASE_URL}${material.DuongDan}`, '_blank');
        }
    };

    const filteredMaterials = materials.filter(m => 
        m.TenTaiLieu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.MoTa && m.MoTa.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getFileIcon = (type) => {
        const t = type.toLowerCase();
        if (t === 'pdf') return <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><FileText className="w-5 h-5" /></div>;
        if (t.includes('doc')) return <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText className="w-5 h-5" /></div>;
        return <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><FileText className="w-5 h-5" /></div>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kho Tài Liệu Học Tập</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Đăng tải và quản lý các file PDF, Docx lý thuyết và bài tập cho học viên</p>
                </div>
                <button 
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 transition-all active:scale-95"
                >
                    <UploadCloud className="w-5 h-5" />
                    Tải Lên Tài Liệu
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Tìm kiếm tài liệu theo tên hoặc mô tả..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">Tổng số:</span>
                    <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full font-bold text-sm">{materials.length}</span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map(m => (
                        <div key={m.MaTaiLieu} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group relative">
                            <div className="flex items-start justify-between mb-4">
                                {getFileIcon(m.LoaiFile)}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleDownload(m)}
                                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                        title="Xem/Tải về"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(m.MaTaiLieu)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{m.TenTaiLieu}</h3>
                            <p className="text-slate-500 text-xs mb-4 line-clamp-2 min-h-[32px]">
                                {m.MoTa || 'Không có mô tả cho tài liệu này.'}
                            </p>
                            
                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
                                        {m.LoaiFile}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {((m.DungLuong || 0) / 1024).toFixed(2)} MB
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {new Date(m.NgayTao).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    ))}

                    {filteredMaterials.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Không tìm thấy tài liệu nào phù hợp.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
                        <div className="p-8 pb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tải Lên Tài Liệu</h2>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 pt-4 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Tên tài liệu</label>
                                <input 
                                    type="text"
                                    value={newMaterial.ten}
                                    onChange={(e) => setNewMaterial({...newMaterial, ten: e.target.value})}
                                    placeholder="Ví dụ: Đề cương ôn tập IELTS..."
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Mô tả (không bắt buộc)</label>
                                <textarea 
                                    value={newMaterial.moTa}
                                    onChange={(e) => setNewMaterial({...newMaterial, moTa: e.target.value})}
                                    placeholder="Mô tả ngắn gọn về nội dung file..."
                                    rows={3}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Chọn tập tin (PDF, Word, ...)</label>
                                <div className="relative">
                                    <input 
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="material-file-upload"
                                    />
                                    <label 
                                        htmlFor="material-file-upload"
                                        className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] p-8 hover:border-teal-500 hover:bg-teal-50/30 transition-all cursor-pointer group"
                                    >
                                        {newMaterial.file ? (
                                            <div className="text-center">
                                                <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto mb-2" />
                                                <p className="font-bold text-slate-700 truncate max-w-[200px]">{newMaterial.file.name}</p>
                                                <p className="text-xs text-slate-400">Nhấn để thay đổi</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-100 group-hover:scale-110 transition-all">
                                                    <FileUp className="w-6 h-6 text-slate-400 group-hover:text-teal-600" />
                                                </div>
                                                <p className="font-bold text-slate-700">Kéo thả hoặc Click</p>
                                                <p className="text-xs text-slate-400 mt-1">Hỗ trợ PDF, DOCX, XLSX (Max 20MB)</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <button 
                                onClick={handleUpload}
                                disabled={uploading || !newMaterial.file || !newMaterial.ten}
                                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${uploading || !newMaterial.file || !newMaterial.ten ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 active:scale-95'}`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang tải lên...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Hoàn tất Tải lên
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
