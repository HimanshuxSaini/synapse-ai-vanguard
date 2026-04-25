import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, BookOpen, GraduationCap, Code, 
  Map, History, Zap, Layout, Send, LogOut, Search, Activity, Target, CheckCircle2,
  Download, Clock, Bookmark, BookmarkCheck, PenLine, 
  Award, ChevronRight, Menu, X, Terminal, Monitor, Sparkles, Plus, User, FileText, HelpCircle,
  Youtube, Video
} from 'lucide-react';
import LoginPage from './pages/LoginPage';
import api, { sessionService } from './services/api';
import NeuralBackground from './components/NeuralBackground';
import ErrorBoundary from './components/ErrorBoundary';

// Styles migrated to index.css

export default function App() {
  const [user, setUser] = useState(null);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [language, setLanguage] = useState('English');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('Roadmap');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [error, setError] = useState(null);
  

  const [masteredTopics, setMasteredTopics] = useState(() => {
    try {
      const saved = localStorage.getItem('synapse_mastered');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const toggleMastery = (id) => {
    const next = masteredTopics.includes(id) 
      ? masteredTopics.filter(t => t !== id) 
      : [...masteredTopics, id];
    setMasteredTopics(next);
    localStorage.setItem('synapse_mastered', JSON.stringify(next));
  };

  const [isMasteryExpanded, setIsMasteryExpanded] = useState(false);
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(true);

  const [chatHistory, setChatHistory] = useState([]);
  const [chatMsg, setChatMsg] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [sessionNotes, setSessionNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('synapse_notes');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Notes corruption detected:', e);
      return {};
    }
  });

  const saveNote = (sessionId, text) => {
    const next = { ...sessionNotes, [sessionId]: text };
    setSessionNotes(next);
    localStorage.setItem('synapse_notes', JSON.stringify(next));
  };
  const chatEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('synapse_user');
    if (saved) {
      setUser(JSON.parse(saved));
      fetchHistory();
    }
  }, []);


  const fetchHistory = async () => {
    try {
      const res = await sessionService.history();
      setHistory(Array.isArray(res?.data) ? res.data : []);
    } catch { console.error('History sync offline'); setHistory([]); }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await sessionService.generate({ topic, level, language });
      setData(res.data);
      setHistory(prev => [res.data, ...prev]);
      setActiveTab('Roadmap');
      setTopic('');
    } catch (err) { 
      const msg = err.response?.data?.error || err.message || 'Something went wrong. Please try again.';
      setError(msg); 
    }
    setLoading(false);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to purge all neural records?')) return;
    try {
      await sessionService.clear();
      setHistory([]);
      setData(null);
    } catch (err) { setError(err.response?.data?.error || 'Purge unsuccessful. Neural link unstable.'); }
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this neural footprint?')) return;
    try {
      await sessionService.deleteOne(id);
      setHistory(prev => prev.filter(s => s._id !== id));
      if (data?._id === id) setData(null);
    } catch (err) { setError(err.response?.data?.error || 'Session deletion failed.'); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  const handleQuiz = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const res = await api.post('/session/quiz', { topic: data.topic, level: data.level });
      setQuizData(res.data.quiz);
      setActiveTab('Quiz');
    } catch (err) { setError(err.response?.data?.error || 'Quiz sync offline'); }
    setLoading(false);
  };

  const handleFetchVideos = async () => {
    if (!data?._id) return;
    setLoading(true);
    try {
      const res = await api.post(`/session/${data._id}/videos`);
      setData(res.data);
      setHistory(prev => prev.map(s => s._id === res.data._id ? res.data : s));
    } catch (err) { setError(err.response?.data?.error || 'Lectures sync failed.'); }
    setLoading(false);
  };

  const handleChat = async () => {
    if (!chatMsg.trim() || !data) return;
    const msg = chatMsg;
    setChatMsg('');
    setChatHistory(prev => [...prev, { role: 'user', content: msg }, { role: 'assistant', content: 'Thinking...' }]);
    
    try {
      const res = await sessionService.chat({ 
        topic: data.topic, 
        message: msg, 
        history: chatHistory.filter(m => m.content !== 'Thinking...') 
      });
      setChatHistory(prev => {
        const next = [...prev];
        next[next.length - 1].content = res.data.response;
        return next;
      });
    } catch {
      setChatHistory(prev => {
        const next = [...prev];
        next[next.length - 1].content = 'Matrix link severed.';
        return next;
      });
    }
  };


  const getSuggestions = () => {
    const fallbacks = ['Neural Networks', 'Quantum Computing', 'Systems Design'];
    const safeHistory = Array.isArray(history) ? history : [];
    if (safeHistory.length === 0) return fallbacks;
    const items = [...new Set(safeHistory.filter(s => s && s.topic).map(s => s.topic))].slice(0, 3);
    while (items.length < 3) {
      const next = fallbacks.find(f => !items.includes(f));
      if (!next) break;
      items.push(next);
    }
    return items;
  };

  return (
    <>
      <NeuralBackground />
      {!user ? (
        <LoginPage onLogin={(ud) => { setUser(ud); fetchHistory(); }} />
      ) : (
        <ErrorBoundary>
        <div
          className="flex h-screen text-white font-sans selection:bg-[#00F5FF]/30 overflow-hidden relative"
        >
          {/* Main Dashboard Layout */}
          <div className="fixed inset-0 -z-10 bg-[#080812]/50 backdrop-blur-3xl" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div style={{ position:'absolute', inset:0, background: 'radial-gradient(circle at center, transparent 0%, rgba(3,4,10,0.6) 100%)' }} />
      </div>
      
      {/* Sidebar */}
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-500"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-[70] h-full ${
          isZenMode ? 'w-0 -translate-x-full opacity-0 overflow-hidden' : 
          isSidebarOpen ? 'w-[280px] translate-x-0 opacity-100' : 
          'w-[280px] -translate-x-full lg:translate-x-0 lg:w-[280px] opacity-100'
        } border-r border-white/5 flex flex-col p-6 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] lg:bg-[rgba(8,8,20,0.85)] bg-[#080814] lg:backdrop-filter-[blur(24px)] backdrop-blur-3xl`}
        style={{ borderColor:'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between mb-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:'linear-gradient(135deg,#00f5ff,#0065e0)', boxShadow:'0 0 18px rgba(0,245,255,0.28)' }}
            >
              <Brain className="w-5 h-5 text-black" />
            </div>
            <span className="text-[17px] font-bold italic tracking-tight" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Synapse <span style={{ color:'rgba(255,255,255,0.5)', fontStyle:'normal', fontWeight:300 }}>AI</span></span>
            <div className="px-2 py-0.5 rounded-md bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-[8px] font-black text-[#00F5FF] uppercase tracking-tighter">Vanguard</div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-white/30 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fixed Generation Header */}
        <div className="space-y-6 mb-10 flex-shrink-0">
          <section>
            <h3 className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.22em] mb-4" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Learn Something New</h3>
            <div className="space-y-4">
              <div className="relative group/input">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/input:text-[#00F5FF]/50 transition-colors" />
                <input 
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  placeholder="What do you want to learn?"
                  className="w-full glass-card rounded-xl py-3.5 pl-11 pr-4 text-[13px] font-medium outline-none transition-all placeholder:text-white/10 text-white focus:border-[#00F5FF]/30 focus:bg-white/[0.04]"
                  style={{ fontFamily:"'Inter',sans-serif" }}
                />
              </div>
              <div className="flex gap-2">
                {['Beginner', 'Intermediate', 'Expert'].map(l => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border ${level === l ? 'bg-[#00F5FF] text-black border-transparent shadow-[0_0_15px_rgba(0,245,255,0.3)]' : 'text-white/35 border-white/5 bg-white/5 hover:border-white/15 hover:text-white/60'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {['English', 'Spanish', 'French', 'Hindi'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex-1 py-2 rounded-xl text-[9px] font-bold uppercase transition-all border ${language === lang ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' : 'text-white/20 border-white/5 bg-white/5 hover:border-white/20 hover:text-white/40'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              {error && (
                <div className="text-red-400 text-[10px] font-bold p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-center">
                  ⚠️ {error}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={loading}
                className="w-full btn-premium"
                style={{ fontFamily:"'Space Grotesk',sans-serif" }}
              >
                {loading ? <Activity className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Start Learning</>}
              </motion.button>
            </div>
          </section>
        </div>

        {/* Scrollable Topics Section */}
        <div className="space-y-10 flex-1 overflow-y-auto no-scrollbar pr-1 -mr-1">

          <section>
            <button 
              onClick={() => setIsMasteryExpanded(!isMasteryExpanded)}
              className="flex items-center justify-between w-full mb-4 group text-left"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-3 h-3 text-white/20 transition-transform ${isMasteryExpanded ? 'rotate-90' : ''}`} />
                <h3 className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.22em] group-hover:text-white/60 transition-colors" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Topic Mastery</h3>
              </div>
              <div className="flex items-center gap-1.5 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/10">
                <span className="text-[9px] font-bold text-cyan-400">{(masteredTopics || []).length}/{(history || []).length}</span>
              </div>
            </button>
            
            {isMasteryExpanded && (
              <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar pr-1 animate-in fade-in slide-in-from-top-2 duration-300">
                {(!history || history.length === 0) ? (
                  <p className="text-[10px] text-white/10 italic text-center py-2">No topics yet...</p>
                ) : (
                  (history || []).map((s, i) => (
                    <div 
                      key={s._id || i}
                      className="group flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:bg-white/5 transition-all"
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleMastery(s._id); }}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 relative z-10 ${
                          masteredTopics.includes(s._id) 
                          ? 'bg-cyan-500 border-cyan-500 text-black' 
                          : 'border-white/10 group-hover:border-white/20'
                        }`}
                      >
                        {masteredTopics.includes(s._id) && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => { setData(s); setActiveTab('Roadmap'); }}
                        className={`flex-1 text-left text-[11px] font-medium transition-all truncate lowercase ${
                          masteredTopics.includes(s._id) ? 'text-white/40 line-through' : 'text-white/60 group-hover:text-white'
                        }`}
                        style={{ fontFamily:"'Inter',sans-serif" }}
                      >
                        {s.topic}
                      </button>
                      <button 
                        onClick={(e) => handleDeleteSession(s._id, e)}
                        className="p-2 opacity-0 group-hover:opacity-100 text-white/5 hover:text-red-400/80 transition-all relative z-50 pointer-events-auto"
                        title="Purge Topic"
                      >
                         <X className="w-3.5 h-3.5" />
                      </button>
                     </div>
                  ))
                )}
              </div>
            )}
          </section>

          <section>
            <button 
              onClick={() => setIsCoursesExpanded(!isCoursesExpanded)}
              className="flex items-center justify-between w-full mb-4 group text-left"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-3 h-3 text-white/20 transition-transform ${isCoursesExpanded ? 'rotate-90' : ''}`} />
                <h3 className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.22em] group-hover:text-white/60 transition-colors" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Your Courses</h3>
              </div>
            </button>
            
            {isCoursesExpanded && (
              <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1 animate-in fade-in slide-in-from-top-2 duration-300">
                {(!history || history.length === 0) ? (
                  <p className="text-[10px] text-white/10 italic text-center py-2">No courses yet...</p>
                ) : (
                  (history || []).map((s, i) => (
                    <div key={s._id || i} className="group relative">
                      <div
                        onClick={() => { setData(s); setActiveTab('Roadmap'); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                          data?._id === s._id
                            ? 'border-cyan-500/25 text-cyan-400'
                            : 'border-transparent text-white/35 hover:text-white/60 hover:border-white/8'
                        }`}
                        style={{ background: data?._id === s._id ? 'rgba(0,245,255,0.06)' : 'rgba(255,255,255,0.025)' }}
                      >
                        <Bookmark className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-[12px] font-medium truncate lowercase flex-1" style={{ fontFamily:"'Inter',sans-serif" }}>{s.topic}</span>
                        <button 
                          onClick={(e) => handleDeleteSession(s._id, e)}
                          className="p-2 opacity-0 group-hover:opacity-100 text-white/5 hover:text-red-400/80 transition-all -mr-1 relative z-50 pointer-events-auto"
                          title="Purge Topic"
                        >
                           <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        </div>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20 uppercase">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate uppercase">{user?.name || 'Vanguard Agent'}</p>
              <p className="text-[10px] text-white/20 font-black tracking-widest uppercase">Certified</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-white/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        
        {/* Header */}
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-10 flex-shrink-0 border-b border-white/5">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-white/40 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-base md:text-lg font-black tracking-tight truncate">{data?.topic || 'Select a topic'}</h2>
            {data && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#121E21] text-[#00F5FF] rounded-lg text-[9px] md:text-[10px] font-black uppercase whitespace-nowrap">
                {data.level || 'Beginner'}
              </div>
            )}
            <div className="items-center gap-2 text-[10px] text-[#00F5FF]/40 font-black uppercase tracking-widest ml-4 hidden md:flex">
               <div className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] animate-pulse" />
               System Online
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             
             <button 
               onClick={() => setIsZenMode(!isZenMode)}
               className={`hidden md:block p-3 border rounded-2xl transition-all ${isZenMode ? 'bg-[#00F5FF] text-black border-[#00F5FF]' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
               title={isZenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
             >
               <Layout className="w-4 h-4" />
             </button>

             <button className="hidden sm:block p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
               <Download className="w-4 h-4 text-white/60" />
             </button>
             
             <button className="sm:hidden p-2 text-white/40">
                <Target className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Content Tabs Navigation */}
        <div className="px-4 md:px-10 flex-shrink-0 mt-6 md:mt-8">
           <div className="flex justify-center">
            <nav
              className="flex gap-1 p-1 rounded-2xl border overflow-x-auto no-scrollbar w-full md:w-auto"
              style={{ background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.07)', backdropFilter:'blur(12px)' }}
            >
              {[
                { id: 'Roadmap',  icon: Zap,         label: 'Road'  },
                { id: 'Projects', icon: Code,        label: 'Prog' },
                { id: 'Readings', icon: BookOpen,    label: 'Read' },
                { id: 'Lectures', icon: Youtube,     label: 'Video'    },
                { id: 'Quiz',     icon: HelpCircle,  label: 'Quiz'     },
                { id: 'Tutor',    icon: Terminal,    label: 'AI'    },
                { id: 'Notes',    icon: PenLine,     label: 'Note'    },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="flex items-center justify-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[11px] font-bold tracking-wide uppercase transition-all whitespace-nowrap min-w-[65px] md:min-w-0 relative group/tab"
                  style={{ fontFamily:"'Space Grotesk',sans-serif" }}
                >
                  {activeTab === t.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/[0.03] border border-white/10 rounded-xl z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <t.icon className={`w-3.5 h-3.5 relative z-10 transition-colors ${activeTab === t.id ? 'text-[#00F5FF]' : 'text-white/30 group-hover/tab:text-white/60'}`} /> 
                  <span className={`relative z-10 hidden sm:inline transition-colors ${activeTab === t.id ? 'text-[#00F5FF]' : 'text-white/30 group-hover/tab:text-white/60'}`}>{t.id}</span>
                  <span className={`relative z-10 sm:hidden transition-colors ${activeTab === t.id ? 'text-[#00F5FF]' : 'text-white/30 group-hover/tab:text-white/60'}`}>{t.label}</span>
                </button>
              ))}
            </nav>
           </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden pb-4 md:pb-10 pt-6 md:pt-8 px-4 md:px-10">
           {!data ? (
             <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="text-center w-full max-w-3xl relative z-10 px-6"
               >
                 <div className="mb-10 flex justify-center">
                   <div className="relative">
                     <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] animate-pulse" />
                     <motion.div 
                       animate={{ rotate: 360 }}
                       transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                       className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center backdrop-blur-xl relative z-10"
                     >
                        <Brain className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-[0_0_15px_rgba(0,245,255,0.5)]" />
                     </motion.div>
                   </div>
                 </div>
                 
                 <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white">
                   Project <span className="bg-gradient-to-r from-[#00F5FF] to-[#0070F3] bg-clip-text text-transparent">Synapse</span>
                 </h1>
                 <p className="text-[10px] md:text-[12px] font-bold tracking-[0.6em] uppercase mb-12 text-white/30" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Initiate Neural Sequence</p>
                 
                 <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                   {getSuggestions().map((t, i) => (
                     <motion.button 
                       key={t}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.1 }}
                       onClick={() => { setTopic(t); handleGenerate(); }}
                       className="px-6 py-3 glass-card rounded-2xl text-[10px] font-bold text-white/40 hover:text-[#00F5FF] hover:border-[#00F5FF]/20 hover:bg-[#00F5FF]/5 transition-all uppercase tracking-widest"
                     >
                       {t}
                     </motion.button>
                   ))}
                 </div>
               </motion.div>
               
               {/* Background Decorative Elements */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30">
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full animate-aurora-1" />
                 <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full animate-aurora-2" />
               </div>
             </div>
           ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={data?._id || 'empty'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex flex-col glass-premium rounded-[2.5rem] p-5 md:p-12 overflow-hidden relative group"
                  style={{ boxShadow:'0 32px 128px -16px rgba(0,0,0,0.8)' }}
                >
                {loading && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl z-[100] flex flex-col items-center justify-center p-6 md:p-20 gap-8 md:gap-10">
                     <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-cyan-500/10 animate-ping absolute inset-0" />
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-cyan-500/20 animate-spin border-t-cyan-500 flex items-center justify-center p-6 md:p-8">
                           <Brain className="w-full h-full text-cyan-400 transition-all animate-pulse" />
                        </div>
                     </div>
                     <div className="text-center px-4">
                        <h2 className="text-lg md:text-2xl font-black tracking-tight mb-2 md:mb-3 text-white uppercase italic" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Synchronizing Patterns</h2>
                        <p className="text-cyan-400/40 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] animate-pulse">Establishing Neural Link...</p>
                     </div>
                     <div className="w-48 md:w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 animate-[grid-scroll_2s_linear_infinite]" style={{ width:'60%' }} />
                     </div>
                  </div>
                )}
                
                {activeTab === 'Roadmap' && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8 md:space-y-12">
                     <section>
                        <h3 className="text-xl md:text-3xl font-black mb-6 md:mb-10 flex items-center gap-3 md:gap-4 tracking-tighter text-white"><Zap className="text-[#00F5FF] w-6 md:w-8 h-6 md:h-8" /> Overview</h3>
                        <div className="prose prose-invert prose-sm md:prose-lg max-w-none text-white/60 leading-relaxed"><ReactMarkdown>{data.explanation || ''}</ReactMarkdown></div>
                     </section>
                     <hr className="border-white/5" />
                     <section>
                        <div className="prose prose-invert prose-sm md:prose-lg max-w-none prose-h3:text-[#00F5FF] prose-h3:mb-4 md:prose-h3:mb-6"><ReactMarkdown>{Array.isArray(data.roadmap) ? data.roadmap.join('\n\n') : (data.roadmap || '')}</ReactMarkdown></div>
                     </section>
                  </div>
                )}

                {activeTab === 'Projects' && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 md:space-y-8">
                    <h3 className="text-xl md:text-3xl font-black mb-4 md:mb-6 flex items-center gap-3 md:gap-4 text-white"><Code className="text-[#00F5FF] w-6 md:w-8 h-6 md:h-8" /> Coding Projects</h3>
                    <div className="prose prose-invert prose-sm md:prose-lg max-w-none prose-ul:list-disc prose-li:mb-2 md:prose-li:mb-4">
                      <ReactMarkdown>{Array.isArray(data.projects) ? data.projects.join('\n\n') : data.projects}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {activeTab === 'Readings' && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 md:space-y-8">
                    <h3 className="text-xl md:text-3xl font-black mb-4 md:mb-6 flex items-center gap-3 md:gap-4 text-white"><BookOpen className="text-[#00F5FF] w-6 md:w-8 h-6 md:h-8" /> Reading Material</h3>
                    <div className="prose prose-invert prose-sm md:prose-lg max-w-none">
                      <ReactMarkdown>{Array.isArray(data.resources) ? data.resources.join('\n\n') : data.resources}</ReactMarkdown>
                    </div>
                  </div>
                )}
                
                {activeTab === 'Lectures' && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <h3 className="text-xl md:text-3xl font-black mb-6 md:mb-10 flex items-center gap-3 md:gap-4 text-white"><Youtube className="text-[#00F5FF] w-6 md:w-8 h-6 md:h-8" /> Vanguard Lectures</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(data.videos || []).length > 0 ? data.videos.map((v, i) => {
                        const vidId = v.url?.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
                        return (
                          <div key={i} className="group relative bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden hover:border-cyan-500/30 transition-all hover:scale-[1.02]">
                            <div className="aspect-video relative overflow-hidden">
                              <img 
                                src={vidId ? `https://img.youtube.com/vi/${vidId}/mqdefault.jpg` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                alt={v.title}
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-4 rounded-full bg-cyan-500 text-black">
                                  <Play className="w-6 h-6 fill-black" />
                                </div>
                              </div>
                            </div>
                            <div className="p-5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#00F5FF] mb-2">{v.channel || 'Educational Master'}</p>
                              <h4 className="text-sm md:text-base font-bold text-white line-clamp-2 mb-4 leading-tight">{v.title}</h4>
                              <a 
                                href={v.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/10 transition-all"
                              >
                                Watch Lecture <ChevronRight className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl gap-6">
                           <Video className="w-12 h-12 text-white/5" />
                           <div className="text-center px-4">
                             <p className="text-[10px] md:text-xs font-bold text-white/20 uppercase tracking-widest mb-4">No prioritized lectures detected for this topic yet.</p>
                             <button 
                               onClick={handleFetchVideos}
                               className="px-8 py-3 bg-[#00F5FF] text-black rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,245,255,0.2)]"
                             >
                               Sync Neural Lectures
                             </button>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'Quiz' && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 md:space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="text-xl md:text-3xl font-black flex items-center gap-3 md:gap-4 text-white"><HelpCircle className="text-[#00F5FF] w-6 md:w-8 h-6 md:h-8" /> Knowledge Quiz</h3>
                      <button onClick={handleQuiz} className="px-4 md:px-6 py-2 bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/20 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-[#00F5FF]/20 transition-all w-fit">Re-generate</button>
                    </div>
                    {quizData ? (
                      <div className="prose prose-invert prose-sm md:prose-lg max-w-none bg-white/5 p-6 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 shadow-inner">
                        <ReactMarkdown>{quizData}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="py-16 md:py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] gap-4 md:gap-6">
                        <Activity className="w-8 md:w-12 h-8 md:h-12 text-white/5" />
                        <p className="text-[10px] md:text-xs font-bold text-white/20 uppercase text-center px-4">No quiz available yet</p>
                        <button onClick={handleQuiz} className="bg-[#00F5FF] text-black px-6 md:px-8 py-2 md:py-3 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:scale-105 transition-all">Create Quiz</button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Tutor' && (
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto pr-2 md:pr-4 space-y-4 md:space-y-6 custom-scrollbar mb-4 md:mb-6">
                      <div className="bg-white/5 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl rounded-tl-none shadow-xl">
                        <p className="text-[#00F5FF] text-[7px] md:text-[8px] font-black uppercase tracking-widest mb-1 md:mb-2 opacity-60">Study Assistant</p>
                        <p className="text-sm md:text-lg font-medium leading-relaxed">Hello! I am your AI study partner. How can I assist you with **{data.topic}** today?</p>
                      </div>
                      {chatHistory.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[90%] md:max-w-[85%] p-4 md:p-6 rounded-2xl md:rounded-3xl ${m.role === 'user' ? 'bg-[#00F5FF]/10 border border-[#00F5FF]/20 rounded-tr-none shadow-lg' : 'bg-white/5 border border-white/10 rounded-tl-none shadow-xl'}`}>
                            <p className={`text-[7px] mb-1 md:mb-2 font-black uppercase tracking-widest opacity-40 ${m.role === 'user' ? 'text-[#00F5FF]' : 'text-slate-400'}`}>
                              {m.role === 'user' ? 'You' : 'Assistant'}
                            </p>
                            <div className="prose prose-invert prose-sm md:prose-base max-w-none leading-relaxed"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="relative mt-auto">
                      <input 
                        value={chatMsg}
                        onChange={e => setChatMsg(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleChat()}
                        placeholder="Ask a question..."
                        className="w-full bg-[#1A1A22] border border-white/5 rounded-2xl md:rounded-[2rem] py-4 md:py-6 px-4 md:px-8 pr-12 md:pr-16 outline-none text-sm md:text-base font-medium focus:border-[#00F5FF]/40 transition-all shadow-2xl"
                      />
                      <button onClick={handleChat} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-[#00F5FF] text-black rounded-xl md:rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00F5FF]/30">
                        <Send className="w-4 md:w-6 h-4 md:h-6" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'Notes' && (
                  <div className="flex-1 flex flex-col space-y-6 md:space-y-8 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                        <h3 className="text-xl md:text-3xl font-black flex items-center gap-3 md:gap-4 text-white"><PenLine className="text-[#00F5FF] w-6 md:w-8 h-6 md:h-8" /> Neural Nexus Notes</h3>
                        <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-fit">
                           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                           <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Auto-Saving</span>
                        </div>
                    </div>
                    <div className="flex-1 relative group">
                        <div className="absolute -inset-1 bg-cyan-500/10 rounded-[1.5rem] md:rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <textarea 
                          value={sessionNotes[data?._id] || ''}
                          onChange={(e) => saveNote(data._id, e.target.value)}
                          className="relative w-full h-full bg-black/40 border border-white/5 p-6 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] outline-none font-mono text-sm md:text-lg text-white/70 leading-relaxed md:leading-[1.8] resize-none shadow-2xl focus:border-cyan-500/30 transition-all placeholder:text-white/5" 
                          placeholder="Channel your thoughts into the neural matrix..." 
                        />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
    </ErrorBoundary>
  )}
</>
);
}
