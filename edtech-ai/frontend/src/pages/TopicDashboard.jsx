import { useState } from 'react';
import axios from 'axios';
import { BookOpen, Send, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopicDashboard() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/topic/generate', {
        topic: topic,
        level: 'Beginner'
      });
      setLesson(response.data);
    } catch (error) {
      console.error("Error generating lesson:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-primary-100 rounded-xl mr-4">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Learn by Topic</h1>
              <p className="text-slate-500">Enter a topic and let AI generate a micro-lesson instantly.</p>
            </div>
          </div>
          
          <form onSubmit={handleGenerate} className="flex gap-4">
            <input 
              type="text" 
              placeholder="e.g. Airport conversation, Playing Football..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !topic.trim()}
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </form>
        </div>

        {lesson && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">1</span>
                Vocabulary
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {lesson.vocabulary.map((vocab, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="font-bold text-lg text-primary-700">{vocab.word}</div>
                    <div className="text-sm text-slate-500 mb-2">{vocab.pronunciation} • {vocab.meaning}</div>
                    <div className="text-sm italic text-slate-700">"{vocab.example}"</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 text-sm">2</span>
                Conversation Practice
              </h2>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 whitespace-pre-line text-slate-700 leading-relaxed font-medium">
                {lesson.conversation}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-sm">3</span>
                Quick Quiz
              </h2>
              <div className="space-y-6">
                {lesson.quiz.map((q, qIndex) => (
                  <div key={qIndex} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h3 className="font-semibold mb-4 text-slate-900">{qIndex + 1}. {q.question}</h3>
                    <div className="space-y-2">
                      {q.options.map((opt, oIndex) => (
                        <label key={oIndex} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-white cursor-pointer transition-colors group">
                          <input type="radio" name={`question-${qIndex}`} className="mr-3 text-primary-600 focus:ring-primary-500" />
                          <span className="text-slate-700 group-hover:text-slate-900">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
