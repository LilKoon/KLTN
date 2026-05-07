import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { apiUploadLessonFile } from '../../../api';
import { Book, FileText, Upload, CheckCircle2, ChevronRight, Layout, Plus, Search, MoreVertical, ExternalLink } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Content() {
    const [activeTab, setActiveTab] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);
    
    const fileInputRef = useRef(null);
    const { token } = useAuth();

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchLessons(selectedCourse.MaKhoaHoc);
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/cms/courses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCourses(res.data);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLessons = async (courseId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/cms/courses/${courseId}/lessons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setLessons(res.data);
        } catch (err) {
            console.error('Failed to fetch lessons:', err);
        }
    };

    const handleUploadClick = (lessonId) => {
        setUploadingId(lessonId);
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !uploadingId) return;

        try {
            await apiUploadLessonFile(token, uploadingId, file);
            alert('Đã tải lên tài liệu thành công!');
            if (selectedCourse) fetchLessons(selectedCourse.MaKhoaHoc);
        } catch (err) {
            alert('Lỗi khi tải lên: ' + err.message);
        } finally {
            setUploadingId(null);
            e.target.value = null;
        }
    };

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
            />

            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in" style={{ opacity: 0 }}>
                <div>
                    <div className="flex items-center gap-2 text-teal-600 mb-1">
                        <Layout className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Management</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Nội dung</h1>
                    <p className="text-slate-500 font-medium text-sm">Đăng tải khóa học, bài học và tài liệu học tập</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedCourse && (
                        <button 
                            onClick={() => setSelectedCourse(null)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                        >
                            Quay lại danh sách
                        </button>
                    )}
                    <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-teal-600/30 transition-all active:scale-95">
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                        Tạo mới
                    </button>
                </div>
            </div>

            {!selectedCourse ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                    {loading ? (
                        <div className="col-span-full py-20 flex justify-center">
                            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        courses.map(course => (
                            <div 
                                key={course.MaKhoaHoc} 
                                onClick={() => setSelectedCourse(course)}
                                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all group flex flex-col cursor-pointer"
                            >
                                <div className="h-40 bg-slate-100 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-indigo-500/20 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Book className="w-16 h-16 text-slate-300 group-hover:text-teal-500 transition-colors" />
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg backdrop-blur-md bg-emerald-500/90 text-white`}>
                                            {course.TrangThai || 'ACTIVE'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors line-clamp-1">{course.TenKhoaHoc}</h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.MoTa || 'Chưa có mô tả cho khóa học này.'}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 font-medium text-xs text-slate-400">
                                        <span className="flex items-center gap-1.5 uppercase font-black">{course.MucDo || 'Cơ bản'}</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-6 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                                <Book className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{selectedCourse.TenKhoaHoc}</h2>
                                <p className="text-slate-500 text-sm">Danh sách bài học trong khóa học</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-16">STT</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tên bài học</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Tài liệu</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lessons.map((lesson, idx) => (
                                    <tr key={lesson.MaBaiHoc} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-slate-400">{idx + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{lesson.TenBaiHoc}</div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">{lesson.TrangThai}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {lesson.FileDinhKem ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <a 
                                                        href={`${API_BASE_URL}${lesson.FileDinhKem}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-teal-600 font-bold text-xs hover:underline"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        Xem tài liệu
                                                    </a>
                                                    <button 
                                                        onClick={() => handleUploadClick(lesson.MaBaiHoc)}
                                                        className="text-[10px] text-slate-400 hover:text-teal-600 font-bold"
                                                    >
                                                        (Thay đổi)
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => handleUploadClick(lesson.MaBaiHoc)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 font-bold text-xs hover:border-teal-500 hover:text-teal-600 transition-all"
                                                >
                                                    <Upload className="w-3.5 h-3.5" />
                                                    Tải lên
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                                                    <ExternalLink className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {lessons.length === 0 && (
                            <div className="p-20 text-center text-slate-400">
                                <Book className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="font-medium">Khóa học này chưa có bài học nào.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
