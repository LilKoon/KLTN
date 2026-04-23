import React, { useState } from 'react';

export default function Content() {
    const [activeTab, setActiveTab] = useState('courses');

    const courses = [
        { id: 1, title: 'IELTS Mastery 7.0+', type: 'Khóa học', students: 1250, status: 'Đã xuất bản', rating: 4.8, img: 'https://images.unsplash.com/photo-1546410531-dd4cbac24b25?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        { id: 2, title: 'Tiếng Anh Giao Tiếp Căn Bản', type: 'Khóa học', students: 840, status: 'Đã xuất bản', rating: 4.5, img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        { id: 3, title: 'Ngữ Pháp Chuyên Sâu', type: 'Khóa học', students: 320, status: 'Bản nháp', rating: 0, img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    ];

    const documents = [
        { id: 1, title: '500 Từ Vựng TOEIC Thường Gặp', type: 'PDF', downloads: 3500, size: '2.4 MB', date: '10/03/2026' },
        { id: 2, title: 'Cẩm Nang Phát Âm Chuẩn Mỹ', type: 'PDF', downloads: 1200, size: '5.1 MB', date: '12/03/2026' },
        { id: 3, title: 'Bài Tập Câu Điều Kiện', type: 'Docx', downloads: 840, size: '1.2 MB', date: '15/03/2026' },
    ];

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>

            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in" style={{ opacity: 0 }}>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Nội dung</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Đăng tải khóa học, tài liệu và các bài giảng</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                        Thư mục
                    </button>
                    <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-teal-600/30 transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none focus:ring-offset-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                        Tạo nội dung
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-6 border-b border-slate-200 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                <button 
                    onClick={() => setActiveTab('courses')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'courses' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Danh sách Khóa học
                </button>
                <button 
                    onClick={() => setActiveTab('documents')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'documents' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Tài liệu Hệ thống
                </button>
            </div>

            {/* Courses Grid */}
            {activeTab === 'courses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-slide-in" style={{ opacity: 0, animationDelay: '0.2s' }}>
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all group flex flex-col">
                            <div className="h-48 relative overflow-hidden bg-slate-100">
                                <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-4 left-4">
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg backdrop-blur-md ${course.status === 'Đã xuất bản' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                                        {course.status}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 flex items-center justify-center hover:text-teal-600 shadow-sm"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                                    <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 flex items-center justify-center hover:text-rose-600 shadow-sm"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">{course.title}</h3>
                                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-100 font-medium text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg> {course.students}</span>
                                    {course.rating > 0 ? (
                                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg> {course.rating}</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-slate-400">Chưa có đánh giá</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Documents List */}
            {activeTab === 'documents' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-slide-in" style={{ opacity: 0, animationDelay: '0.2s' }}>
                    <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-700 grid grid-cols-12 gap-4">
                        <div className="col-span-6">Tên tài liệu</div>
                        <div className="col-span-2 text-center">Định dạng</div>
                        <div className="col-span-2 text-right">Dung lượng</div>
                        <div className="col-span-2 text-right">Hành động</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {documents.map((doc) => (
                            <div key={doc.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/80 transition-colors group">
                                <div className="col-span-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors cursor-pointer">{doc.title}</p>
                                        <p className="text-xs font-semibold text-slate-400">Tải lên: {doc.date} &bull; {doc.downloads} lượt tải</p>
                                    </div>
                                </div>
                                <div className="col-span-2 text-center">
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">{doc.type}</span>
                                </div>
                                <div className="col-span-2 text-right text-sm font-medium text-slate-500">
                                    {doc.size}
                                </div>
                                <div className="col-span-2 flex justify-end gap-2">
                                     <button className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
