import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiGetAdminMaterials, apiUploadMaterial, apiDeleteMaterial, API_BASE_URL } from '../../../api';
import {
    FileText, Trash2, Download, Search, X, UploadCloud, CheckCircle2,
    FileUp, Save, BookOpen, Mic, Headphones, PenLine, MessageSquare, Layers
} from 'lucide-react';

const TYPE_META = {
    GRAMMAR:    { label: 'Ngữ pháp',  icon: PenLine,        color: 'rose',    short: 'NP' },
    VOCABULARY: { label: 'Từ vựng',   icon: BookOpen,       color: 'emerald', short: 'TV' },
    LISTENING:  { label: 'Nghe',      icon: Headphones,     color: 'sky',     short: 'NG' },
    READING:    { label: 'Đọc',       icon: FileText,       color: 'indigo',  short: 'Đ' },
    WRITING:    { label: 'Viết',      icon: PenLine,        color: 'amber',   short: 'V' },
    SPEAKING:   { label: 'Nói',       icon: Mic,            color: 'violet',  short: 'N' },
    OTHER:      { label: 'Khác',      icon: Layers,         color: 'slate',   short: '?' },
};

const TYPE_BG = {
    rose:    'bg-rose-100 text-rose-700 border-rose-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    sky:     'bg-sky-100 text-sky-700 border-sky-200',
    indigo:  'bg-indigo-100 text-indigo-700 border-indigo-200',
    amber:   'bg-amber-100 text-amber-700 border-amber-200',
    violet:  'bg-violet-100 text-violet-700 border-violet-200',
    slate:   'bg-slate-100 text-slate-700 border-slate-200',
};

export default function SystemMaterials() {
    const { token } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [newMaterial, setNewMaterial] = useState({
        ten: '',
        moTa: '',
        loai: 'GRAMMAR',
        file: null,
    });

    const fetchMaterials = useCallback(async () => {
        if (!token) return;
        setLoading(true); setError('');
        try {
            const data = await apiGetAdminMaterials(token, {
                loai: typeFilter || undefined,
                search: searchQuery || undefined,
            });
            setMaterials(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || 'Không tải được tài liệu');
        } finally {
            setLoading(false);
        }
    }, [token, typeFilter, searchQuery]);

    useEffect(() => {
        const t = setTimeout(fetchMaterials, 300);
        return () => clearTimeout(t);
    }, [fetchMaterials]);

    const handleUpload = async () => {
        if (!newMaterial.ten.trim() || !newMaterial.file) {
            return alert('Vui lòng nhập tên và chọn file');
        }
        setUploading(true);
        try {
            await apiUploadMaterial(token, newMaterial);
            setShowUploadModal(false);
            setNewMaterial({ ten: '', moTa: '', loai: 'GRAMMAR', file: null });
            fetchMaterials();
        } catch (err) {
            alert('Lỗi khi tải lên: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận xoá tài liệu này?')) return;
        try {
            await apiDeleteMaterial(token, id);
            setMaterials((prev) => prev.filter((m) => m.MaTaiLieu !== id));
        } catch (err) {
            alert('Lỗi xoá: ' + err.message);
        }
    };

    const handleDownload = (m) => {
        window.open(`${API_BASE_URL}${m.DuongDan}`, '_blank');
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 KB';
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kho Tài liệu Học tập</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Upload tài liệu PDF/Word/Slide cho học viên, phân loại theo kỹ năng</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 transition-all"
                >
                    <UploadCloud className="w-5 h-5" />
                    Tải lên Tài liệu
                </button>
            </div>

            {/* Type filter chips */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setTypeFilter('')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        !typeFilter ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    Tất cả ({materials.length})
                </button>
                {Object.entries(TYPE_META).map(([k, m]) => {
                    const Ico = m.icon;
                    const active = typeFilter === k;
                    return (
                        <button
                            key={k}
                            onClick={() => setTypeFilter(k)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                                active
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <Ico className="w-4 h-4" />
                            {m.label}
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc mô tả..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materials.map((m) => {
                        const meta = TYPE_META[m.LoaiTaiLieu] || TYPE_META.OTHER;
                        const Ico = meta.icon;
                        return (
                            <div key={m.MaTaiLieu} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2.5 rounded-xl border ${TYPE_BG[meta.color]}`}>
                                        <Ico className="w-5 h-5" />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDownload(m)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg" title="Tải về">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(m.MaTaiLieu)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Xoá">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{m.TenTaiLieu}</h3>
                                <p className="text-slate-500 text-xs mb-4 line-clamp-2 min-h-[32px]">
                                    {m.MoTa || 'Không có mô tả.'}
                                </p>
                                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${TYPE_BG[meta.color]}`}>
                                        {meta.label}
                                    </span>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                        <span className="uppercase">{m.LoaiFile}</span>
                                        <span>·</span>
                                        <span>{formatSize(m.DungLuong)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {materials.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Chưa có tài liệu nào.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Tải lên Tài liệu</h2>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                            <div>
                                <label className="text-sm font-bold text-slate-700 ml-1">Tên tài liệu</label>
                                <input
                                    type="text"
                                    value={newMaterial.ten}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, ten: e.target.value })}
                                    placeholder="Ví dụ: Đề cương ôn tập IELTS Listening..."
                                    className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 ml-1">Loại tài liệu</label>
                                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {Object.entries(TYPE_META).map(([k, m]) => {
                                        const Ico = m.icon;
                                        const active = newMaterial.loai === k;
                                        return (
                                            <button
                                                key={k}
                                                type="button"
                                                onClick={() => setNewMaterial({ ...newMaterial, loai: k })}
                                                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                                                    active
                                                        ? `${TYPE_BG[m.color]} border-current`
                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                                }`}
                                            >
                                                <Ico className="w-5 h-5" />
                                                <span className="text-[11px] font-bold">{m.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 ml-1">Mô tả (không bắt buộc)</label>
                                <textarea
                                    value={newMaterial.moTa}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, moTa: e.target.value })}
                                    rows={2}
                                    className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-sm resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 ml-1">File (PDF, DOCX, ...)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setNewMaterial({ ...newMaterial, file: e.target.files[0] })}
                                    className="hidden"
                                    id="material-file-upload"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.txt,.zip"
                                />
                                <label htmlFor="material-file-upload" className="mt-2 w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-teal-500 hover:bg-teal-50/30 transition-all cursor-pointer group">
                                    {newMaterial.file ? (
                                        <div className="text-center">
                                            <CheckCircle2 className="w-10 h-10 text-teal-500 mx-auto mb-2" />
                                            <p className="font-bold text-slate-700 text-sm truncate max-w-[260px]">{newMaterial.file.name}</p>
                                            <p className="text-xs text-slate-400 mt-1">Nhấn để đổi file khác</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <FileUp className="w-10 h-10 text-slate-400 mx-auto mb-2 group-hover:text-teal-600" />
                                            <p className="font-bold text-slate-700 text-sm">Click để chọn file</p>
                                            <p className="text-xs text-slate-400 mt-1">PDF, DOCX, PPTX, XLSX (≤30MB)</p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={uploading || !newMaterial.file || !newMaterial.ten}
                                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                    uploading || !newMaterial.file || !newMaterial.ten
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700'
                                }`}
                            >
                                {uploading ? (
                                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang tải lên...</>
                                ) : (
                                    <><Save className="w-5 h-5" /> Hoàn tất Tải lên</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
