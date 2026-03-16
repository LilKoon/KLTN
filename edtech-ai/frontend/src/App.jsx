import { Routes, Route, Link } from 'react-router-dom';
import { BookOpen, FileText, Sparkles } from 'lucide-react';
import TopicDashboard from './pages/TopicDashboard';

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50 p-6">
      <div className="text-center max-w-3xl">
        <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-6">
          <Sparkles className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
          Edtech AI <span className="text-primary-600">Smart Companion</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10">
          The all-in-one AI platform to supercharge your English learning journey. 
          Learn from specific topics or upload your own documents.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link to="/topic" className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group">
            <BookOpen className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Learn by Topic</h3>
            <p className="text-slate-500 text-center">Enter a subject and let AI generate a micro-lesson instantly.</p>
          </Link>
          
          <Link to="/document" className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group">
            <FileText className="w-12 h-12 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Upload Document</h3>
            <p className="text-slate-500 text-center">Upload PDF/Docs to extract vocabulary, summaries and quizzes.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function DocumentWorkspace() {
  return <div className="p-8"><h2 className="text-2xl font-bold">Document Workspace (Coming Soon)</h2></div>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/topic" element={<TopicDashboard />} />
      <Route path="/document" element={<DocumentWorkspace />} />
    </Routes>
  );
}

export default App;
