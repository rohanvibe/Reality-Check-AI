import React, { useState, useEffect } from 'react';
import { getRealityCheck, type RealityCheckResult } from './logic/ai';
import { Loader2, Send, History as HistoryIcon, Skull, RefreshCw, X, Cog } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const safeGetItem = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RealityCheckResult | null>(null);
  const [history, setHistory] = useState<RealityCheckResult[]>([]);
  const [customKey, setCustomKey] = useState(safeGetItem('custom_sambanova_api_key') || '');
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [usageTimestamps, setUsageTimestamps] = useState<number[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const saved = safeGetItem('reality_check_history');
    if (saved) setHistory(JSON.parse(saved));
    const usage = safeGetItem('usage_limit_v1');
    if (usage) setUsageTimestamps(JSON.parse(usage));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (result && (e.key === 'Backspace' || e.key === 'Escape')) setResult(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [result]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    
    if (!isOnline) {
      alert("You are currently offline. Check your connection to run a new Reality Check.");
      return;
    }

    if (!customKey) {
      const now = Date.now();
      const recent = usageTimestamps.filter(ts => ts > now - 3600000);
      if (recent.length >= 5) {
        alert("Free limit reached (5/hr). Add your own key in Settings.");
        return;
      }
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await getRealityCheck(input, customKey);
      setResult(res);
      const updatedHistory = [res, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem('reality_check_history', JSON.stringify(updatedHistory));
      
      if (!customKey) {
        const updatedUsage = [...usageTimestamps, Date.now()];
        setUsageTimestamps(updatedUsage);
        localStorage.setItem('usage_limit_v1', JSON.stringify(updatedUsage));
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const layoutStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    textAlign: 'center',
    padding: '2rem',
    position: 'relative'
  };

  const headerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    padding: '1.2rem 2rem', // Moved further up
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', width: '100%' }}>
      {/* Header */}
      <AnimatePresence>
        {!result && (
          <header style={headerStyle} className="header-container">
            <div style={{ maxWidth: '1400px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <button 
                onClick={() => setShowSettings(true)} 
                className="btn-secondary flex items-center gap-2"
                style={{ fontSize: '0.75rem', padding: '0.6rem 1.2rem' }}
              >
              <button 
                onClick={() => setShowSettings(true)} 
                className="btn-secondary flex items-center gap-2"
                style={{ fontSize: '0.75rem', padding: '0.6rem 1.2rem' }}
              >
                {Cog ? <Cog size={18} /> : null} <span className="hide-mobile">SETTINGS</span>
              </button>
              </button>
              
              <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '1.5rem', pointerEvents: 'none' }} className="logo-wrapper">
                <Skull size={32} style={{ color: '#ff3e3e' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h1 style={{ fontSize: '1.5rem', margin: 0, whiteSpace: 'nowrap' }} className="logo-text">REALITY CHECK AI</h1>
                  {!isOnline && (
                    <span style={{ fontSize: '0.6rem', color: '#ff3e3e', fontWeight: 900, letterSpacing: '0.1em' }}>[ OFFLINE MODE ]</span>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setShowHistory(true)} 
                className="btn-secondary flex items-center gap-2"
                style={{ fontSize: '0.75rem', padding: '0.6rem 1.2rem' }}
              >
                <HistoryIcon size={18} /> <span className="hide-mobile">HISTORY</span>
              </button>
            </div>
          </header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main style={layoutStyle} className="center-stage">
        <AnimatePresence mode="wait">
          {!result && !loading ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              style={{ width: '100%' }}
              className="max-w-container"
            >
              <h2 style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', marginBottom: '2rem', lineHeight: 0.9 }}>
                Get <span style={{ color: '#ff3e3e' }}>Brutally Honest</span> Feedback.
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#888', marginBottom: '3rem', maxWidth: '800px', marginInline: 'auto' }}>
                No fluff. No motivation. Just cold logic for builders who want to win.
              </p>

              <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', position: 'relative' }}>
                <textarea
                  className="main-input"
                  style={{ minHeight: '300px', width: '100%', padding: '2rem' }}
                  placeholder="Describe your idea... (Enter to submit)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingInline: '0.5rem' }}>
                  <div className="badge">
                    LIMIT: {usageTimestamps.filter(ts => ts > Date.now() - 3600000).length}/5
                  </div>
                  <button 
                    onClick={handleSubmit}
                    className="btn-primary flex items-center gap-3"
                    disabled={!input.trim()}
                  >
                    <Send size={24} /> CHECK IDEA
                  </button>
                </div>
              </div>
            </motion.div>
          ) : loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Loader2 size={64} style={{ color: '#ff3e3e' }} className="animate-spin mb-6" />
              <h3 style={{ fontSize: '2rem', fontStyle: 'italic' }} className="animate-pulse">DISSECTING LOGIC...</h3>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Results View */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="full-screen-result"
          >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                <button onClick={() => setResult(null)} className="btn-ghost flex items-center gap-2">
                  <RefreshCw size={16} /> NEW CHECK (BACKSPACE)
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => {
                    navigator.clipboard.writeText(`Verdict: ${result.finalVerdict}`);
                    alert("Copied!");
                  }} className="btn-secondary">SHARE</button>
                  <button onClick={() => setResult(null)} className="btn-primary !p-3 !rounded-xl">
                    <X size={32} />
                  </button>
                </div>
              </div>

              <div className="section-card verdict-glow" style={{ marginBottom: '3rem' }}>
                <div className="badge" style={{ marginBottom: '1rem' }}>VERDICT</div>
                <p style={{ fontSize: '4rem', color: '#ff3e3e', fontWeight: 900 }}>"{result.finalVerdict}"</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                <div className="section-card">
                  <h4 style={{ color: '#ff3e3e', fontSize: '0.8rem', marginBottom: '1.5rem' }}>CORE PROBLEM</h4>
                  <p style={{ fontSize: '1.5rem' }}>{result.coreProblem}</p>
                </div>
                <div className="section-card">
                  <h4 style={{ color: '#eab308', fontSize: '0.8rem', marginBottom: '1.5rem' }}>FAILURE RISKS</h4>
                  <ul style={{ listStyle: 'none', color: '#888', fontSize: '1.2rem' }}>
                    {result.failureRisks.map((r, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>/ {r}</li>)}
                  </ul>
                </div>
                <div className="section-card">
                  <h4 style={{ color: '#60a5fa', fontSize: '0.8rem', marginBottom: '1.5rem' }}>MISSING PIECES</h4>
                  <ul style={{ listStyle: 'none', color: '#888', fontSize: '1.2rem' }}>
                    {result.missingPieces.map((p, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>+ {p}</li>)}
                  </ul>
                </div>
                <div className="section-card">
                  <h4 style={{ color: '#4ade80', fontSize: '0.8rem', marginBottom: '1.5rem' }}>UPGRADES</h4>
                  <ul style={{ listStyle: 'none', color: '#888', fontSize: '1.2rem' }}>
                    {result.improvements.map((p, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>➔ {p}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar/Modals */}
      <AnimatePresence>
        {showHistory && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistory(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }} />
            <motion.div initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '100%', maxWidth: '500px', background: '#0a0a0a', padding: '3rem', borderLeft: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '2rem' }}>HISTORY</h3>
                <button onClick={() => setShowHistory(false)} className="btn-ghost scale-150"><X /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {history.map((h, i) => (
                  <div key={i} className="history-item" onClick={() => { setResult(h); setShowHistory(false); }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#555' }}>{format(h.timestamp, 'MMM dd, HH:mm')}</span>
                    </div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.input}</p>
                    <p style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>"{h.finalVerdict}"</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {showSettings && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(30px)' }} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="section-card" style={{ maxWidth: '40rem', width: '100%', position: 'relative', border: '1px solid #ff3e3e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '2rem' }}>SETTINGS</h3>
                <button onClick={() => setShowSettings(false)} className="btn-ghost scale-150"><X /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#555', marginBottom: '1rem', display: 'block' }}>SAMBANOVA API KEY</label>
                  <input type="password" value={customKey} onChange={(e) => setCustomKey(e.target.value)} className="main-input" style={{ minHeight: 'auto', padding: '1rem' }} placeholder="sk-..." />
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>Required to bypass the 5/hr free limit.</p>
                </div>

                {deferredPrompt && (
                  <button 
                    onClick={async () => {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      if (outcome === 'accepted') setDeferredPrompt(null);
                    }} 
                    className="btn-primary w-full py-4 !bg-white !text-black"
                  >
                    INSTALL REALITY CHECK APP
                  </button>
                )}

                <button onClick={() => { localStorage.setItem('custom_sambanova_api_key', customKey); setShowSettings(false); }} className="btn-primary w-full py-4">SAVE KEYS</button>
                <button onClick={() => { if(confirm("Clear history?")) { localStorage.removeItem('reality_check_history'); setHistory([]); } }} style={{ color: '#ff3e3e', fontSize: '0.7rem', cursor: 'pointer', background: 'none', border: 'none' }}>WIPE DATA</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
