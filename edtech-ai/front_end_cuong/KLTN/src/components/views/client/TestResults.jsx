import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { apiGetExamResult } from '../../../api';

// ─── Helpers ────────────────────────────────────────────────────────────────
const SKILL_META = {
    GRAMMAR: { label: 'Ngữ pháp', icon: '📖', color: '#14b8a6', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
    VOCABULARY: { label: 'Từ vựng', icon: '💡', color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1' },
    LISTENING: { label: 'Nghe', icon: '🎧', color: '#8b5cf6', bg: '#faf5ff', border: '#ddd6fe', text: '#6d28d9' },
};

function getScoreLevel(score) {
    if (score >= 80) return { label: 'Xuất sắc', emoji: '🏆', color: '#14b8a6' };
    if (score >= 65) return { label: 'Khá', emoji: '🌟', color: '#0ea5e9' };
    if (score >= 45) return { label: 'Trung bình', emoji: '📚', color: '#f59e0b' };
    return { label: 'Cần cải thiện', emoji: '💪', color: '#f43f5e' };
}

// Animated counter hook
function useCountUp(target, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (target === 0) return;
        const start = Date.now();
        const tick = () => {
            const progress = Math.min((Date.now() - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [target, duration]);
    return value;
}

// Circular progress ring
function ScoreRing({ score, size = 140, stroke = 10 }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const level = getScoreLevel(score);
    const animated = useCountUp(score);
    const offset = circ - (animated / 100) * circ;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={level.color} strokeWidth={stroke}
                    strokeLinecap="round" strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{animated}%</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: level.color, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{level.label}</span>
            </div>
        </div>
    );
}

// Skill bar component
function SkillBar({ skill, correct, total, comp }) {
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
    const meta = SKILL_META[skill] || { label: skill, icon: '📋', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', text: '#475569' };
    const animated = useCountUp(pct);
    return (
        <div style={{ background: meta.bg, border: `1.5px solid ${meta.border}`, borderRadius: 16, padding: '1.1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.2rem' }}>{meta.icon}</span>
                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{meta.label}</span>
                    {comp && (
                        <span style={{
                            marginLeft: 4, fontSize: '0.75rem', fontWeight: 800, padding: '2px 6px', borderRadius: 6,
                            background: comp.status === 'increase' ? '#dcfce7' : comp.status === 'decrease' ? '#fee2e2' : '#f1f5f9',
                            color: comp.status === 'increase' ? '#16a34a' : comp.status === 'decrease' ? '#dc2626' : '#64748b'
                        }}>
                            {comp.status === 'increase' ? `⬆ ${comp.diff}%` : comp.status === 'decrease' ? `⬇ ${comp.diff}%` : `➖`}
                        </span>
                    )}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, color: meta.color, fontSize: '1.15rem' }}>{animated}%</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: 4 }}>{correct}/{total}</span>
                </div>
            </div>
            <div style={{ height: 8, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${animated}%`, background: meta.color, borderRadius: 999, transition: 'width 0.05s linear' }} />
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function TestResults() {
    const { token } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const examId = searchParams.get('examId');
    const topRef = useRef(null);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');   // 'all' | 'wrong' | skill name
    const [expandedIdx, setExpandedIdx] = useState(null);
    const [bannerVisible, setBannerVisible] = useState(true);

    useEffect(() => {
        if (!examId || !token) return;
        setLoading(true);
        apiGetExamResult(token, examId)
            .then(data => { setResult(data); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [examId, token]);

    // ─── Loading ────────────────────────────────────────────────────────
    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, border: '4px solid #14b8a6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: '#64748b', fontWeight: 600 }}>Đang tải kết quả...</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        </div>
    );

    if (error || !result) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 24 }}>
            <div style={{ background: '#fff', padding: 32, borderRadius: 20, border: '1px solid #fee2e2', textAlign: 'center', maxWidth: 400 }}>
                <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Không thể tải kết quả</h3>
                <p style={{ color: '#64748b', marginBottom: 16 }}>{error || 'Không tìm thấy bài kiểm tra'}</p>
                <button onClick={() => navigate('/client/dashboard')}
                    style={{ padding: '10px 24px', background: '#14b8a6', color: '#fff', borderRadius: 12, border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                    Về trang chủ
                </button>
            </div>
        </div>
    );

    const { score, correct_count, wrong_count, total_questions, details, evaluation, exam_type, comparison } = result;
    const isFinal = exam_type === 'FINAL';
    const level = getScoreLevel(score);

    // ─── Per-skill stats ─────────────────────────────────────────────────
    const skillStats = {};
    details.forEach(d => {
        if (!skillStats[d.skill]) skillStats[d.skill] = { correct: 0, total: 0 };
        skillStats[d.skill].total++;
        if (d.is_correct) skillStats[d.skill].correct++;
    });

    const totalTimeSeconds = details.reduce((s, d) => s + (d.time_spent || 0), 0);
    const timeFormatted = `${Math.floor(totalTimeSeconds / 60)}p ${totalTimeSeconds % 60}s`;

    // ─── Filter tabs  ─────────────────────────────────────────────────
    const filteredDetails = details.filter(d => {
        if (activeTab === 'all') return true;
        if (activeTab === 'wrong') return !d.is_correct;
        return d.skill === activeTab;
    });

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                @keyframes tr-slide-down { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
                @keyframes tr-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin { to{transform:rotate(360deg)} }
                .tr-card { animation: tr-fade-up 0.4s ease both; }
                .tr-tab-btn { transition: all 0.18s ease; cursor: pointer; border: none; }
                .tr-detail-item { transition: box-shadow 0.15s ease; }
                .tr-detail-item:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
                .tr-cta-btn { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .tr-cta-btn:hover { transform: translateY(-2px); }
            `}</style>

            <div ref={topRef} style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 60px' }}>

                {/* ── Score Notification Banner ── */}
                {bannerVisible && !isFinal && (
                    <div style={{
                        animation: 'tr-slide-down 0.45s ease both',
                        background: score >= 65
                            ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
                            : score >= 45
                                ? 'linear-gradient(135deg, #78350f 0%, #92400e 100%)'
                                : 'linear-gradient(135deg, #4c0519 0%, #881337 100%)',
                        borderRadius: 20, padding: '16px 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 16, flexWrap: 'wrap',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                        marginBottom: 24,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: '2rem' }}>{level.emoji}</span>
                            <div>
                                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                                    Kết quả bài kiểm tra đầu vào
                                </p>
                                <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem' }}>
                                    Bạn đạt <span style={{ color: level.color, fontSize: '1.3rem' }}>{Math.round(score)}%</span> — {level.label}! ({correct_count}/{total_questions} câu đúng)
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setBannerVisible(false)}
                            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}

                {/* ── Header: Score + Skill Bars ── */}
                <div className="tr-card" style={{ background: '#fff', borderRadius: 24, padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: 20, animationDelay: '0.05s' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 32, marginBottom: 28 }}>
                        {/* Score Ring */}
                        <ScoreRing score={Math.round(score)} size={140} stroke={11} />

                        {/* Summary */}
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.02em' }}>
                                Kết quả bài kiểm tra
                            </h1>
                            <p style={{ color: '#64748b', fontWeight: 500, marginBottom: 16, fontSize: '0.9rem' }}>
                                {isFinal ? 'Final Test — Đánh giá cuối khóa' : 'Placement Test — Đánh giá đầu vào'}
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                {[
                                    { icon: '✅', val: correct_count, label: 'câu đúng', color: '#14b8a6' },
                                    { icon: '❌', val: wrong_count, label: 'câu sai', color: '#f43f5e' },
                                    { icon: '⏱', val: timeFormatted, label: 'thời gian', color: '#0ea5e9', noCount: true },
                                ].map((s, i) => (
                                    <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: '8px 14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>{s.icon}</span>
                                        <div>
                                            <p style={{ fontWeight: 800, color: s.color, fontSize: '1rem', lineHeight: 1 }}>
                                                {s.noCount ? s.val : `${s.val}/${total_questions}`}
                                            </p>
                                            <p style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Per-skill bars */}
                    <div>
                        <h2 style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>📊</span> Điểm theo từng kỹ năng
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                            {Object.entries(skillStats).map(([skill, s]) => (
                                <SkillBar key={skill} skill={skill} correct={s.correct} total={s.total} comp={comparison ? comparison[skill] : null} />
                            ))}
                        </div>
                    </div>

                    {/* AI Evaluation */}
                    {evaluation && (
                        <div style={{ marginTop: 24, padding: '20px', background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', borderRadius: '16px', border: '1px solid #f5d0fe' }}>
                            <h3 style={{ fontWeight: 800, color: '#86198f', fontSize: '1.05rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>🤖</span> Nhận xét từ Hệ thống
                            </h3>
                            <p style={{ color: '#701a75', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 500 }}>
                                {evaluation}
                            </p>
                        </div>
                    )}
                </div>

                {/* ── CTA Buttons ── */}
                <div className="tr-card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24, animationDelay: '0.1s' }}>
                    <button onClick={() => navigate(isFinal ? '/client/final-test' : '/client/dashboard')}
                        className="tr-cta-btn"
                        style={{ padding: '13px 28px', borderRadius: 14, border: '2px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        {isFinal ? 'Trở về' : 'Trở về Trang Chủ'}
                    </button>
                    {isFinal ? (
                        <button onClick={() => navigate('/client/final-test')}
                            className="tr-cta-btn"
                            style={{ padding: '13px 28px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 20px rgba(244,63,94,0.35)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Làm lại bài Test
                        </button>
                    ) : (
                        <button onClick={() => navigate('/client/learning-path')}
                            className="tr-cta-btn"
                            style={{ padding: '13px 28px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 20px rgba(20,184,166,0.35)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            Xem Lộ Trình Học
                        </button>
                    )}
                </div>

                {/* ── Detail Review Section ── */}
                <div className="tr-card" style={{ background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden', animationDelay: '0.15s' }}>
                    {/* Section header */}
                    <div style={{ padding: '24px 28px 0' }}>
                        <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem', marginBottom: 16 }}>📋 Chi tiết bài làm</h2>

                        {/* Filter tabs */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                            {[
                                { key: 'all', label: `Tất cả (${details.length})` },
                                { key: 'wrong', label: `Sai (${wrong_count})` },
                                ...Object.keys(skillStats).map(sk => ({
                                    key: sk,
                                    label: `${SKILL_META[sk]?.icon || '📋'} ${SKILL_META[sk]?.label || sk}`
                                })),
                            ].map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                    className="tr-tab-btn"
                                    style={{
                                        padding: '6px 14px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700,
                                        background: activeTab === tab.key ? '#0f172a' : '#f1f5f9',
                                        color: activeTab === tab.key ? '#fff' : '#64748b',
                                        border: activeTab === tab.key ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0',
                                    }}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Question list */}
                    <div style={{ padding: '0 16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {filteredDetails.length === 0 && (
                                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0', fontWeight: 500 }}>
                                    Không có câu hỏi nào trong bộ lọc này.
                                </p>
                            )}
                            {filteredDetails.map((item, idx) => {
                                const isOpen = expandedIdx === idx;
                                const skillMeta = SKILL_META[item.skill] || {};
                                return (
                                    <div key={idx} className="tr-detail-item" style={{
                                        border: `1.5px solid ${item.is_correct ? '#d1fae5' : '#fee2e2'}`,
                                        borderRadius: 16, background: item.is_correct ? '#f0fdf4' : '#fff8f8',
                                        overflow: 'hidden',
                                    }}>
                                        {/* Row header — clickable to expand */}
                                        <button onClick={() => setExpandedIdx(isOpen ? null : idx)}
                                            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 18px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
                                            {/* Correct/wrong badge */}
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                                background: item.is_correct ? '#14b8a6' : '#f43f5e',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {item.is_correct
                                                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                }
                                            </div>

                                            {/* Question summary */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: skillMeta.text || '#64748b', background: skillMeta.bg || '#f8fafc', border: `1px solid ${skillMeta.border || '#e2e8f0'}`, padding: '1px 8px', borderRadius: 999 }}>
                                                        {skillMeta.icon} {skillMeta.label || item.skill}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Câu {item.index}</span>
                                                </div>
                                                <p style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isOpen ? 'normal' : 'nowrap' }}>
                                                    {item.question}
                                                </p>
                                            </div>

                                            {/* Expand chevron */}
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"
                                                style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Expanded content */}
                                        {isOpen && (
                                            <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${item.is_correct ? '#bbf7d0' : '#fecdd3'}` }}>
                                                {/* Audio */}
                                                {item.audio && (
                                                    <div style={{ margin: '14px 0 10px', background: '#f8fafc', padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>🎧 Audio</p>
                                                        <audio controls src={`http://127.0.0.1:8000/static/audios/${item.audio}`} style={{ width: '100%', maxWidth: 360, height: 36 }} />
                                                    </div>
                                                )}

                                                {/* Options grid */}
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, margin: '14px 0' }}>
                                                    {Object.entries(item.options).map(([key, text]) => {
                                                        const isCorrectOption = key === item.correct_answer;
                                                        const isSelectedOption = key === item.selected;
                                                        let bg = '#f8fafc', border = '#e2e8f0', color = '#475569';
                                                        if (isCorrectOption) { bg = '#f0fdf4'; border = '#86efac'; color = '#15803d'; }
                                                        if (isSelectedOption && !item.is_correct) { bg = '#fff1f2'; border = '#fda4af'; color = '#be123c'; }
                                                        return (
                                                            <div key={key} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <span style={{ fontWeight: 800, color, fontSize: '0.85rem', flexShrink: 0 }}>{key}</span>
                                                                <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>{text}</span>
                                                                {isCorrectOption && <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>✅</span>}
                                                                {isSelectedOption && !item.is_correct && <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>❌</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Answer summary */}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '0.82rem', marginBottom: 10 }}>
                                                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '5px 12px', border: '1px solid #e2e8f0' }}>
                                                        <span style={{ color: '#94a3b8', fontWeight: 600 }}>Bạn chọn: </span>
                                                        <span style={{ fontWeight: 700, color: item.is_correct ? '#15803d' : '#be123c' }}>
                                                            {item.selected || '(Chưa trả lời)'}
                                                        </span>
                                                    </div>
                                                    {!item.is_correct && (
                                                        <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '5px 12px', border: '1px solid #bbf7d0' }}>
                                                            <span style={{ color: '#94a3b8', fontWeight: 600 }}>Đáp án đúng: </span>
                                                            <span style={{ fontWeight: 700, color: '#15803d' }}>{item.correct_answer}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Explanation */}
                                                {item.explanation && item.skill !== 'LISTENING' && (
                                                    <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)', borderRadius: 12, padding: '12px 16px', border: '1px solid #bae6fd' }}>
                                                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1', marginBottom: 4 }}>💡 Giải thích</p>
                                                        <p style={{ fontSize: '0.84rem', color: '#1e3a5f', lineHeight: 1.6, fontWeight: 500 }}>{item.explanation}</p>
                                                    </div>
                                                )}
                                                {item.explanation && item.skill === 'LISTENING' && (
                                                    <div style={{ background: '#faf5ff', borderRadius: 12, padding: '12px 16px', border: '1px solid #ddd6fe' }}>
                                                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6d28d9', marginBottom: 6 }}>📝 Transcript</p>
                                                        <p style={{ fontSize: '0.84rem', color: '#3b1f73', lineHeight: 1.7, fontWeight: 500, whiteSpace: 'pre-line' }}>{item.explanation}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Bottom CTA repeated ── */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 28 }}>
                    <button onClick={() => navigate(isFinal ? '/client/final-test' : '/client/dashboard')} className="tr-cta-btn"
                        style={{ padding: '13px 28px', borderRadius: 14, border: '2px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        {isFinal ? 'Trở về' : 'Trở về Trang Chủ'}
                    </button>
                    {isFinal ? (
                        <button onClick={() => navigate('/client/final-test')} className="tr-cta-btn"
                            style={{ padding: '13px 28px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 20px rgba(244,63,94,0.35)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Làm lại bài Test
                        </button>
                    ) : (
                        <button onClick={() => navigate('/client/learning-path')} className="tr-cta-btn"
                            style={{ padding: '13px 28px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 20px rgba(20,184,166,0.35)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            Xem Lộ Trình Học
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
