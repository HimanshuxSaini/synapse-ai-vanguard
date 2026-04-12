import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import {
  Brain, Lock, Mail, Users, ShieldCheck,
  Zap, Star, Monitor, BookOpen, Eye, EyeOff,
  MessageSquare, CheckCircle2, Activity
} from 'lucide-react';

/* ─── keyframe injection ─── */
const CSS = `
  @keyframes floatA { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(14px,-18px) scale(1.04)} }
  @keyframes floatB { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-12px,16px) scale(1.03)} }
  @keyframes floatC { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,10px)} }
  @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes pulseRing { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  .animate-fadeUp { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both; }
  .animate-fadeUp-1 { animation: fadeUp .7s .1s cubic-bezier(.22,1,.36,1) both; }
  .animate-fadeUp-2 { animation: fadeUp .7s .2s cubic-bezier(.22,1,.36,1) both; }
  .animate-fadeUp-3 { animation: fadeUp .7s .3s cubic-bezier(.22,1,.36,1) both; }
  .animate-fadeUp-4 { animation: fadeUp .7s .4s cubic-bezier(.22,1,.36,1) both; }
  .animate-fadeUp-5 { animation: fadeUp .7s .5s cubic-bezier(.22,1,.36,1) both; }
  .shine-btn:hover { filter: brightness(1.12); }
  .shine-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.1) 50%,transparent 100%); background-size:200% 100%; animation:shimmer 2.5s linear infinite; border-radius:inherit; pointer-events:none; }
  .feature-row:hover { background:rgba(255,255,255,0.04) !important; border-color:rgba(255,255,255,0.1) !important; transform:translateX(4px); }
  .ghost-btn:hover { background:rgba(255,255,255,0.055) !important; border-color:rgba(255,255,255,0.14) !important; }
  .auth-card-stable { transform: translateZ(0); backface-visibility: hidden; will-change: transform, opacity; }
  .deco-blob { pointer-events: none; }
`;

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin]   = useState(true);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [focused, setFocused]   = useState(null);
  const [showPass, setShowPass] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) return;
    setLoading(true); setError('');
    try {
      const res = await api.post(isLogin ? '/auth/login' : '/auth/register',
        isLogin ? { email, password } : { name, email, password });
      if (res.data?.token && res.data?.user) {
        localStorage.setItem('synapse_token', res.data.token);
        localStorage.setItem('synapse_user', JSON.stringify(res.data.user));
        onLogin(res.data.user);
      } else { setError('Login failed. Please try again.'); }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Incorrect credentials. Try again.';
      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally { setLoading(false); }
  };

  const inp = (f) => ({
    background:  focused === f ? 'rgba(0,245,255,0.05)' : 'rgba(255,255,255,0.035)',
    border:      `1px solid ${focused === f ? 'rgba(0,245,255,0.35)' : 'rgba(255,255,255,0.09)'}`,
    boxShadow:   focused === f ? '0 0 0 3px rgba(0,245,255,0.06)' : 'none',
    color: 'white', fontFamily:"'Inter',sans-serif",
    transition: 'all .2s',
  });
  const ico = (f) => `absolute left-4 top-1/2 -translate-y-1/2 w-[15px] h-[15px] transition-colors duration-200 ${focused===f?'text-cyan-400':'text-white/20'}`;

  const features = [
    { icon: Zap,           label: 'AI Learning Roadmaps', color: '#a855f7', glow:'rgba(168,85,247,0.15)'  },
    { icon: Monitor,       label: 'Visual Mind Maps',     color: '#00f5ff', glow:'rgba(0,245,255,0.12)'   },
    { icon: MessageSquare, label: 'Smart AI Quizzes',     color: '#f59e0b', glow:'rgba(245,158,11,0.12)'  },
  ];
  return (
    <>
      <style>{CSS}</style>
      <div
        className="min-h-screen w-screen overflow-x-hidden flex items-center justify-center py-10 lg:py-0"
        style={{ background:'radial-gradient(ellipse 85% 90% at 18% 52%, #100330 0%, #070a12 46%, #040610 100%)', fontFamily:"'Inter','Manrope',sans-serif" }}
      >

        {/* ─── animated background blobs ─── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div style={{ position:'absolute', top:'-18%', right:'-14%', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,200,255,0.13) 0%, transparent 65%)', animation:'floatA 9s ease-in-out infinite' }} />
          <div style={{ position:'absolute', bottom:'-22%', left:'-12%', width:650, height:650, borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 65%)', animation:'floatB 11s ease-in-out infinite' }} />
          <div style={{ position:'absolute', top:'55%', left:'55%', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 65%)', animation:'floatC 13s ease-in-out infinite' }} />
          {[820, 560, 310].map((s, i) => (
            <div key={i} style={{ position:'absolute', top:'50%', left:'33%', transform:'translate(-50%,-50%)', width:s, height:s, borderRadius:'50%', border:`1px solid rgba(255,255,255,${0.018+i*0.009})` }} className="hidden md:block" />
          ))}
          <div style={{ position:'absolute', inset:0, opacity:.016, backgroundImage:'linear-gradient(rgba(0,245,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,1) 1px,transparent 1px)', backgroundSize:'76px 76px' }} />
          <div style={{ position:'absolute', inset:0, backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', opacity:.025 }} />
        </div>

        {/* ══════ MAIN TWO-COLUMN LAYOUT ══════ */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">

            {/* ══ LEFT ══ */}
            <div className="flex flex-col text-center lg:text-left items-center lg:items-start max-w-2xl lg:max-w-[600px] gap-8 lg:gap-12">

              {/* Brand */}
              <div className="flex items-center gap-3 animate-fadeUp">
                <div style={{ width:38, height:38, borderRadius:12, background:'linear-gradient(135deg,#00f5ff,#0065e0)', boxShadow:'0 0 22px rgba(0,245,255,0.32)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Brain style={{ width:19, height:19, color:'black' }} />
                </div>
                <span className="text-white text-lg font-bold italic tracking-tight" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Synapse AI</span>
              </div>

              {/* Headline */}
              <div className="animate-fadeUp-1" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none text-white m-0">
                  Learn Anything.
                </h1>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none m-0 italic bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent filter drop-shadow-[0_0_24px_rgba(0,245,255,0.18)]">
                  Master Fast.
                </h1>
              </div>

              {/* Body */}
              <p className="animate-fadeUp-2 text-sm md:text-base leading-relaxed text-white/50 m-0 max-w-md">
                Your personal AI tutor builds custom study plans, answers every question instantly, and tracks your progress — all from one clean dashboard.
              </p>

              {/* Feature rows - Hidden on small mobile to keep focus on login */}
              <div className="hidden sm:flex animate-fadeUp-3 flex-col gap-3 w-full max-w-sm">
                {features.map((f, i) => (
                  <div key={i} className="feature-row flex items-center gap-4 p-3 rounded-2xl border border-white/5 bg-white/[0.02] transition-all cursor-default">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg" style={{ background:f.glow, color:f.color, border:`1px solid ${f.color}28` }}>
                      <f.icon className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-semibold" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{f.label}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 opacity-60" style={{ color:f.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="animate-fadeUp-4 flex items-center gap-6 md:gap-12 pt-6 border-t border-white/10">
                {[
                  { val:'12K+', label:'Active learners', color:'#00f5ff' },
                  { val:'4.9',  label:'Avg rating',  color:'#a855f7' },
                  { val:'500+', label:'Topics',   color:'#ec4899' },
                ].map((s, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <p className="text-lg md:text-xl font-black m-0" style={{ color:s.color, fontFamily:"'Space Grotesk',sans-serif", textShadow:`0 0 20px ${s.color}55` }}>{s.val}</p>
                    <p className="text-[10px] uppercase font-bold text-white/30 m-0 tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ RIGHT — Auth Card ══ */}
            <div className="animate-fadeUp-5 w-full max-w-[448px] shrink-0">

              {/* glowing border wrapper */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="p-[1px] rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-white/5 shadow-2xl auth-card-stable"
              >
                <div className="rounded-[calc(1.95rem-1px)] md:rounded-[calc(2.45rem-1px)] glass-premium relative overflow-hidden">

                  {/* top shine */}
                  <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                  
                  <div className="p-8 md:p-10 transition-all duration-300 min-h-[500px] flex flex-col justify-center">

                    {/* Brand mark (Visible only on desktop in column, but show for context) */}
                    <div className="flex lg:hidden items-center gap-3 mb-8">
                       <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shrink-0 shadow-lg">
                          <Brain className="w-5 h-5 text-black" />
                       </div>
                       <p className="text-white font-bold italic text-base m-0 tracking-tight" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Synapse AI</p>
                    </div>

                    {/* Title */}
                    <div className="mb-8">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2 leading-tight" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
                        {isLogin ? 'Welcome back 👋' : 'Get started free ✨'}
                      </h2>
                      <p className="text-sm text-white/40 leading-relaxed">
                        {isLogin ? 'Sign in to continue your learning journey.' : 'Create your account and study smarter today.'}
                      </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="flex flex-col gap-4">

                      {!isLogin && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Full Name</label>
                          <div className="relative">
                            <Users className={ico('name')} />
                            <input required value={name} onChange={e=>setName(e.target.value)}
                              onFocus={()=>setFocused('name')} onBlur={()=>setFocused(null)}
                              className="w-full px-11 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm outline-none transition-all placeholder:text-white/20"
                              style={inp('name')}
                              placeholder="Your full name" />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Email Address</label>
                        <div className="relative">
                          <Mail className={ico('email')} />
                          <input required type="email" value={email} onChange={e=>setEmail(e.target.value)}
                            onFocus={()=>setFocused('email')} onBlur={()=>setFocused(null)}
                            className="w-full px-11 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm outline-none transition-all placeholder:text-white/20"
                            style={inp('email')}
                            placeholder="you@email.com" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Password</label>
                          {isLogin && (
                            <button type="button" className="text-[11px] font-semibold text-cyan-400/80 hover:text-cyan-400 transition-colors bg-transparent border-none cursor-pointer">
                              Forgot?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className={ico('pass')} />
                          <input required type={showPass ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)}
                            onFocus={()=>setFocused('pass')} onBlur={()=>setFocused(null)}
                            className="w-full px-11 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm outline-none transition-all placeholder:text-white/20"
                            style={inp('pass')}
                            placeholder="Min. 8 characters" />
                          <button
                            type="button"
                            onClick={()=>setShowPass(p=>!p)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-cyan-400 transition-colors bg-transparent border-none cursor-pointer"
                          >
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <ShieldCheck size={16} className="text-red-400 shrink-0" />
                          <span className="text-xs text-red-400">{error}</span>
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full btn-premium py-4 mt-4"
                        style={{ fontFamily:"'Space Grotesk',sans-serif" }}
                      >
                         {loading ? <Activity className="w-4 h-4 animate-spin" /> : (isLogin ? 'Sign In' : 'Join Vanguard')}
                      </motion.button>
                    </form>

                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-white/5" />
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">Alternative</span>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>

                    <button
                      onClick={()=>setIsLogin(!isLogin)}
                      className="ghost-btn w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-bold transition-all hover:bg-white/10 cursor-pointer"
                      style={{ fontFamily:"'Space Grotesk',sans-serif" }}
                    >
                      {isLogin ? 'Create Account →' : '← Back to Login'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
