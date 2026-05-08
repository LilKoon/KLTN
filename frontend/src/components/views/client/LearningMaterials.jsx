import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, Download, FileText, BookOpen, Headphones, PenLine, Mic, Layers } from 'lucide-react';
import { apiGetUserMaterials, API_BASE_URL } from '../../../api';

const TYPE_META = {
    GRAMMAR:    { label: 'Ngữ pháp', icon: PenLine,    color: 'rose',    accent: 'bg-rose-500',    light: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200' },
    VOCABULARY: { label: 'Từ vựng',  icon: BookOpen,   color: 'emerald', accent: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    LISTENING:  { label: 'Nghe',     icon: Headphones, color: 'sky',     accent: 'bg-sky-500',     light: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200' },
    READING:    { label: 'Đọc',      icon: FileText,   color: 'indigo',  accent: 'bg-indigo-500',  light: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
    WRITING:    { label: 'Viết',     icon: PenLine,    color: 'amber',   accent: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
    SPEAKING:   { label: 'Nói',      icon: Mic,        color: 'violet',  accent: 'bg-violet-500',  light: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200' },
    OTHER:      { label: 'Khác',     icon: Layers,     color: 'slate',   accent: 'bg-slate-500',   light: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200' },
};

const TYPE_ORDER = ['GRAMMAR', 'VOCABULARY', 'LISTENING', 'READING', 'WRITING', 'SPEAKING', 'OTHER'];

function MaterialCard({ m }) {
    const meta = TYPE_META[m.LoaiTaiLieu] || TYPE_META.OTHER;
    const Ico = meta.icon;
    const sizeMB = ((m.DungLuong || 0) / 1024 / 1024).toFixed(2);
    return (
        <a
            href={`${API_BASE_URL}${m.DuongDan}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`block bg-white rounded-2xl border-2 ${meta.border} p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${meta.light} ${meta.text}`}>
                    <Ico className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${meta.light} ${meta.text}`}>
                    {meta.label}
                </span>
            </div>
            <h3 className="font-bold text-slate-800 mb-1 line-clamp-2 group-hover:text-teal-700 transition-colors">{m.TenTaiLieu}</h3>
            <p className="text-slate-500 text-xs mb-4 line-clamp-2 min-h-[32px]">
                {m.MoTa || 'Không có mô tả.'}
            </p>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="uppercase font-bold">{m.LoaiFile}</span>
                <span>{sizeMB} MB</span>
                <span className="flex items-center gap-1 text-teal-600 font-bold">
                    <Download className="w-3.5 h-3.5" /> Tải về
                </span>
            </div>
        </a>
    );
}

export default function LearningMaterials() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const data = await apiGetUserMaterials({
                loai: filter || undefined,
                search: search || undefined,
            });
            setMaterials(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || 'Lỗi tải tài liệu');
        } finally {
            setLoading(false);
        }
    }, [filter, search]);

    useEffect(() => {
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [load]);

    const grouped = useMemo(() => {
        const map = {};
        for (const m of materials) {
            const k = TYPE_META[m.LoaiTaiLieu] ? m.LoaiTaiLieu : 'OTHER';
            if (!map[k]) map[k] = [];
            map[k].push(m);
        }
        return map;
    }, [materials]);

    const totalByType = useMemo(() => {
        const c = {};
        for (const k of TYPE_ORDER) c[k] = (grouped[k] || []).length;
        return c;
    }, [grouped]);

    return (
        <div className="flex-1 h-full overflow-y-auto bg-slate-50">
            <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Kho Tài liệu Học tập</h1>
                    <p className="text-slate-500 text-sm mt-1">Tài liệu PDF/Word/Slide do giảng viên tải lên — phân theo từng kỹ năng</p>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm tài liệu theo tên hoặc mô tả..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                        />
                    </div>
                </div>

                {/* Type filter chips */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter('')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            !filter ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Tất cả ({materials.length})
                    </button>
                    {TYPE_ORDER.map((k) => {
                        const m = TYPE_META[k];
                        const Ico = m.icon;
                        const active = filter === k;
                        const cnt = totalByType[k] || 0;
                        return (
                            <button
                                key={k}
                                onClick={() => setFilter(k)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                                    active
                                        ? `${m.accent} text-white shadow-md`
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <Ico className="w-4 h-4" />
                                {m.label}
                                {cnt > 0 && (
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${active ? 'bg-white/20' : 'bg-slate-100'}`}>
                                        {cnt}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : materials.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">
                            {search || filter ? 'Không tìm thấy tài liệu phù hợp.' : 'Chưa có tài liệu nào. Vui lòng quay lại sau.'}
                        </p>
                    </div>
                ) : filter ? (
                    // Khi đang filter: list flat
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {materials.map((m) => <MaterialCard key={m.MaTaiLieu} m={m} />)}
                    </div>
                ) : (
                    // Group theo type
                    <div className="space-y-8">
                        {TYPE_ORDER.map((k) => {
                            const list = grouped[k] || [];
                            if (list.length === 0) return null;
                            const meta = TYPE_META[k];
                            const Ico = meta.icon;
                            return (
                                <section key={k}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2 rounded-xl ${meta.light} ${meta.text}`}>
                                            <Ico className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-800">{meta.label}</h2>
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{list.length}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {list.map((m) => <MaterialCard key={m.MaTaiLieu} m={m} />)}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
