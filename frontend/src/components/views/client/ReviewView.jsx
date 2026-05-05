import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { RefreshCw, CheckCircle2, XCircle, ArrowLeft, Trophy, RotateCcw } from 'lucide-react';

const SKILL_COLOR = {
  GRAMMAR:    { bg: 'bg-rose-500',    light: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-300',    icon: '📝' },
  VOCABULARY: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-300', icon: '📚' },
  LISTENING:  { bg: 'bg-sky-500',     light: 'bg-sky-50',     text: 'text-sky-600',     border: 'border-sky-300',     icon: '🎧' },
  MIXED:      { bg: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-300',   icon: '🔄' },
};

export default function ReviewView({ maNode }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null); // {passed, score, total, ratio, message}
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    setAnswers({});
    setResult(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/path/node/${maNode}/review`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, [maNode]);

  const handleSelect = (qId, opt) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [qId]: opt }));
  };

  const allAnswered = data && Object.keys(answers).length >= data.questions.length;

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    let correct = 0;
    data.questions.forEach(q => {
      if ((answers[q.MaCauHoi] || '').trim() === (q.DapAnDung || '').trim()) correct++;
    });
    const total = data.questions.length;
    try {
      const res = await fetch(`http://127.0.0.1:8000/path/node/${maNode}/review/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: correct, total }),
      });
      if (res.ok) setResult(await res.json());
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Đang tải bài ôn tập...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-slate-400">Không tải được câu hỏi ôn tập.</p>
    </div>
  );

  const questions = data.questions || [];
  const node = data.node || {};

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <button onClick={() => navigate('/client/learning-path')} className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại lộ trình
        </button>

        {/* Hero */}
        <div className="bg-amber-500 rounded-[2rem] px-8 py-10 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded border border-white/30">
                🔄 Ôn Tập
              </span>
              {node.SoLanThu > 0 && (
                <span className="text-amber-100 text-xs font-medium">Lần thử: {node.SoLanThu + 1}</span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold mb-2">{node.TieuDe || 'Ôn tập'}</h1>
            <p className="text-amber-100 text-sm">
              🎯 {questions.length} câu hỏi · Cần đạt 80% để tiếp tục lộ trình
            </p>
          </div>
        </div>

        {/* Result Banner */}
        {result && (
          <div className={`mb-8 p-6 rounded-2xl border-2 flex items-center gap-6 ${
            result.passed
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0 ${
              result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}>
              {result.ratio}%
            </div>
            <div className="flex-1">
              <p className={`font-bold text-lg ${result.passed ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.passed ? '🎉 Xuất sắc! Trạm ôn tập hoàn thành!' : '⚠️ Chưa đủ 80% — Hãy thử lại!'}
              </p>
              <p className="text-slate-500 text-sm mt-1">{result.message}</p>
            </div>
            <div className="flex gap-3">
              {result.passed ? (
                <button
                  onClick={() => navigate('/client/learning-path')}
                  className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" /> Tiếp tục
                </button>
              ) : (
                <button
                  onClick={fetchQuestions}
                  className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Làm lại
                </button>
              )}
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-5">
          {questions.map((q, idx) => {
            const skill = SKILL_COLOR[q.KyNang] || SKILL_COLOR.MIXED;
            const isAnswered = !!answers[q.MaCauHoi];
            const isCorrect = result && (answers[q.MaCauHoi] || '').trim() === (q.DapAnDung || '').trim();
            const isWrong = result && isAnswered && !isCorrect;

            return (
              <div key={q.MaCauHoi} className={`bg-white rounded-2xl border-2 p-6 shadow-sm transition-all ${
                result
                  ? isCorrect ? 'border-emerald-200' : isWrong ? 'border-red-200' : 'border-slate-100'
                  : isAnswered ? 'border-amber-200 shadow-amber-100/50' : 'border-slate-100'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${skill.light} ${skill.text}`}>
                    {skill.icon} {q.KyNang}
                  </span>
                  <span className="text-slate-400 font-bold text-sm">Câu {idx + 1}</span>
                  {result && (isCorrect
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                    : <XCircle className="w-4 h-4 text-red-400 ml-auto" />
                  )}
                </div>

                {/* Audio */}
                {q.FileAudio && (
                  <audio controls className="w-full mb-4 h-10 rounded-xl" src={`http://127.0.0.1:8000/static/${q.FileAudio}`} />
                )}

                <h3 className="font-bold text-slate-800 text-base mb-4">{q.NoiDung}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.DapAn.map((opt, i) => {
                    const sel = answers[q.MaCauHoi] === opt;
                    const correct = opt.trim() === (q.DapAnDung || '').trim();
                    let cls = 'border-slate-200 text-slate-600 hover:border-slate-400';
                    if (result) {
                      if (correct) cls = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                      else if (sel && !correct) cls = 'border-red-400 bg-red-50 text-red-700 line-through opacity-60';
                      else cls = 'border-slate-200 text-slate-400 opacity-40';
                    } else if (sel) {
                      cls = `${skill.border} ${skill.light} ${skill.text} shadow-md`;
                    }
                    return (
                      <button key={i} disabled={!!result} onClick={() => handleSelect(q.MaCauHoi, opt)}
                        className={`p-4 rounded-xl border-2 text-left transition-all font-medium text-sm ${cls}`}>
                        <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                      </button>
                    );
                  })}
                </div>

                {result && q.GiaiThich && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-amber-800 text-sm leading-relaxed">
                      <span className="font-bold">💡 Giải thích: </span>{q.GiaiThich}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit */}
        {!result && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between">
            <p className="text-slate-500 font-medium">
              {Object.keys(answers).length}/{questions.length} câu đã chọn
            </p>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className={`px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
                allAnswered
                  ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : '🎯'} Nộp bài
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
