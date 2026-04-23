import React, { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
    const [messages, setMessages] = useState([
        { id: 1, text: 'Xin chào! Tôi là Trợ lý AI. Tôi có thể giúp gì cho bạn hôm nay?', sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiMsg = { id: Date.now() + 1, text: 'Tính năng này đang được phát triển để kết nối với Backend AI. Vui lòng quay lại sau!', sender: 'ai' };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto py-6">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
                .typing-dot { animation: typing 1.4s infinite ease-in-out both; }
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
                @keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
            `}</style>
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-200">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Trợ Lý AI</h1>
                    <p className="text-sm text-slate-500 font-medium">Hỏi bất cứ điều gì về tiếng Anh, ngữ pháp hay từ vựng.</p>
                </div>
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col relative">
                {/* Decorative background */}
                <div className="absolute inset-0 bg-slate-50/50 pointer-events-none z-0"></div>

                {/* Messages Area */}
                <div className="flex-1 p-6 overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
                                <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-[15px] font-medium leading-relaxed
                                    ${msg.sender === 'user' 
                                        ? 'bg-slate-900 text-white rounded-br-sm' 
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="flex justify-start animate-slide-in">
                                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex gap-1.5 items-center">
                                    <div className="w-2 h-2 bg-slate-300 rounded-full typing-dot"></div>
                                    <div className="w-2 h-2 bg-slate-300 rounded-full typing-dot"></div>
                                    <div className="w-2 h-2 bg-slate-300 rounded-full typing-dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 z-10">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Nhập câu hỏi của bạn tại đây..." 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim()}
                            className="absolute right-2 p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
