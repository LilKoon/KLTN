import React from 'react';

export default function ManageReviews() {
    const reviews = [
        { id: 1, user: 'Hoàng Lan', course: 'Tiếng Anh Giao Tiếp Căn Bản', rating: 5, comment: 'Khóa học tuyệt vời, giảng viên siêu dễ hiểu!', time: 'Hôm qua' },
        { id: 2, user: 'Tuấn Kiệt', course: 'IELTS Mastery 7.0+', rating: 4, comment: 'Tài liệu rất sát với đề thi thật. Tuy nhiên phần Speaking cần thêm video.', time: '2 ngày trước' },
        { id: 3, user: 'Minh Thư', course: 'Ngữ Pháp Chuyên Sâu', rating: 2, comment: 'Video bị lỗi đoạn giữa không xem được admin ơi!', time: '1 tuần trước' },
    ];

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
            `}</style>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in" style={{ opacity: 0 }}>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Đánh giá</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Theo dõi Feedbacks từ học viên cho các Khóa học</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 animate-slide-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="p-6 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-between">
                         <div>
                             <p className="text-sm font-bold text-teal-700">Điểm trung bình</p>
                             <h3 className="text-3xl font-bold text-teal-900 mt-1">4.8 <span className="text-lg text-teal-600">/ 5</span></h3>
                         </div>
                         <div className="text-amber-400 flex"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg></div>
                     </div>
                     <div className="p-6 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-between">
                         <div>
                             <p className="text-sm font-bold text-sky-700">Tổng đánh giá</p>
                             <h3 className="text-3xl font-bold text-sky-900 mt-1">1,245</h3>
                         </div>
                         <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-sky-500 shadow-sm"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
                     </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {reviews.map(review => (
                        <div key={review.id} className="py-6 flex gap-4 first:pt-0">
                            <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0 font-bold text-slate-500 flex items-center justify-center border-2 border-white shadow-sm">{review.user.charAt(0)}</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{review.user} <span className="text-sm font-semibold text-slate-400 block sm:inline sm:ml-2">({review.time})</span></h4>
                                        <p className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded inline-block mt-1">{review.course}</p>
                                    </div>
                                    <div className="flex gap-1 text-amber-400">
                                        {[1,2,3,4,5].map(star => (
                                            <svg key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-slate-600 mb-3">{review.comment}</p>
                                <div className="flex gap-3">
                                    <button className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors">Phản hồi</button>
                                    {review.rating <= 3 && <button className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors">Ẩn đánh giá</button>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
