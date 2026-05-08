import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Trophy, ArrowLeft, RefreshCw, Sparkles, XCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SKILL_META = {
  GRAMMAR:    { label: 'Ngữ pháp',  icon: '📝', color: 'text-rose-600',    bg: 'bg-rose-50',    bar: 'bg-rose-500' },
  VOCABULARY: { label: 'Từ vựng',   icon: '📚', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
  LISTENING:  { label: 'Nghe',      icon: '🎧', color: 'text-sky-600',     bg: 'bg-sky-50',     bar: 'bg-sky-500' },
};

export default function FinalTestView({ maNode }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/path/node/${maNode}/final-test`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setData(await res.json());
      } finally { setLoading(false); }
    })();
  }, [maNode]);

  const handleSelect = (qId, opt) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [qId]: opt }));
  };

  const allAnswered = data && Object.keys(answers).length >= data.questions.length;

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);

    // Tính điểm theo từng skill + chi tiết per câu (cho SR)
    const skillScores = { GRAMMAR: 0, VOCABULARY: 0, LISTENING: 0 };
    const details = data.questions.map(q => {
      const isCorrect = (answers[q.MaCauHoi] || '').trim() === (q.DapAnDung || '').trim();
      if (isCorrect) skillScores[q.KyNang] = (skillScores[q.KyNang] || 0) + 1;
      return { MaCauHoi: q.MaCauHoi, isCorrect };
    });

    try {
      const res = await fetch(`http://127.0.0.1:8000/path/node/${maNode}/final-test/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: skillScores, details }),
      });
      if (res.ok) setResult(await res.json());
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Đang chuẩn bị bài kiểm tra cuối...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-slate-400">Không tải được câu hỏi.</p>
    </div>
  );

  const questions = data.questions || [];
  const node = data.node || {};

  // Count per skill
  const skillCount = { GRAMMAR: 0, VOCABULARY: 0, LISTENING: 0 };
  questions.forEach(q => { skillCount[q.KyNang] = (skillCount[q.KyNang] || 0) + 1; });

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        {!result && (
          <button onClick={() => navigate('/client/learning-path')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm font-medium mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại lộ trình
          </button>
        )}

        {/* Result screen */}
        {result ? (
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-12 text-center">
            <div className={`w-24 h-24 ${result.passed ? 'bg-amber-400' : 'bg-red-400'} rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${result.passed ? 'shadow-amber-100' : 'shadow-red-100'}`}>
              {result.passed
                ? <Trophy className="w-12 h-12 text-white" />
                : <XCircle className="w-12 h-12 text-white" />
              }
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              {result.passed ? 'Hoàn thành!' : 'Chưa đạt yêu cầu'}
            </h1>
            <p className="text-slate-500 mb-8">{result.message}</p>

            {/* Score breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {Object.entries(result.breakdown || {}).map(([skill, score]) => {
                const meta = SKILL_META[skill] || {};
                return (
                  <div key={skill} className={`p-4 rounded-2xl ${meta.bg}`}>
                    <p className="text-2xl mb-1">{meta.icon}</p>
                    <p className={`text-2xl font-black ${meta.color}`}>{score}<span className="text-sm font-bold text-slate-400">/10</span></p>
                    <p className="text-xs font-bold text-slate-500 mt-1">{meta.label}</p>
                    <div className="mt-2 w-full bg-white rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${meta.bar}`} style={{ width: `${score * 10}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="text-4xl font-black text-slate-900">{result.overall}<span className="text-lg text-slate-400">/10</span></div>
              <div className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm">
                Cấp {result.new_level}
              </div>
            </div>

            {result.next_path_generated && (
              <div className={`p-4 ${result.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} rounded-2xl border mb-6`}>
                <p className={`${result.passed ? 'text-emerald-700' : 'text-amber-700'} font-bold flex items-center justify-center gap-2`}>
                  <Sparkles className="w-4 h-4" />
                  {result.passed
                    ? 'Lộ trình giai đoạn mới đã sẵn sàng!'
                    : `Hệ thống đã đánh giá lại và tạo lộ trình cấp ${result.new_level} để củng cố.`
                  }
                </p>
              </div>
            )}

            <button
              onClick={() => navigate('/client/learning-path')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition-all shadow-lg"
            >
              Bắt đầu lộ trình tiếp theo →
            </button>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="bg-slate-900 rounded-[2rem] px-8 py-10 text-white mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded border border-white/20">
                    🏆 Kiểm Tra Cuối Lộ Trình
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold mb-3">{node.TieuDe || 'Final Test'}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  {Object.entries(skillCount).map(([skill, count]) => {
                    const meta = SKILL_META[skill];
                    return count > 0 ? (
                      <span key={skill}>{meta?.icon} {meta?.label}: {count} câu</span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-5">
              {questions.map((q, idx) => {
                const meta = SKILL_META[q.KyNang] || {};
                const sel = answers[q.MaCauHoi];
                return (
                  <div key={q.MaCauHoi} className={`bg-white rounded-2xl border-2 p-6 shadow-sm ${sel ? 'border-slate-300' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${meta.bg} ${meta.color}`}>
                        {meta.icon} {q.KyNang}
                      </span>
                      <span className="text-slate-400 font-bold text-sm">Câu {idx + 1}</span>
                    </div>

                    {q.FileAudio && (
                      <audio controls className="w-full mb-4 h-10 rounded-xl"
                        src={`${API_BASE_URL}/static/${q.FileAudio}`} />
                    )}

                    <h3 className="font-bold text-slate-800 text-base mb-4">{q.NoiDung}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.DapAn.map((opt, i) => {
                        const isSel = sel === opt;
                        return (
                          <button key={i} onClick={() => handleSelect(q.MaCauHoi, opt)}
                            className={`p-4 rounded-xl border-2 text-left transition-all font-medium text-sm ${
                              isSel
                                ? 'border-slate-700 bg-slate-800 text-white shadow-md'
                                : 'border-slate-200 text-slate-600 hover:border-slate-400'
                            }`}>
                            <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit */}
            <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-700">{Object.keys(answers).length}/{questions.length} câu đã chọn</p>
                <p className="text-slate-400 text-sm mt-0.5">Hoàn thành tất cả để nộp bài</p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className={`px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  allAnswered
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                Nộp bài & Xem kết quả
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
