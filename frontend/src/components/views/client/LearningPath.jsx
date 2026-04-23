import React, { useState, useRef, useEffect } from 'react';
import { Map as MapIcon, Star, BookOpen, Headphones, Mic, PenTool, Award, Lock, Clock, Trophy } from 'lucide-react';

const LearningPath = () => {
    const totalSteps = 6;
    const [currentStep, setCurrentStep] = useState(2);
    const pathRef = useRef(null);
    const scrollerRef = useRef(null);
    const [pathLength, setPathLength] = useState(1500); // Default approx length

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, []);

    const completeStep = (stepNumber) => {
        if (stepNumber <= currentStep) {
            // Already completed or current
            setCurrentStep(stepNumber);
            return;
        }
        setCurrentStep(stepNumber);
    };

    // Auto-scroll loosely based on step
    useEffect(() => {
        if (scrollerRef.current) {
            // Approximate node offset (100 -> 1450)
            const offsets = [0, 100, 325, 550, 775, 1000, 1225];
            const targetLeft = offsets[currentStep] || 0;
            scrollerRef.current.scrollTo({
                left: targetLeft - (scrollerRef.current.clientWidth / 2) + 150,
                behavior: 'smooth'
            });
        }
    }, [currentStep]);

    const strokeDashoffset = pathLength - ((currentStep / totalSteps) * pathLength);

    const getNodeClass = (nodeNum) => {
        if (nodeNum < currentStep) return 'node-completed';
        if (nodeNum === currentStep) return 'node-active';
        return 'node-locked';
    };

    return (
        <div className="flex flex-1 overflow-hidden relative w-full h-[calc(100vh-80px)] bg-[#f0fdf4]" style={{
            backgroundImage: `
                radial-gradient(at 0% 0%, rgba(204, 251, 241, 0.5) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(187, 247, 208, 0.4) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(255, 255, 255, 0.8) 0px, transparent 50%)
            `,
            backgroundAttachment: 'fixed'
        }}>
            {/* Custom CSS overrides for this page specifically */}
            <style dangerouslySetInnerHTML={{__html: `
                .map-viewport { scroll-behavior: smooth; }
                .path-front { transition: stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1); filter: drop-shadow(0 4px 12px rgba(45, 212, 191, 0.5)); }
                .node-locked { background-color: #f1f5f9; color: #94a3b8; box-shadow: inset 0 -6px 0 rgba(0, 0, 0, 0.05), 0 8px 15px rgba(0, 0, 0, 0.04); }
                .node-active { background: linear-gradient(135deg, #2dd4bf, #0d9488); color: white; box-shadow: inset 0 -8px 0 rgba(0, 0, 0, 0.1), 0 16px 30px rgba(20, 184, 166, 0.4); border-color: #ccfbf1; }
                .node-completed { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; box-shadow: inset 0 -8px 0 rgba(0, 0, 0, 0.1), 0 12px 25px rgba(245, 158, 11, 0.3); }
                .node-label-box { transition: all 0.3s; }
                .node-wrapper:hover .node-label-box { box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); transform: translateY(-2px); }
            `}} />

            {/* Left: Map Area */}
            <div className="flex-1 relative overflow-hidden h-full">
                {/* Floating Status Bar */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-slate-100 flex items-center gap-4 transition-all">
                    <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center shadow-sm">
                        <MapIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tiến độ lộ trình</div>
                        <div className="text-[15px] font-extrabold text-slate-800">
                            <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md mr-1 border border-teal-100">{currentStep}/{totalSteps}</span>
                            Bài học hoàn thành
                        </div>
                    </div>
                </div>

                {/* Map Playground */}
                <div ref={scrollerRef} className="map-viewport absolute inset-0 overflow-x-auto overflow-y-hidden no-scrollbar">
                    <div className="relative min-w-[1600px] min-h-[600px] h-full flex items-center justify-center">
                        {/* 1600x500 Canvas exactly matching SVG viewBox for perfect pixel mapping */}
                        <div className="relative w-[1600px] h-[500px] shrink-0">
                            
                            <svg className="absolute inset-0 w-full h-full z-[1] fill-transparent stroke-[18] stroke-slate-200" style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 1600 500" preserveAspectRatio="none">
                                <path d="M 100 250 Q 325 50 550 250 T 1000 250 T 1450 250" />
                            </svg>

                            <svg className="absolute inset-0 w-full h-full z-[1] fill-transparent stroke-[18] stroke-teal-400 path-front pointer-events-none" style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 1600 500" preserveAspectRatio="none">
                                <path ref={pathRef}
                                    strokeDasharray={pathLength}
                                    strokeDashoffset={isNaN(strokeDashoffset) ? 0 : strokeDashoffset}
                                    d="M 100 250 Q 325 50 550 250 T 1000 250 T 1450 250" />
                            </svg>

                            {/* Nodes - Mapped mathematically exact to Bezier control points */}
                            <div className="absolute z-[2] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 hover:-translate-y-[55%] hover:scale-105 hover:z-10 node-wrapper" style={{ left: '100px', top: '250px' }} onClick={() => completeStep(1)}>
                                <div className={`w-[76px] h-[76px] rounded-full flex items-center justify-center border-[4px] border-white transition-all duration-400 relative z-10 ${getNodeClass(1)} ${currentStep === 1 ? 'animate-bounce' : ''}`}>
                                    <Star className="w-7 h-7" />
                                </div>
                                <div className={`mt-[14px] px-4 py-2 rounded-full text-[13px] font-bold shadow-md whitespace-nowrap border node-label-box ${currentStep >= 1 ? 'text-teal-700 bg-teal-50 border-teal-100' : 'text-slate-700 bg-white border-slate-100'}`}>Unit 1: Khởi động</div>
                            </div>

                            <div className="absolute z-[2] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 hover:-translate-y-[55%] hover:scale-105 hover:z-10 node-wrapper" style={{ left: '325px', top: '150px' }} onClick={() => completeStep(2)}>
                                <div className={`w-[76px] h-[76px] rounded-full flex items-center justify-center border-[4px] border-white transition-all duration-400 relative z-10 ${getNodeClass(2)} ${currentStep === 2 ? 'animate-bounce' : ''}`}>
                                    <BookOpen className="w-7 h-7" />
                                </div>
                                <div className={`mt-[14px] px-4 py-2 rounded-full text-[13px] font-bold shadow-md whitespace-nowrap border node-label-box ${currentStep >= 2 ? 'text-teal-700 bg-teal-50 border-teal-100' : 'text-slate-700 bg-white border-slate-100'}`}>Unit 2: Từ vựng</div>
                            </div>

                            <div className="absolute z-[2] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 hover:-translate-y-[55%] hover:scale-105 hover:z-10 node-wrapper" style={{ left: '550px', top: '250px' }} onClick={() => completeStep(3)}>
                                <div className={`w-[76px] h-[76px] rounded-full flex items-center justify-center border-[4px] border-white transition-all duration-400 relative z-10 ${getNodeClass(3)} ${currentStep === 3 ? 'animate-bounce' : ''}`}>
                                    <Headphones className="w-7 h-7" />
                                </div>
                                <div className={`mt-[14px] px-4 py-2 rounded-full text-[13px] font-bold shadow-md whitespace-nowrap border node-label-box ${currentStep >= 3 ? 'text-teal-700 bg-teal-50 border-teal-100' : 'text-slate-700 bg-white border-slate-100'}`}>Unit 3: Luyện nghe</div>
                            </div>

                            <div className="absolute z-[2] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 hover:-translate-y-[55%] hover:scale-105 hover:z-10 node-wrapper" style={{ left: '775px', top: '350px' }} onClick={() => completeStep(4)}>
                                <div className={`w-[76px] h-[76px] rounded-full flex items-center justify-center border-[4px] border-white transition-all duration-400 relative z-10 ${getNodeClass(4)} ${currentStep === 4 ? 'animate-bounce' : ''}`}>
                                    <Mic className="w-7 h-7" />
                                </div>
                                <div className={`mt-[14px] px-4 py-2 rounded-full text-[13px] font-bold shadow-md whitespace-nowrap border node-label-box ${currentStep >= 4 ? 'text-teal-700 bg-teal-50 border-teal-100' : 'text-slate-700 bg-white border-slate-100'}`}>Unit 4: Luyện nói</div>
                            </div>

                            <div className="absolute z-[2] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 hover:-translate-y-[55%] hover:scale-105 hover:z-10 node-wrapper" style={{ left: '1000px', top: '250px' }} onClick={() => completeStep(5)}>
                                <div className={`w-[76px] h-[76px] rounded-full flex items-center justify-center border-[4px] border-white transition-all duration-400 relative z-10 ${getNodeClass(5)} ${currentStep === 5 ? 'animate-bounce' : ''}`}>
                                    <PenTool className="w-7 h-7" />
                                </div>
                                <div className={`mt-[14px] px-4 py-2 rounded-full text-[13px] font-bold shadow-md whitespace-nowrap border node-label-box ${currentStep >= 5 ? 'text-teal-700 bg-teal-50 border-teal-100' : 'text-slate-700 bg-white border-slate-100'}`}>Unit 5: Ngữ pháp</div>
                            </div>

                            <div className="absolute z-[2] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 hover:-translate-y-[55%] hover:scale-105 hover:z-10 node-wrapper" style={{ left: '1225px', top: '150px' }} onClick={() => completeStep(6)}>
                                <div className={`w-[88px] h-[88px] rounded-full flex items-center justify-center border-[4px] border-white transition-all duration-400 relative z-10 ${getNodeClass(6)} ${currentStep === 6 ? 'animate-bounce' : ''}`}>
                                    <Award className="w-10 h-10" />
                                </div>
                                <div className={`mt-[14px] px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap border node-label-box relative ${currentStep >= 6 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-slate-700 bg-white border-slate-100'}`}>
                                    BÀI THI CUỐI KỲ
                                    {currentStep < 6 && (
                                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                                            <Lock className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Floating Panel */}
            <div className="w-[340px] xl:w-[380px] pt-8 pr-6 lg:pr-8 pb-8 flex flex-col overflow-y-auto no-scrollbar z-20 relative shrink-0">
                <h2 className="text-[20px] font-bold text-slate-900 tracking-tight mb-5 ml-1">Study Plan</h2>

                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-white flex flex-col gap-4 relative">
                    {/* Top Graphic */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-[150px] h-36 flex items-center justify-center mt-2 mb-3">
                            <div className="absolute bottom-0 w-[130px] h-[60px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full shadow-[inset_0_-8px_16px_rgba(0,0,0,0.15)] flex items-center justify-center border-b-[6px] border-amber-900 outline outline-[3px] outline-green-100/80">
                                <div className="absolute left-3 bottom-2 w-3 h-2 bg-slate-200/50 rounded-full"></div>
                                <div className="absolute right-3 bottom-3 w-4 h-2 bg-slate-200/50 rounded-full"></div>
                            </div>

                            <div className="absolute bottom-6 w-full flex justify-center z-10 animate-float-soft">
                                <div className="w-[50px] h-[55px] bg-amber-400 rounded-t-[2rem] rounded-b-xl border-[3px] border-amber-500 relative flex justify-center items-end pb-1.5 ">
                                    <div className="w-6 h-3 bg-lime-400 rounded-t-full border-t border-l border-r border-lime-500 relative">
                                        <div className="absolute top-0.5 left-1.5 w-1 h-1 bg-black rounded-full"></div>
                                        <div className="absolute top-0.5 right-1.5 w-1 h-1 bg-black rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-0 left-[-15px] z-20">
                                <div className="w-[52px] h-[52px] rounded-full border-[3px] border-[#2563eb] bg-white flex items-center justify-center relative shadow-sm">
                                    <div className="absolute -inset-1 border-[2px] border-blue-100 rounded-full"></div>
                                    <span className="font-bold text-[16px] text-[#2563eb]">5.0</span>
                                </div>
                            </div>
                        </div>
                        <h4 className="font-bold text-slate-800 text-[17px] tracking-tight text-center">IELTS Cơ bản</h4>
                        <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[13px] mt-1 whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5" /> Ngoài kế hoạch dự kiến
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col mt-4">
                        <h3 className="text-[17px] font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 tracking-tight">Tiến độ</h3>
                        
                        <div className="flex items-center justify-between mb-5">
                            <span className="text-[14px] font-bold text-slate-700">Số cúp đã đạt</span>
                            <div className="flex items-center gap-1.5 font-bold text-amber-500 text-[14px]">
                                <Trophy className="w-4 h-4 fill-transparent" /> 125/348
                            </div>
                        </div>

                        <div className="mb-5">
                            <h4 className="text-[14px] font-bold text-slate-700 mb-3">Số Units đạt 2 cúp trở lên</h4>
                            <div className="w-full bg-[#2563eb] h-[10px] rounded-full overflow-hidden flex relative mb-4">
                                <div className="bg-[#22c55e] w-[38%] h-full relative z-10 border-r-2 border-white rounded-full"></div>
                            </div>

                            <div className="flex flex-col gap-2.5 text-[13px] text-slate-600 font-medium">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div> Hoàn thành: 44/116 Units
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></div> Kế hoạch: 116/116 Units
                                </div>
                            </div>
                        </div>

                        <p className="text-[13px] text-slate-500 leading-relaxed mb-6 mt-1">
                            Bạn đang học chậm hơn kế hoạch. Phải cố gắng hơn nữa để đạt được mục tiêu đấy!
                        </p>

                        <button className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-[14px] rounded-xl transition-all shadow-md active:scale-[0.98]">
                            Tiếp tục học
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearningPath;
