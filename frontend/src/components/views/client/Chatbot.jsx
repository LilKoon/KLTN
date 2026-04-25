import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const API_BASE = 'http://127.0.0.1:8000';

const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((part, i) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) {
            return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        if (/^\*[^*]+\*$/.test(part)) {
            return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        }
        if (/^`[^`]+`$/.test(part)) {
            return <code key={i} className="bg-slate-100 px-1.5 py-0.5 rounded text-[13px] font-mono text-rose-600">{part.slice(1, -1)}</code>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
    });
};

const renderMessage = (text) => {
    const lines = text.split(/\r?\n/);
    const blocks = [];
    let listBuffer = null;

    const flushList = () => {
        if (!listBuffer) return;
        const Tag = listBuffer.type === 'ol' ? 'ol' : 'ul';
        const listClass = listBuffer.type === 'ol'
            ? 'list-decimal pl-6 space-y-1 my-2'
            : 'list-disc pl-6 space-y-1 my-2';
        blocks.push(
            <Tag key={`list-${blocks.length}`} className={listClass}>
                {listBuffer.items.map((item, idx) => (
                    <li key={idx}>{renderInline(item)}</li>
                ))}
            </Tag>
        );
        listBuffer = null;
    };

    lines.forEach((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) { flushList(); return; }
        const bulletMatch = line.match(/^[-*]\s+(.*)$/);
        const numberedMatch = line.match(/^\d+\.\s+(.*)$/);
        if (bulletMatch) {
            if (!listBuffer || listBuffer.type !== 'ul') { flushList(); listBuffer = { type: 'ul', items: [] }; }
            listBuffer.items.push(bulletMatch[1]);
            return;
        }
        if (numberedMatch) {
            if (!listBuffer || listBuffer.type !== 'ol') { flushList(); listBuffer = { type: 'ol', items: [] }; }
            listBuffer.items.push(numberedMatch[1]);
            return;
        }
        flushList();
        blocks.push(<p key={`p-${idx}`} className="my-1">{renderInline(line)}</p>);
    });
    flushList();
    return blocks;
};

const sourceLabel = (t) => {
    if (t === 'pdf_text') return 'PDF (text)';
    if (t === 'pdf_ocr') return 'PDF (OCR)';
    if (t === 'image_ocr') return 'Ảnh (OCR)';
    return 'Tệp';
};

const formatDate = (iso) => {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Vừa xong';
        if (diffMin < 60) return `${diffMin}p trước`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h trước`;
        const diffDay = Math.floor(diffHr / 24);
        if (diffDay < 7) return `${diffDay}d trước`;
        return d.toLocaleDateString('vi-VN');
    } catch { return ''; }
};

function AttachmentCard({ filename, source_type, char_count, variant = 'user' }) {
    const isUser = variant === 'user';
    return (
        <div className={`flex items-center gap-3 rounded-xl px-3 py-2 ${isUser ? 'bg-slate-800/40 border border-white/10' : 'bg-teal-50 border border-teal-200'}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isUser ? 'bg-white/10 text-white' : 'bg-teal-500 text-white'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h6M5 21h14a2 2 0 002-2V7l-5-5H5a2 2 0 00-2 2v15a2 2 0 002 2z" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-bold truncate ${isUser ? 'text-white' : 'text-slate-800'}`}>{filename}</p>
                <p className={`text-[11px] ${isUser ? 'text-white/60' : 'text-slate-500'}`}>
                    {sourceLabel(source_type)}{typeof char_count === 'number' ? ` • ${char_count.toLocaleString('vi-VN')} ký tự` : ''}
                </p>
            </div>
        </div>
    );
}

