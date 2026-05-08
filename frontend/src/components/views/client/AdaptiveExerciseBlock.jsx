import React, { useEffect, useState, useRef } from 'react';

/**
 * Adaptive (mid-session) exercise block.
 * Hỏi từng câu một, server sẽ pick câu kế dựa vào theta của user.
 *
 * Props:
 *   maNode: UUID node
 *   token: auth bearer
 *   skill: 'GRAMMAR' | 'LISTENING' | 'VOCABULARY'
 *   onResult: (passed: boolean) => void
 */
export default function AdaptiveExerciseBlock({ maNode, token, skill, onResult }) {
  const [currentQ, setCurrentQ] = useState(null);
  const [sessionState, setSessionState] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const questionStartRef = useRef(null);

  const SKILL_COLOR = {
    GRAMMAR:    { bg: 'bg-rose-500',    light: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-500' },
    LISTENING:  { bg: 'bg-sky-500',     light: 'bg-sky-50',     text: 'text-sky-600',     border: 'border-sky-500' },
    VOCABULARY: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-500' },
  }[skill] || { bg: 'bg-slate-500', light: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-500' };

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/path/node/${maNode}/exercises/adaptive/start`,
          { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) throw new Error('Không bắt đầu được phiên adaptive');
        const data = await res.json();
        if (cancelled) return;
        setCurrentQ(data.question);
        setSessionState(data.session_state);
        setProgress(data.progress || { current: 1, total: 5 });
        questionStartRef.current = Date.now();
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    start();
    return () => { cancelled = true; };
  }, [maNode, token]);

  const handleSelect = (opt) => {
    if (revealed || submitting) return;
    setSelected(opt);
    setRevealed(true);
  };

  const handleNext = async () => {
    if (!currentQ || submitting) return;
    setSubmitting(true);
    const isCorrect = (selected || '').trim() === (currentQ.DapAnDung || '').trim();
    const elapsed = questionStartRef.current
      ? Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000))
      : null;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/path/node/${maNode}/exercises/adaptive/next`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_state: sessionState,
            last_question_id: currentQ.MaCauHoi,
            is_correct: isCorrect,
            time_seconds: elapsed,
          }),
        },
      );
      if (!res.ok) throw new Error('Lỗi khi xử lý câu trả lời');
      const data = await res.json();
      if (data.done) {
        setSummary(data.summary);
        onResult?.(!!data.summary?.passed);
      } else {
        setCurrentQ(data.question);
        setSessionState(data.session_state);
        setProgress(data.progress || progress);
        setSelected(null);
        setRevealed(false);
        questionStartRef.current = Date.now();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="mt-8 pt-10 border-t-2 border-dashed border-slate-200 flex justify-center py-12">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="mt-8 p-6 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>
  );

  if (summary) {
    const ratio = Math.round((summary.ratio || 0) * 100);
    return (
      <div className="mt-8 pt-10 border-t-2 border-dashed border-slate-200">
        <div className={`p-6 rounded-2xl border-2 flex items-center gap-6 ${summary.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black ${summary.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {summary.num_correct}/{summary.num_answered}
          </div>
          <div className="flex-1">
            <p className={`font-bold text-lg ${summary.passed ? 'text-emerald-700' : 'text-red-700'}`}>
              {summary.passed ? '🎉 Bạn đã vượt qua trạm này!' : '⚠️ Chưa đạt 80%, ôn thêm rồi thử lại nhé.'}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Tỷ lệ đúng: <span className="font-bold">{ratio}%</span> · Mức năng lực ước lượng (theta): <span className="font-bold">{summary.final_theta}</span>
              {summary.early_finish_reason && <span className="ml-2 italic">({summary.early_finish_reason})</span>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="mt-8 pt-10 border-t-2 border-dashed border-slate-200">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-800">Bài Tập Củng Cố (Adaptive)</h2>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${SKILL_COLOR.text}`}>
            Câu {progress.current}/{progress.total}
          </span>
          <span className="text-xs text-slate-400">Độ khó: {currentQ.DoKho?.toFixed(2)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
        <div
          className={`h-full ${SKILL_COLOR.bg} transition-all`}
          style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
        />
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base mb-4">{currentQ.NoiDung}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.DapAn.map((opt, i) => {
            const isSelected = selected === opt;
            const isCorrect = opt === currentQ.DapAnDung;
            let cls = 'border-slate-200 text-slate-600 hover:border-slate-400';
            if (revealed) {
              if (isCorrect) cls = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
              else if (isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 text-red-700 line-through opacity-60';
              else cls = 'border-slate-200 text-slate-400 opacity-40';
            } else if (isSelected) {
              cls = `${SKILL_COLOR.border} ${SKILL_COLOR.light} ${SKILL_COLOR.text} shadow-md`;
            }
            return (
              <button
                key={i}
                disabled={revealed}
                onClick={() => handleSelect(opt)}
                className={`p-4 rounded-xl border-2 text-left transition-all font-medium text-sm ${cls}`}
              >
                <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            );
          })}
        </div>

        {revealed && currentQ.GiaiThich && (
          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-amber-800 text-sm leading-relaxed">
              <span className="font-bold">💡 Giải thích: </span>{currentQ.GiaiThich}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleNext}
          disabled={!revealed || submitting}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${
            revealed && !submitting
              ? `${SKILL_COLOR.bg} text-white hover:opacity-90 shadow-lg`
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {submitting ? 'Đang xử lý...' : (progress.current >= progress.total ? 'Hoàn thành' : 'Câu tiếp theo →')}
        </button>
      </div>
    </div>
  );
}
