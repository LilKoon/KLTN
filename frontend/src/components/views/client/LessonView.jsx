import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AdaptiveExerciseBlock from './AdaptiveExerciseBlock';

/**
 * Phát âm tiếng Anh dùng Web Speech API (TTS native browser, không cần API key).
 * Ưu tiên giọng en-US, fallback bất kỳ giọng en nào có sẵn.
 */
function PronounceButton({ word, lang = 'en-US', size = 16, className = '' }) {
  const speak = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (!word || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = lang;
      u.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const pref = voices.find(v => v.lang === lang) || voices.find(v => v.lang?.startsWith('en'));
      if (pref) u.voice = pref;
      window.speechSynthesis.speak(u);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={speak}
      title={`Phát âm "${word}"`}
      className={`p-1.5 rounded-lg text-sky-500 hover:text-white hover:bg-sky-500 active:scale-95 transition-all ${className}`}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    </button>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Grammar: Hiển thị lý thuyết từ JSON sections + bài tập MCQ */
function GrammarLesson({ theory, exercises, onExercisesResult, topicName, level, maNode, token }) {
  const [showAll, setShowAll] = useState(false);
  const allSections = (theory?.sections || []).filter(
    s => (s.heading || '').trim() || (s.content || '').trim()
  );
  const PREVIEW_COUNT = 15;
  const sections = showAll ? allSections : allSections.slice(0, PREVIEW_COUNT);
  const hasMore = allSections.length > PREVIEW_COUNT;

  const levelColor = { A: 'bg-emerald-100 text-emerald-700', B: 'bg-sky-100 text-sky-700', C: 'bg-rose-100 text-rose-700' }[level] || 'bg-slate-100 text-slate-600';

  return (
    <div className="space-y-8">
      {/* Topic header */}
      {topicName && (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${levelColor}`}>
          📝 {topicName}
          {level && <span className="opacity-60">· Cấp {level}</span>}
        </div>
      )}

      {/* Theory sections */}
      <div className="space-y-4">
        {allSections.length > 0 ? (
          <>
            {sections.map((sec, i) => {
              const hasHeading = (sec.heading || '').trim();
              const hasContent = (sec.content || '').trim();
              // Detect standalone headings (no content below)
              const isStandaloneHeading = hasHeading && !hasContent;
              return (
                <div
                  key={i}
                  className={isStandaloneHeading
                    ? 'pt-4 first:pt-0'
                    : 'bg-slate-50 rounded-xl p-5 border border-slate-100'
                  }
                >
                  {hasHeading && (
                    <h2 className={`font-bold text-slate-800 ${isStandaloneHeading
                      ? 'text-lg border-b-2 border-teal-200 pb-2 text-teal-800'
                      : 'text-base mb-2'
                    }`}>
                      {sec.heading}
                    </h2>
                  )}
                  {hasContent && (
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">
                      {sec.content}
                    </p>
                  )}
                </div>
              );
            })}

            {hasMore && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-medium text-sm hover:border-teal-300 hover:text-teal-600 transition-all"
              >
                {showAll
                  ? '▲ Thu gọn'
                  : `▼ Xem thêm ${allSections.length - PREVIEW_COUNT} phần nội dung`}
              </button>
            )}
          </>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-400 border border-dashed border-slate-200">
            <p className="font-medium">Nội dung lý thuyết đang được cập nhật...</p>
          </div>
        )}
      </div>

      <AdaptiveExerciseBlock maNode={maNode} token={token} skill="GRAMMAR" onResult={onExercisesResult} />
    </div>
  );
}

/** Listening: Audio player + transcript accordion + MCQ */
function ListeningLesson({ baiHoc, exercises, onExercisesResult, maNode, token }) {
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef(null);

  const BACKEND = 'http://127.0.0.1:8000';
  const audioSrc = baiHoc?.FileAudio
    ? `${BACKEND}/static/${baiHoc.FileAudio}`
    : null;
  const transcript = baiHoc?.NoiDungLyThuyet?.transcript || '';

  return (
    <div className="space-y-8">
      {/* Audio Player Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 9.75v4.5m0 0l-2.25-2.25M12 14.25l2.25-2.25M19.5 12a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-base">{baiHoc?.ChuDe || 'Bài nghe'}</p>
            <p className="text-slate-400 text-sm">Nghe và trả lời câu hỏi bên dưới</p>
          </div>
        </div>

        {audioSrc ? (
          <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 p-2">
            <audio
              ref={audioRef}
              controls
              crossOrigin="anonymous"
              className="w-full rounded-lg"
              style={{ minHeight: '54px' }}
            >
              <source src={audioSrc} type="audio/mpeg" />
              <source src={audioSrc} type="audio/mp3" />
              Trình duyệt của bạn không hỗ trợ audio.
            </audio>
          </div>
        ) : (
          <div className="bg-white/10 rounded-xl p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <p className="text-slate-300 font-medium text-sm">Audio đang tải...</p>
            <p className="text-slate-500 text-xs">Thử làm mới trang hoặc quay lại lộ trình để tải lại bài học.</p>
          </div>
        )}
      </div>

      {/* Transcript Accordion */}
      {transcript && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xem transcript
            </span>
            <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${showTranscript ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showTranscript && (
            <div className="px-6 py-5 bg-white text-slate-600 text-sm leading-relaxed whitespace-pre-line border-t border-slate-100">
              {transcript}
            </div>
          )}
        </div>
      )}

      <AdaptiveExerciseBlock maNode={maNode} token={token} skill="LISTENING" onResult={onExercisesResult} />
    </div>
  );
}

/** Vocabulary: Word cards grid + quiz MCQ */
function VocabularyLesson({ theory, exercises, onExercisesResult, level, maNode, token }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const allWords = theory?.words || [];
  const topicName = theory?.topic || '';
  const filtered = allWords.filter(w =>
    !search ||
    (w.word || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.meaning || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const words = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const levelColor = { A: 'bg-emerald-100 text-emerald-700', B: 'bg-sky-100 text-sky-700', C: 'bg-rose-100 text-rose-700' }[level] || 'bg-slate-100 text-slate-600';

  return (
    <div className="space-y-8">
      {/* Topic + search header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {topicName && (
            <span className={`px-4 py-2 rounded-xl text-sm font-bold ${levelColor}`}>
              📚 {topicName}
            </span>
          )}
          {level && (
            <span className="text-slate-400 text-sm font-medium">· Cấp {level} · {allWords.length} từ</span>
          )}
        </div>
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm từ vựng..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all"
          />
        </div>
      </div>

      {/* Word Grid */}
      <div>
        {words.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {words.map((w, i) => (
              <div
                key={`${page}-${i}`}
                className="bg-white border border-slate-100 rounded-xl p-4 hover:border-emerald-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-1 gap-2">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors truncate">
                      {w.word}
                    </span>
                    <PronounceButton word={w.word} />
                  </div>
                  {w.type && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
                      {w.type}
                    </span>
                  )}
                </div>
                {w.phonetic && (
                  <p className="text-sky-500 text-sm font-mono mb-1">{w.phonetic}</p>
                )}
                <p className="text-slate-500 text-sm">{w.meaning}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-10 text-center text-slate-400 border border-dashed">
            <p className="font-medium">{search ? `Không tìm thấy từ "${search}"` : 'Danh sách từ vựng đang được cập nhật...'}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-40 hover:border-emerald-300 transition-all"
            >
              ← Trước
            </button>
            <span className="text-sm text-slate-500 px-3 font-medium">
              {page + 1} / {totalPages} ({filtered.length} từ)
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-40 hover:border-emerald-300 transition-all"
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      <AdaptiveExerciseBlock maNode={maNode} token={token} skill="VOCABULARY" onResult={onExercisesResult} />
    </div>

  );
}

/** Shared MCQ Exercise Block */
function ExerciseBlock({ exercises, onResult, skill }) {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [passed, setPassed] = useState(false);

  const skillColor = {
    GRAMMAR: { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-500' },
    LISTENING: { bg: 'bg-sky-500', light: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-500' },
    VOCABULARY: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-500' },
  }[skill] || { bg: 'bg-slate-500', light: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-500' };

  if (exercises.length === 0) return null;

  const handleSelect = (qId, opt) => {
    if (score !== null) return;
    setAnswers(prev => ({ ...prev, [qId]: opt }));
  };

  const handleCheck = () => {
    // Nếu đã có kết quả (retry) → reset trước
    if (score !== null) {
      setAnswers({});
      setScore(null);
      setPassed(false);
      return;
    }
    let correct = 0;
    exercises.forEach(ex => {
      if ((answers[ex.MaCauHoi] || '').trim() === (ex.DapAnDung || '').trim()) correct++;
    });
    const s = correct;
    setScore(s);
    const threshold = Math.ceil(exercises.length * 0.8);
    const p = s >= threshold;
    setPassed(p);
    onResult?.(p);
  };

  const allAnswered = Object.keys(answers).length >= exercises.length;

  return (
    <div className="mt-8 pt-10 border-t-2 border-dashed border-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
          <span className={`w-9 h-9 ${skillColor.bg} rounded-xl flex items-center justify-center`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </span>
          Bài Tập Củng Cố
        </h2>
        <p className="text-slate-500 mt-2 text-sm">Cần đạt tối thiểu 80% để hoàn thành bài học.</p>
      </div>

      <div className="space-y-6">
        {exercises.map((ex, idx) => (
          <div key={ex.MaCauHoi} className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4">
              <span className={`${skillColor.text} mr-2`}>Câu {idx + 1}:</span>
              {ex.NoiDung}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ex.DapAn.map((opt, i) => {
                const isSelected = answers[ex.MaCauHoi] === opt;
                const isCorrect = opt === ex.DapAnDung;
                const showResult = score !== null;

                let cls = 'border-slate-200 text-slate-600 hover:border-slate-400';
                if (showResult) {
                  if (isCorrect) cls = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                  else if (isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 text-red-700 opacity-60 line-through';
                  else cls = 'border-slate-200 text-slate-400 opacity-40';
                } else if (isSelected) {
                  cls = `${skillColor.border} ${skillColor.light} ${skillColor.text} shadow-md`;
                }

                return (
                  <button
                    key={i}
                    disabled={showResult}
                    onClick={() => handleSelect(ex.MaCauHoi, opt)}
                    className={`p-4 rounded-xl border-2 text-left transition-all font-medium text-sm ${cls}`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                );
              })}
            </div>
            {/* Explanation */}
            {score !== null && ex.GiaiThich && (
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-amber-800 text-sm leading-relaxed">
                  <span className="font-bold">💡 Giải thích: </span>{ex.GiaiThich}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Score + Check Button */}
      <div className="mt-8 bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {score === null ? (
            <p className="text-slate-500 font-medium">Chọn đáp án rồi bấm Chấm điểm.</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {score}/{exercises.length}
              </div>
              <div>
                <p className={`font-bold text-lg ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                  {passed ? '🎉 Xuất sắc! Bạn đã vượt qua.' : '⚠️ Chưa đủ 80%. Hãy xem lại lý thuyết!'}
                </p>
              </div>
            </div>
          )}
        </div>
        {!passed && (
          <button
            onClick={handleCheck}
            disabled={!allAnswered}
            className={`px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
              allAnswered
                ? `${skillColor.bg} text-white hover:opacity-90 shadow-lg`
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {score !== null ? 'Làm lại & Chấm điểm' : 'Chấm Điểm'}
          </button>
        )}
      </div>
    </div>
  );
}

import ReviewView from './ReviewView';
import FinalTestView from './FinalTestView';
import RevisionView from './RevisionView';

// ─── Main LessonView ─────────────────────────────────────────────────────────

export default function LessonView() {
  const { maNode } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [nodeType, setNodeType] = useState(null); // null | 'CORE' | 'REVIEW' | 'FINAL_TEST'
  const [data, setData] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [exercisePassed, setExercisePassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // First: quick check node type before full load
  useEffect(() => {
    if (!token || !maNode) return;
    fetch(`http://127.0.0.1:8000/path/current/nodes`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : null).then(d => {
      if (d?.nodes) {
        const found = d.nodes.find(n => n.MaNode === maNode);
        if (found) setNodeType(found.LoaiNode);
      }
    }).catch(() => {});
  }, [maNode, token]);

  useEffect(() => {
    const fetchLesson = async (retry = false) => {
      let shouldFinish = true;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await fetch(`http://127.0.0.1:8000/path/node/${maNode}`, { headers });
        if (!res.ok) throw new Error('Không thể tải nội dung bài học');
        const result = await res.json();

        // bai_hoc null → backend đang auto-resolve, thử lại sau 800ms
        if (!result.bai_hoc && !retry) {
          shouldFinish = false;
          setTimeout(() => fetchLesson(true), 800);
          return;
        }

        setData(result);

        const exRes = await fetch(`http://127.0.0.1:8000/path/node/${maNode}/exercises`, { headers });
        if (exRes.ok) setExercises(await exRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        if (shouldFinish) setLoading(false);
      }
    };
    fetchLesson();
  }, [maNode, token]);

  const handleComplete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/path/node/${maNode}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Lỗi khi lưu tiến độ');
      navigate('/client/learning-path');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
        <p className="mt-4 text-slate-400 font-medium">Đang tải bài học...</p>
      </div>
    );
  }

  // Route to specialized views based on node type
  if (nodeType === 'REVIEW') return <ReviewView maNode={maNode} />;
  if (nodeType === 'FINAL_TEST') return <FinalTestView maNode={maNode} />;
  if (nodeType === 'REVISION') return <RevisionView maNode={maNode} />;

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-500 font-bold text-lg">Lỗi: {error || 'Không tìm thấy dữ liệu'}</p>
        <button onClick={() => navigate('/client/learning-path')} className="mt-4 text-slate-500 underline">
          Quay lại lộ trình
        </button>
      </div>
    );
  }

  const { node, bai_hoc } = data;
  // Skill/level ưu tiên từ bai_hoc (sau auto-resolve), fallback về NoiDungBoost
  const skill = bai_hoc?.KyNang || node.skill || 'GRAMMAR';
  const level = node.level || 'B';
  const theory = bai_hoc?.NoiDungLyThuyet || {};
  // Tên topic thực từ dataset
  const topicName = bai_hoc?.ChuDe || bai_hoc?.TenBaiHoc || node.TieuDe;

  // Skill meta
  const skillMeta = {
    GRAMMAR: { label: 'Ngữ pháp', color: 'bg-rose-100 text-rose-700', icon: '📝' },
    LISTENING: { label: 'Nghe', color: 'bg-sky-100 text-sky-700', icon: '🎧' },
    VOCABULARY: { label: 'Từ vựng', color: 'bg-emerald-100 text-emerald-700', icon: '📚' },
  }[skill] || { label: skill, color: 'bg-slate-100 text-slate-700', icon: '📖' };

  const levelBadge = { A: 'Sơ cấp', B: 'Trung cấp', C: 'Nâng cao' }[level] || level;

  const canComplete = exercises.length === 0 || exercisePassed;

  return (
    <div className="min-h-[80vh] font-inter p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/client/learning-path')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Trở lại Lộ Trình
        </button>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${skillMeta.color}`}>
            {skillMeta.icon} {skillMeta.label}
          </span>
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
            Cấp {levelBadge}
          </span>
          <div className="px-3 py-1.5 bg-sky-100 text-sky-700 font-bold rounded-lg text-xs border border-sky-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Đang Học
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        {/* Hero */}
        <div className="bg-slate-900 px-8 py-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded border border-white/20">
                {node.LoaiNode === 'CORE' ? 'Bài học Cốt Lõi' : 'AI Bổ Trợ'}
              </span>
              <span className="text-slate-400 font-medium text-sm">Trạm thứ {node.ThuTu}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${level==='A' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : level==='C' ? 'bg-rose-500/20 border-rose-400 text-rose-300' : 'bg-sky-500/20 border-sky-400 text-sky-300'}`}>
                Cấp {level}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              {topicName}
            </h1>
            <p className="text-slate-400 text-sm">
              {skillMeta.icon} {skillMeta.label} · Hoàn thành bài tập để mở trạm tiếp theo.
            </p>
          </div>
        </div>

        {/* Lesson Body */}
        <div className="p-8 sm:p-12">
          {skill === 'GRAMMAR' && (
            <GrammarLesson
              theory={theory}
              exercises={exercises}
              onExercisesResult={setExercisePassed}
              topicName={topicName}
              level={level}
              maNode={maNode}
              token={token}
            />
          )}
          {skill === 'LISTENING' && (
            <ListeningLesson
              baiHoc={bai_hoc}
              exercises={exercises}
              onExercisesResult={setExercisePassed}
              maNode={maNode}
              token={token}
            />
          )}
          {skill === 'VOCABULARY' && (
            <VocabularyLesson
              theory={theory}
              exercises={exercises}
              onExercisesResult={setExercisePassed}
              level={level}
              maNode={maNode}
              token={token}
            />
          )}
          {/* Fallback */}
          {!['GRAMMAR', 'LISTENING', 'VOCABULARY'].includes(skill) && (
            <div className="text-center py-16 text-slate-400">
              <p>Nội dung bài học đang được cập nhật.</p>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="bg-slate-50 p-8 sm:p-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-sm font-medium text-center sm:text-left max-w-sm leading-relaxed">
            {exercises.length > 0 && !exercisePassed
              ? 'Hoàn thành bài tập (≥80%) để mở khóa trạm tiếp theo.'
              : 'Hãy đảm bảo bạn đã nắm vững kiến thức trước khi tiếp tục.'}
          </p>
          {node.TrangThai === 'COMPLETED' ? (
            <button
              disabled
              className="px-10 py-4 bg-emerald-100 text-emerald-700 font-bold rounded-2xl shadow-sm border border-emerald-200 flex items-center gap-2 cursor-not-allowed w-full sm:w-auto justify-center"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Bạn đã hoàn thành
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={saving || !canComplete}
              className={`px-10 py-4 rounded-2xl shadow-xl transition-all font-bold text-lg text-center flex items-center justify-center gap-2 w-full sm:w-auto ${
                !canComplete
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 hover:-translate-y-1'
              }`}
            >
              {saving ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Đánh Dấu Hoàn Thành
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