export default function Chatbot() {
    const { token } = useAuth();
    const authHeaders = useMemo(() => token ? { Authorization: `Bearer ${token}` } : {}, [token]);

    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]); // {id, role, content, attachment? }
    const [attachmentsById, setAttachmentsById] = useState({}); // map id -> attachment record
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoadingSession, setIsLoadingSession] = useState(false);
    const [pendingFile, setPendingFile] = useState(null); // File selected but not yet uploaded

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const activeSession = sessions.find(s => s.id === activeSessionId);
    const latestAttachment = useMemo(() => {
        const list = Object.values(attachmentsById);
        if (!list.length) return null;
        return list.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b);
    }, [attachmentsById]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Load session list on mount / when token changes
    useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                const res = await axios.get(`${API_BASE}/chat/sessions`, { headers: authHeaders });
                setSessions(res.data || []);
            } catch (err) {
                console.error('Lỗi tải danh sách phiên:', err);
            }
        })();
    }, [token, authHeaders]);

    const resetToNewChat = () => {
        setActiveSessionId(null);
        setMessages([]);
        setAttachmentsById({});
        setPendingFile(null);
        setInput('');
    };

    const loadSession = async (sessionId) => {
        if (sessionId === activeSessionId) return;
        setIsLoadingSession(true);
        try {
            const res = await axios.get(`${API_BASE}/chat/sessions/${sessionId}`, { headers: authHeaders });
            const data = res.data;
            const attachMap = {};
            (data.attachments || []).forEach(a => { attachMap[a.id] = a; });
            setAttachmentsById(attachMap);
            setMessages((data.messages || []).map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                attachment: m.attachment_id ? attachMap[m.attachment_id] : null,
            })));
            setActiveSessionId(sessionId);
            setPendingFile(null);
        } catch (err) {
            console.error('Lỗi tải phiên:', err);
            alert('Không tải được phiên trò chuyện.');
        } finally {
            setIsLoadingSession(false);
        }
    };

    const deleteSession = async (e, sessionId) => {
        e.stopPropagation();
        if (!confirm('Xoá cuộc trò chuyện này?')) return;
        try {
            await axios.delete(`${API_BASE}/chat/sessions/${sessionId}`, { headers: authHeaders });
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (activeSessionId === sessionId) resetToNewChat();
        } catch (err) {
            alert('Lỗi xoá phiên.');
        }
    };

    const handlePickFile = (e) => {
        const file = e.target.files?.[0];
        if (e.target) e.target.value = '';
        if (!file) return;
        setPendingFile(file);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isTyping) return;
        if (!token) {
            alert('Bạn cần đăng nhập để dùng trò chuyện.');
            return;
        }

        setIsTyping(true);
        const tempId = `temp-${Date.now()}`;
        let tempAttachmentPreview = null;
        if (pendingFile) {
            tempAttachmentPreview = {
                id: `temp-att-${Date.now()}`,
                filename: pendingFile.name,
                source_type: pendingFile.name.toLowerCase().endsWith('.pdf') ? 'pdf_text' : 'image_ocr',
                char_count: undefined,
            };
        }
        // Optimistic user message
        setMessages(prev => [...prev, {
            id: tempId,
            role: 'user',
            content: trimmed,
            attachment: tempAttachmentPreview,
        }]);
        setInput('');

        try {
            // 1. Ensure session exists
            let sessionId = activeSessionId;
            if (!sessionId) {
                const created = await axios.post(`${API_BASE}/chat/sessions`, { title: trimmed.slice(0, 80) }, { headers: authHeaders });
                sessionId = created.data.id;
                setActiveSessionId(sessionId);
                setSessions(prev => [created.data, ...prev]);
            }

            // 2. Upload pending file (if any) to this session
            let uploadedAttachmentId = null;
            let uploadedAttachmentRecord = null;
            if (pendingFile) {
                const fd = new FormData();
                fd.append('file', pendingFile);
                const upRes = await axios.post(
                    `${API_BASE}/chat/sessions/${sessionId}/attachments`,
                    fd,
                    { headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' } }
                );
                uploadedAttachmentId = upRes.data.id;
                uploadedAttachmentRecord = {
                    id: upRes.data.id,
                    filename: upRes.data.filename,
                    source_type: upRes.data.source_type,
                    char_count: upRes.data.char_count,
                    created_at: new Date().toISOString(),
                };
                setAttachmentsById(prev => ({ ...prev, [uploadedAttachmentId]: uploadedAttachmentRecord }));
                setPendingFile(null);
            }

            // 3. Send message
            const sendRes = await axios.post(
                `${API_BASE}/chat/sessions/${sessionId}/messages`,
                { content: trimmed, attachment_id: uploadedAttachmentId },
                { headers: authHeaders }
            );

            const userMsg = sendRes.data.user_message;
            const aiMsg = sendRes.data.assistant_message;

            // Replace optimistic message with persisted one + append AI reply
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== tempId);
                return [
                    ...filtered,
                    {
                        id: userMsg.id,
                        role: 'user',
                        content: userMsg.content,
                        attachment: userMsg.attachment_id ? (uploadedAttachmentRecord || attachmentsById[userMsg.attachment_id]) : null,
                    },
                    { id: aiMsg.id, role: 'assistant', content: aiMsg.content, attachment: null },
                ];
            });

            // Update sessions list (title + updated_at)
            const newTitle = sendRes.data.session_title;
            setSessions(prev => prev.map(s =>
                s.id === sessionId
                    ? { ...s, title: newTitle, updated_at: new Date().toISOString(), message_count: (s.message_count || 0) + 2 }
                    : s
            ));
        } catch (err) {
            const detail = err.response?.data?.detail || err.message || 'Lỗi không xác định.';
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== tempId);
                return [...filtered, {
                    id: `err-${Date.now()}`,
                    role: 'assistant',
                    content: `Đã xảy ra lỗi: ${detail}`,
                    attachment: null,
                }];
            });
        } finally {
            setIsTyping(false);
        }
    };

    const showWelcome = !activeSessionId && messages.length === 0 && !isTyping;

    return (
        <div className="flex h-[calc(100vh-6rem)] max-w-7xl mx-auto py-6 gap-4">
            <style>{`
                @keyframes slideIn { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
                .typing-dot { animation: typing 1.4s infinite ease-in-out both; }
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
                @keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
            `}</style>

            {/* Sessions Sidebar */}
            <aside className="w-[280px] hidden md:flex flex-col bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden shrink-0">
                <div className="p-4 border-b border-slate-100">
                    <button
                        onClick={resetToNewChat}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Cuộc trò chuyện mới
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                    {sessions.length === 0 ? (
                        <div className="px-3 py-6 text-center text-[13px] text-slate-400 font-medium">
                            Chưa có cuộc trò chuyện nào.
                        </div>
                    ) : (
                        sessions.map(s => (
                            <div
                                key={s.id}
                                onClick={() => loadSession(s.id)}
                                className={`group flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors mb-1 ${
                                    activeSessionId === s.id ? 'bg-teal-50 border border-teal-200' : 'hover:bg-slate-50 border border-transparent'
                                }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[13px] font-bold truncate ${activeSessionId === s.id ? 'text-teal-800' : 'text-slate-700'}`}>
                                        {s.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-slate-400 font-medium">{formatDate(s.updated_at)}</span>
                                        {s.attachment_count > 0 && (
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                {s.attachment_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => deleteSession(e, s.id)}
                                    title="Xoá phiên"
                                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded text-slate-400 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition-all shrink-0"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Chat */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4 px-2">
                    <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-200">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold text-slate-800 truncate">
                            {activeSession?.title || 'Trợ Lý AI'}
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">
                            {activeSession ? `${formatDate(activeSession.updated_at)}` : 'Hỏi bất cứ điều gì về tiếng Anh, ngữ pháp hay từ vựng.'}
                        </p>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="flex-1 bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col relative min-h-0">
                    <div className="absolute inset-0 bg-slate-50/50 pointer-events-none z-0"></div>

                    {/* Messages Area */}
                    <div className="flex-1 p-6 overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-slate-200">
                        <div className="space-y-6">
                            {showWelcome && (
                                <div className="flex justify-start animate-slide-in">
                                    <div className="max-w-[75%] bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm text-[15px] font-medium leading-relaxed text-slate-700">
                                        Xin chào! Tôi là Trợ lý AI. Bạn có thể đính kèm PDF/ảnh và đặt câu hỏi về nội dung trong tệp.
                                    </div>
                                </div>
                            )}

                            {isLoadingSession && (
                                <div className="flex justify-center py-12">
                                    <svg className="w-8 h-8 text-teal-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                            )}

                            {!isLoadingSession && messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
                                    <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-[15px] font-medium leading-relaxed flex flex-col gap-3
                                        ${msg.role === 'user'
                                            ? 'bg-slate-900 text-white rounded-br-sm'
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'}`}>
                                        {msg.attachment && (
                                            <AttachmentCard
                                                filename={msg.attachment.filename}
                                                source_type={msg.attachment.source_type}
                                                char_count={msg.attachment.char_count}
                                                variant={msg.role === 'user' ? 'user' : 'ai'}
                                            />
                                        )}
                                        {msg.content && (
                                            <div className={msg.role === 'user' ? '' : 'min-w-0'}>
                                                {msg.role === 'assistant' ? renderMessage(msg.content) : msg.content}
                                            </div>
                                        )}
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
                        {/* Pending file preview (only before send) */}
                        {pendingFile && (
                            <div className="mb-3 flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
                                <div className="w-9 h-9 rounded-lg bg-teal-500 text-white flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h6M5 21h14a2 2 0 002-2V7l-5-5H5a2 2 0 00-2 2v15a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-slate-800 truncate">{pendingFile.name}</p>
                                    <p className="text-[11px] text-slate-500">Sẽ được tải lên khi bạn gửi tin nhắn</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPendingFile(null)}
                                    title="Bỏ tệp"
                                    className="w-8 h-8 rounded-full text-slate-400 hover:bg-white hover:text-rose-500 flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Active session attachment indicator */}
                        {!pendingFile && latestAttachment && (
                            <div className="mb-3 flex items-center gap-2 px-1 text-[11px] text-slate-500">
                                <svg className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span>
                                    Đang dùng tài liệu <span className="font-bold text-slate-700">{latestAttachment.filename}</span> làm ngữ cảnh
                                </span>
                            </div>
                        )}

                        <form onSubmit={handleSend} className="relative flex items-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePickFile}
                                accept=".pdf,.png,.jpg,.jpeg,.bmp,.tiff,.tif,.webp"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isTyping}
                                title="Đính kèm PDF hoặc ảnh"
                                className="absolute left-2 p-2.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={pendingFile ? `Đặt câu hỏi về "${pendingFile.name}"...` : 'Nhập câu hỏi của bạn tại đây...'}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 rounded-2xl py-4 pl-14 pr-16 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
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
        </div>
    );
}
