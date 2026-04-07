import React, { useState } from 'react';

export default function LearningMaterials() {
    const [activeTab, setActiveTab] = useState('all');

    const tabs = [
        { id: 'all', label: 'Tất cả' },
        { id: 'course', label: 'Khóa học' },
        { id: 'document', label: 'Tài liệu (PDF)' },
        { id: 'video', label: 'Video bài giảng' },
    ];

    const materials = [
        {
            id: 1,
            title: "Ngữ pháp tiếng Anh cơ bản",
            type: "course",
            progress: 45,
            lessons: 24,
            duration: "12 giờ",
            author: "Thầy John Doe"
        },
        {
            id: 2,
            title: "1000 Từ vựng IELTS cốt lõi",
            type: "document",
            progress: 10,
            pages: 156,
            fileSize: "4.5 MB",
            author: "EdTech AI"
        },
        {
            id: 3,
            title: "Luyện phát âm chuẩn Anh-Mỹ",
            type: "video",
            progress: 80,
            duration: "45 phút",
            author: "Cô Maria"
        },
        {
            id: 4,
            title: "Luyện nghe thụ động mổi ngày",
            type: "video",
            progress: 100,
            duration: "25 phút",
            author: "Thầy John Doe"
        },
        {
            id: 5,
            title: "Khóa học TOEIC 650+",
            type: "course",
            progress: 0,
            lessons: 40,
            duration: "30 giờ",
            author: "Trung tâm EdTech"
        },
        {
            id: 6,
            title: "Đề thi thử IELTS Reading #1",
            type: "document",
            progress: 100,
            pages: 12,
            fileSize: "1.2 MB",
            author: "EdTech AI"
        }
    ];

    const filteredMaterials = activeTab === 'all' 
        ? materials 
        : materials.filter(m => m.type === activeTab);

    // Icon helper based on type
    const getIcon = (type) => {
        if (type === 'course') {
            return (
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            );
        }
        if (type === 'document') {
            return (
                <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        }
        if (type === 'video') {
            return (
                <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        }
    };

    const getTypeColor = (type) => {
        if (type === 'course') return 'bg-teal-50';
        if (type === 'document') return 'bg-sky-50';
        if (type === 'video') return 'bg-rose-50';
        return 'bg-slate-50';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-6 lg:p-12">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>
            
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Tài liệu học tập</h1>
                        <p className="text-slate-500 font-medium">Quản lý và tiếp tục các khóa học, tài liệu của bạn</p>
                    </div>
                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none" 
                            placeholder="Tìm kiếm tài liệu..." 
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                                activeTab === tab.id
                                ? 'bg-slate-800 text-white shadow-md'
                                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map(material => (
                        <div key={material.id} className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-teal-100 transition-all duration-300 group cursor-pointer flex flex-col h-full">
                            
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(material.type)}`}>
                                    {getIcon(material.type)}
                                </div>
                                {material.progress === 100 && (
                                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                                        Hoàn thành
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-teal-600 transition-colors line-clamp-2">
                                {material.title}
                            </h3>
                            <p className="text-sm font-medium text-slate-400 mb-6">bởi {material.author}</p>
                            
                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mt-auto mb-6">
                                {material.type === 'course' && (
                                    <>
                                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>{material.lessons} bài học</span>
                                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{material.duration}</span>
                                    </>
                                )}
                                {material.type === 'document' && (
                                    <>
                                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>{material.pages} trang</span>
                                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>{material.fileSize}</span>
                                    </>
                                )}
                                {material.type === 'video' && (
                                    <>
                                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{material.duration}</span>
                                    </>
                                )}
                            </div>

                            {/* Progress */}
                            <div>
                                <div className="flex justify-between text-sm mb-2 font-semibold text-slate-600">
                                    <span>Tiến độ</span>
                                    <span>{material.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-teal-500 rounded-full" 
                                        style={{ width: `${material.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
