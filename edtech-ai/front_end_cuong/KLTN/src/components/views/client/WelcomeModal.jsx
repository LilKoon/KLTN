import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';

/**
 * WelcomeModal
 * Props:
 *   - isNewUser (bool): true = user mới, false = user cũ
 *   - userName (string): tên hiển thị
 *   - onClose (fn): đóng modal / ẩn banner
 */
export default function WelcomeModal({ isNewUser, userName, onClose }) {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    // Animate in after first paint
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 30);
        return () => clearTimeout(t);
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 320);
    };

    const handleChoice = (choice) => {
        setSelectedCard(choice);
        setTimeout(() => {
            handleClose();
            if (choice === 'test') navigate('/client/placement-test');
            else navigate('/client/flashcard-storage');
        }, 280);
    };

    /* ─────────────────────────────────────────
       USER MỚI — Fullscreen overlay via Portal
    ───────────────────────────────────────── */
    if (isNewUser) {
        const overlay = (
            <>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                    .wm-wrap {
                        font-family: 'Inter', sans-serif;
                        position: fixed; inset: 0; z-index: 99999;
                        display: flex; align-items: center; justify-content: center;
                        padding: 16px;
                        background: rgba(10,18,36,0.82);
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                        transition: opacity 0.32s ease;
                    }
                    .wm-card-btn {
                        transition: transform 0.22s cubic-bezier(.34,1.56,.64,1),
                                    box-shadow 0.22s ease,
                                    border-color 0.18s ease;
                        background: none; border: none; padding: 0;
                        cursor: pointer; text-align: left;
                    }
                    .wm-card-btn:hover { transform: translateY(-6px) scale(1.03); }
                    .wm-card-btn:active { transform: scale(0.97); }
                    .wm-card-btn.chosen { transform: scale(0.95); opacity: 0.8; }
                    @keyframes wm-pop {
                        from { opacity:0; transform: scale(0.9) translateY(28px); }
                        to   { opacity:1; transform: scale(1) translateY(0); }
                    }
                    .wm-panel { animation: wm-pop 0.42s cubic-bezier(.22,1,.36,1) both; }
                    @keyframes wm-float {
                        0%,100% { transform: translateY(0px) rotate(-2deg); }
                        50%    { transform: translateY(-10px) rotate(2deg); }
                    }
                    .wm-emoji { animation: wm-float 3.2s ease-in-out infinite; display:inline-block; }
                    @keyframes wm-ring {
                        0%   { opacity:0.55; transform: scale(1); }
                        100% { opacity:0; transform: scale(1.9); }
                    }
                    .wm-ring { animation: wm-ring 2s ease-out infinite; }
                `}</style>

                <div
                    className="wm-wrap"
                    style={{ opacity: visible ? 1 : 0 }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
                >
                    <div className="wm-panel" style={{
                        background: 'linear-gradient(150deg, #0d1b2e 0%, #0f2744 50%, #061420 100%)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '28px',
                        padding: 'clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2.5rem)',
                        maxWidth: '700px',
                        width: '100%',
                        boxShadow: '0 48px 96px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Decorative blobs */}
                        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(20,184,166,0.22) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(24px)', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', top: '40%', left: '-20px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(12px)', pointerEvents: 'none' }} />

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '2.25rem', position: 'relative', zIndex: 1 }}>
                            <div className="wm-emoji" style={{ fontSize: '3rem', marginBottom: '0.9rem', lineHeight: 1 }}>👋</div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '4px 14px', borderRadius: '999px',
                                background: 'rgba(20,184,166,0.13)', border: '1px solid rgba(20,184,166,0.28)',
                                color: '#2dd4bf', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
                                textTransform: 'uppercase', marginBottom: '1rem',
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2dd4bf', display: 'inline-block' }} />
                                Tài khoản mới
                            </div>
                            <h2 style={{
                                fontSize: 'clamp(1.5rem, 4.5vw, 2.2rem)', fontWeight: 900, color: '#f1f5f9',
                                lineHeight: 1.15, margin: '0 0 0.8rem', letterSpacing: '-0.02em',
                            }}>
                                Chào mừng,{' '}
                                <span style={{ background: 'linear-gradient(90deg, #2dd4bf 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {userName || 'bạn'}!
                                </span>
                            </h2>
                            <p style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.925rem', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>
                                Hãy chọn hành động đầu tiên trong hành trình chinh phục tiếng Anh của bạn.
                            </p>
                        </div>

                        {/* Two choice cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', position: 'relative', zIndex: 1 }}>

                            {/* Card 1 — Kiểm tra đầu vào */}
                            <button
                                id="welcome-choice-test"
                                className={`wm-card-btn${selectedCard === 'test' ? ' chosen' : ''}`}
                                onClick={() => handleChoice('test')}
                            >
                                <div style={{
                                    background: 'linear-gradient(145deg, #093d39 0%, #0a4a5a 100%)',
                                    border: selectedCard === 'test' ? '2px solid #2dd4bf' : '1.5px solid rgba(45,212,191,0.22)',
                                    borderRadius: '20px', padding: '1.75rem 1.5rem',
                                    boxShadow: selectedCard === 'test' ? '0 0 32px rgba(45,212,191,0.25)' : '0 8px 24px rgba(0,0,0,0.28)',
                                    position: 'relative', overflow: 'hidden',
                                    transition: 'border-color 0.18s ease, box-shadow 0.22s ease',
                                }}>
                                    {/* Icon with pulse ring */}
                                    <div style={{ position: 'relative', display: 'inline-flex', marginBottom: '1.25rem' }}>
                                        <div className="wm-ring" style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', border: '1.5px solid rgba(45,212,191,0.5)' }} />
                                        <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(45,212,191,0.12)', border: '1.5px solid rgba(45,212,191,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>📝</div>
                                    </div>
                                    <h3 style={{ color: '#ecfdf5', fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
                                        Kiểm tra đầu vào
                                    </h3>
                                    <p style={{ color: '#6ee7b7', fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.55, margin: '0 0 1.25rem' }}>
                                        Đánh giá trình độ để xây dựng lộ trình học phù hợp nhất với bạn.
                                    </p>
                                    {/* Bottom arrow */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2dd4bf', fontSize: '0.78rem', fontWeight: 700 }}>
                                        Bắt đầu ngay
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                    {/* Subtle corner glow */}
                                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%)' }} />
                                </div>
                            </button>

                            {/* Card 2 — Học Flashcard */}
                            <button
                                id="welcome-choice-flashcard"
                                className={`wm-card-btn${selectedCard === 'flashcard' ? ' chosen' : ''}`}
                                onClick={() => handleChoice('flashcard')}
                            >
                                <div style={{
                                    background: 'linear-gradient(145deg, #0d2d52 0%, #1a2a54 100%)',
                                    border: selectedCard === 'flashcard' ? '2px solid #38bdf8' : '1.5px solid rgba(56,189,248,0.22)',
                                    borderRadius: '20px', padding: '1.75rem 1.5rem',
                                    boxShadow: selectedCard === 'flashcard' ? '0 0 32px rgba(56,189,248,0.25)' : '0 8px 24px rgba(0,0,0,0.28)',
                                    position: 'relative', overflow: 'hidden',
                                    transition: 'border-color 0.18s ease, box-shadow 0.22s ease',
                                }}>
                                    <div style={{ position: 'relative', display: 'inline-flex', marginBottom: '1.25rem' }}>
                                        <div className="wm-ring" style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', border: '1.5px solid rgba(56,189,248,0.5)', animationDelay: '1s' }} />
                                        <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(56,189,248,0.12)', border: '1.5px solid rgba(56,189,248,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>🃏</div>
                                    </div>
                                    <h3 style={{ color: '#f0f9ff', fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
                                        Học từ vựng Flashcard
                                    </h3>
                                    <p style={{ color: '#7dd3fc', fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.55, margin: '0 0 1.25rem' }}>
                                        Khám phá kho Flashcard thông minh với spaced repetition cực hiệu quả.
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.78rem', fontWeight: 700 }}>
                                        Khám phá ngay
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)' }} />
                                </div>
                            </button>
                        </div>

                        {/* Skip */}
                        <p style={{ textAlign: 'center', marginTop: '1.5rem', position: 'relative', zIndex: 1 }}>
                            <button
                                id="welcome-skip-btn"
                                onClick={handleClose}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '3px' }}
                            >
                                Bỏ qua, khám phá sau
                            </button>
                        </p>
                    </div>
                </div>
            </>
        );

        // Render vào document.body để tránh bị clip bởi overflow-hidden của layout
        return ReactDOM.createPortal(overlay, document.body);
    }

    /* ─────────────────────────────────────────
       USER CŨ — Inline returning banner
    ───────────────────────────────────────── */
    return (
        <div style={{
            transition: 'opacity 0.32s ease, transform 0.32s ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-14px)',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @keyframes wm-shimmer {
                    0%   { background-position: -500px 0; }
                    100% { background-position: 500px 0; }
                }
                .wm-cta-btn {
                    background: linear-gradient(90deg, #2dd4bf, #38bdf8, #818cf8, #38bdf8, #2dd4bf);
                    background-size: 500px 100%;
                    animation: wm-shimmer 3s linear infinite;
                }
                @keyframes wm-slide-right {
                    from { opacity:0; transform: translateX(-20px); }
                    to   { opacity:1; transform: translateX(0); }
                }
                .wm-return-banner { animation: wm-slide-right 0.4s ease both; font-family: 'Inter', sans-serif; }
            `}</style>

            <div className="wm-return-banner" style={{
                background: 'linear-gradient(135deg, #0d1b2e 0%, #1e253b 50%, #0b3654 100%)',
                borderRadius: '20px',
                padding: '1.5rem 2rem',
                border: '1px solid rgba(56,189,248,0.18)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
                flexWrap: 'wrap',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '0.5rem',
            }}>
                {/* BG Glow */}
                <div style={{ position: 'absolute', top: '-40px', right: '15%', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-30px', left: '30%', width: '160px', height: '160px', background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                {/* Left: greeting */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '200px' }}>
                    <div style={{
                        width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem', boxShadow: '0 4px 16px rgba(14,165,233,0.35)',
                        position: 'relative',
                    }}>
                        🌟
                        <div style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', border: '1.5px solid rgba(14,165,233,0.3)' }} />
                    </div>
                    <div>
                        <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, marginBottom: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Chào mừng trở lại
                        </p>
                        <h3 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.05rem', margin: 0, letterSpacing: '-0.01em' }}>
                            {userName || 'bạn'} — Tiếp tục hành trình nào!
                        </h3>
                    </div>
                </div>

                {/* Right: CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <button
                        id="returning-daily-review-btn"
                        className="wm-cta-btn"
                        onClick={() => { handleClose(); navigate('/client/daily-review'); }}
                        style={{
                            padding: '0.65rem 1.4rem', borderRadius: '12px', border: 'none',
                            cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
                            color: '#0f172a', whiteSpace: 'nowrap',
                            boxShadow: '0 4px 16px rgba(56,189,248,0.3)',
                        }}
                    >
                        Ôn tập hôm nay 📚
                    </button>
                    <button
                        id="returning-banner-close-btn"
                        onClick={handleClose}
                        style={{
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#94a3b8', flexShrink: 0, transition: 'background 0.18s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
