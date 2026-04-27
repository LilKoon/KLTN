import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Edit3, Headphones, Award, ChevronRight } from 'lucide-react';

export default function ExercisesTests() {
    const navigate = useNavigate();

    const tests = [
        {
            id: 'vocabulary',
            title: 'Bài test Từ Vựng',
            description: 'Đánh giá vốn từ vựng của bạn theo nhiều cấp độ khác nhau. Giúp bạn xác định những khoảng trống từ vựng.',
            icon: <BookOpen className="w-8 h-8 text-blue-500" />,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
            buttonColor: 'bg-blue-600 hover:bg-blue-700'
        },
        {
            id: 'grammar',
            title: 'Bài test Ngữ Pháp',
            description: 'Kiểm tra độ vững chắc của cấu trúc ngữ pháp. Những cấu trúc nào bạn hay nhầm lẫn?',
            icon: <Edit3 className="w-8 h-8 text-orange-500" />,
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-100',
            buttonColor: 'bg-orange-600 hover:bg-orange-700'
        },
        {
            id: 'listening',
            title: 'Bài test Kỹ năng Nghe',
            description: 'Luyện tập kỹ năng nghe qua các đoạn hội thoại thực tế. Đánh giá khả năng bắt âm.',
            icon: <Headphones className="w-8 h-8 text-purple-500" />,
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-100',
            buttonColor: 'bg-purple-600 hover:bg-purple-700'
        },
        {
            id: 'final',
            title: 'Bài Test Cuối Khóa',
            description: 'Bài kiểm tra tổng hợp kiến thức tương tự bài test đầu vào. Đánh giá sự tiến bộ của bạn!',
            icon: <Award className="w-8 h-8 text-teal-500" />,
            bgColor: 'bg-teal-50',
            borderColor: 'border-teal-100',
            buttonColor: 'bg-teal-600 hover:bg-teal-700'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-inter p-6 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full mix-blend-overlay filter blur-3xl opacity-50"></div>
                    
                    <div className="relative z-10 w-full text-center md:text-left space-y-3">
                        <span className="bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-block">Trung tâm bài tập</span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Bài tập & Test</h1>
                        <p className="text-slate-500 font-medium max-w-xl">
                            Luyện tập thường xuyên là chìa khóa để thành thạo. Hãy chọn bài test bạn muốn thực hiện để đánh giá năng lực hiện tại của mình!
                        </p>
                    </div>
                    
                    <div className="hidden md:block relative z-10">
                        <div className="w-32 h-32 bg-teal-50 rounded-full flex items-center justify-center">
                            <span className="text-6xl">🎯</span>
                        </div>
                    </div>
                </div>

                {/* Grid Tests */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tests.map(test => (
                        <div key={test.id} className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex gap-4 mb-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${test.bgColor} border ${test.borderColor}`}>
                                    {test.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">{test.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{test.description}</p>
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-slate-50">
                                <button 
                                    onClick={() => navigate(`/client/section-test/${test.id}`)}
                                    className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${test.buttonColor}`}
                                >
                                    Làm bài ngay <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
