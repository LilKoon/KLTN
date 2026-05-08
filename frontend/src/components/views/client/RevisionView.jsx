import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SKILL_META = {
  GRAMMAR:    { icon: '📝', label: 'Ngữ pháp',   color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-200',   bar: 'bg-rose-500' },
  LISTENING:  { icon: '🎧', label: 'Nghe',        color: 'text-sky-600',     bg: 'bg-sky-50',     border: 'border-sky-200',    bar: 'bg-sky-500' },
  VOCABULARY: { icon: '📚', label: 'Từ vựng',     color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200',bar: 'bg-emerald-500' },
};

function PronounceButton({ word, lang = 'en-US' }) {
  const speak = (e) => {
    e?.stopPropagation?.(); e?.preventDefault?.();
    if (!word || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = lang; u.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const pref = voices.find(v => v.lang === lang) || voices.find(v => v.lang?.startsWith('en'));
      if (pref) u.voice = pref;
      window.speechSynthesis.speak(u);
    } catch {}
  };
  return (
    <button type="button" onClick={speak} title={`Phát âm "${word}"`}
      className="p-1.5 rounded-lg text-sky-500 hover:text-white hover:bg-sky-500 active:scale-95 transition-all">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    </button>
  );
}

/**
 * Render theory cho 1 BaiHoc theo shape NoiDungLyThuyet:
 *  - GRAMMAR:    { sections: [{heading, content}, ...] }
 *  - VOCABULARY: { topic, words: [{word, type, phonetic, meaning}, ...] }
 *  - LISTENING:  { transcript: '...' }
 * Sao chép cách render từ LessonView để hiển thị nhất quán.
 */
function TheoryRenderer({ baiHoc }) {
  const theory = baiHoc?.NoiDungLyThuyet || {};
  const skill = baiHoc?.KyNang;

  // VOCABULARY: word grid
  if (skill === 'VOCABULARY' || (Array.isArray(theory.words) && theory.words.length > 0)) {
    const words = theory.words || [];
    if (words.length === 0) {
      return <p className="text-slate-400 italic text-sm">Danh sách từ vựng chưa có.</p>;
    }
    return (
      <div>
        {theory.topic && (
          <p className="text-emerald-700 font-bold text-sm mb-3">📚 {theory.topic} · {words.length} từ</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {words.map((w, i) => (
            <div key={i} className="bg-white border border-emerald-100 rounded-xl p-4 hover:border-emerald-300 transition-all">
              <div className="flex items-start justify-between mb-1 gap-2">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-bold text-slate-900 text-base truncate">{w.word}</span>
                  <PronounceButton word={w.word} />
                </div>
                {w.type && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">{w.type}</span>
                )}
              </div>
              {w.phonetic && <p className="text-sky-500 text-sm font-mono mb-1">{w.phonetic}</p>}
              <p className="text-slate-500 text-sm">{w.meaning}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // LISTENING: transcript
  if (skill === 'LISTENING' || typeof theory.transcript === 'string') {
    const transcript = theory.transcript || '';
    if (!transcript.trim()) {
      return <p className="text-slate-400 italic text-sm">Transcript chưa có.</p>;
    }
    return (
      <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-4">
        <p className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-2">Transcript</p>
        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{transcript}</p>
      </div>
    );
  }

  // GRAMMAR (default): sections
  const allSections = (theory.sections || []).filter(s => (s.heading || s.title || '').trim() || (s.content || '').trim());
  if (allSections.length === 0) {
    return <p className="text-slate-400 italic text-sm">Nội dung lý thuyết chưa có.</p>;
  }
  return (
    <div className="space-y-3">
      {allSections.map((sec, i) => {
        const heading = (sec.heading || sec.title || '').trim();
        const content = (sec.content || '').trim();
        const standalone = heading && !content;
        return (
          <div key={i} className={standalone ? 'pt-2 first:pt-0' : 'bg-slate-50 rounded-xl p-4 border border-slate-100'}>
            {heading && (
              <h3 className={`font-bold text-slate-800 ${standalone ? 'text-base border-b-2 border-rose-200 pb-1.5 text-rose-800' : 'text-sm mb-1.5'}`}>
                {heading}
              </h3>
            )}
            {content && (
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">{content}</p>
            )}
            {sec.examples?.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-slate-500 list-disc list-inside">
                {sec.examples.map((ex, ei) => <li key={ei}>{ex}</li>)}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RevisionView({ maNode }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('theory'); // 'theory' | 'exercises'

  // Exercise state
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [passed, setPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRevision = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/path/node/${maNode}/revision`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setData(await res.json());
      } finally {
        setLoading(false);
      }
    };
    fetchRevision();
  }, [maNode, token]);

  const handleSelect = (qId, opt) => {
    if (score !== null) return;
    setAnswers(prev => ({ ...prev, [qId]: opt }));
  };

  const handleCheck = () => {
    if (score !== null) { setAnswers({}); setScore(null); setPassed(false); return; }
    let correct = 0;
    const details = (data?.exercises || []).map(ex => {
      const isCorrect = (answers[ex.MaCauHoi] || '').trim() === (ex.DapAnDung || '').trim();
      if (isCorrect) correct++;
      return { MaCauHoi: ex.MaCauHoi, isCorrect };
    });
    setScore(correct);
    const p = correct >= Math.ceil(data.exercises.length * 0.8);
    setPassed(p);
    if (p) handleComplete(correct, data.exercises.length, details);
  };

  const handleComplete = async (s, t, details) => {
    setSubmitting(true);
    try {
      await fetch(`http://127.0.0.1:8000/path/node/${maNode}/revision/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: s, total: t, details }),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Đang tải nội dung ôn tập...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-slate-400">Không tải được nội dung ôn tập.</p>
    </div>
  );

  const theories = data.theories || [];
  const exercises = data.exercises || [];
  const nodeInfo = data.node || {};
  const allAnswered = Object.keys(answers).length >= exercises.length;

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back */}
        <button onClick={() => navigate('/client/learning-path')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại lộ trình
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">📖</div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{nodeInfo.TieuDe || 'Ôn tập tổng hợp'}</h1>
              <p className="text-slate-500 text-sm">{nodeInfo.MoTa}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b border-slate-100 pb-0">
            <button onClick={() => setTab('theory')}
              className={`px-5 py-2.5 font-bold text-sm rounded-t-xl transition-all ${tab === 'theory' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700'}`}>
              <BookOpen className="w-4 h-4 inline mr-2" />Lý thuyết ({theories.length} bài)
            </button>
            <button onClick={() => setTab('exercises')}
              className={`px-5 py-2.5 font-bold text-sm rounded-t-xl transition-all ${tab === 'exercises' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700'}`}>
              Bài tập ({exercises.length} câu)
            </button>
          </div>
        </div>

        {/* Theory tab */}
        {tab === 'theory' && (
          <div className="space-y-6">
            {theories.map((th, idx) => {
              const meta = SKILL_META[th.KyNang] || { icon: '📖', label: th.KyNang, bg: 'bg-slate-50', border: 'border-slate-200', color: 'text-slate-600' };
              return (
                <div key={idx} className={`bg-white rounded-2xl border-2 ${meta.border} overflow-hidden`}>
                  <div className={`${meta.bg} px-6 py-4 flex items-center gap-3`}>
                    <span className="text-2xl">{meta.icon}</span>
                    <div>
                      <h2 className={`font-bold text-lg ${meta.color}`}>{th.TenBaiHoc}</h2>
                      {th.ChuDe && <p className="text-slate-500 text-xs">{th.ChuDe}</p>}
                    </div>
                  </div>
                  {th.FileAudio && th.KyNang === 'LISTENING' && (
                    <div className="px-6 pt-4">
                      <audio controls className="w-full">
                        <source src={`${API_BASE_URL}/static/${th.FileAudio}`} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                  <div className="px-6 py-4">
                    <TheoryRenderer baiHoc={th} />
                  </div>
                </div>
              );
            })}
            {theories.length === 0 && (
              <div className="bg-white p-8 rounded-xl text-center text-slate-400 border border-dashed border-slate-200">
                Không có bài học liên kết.
              </div>
            )}
            <div className="text-center pt-4">
              <button onClick={() => setTab('exercises')}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                Chuyển sang Bài tập
              </button>
            </div>
          </div>
        )}

        {/* Exercises tab */}
        {tab === 'exercises' && (
          <div>
            <div className="space-y-5">
              {exercises.map((ex, idx) => {
                const meta = SKILL_META[ex.KyNang] || SKILL_META.GRAMMAR;
                const isSelected = !!answers[ex.MaCauHoi];
                const isCorrect = score !== null && (answers[ex.MaCauHoi] || '').trim() === (ex.DapAnDung || '').trim();
                const isWrong = score !== null && isSelected && !isCorrect;

                return (
                  <div key={ex.MaCauHoi} className={`bg-white rounded-2xl border-2 p-6 shadow-sm ${
                    score !== null ? (isCorrect ? 'border-emerald-200' : isWrong ? 'border-red-200' : 'border-slate-100') :
                    isSelected ? 'border-amber-200' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{meta.icon}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${meta.bg} ${meta.color}`}>{meta.label}</span>
                      <span className="text-slate-400 text-xs">Câu {idx + 1}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-4">{ex.NoiDung}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ex.DapAn.map((opt, i) => {
                        const sel = answers[ex.MaCauHoi] === opt;
                        const correct = opt.trim() === (ex.DapAnDung || '').trim();
                        let cls = 'border-slate-200 text-slate-600 hover:border-slate-400';
                        if (score !== null) {
                          if (correct) cls = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                          else if (sel && !correct) cls = 'border-red-400 bg-red-50 text-red-700 line-through opacity-60';
                          else cls = 'border-slate-200 text-slate-400 opacity-40';
                        } else if (sel) {
                          cls = 'border-amber-400 bg-amber-50 text-amber-700 shadow-md';
                        }
                        return (
                          <button key={i} disabled={score !== null}
                            onClick={() => handleSelect(ex.MaCauHoi, opt)}
                            className={`p-3.5 rounded-xl border-2 text-left transition-all font-medium text-sm ${cls}`}>
                            <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                          </button>
                        );
                      })}
                    </div>
                    {score !== null && ex.GiaiThich && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-sm">
                        <span className="font-bold">Giải thích: </span>{ex.GiaiThich}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Score + action */}
            <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {score === null ? (
                <p className="text-slate-500 font-medium">Chọn đáp án cho tất cả câu rồi bấm Chấm điểm.</p>
              ) : (
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {score}/{exercises.length}
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                      {passed ? 'Hoàn thành! Trạm kiểm tra mới đã mở.' : 'Chưa đủ 80%. Xem lại lý thuyết rồi thử lại.'}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                {passed ? (
                  <button onClick={() => navigate('/client/learning-path')}
                    className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all">
                    Tiếp tục lộ trình
                  </button>
                ) : (
                  <button onClick={score !== null ? handleCheck : handleCheck}
                    disabled={!allAnswered}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      allAnswered ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}>
                    {score !== null ? 'Làm lại' : 'Chấm Điểm'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
