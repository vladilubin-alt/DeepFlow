import React, { useState, useEffect } from 'react';

export default function App() {
  // Demo states to show off the visual layout in this review phase
  const [sessionState, setSessionState] = useState('idle'); // 'idle' | 'writing' | 'warning' | 'guillotined' | 'completed'
  const [text, setText] = useState('');
  const [duration, setDuration] = useState(25); // 25 minutes
  const [wordTarget, setWordTarget] = useState(300);
  const [graceTokens, setGraceTokens] = useState(3);
  const [streak, setStreak] = useState(5);
  const [audioTone, setAudioTone] = useState('alpha'); // 'alpha' | 'beta' | 'off'
  const [isMuted, setIsMuted] = useState(false);
  const [syncStatus, setSyncStatus] = useState('connected'); // 'connected' | 'syncing' | 'offline'

  // Dynamic word count calculation
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const progressPercent = Math.min(100, Math.round((wordCount / wordTarget) * 100));

  return (
    <div className="min-h-screen noise-overlay flex flex-col justify-between p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl text-amber-500 font-serif tracking-wide">DeepFlow</h1>
          <p className="text-xs text-stone-400 font-sans mt-1 uppercase tracking-widest">ADHD Writing Instrument</p>
        </div>
        
        {/* Sync & Profile Status Widget */}
        <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full text-xs font-mono">
          <div className={`w-2 h-2 rounded-full ${syncStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-stone-500'}`}></div>
          <span className="text-stone-300">Supabase: {syncStatus}</span>
          <span className="text-stone-500">|</span>
          <span className="text-amber-500">vladi_lubin</span>
        </div>
      </header>

      {/* MAIN ASYMMETRICAL BENTO GRID */}
      <main className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch flex-grow">
        
        {/* LEFT COLUMN: THE WRITING ARENA (Spans 3 cols on desktop) */}
        <section className="lg:col-span-3 flex flex-col glass-panel rounded-2xl overflow-hidden p-6 relative">
          {/* Top Progress bar and Stats */}
          <div className="flex justify-between items-center mb-4 text-xs font-mono text-stone-400">
            <div className="flex items-center gap-4">
              <span>TARGET: <strong className="text-stone-200">{wordCount} / {wordTarget} words</strong></span>
              <span>•</span>
              <span>PROGRESS: <strong className="text-stone-200">{progressPercent}%</strong></span>
            </div>
            <div>
              <span>STATE: <strong className="text-amber-500 uppercase">{sessionState}</strong></span>
            </div>
          </div>
          
          {/* Word count progress bar line */}
          <div className="w-full bg-stone-900 h-1 rounded-full overflow-hidden mb-6">
            <div 
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Text Editor Textarea */}
          <div className="flex-grow flex flex-col relative">
            <textarea
              className="w-full flex-grow bg-transparent text-stone-100 placeholder-stone-600 focus:outline-none resize-none font-serif text-lg leading-relaxed custom-scrollbar"
              placeholder="Begin typing to enter flow state. Stopping for more than 5 seconds triggers the warnings..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (sessionState === 'idle' && e.target.value.length > 0) {
                  setSessionState('writing');
                }
              }}
              disabled={sessionState === 'guillotined'}
            ></textarea>

            {/* Guillotined State Overlay (frosted glass) */}
            {sessionState === 'guillotined' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/80 backdrop-blur-md rounded-xl p-6 text-center transition-all duration-500">
                <div className="text-red-500 text-5xl mb-4 font-serif">☠️</div>
                <h3 className="text-2xl text-stone-100 font-serif mb-2">The Guillotine Has Fallen</h3>
                <p className="text-stone-400 text-sm max-w-md mb-6 leading-relaxed">
                  Your flow was interrupted. Spend a Grace Token to rescue your draft, or abandon it to the Graveyard vault and break your streak.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      if (graceTokens > 0) {
                        setGraceTokens(prev => prev - 1);
                        setSessionState('writing');
                      }
                    }}
                    className="px-5 py-2.5 rounded-lg bg-amber-600 text-stone-100 hover:bg-amber-500 font-mono text-sm transition"
                    disabled={graceTokens === 0}
                  >
                    Use Grace Token ({graceTokens} Left)
                  </button>
                  <button 
                    onClick={() => {
                      setText('');
                      setStreak(0);
                      setSessionState('idle');
                    }}
                    className="px-5 py-2.5 rounded-lg bg-stone-800 text-stone-400 hover:bg-stone-700 font-mono text-sm transition"
                  >
                    Give Up & Clear
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Bottom status toolbar */}
          <div className="mt-4 pt-4 border-t border-stone-900/60 flex justify-between items-center text-xs font-mono text-stone-500">
            <span>Deterministic backup verified locally.</span>
            <span>UTF-8</span>
          </div>
        </section>

        {/* RIGHT COLUMN: CONTROL PANEL & MASCOT (Spans 2 cols on desktop) */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          
          {/* 1. FLOW ORB MASCOT PANEL */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden h-64">
            <div className="absolute inset-0 bg-radial from-amber-500/5 to-transparent pointer-events-none"></div>
            
            {/* The Flow Orb Placeholder */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Pulsating glowing backing */}
              <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl animate-pulse"></div>
              {/* Dynamic visual orb depending on state */}
              <div className={`w-28 h-28 rounded-full border border-amber-500/30 flex items-center justify-center transition-all duration-700
                ${sessionState === 'writing' ? 'bg-amber-500/20 scale-110 border-amber-400 rotate-45 rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]' : ''}
                ${sessionState === 'warning' ? 'bg-red-500/20 border-red-500 scale-105 animate-bounce' : ''}
                ${sessionState === 'guillotined' ? 'bg-stone-900 border-stone-800 scale-90 grayscale' : ''}
                ${sessionState === 'idle' ? 'bg-amber-500/5 scale-100' : ''}
              `}>
                <span className="text-2xl text-amber-500/80 font-serif">
                  {sessionState === 'idle' && '💤'}
                  {sessionState === 'writing' && '✨'}
                  {sessionState === 'warning' && '⚠️'}
                  {sessionState === 'guillotined' && '☠️'}
                </span>
              </div>
            </div>
            
            <div className="mt-4 text-center z-10">
              <span className="text-xs font-mono uppercase tracking-widest text-stone-400">Flow Mascot</span>
              <p className="text-stone-500 text-xxs mt-0.5 font-mono">Reacts to typing velocity and warning countdowns</p>
            </div>
          </div>

          {/* 2. TIMER & SESSION METRIC PANEL */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between gap-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-stone-400">Session Setup</h2>
            
            {/* Setup Controls */}
            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-stone-500">Duration (Min)</label>
                <select 
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))}
                  disabled={sessionState !== 'idle'}
                  className="bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 text-sm font-mono focus:outline-none focus:border-amber-500/40"
                >
                  <option value={5}>5 Min</option>
                  <option value={15}>15 Min</option>
                  <option value={25}>25 Min</option>
                  <option value={45}>45 Min</option>
                  <option value={60}>60 Min</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-stone-500">Word Target</label>
                <select 
                  value={wordTarget} 
                  onChange={(e) => setWordTarget(Number(e.target.value))}
                  disabled={sessionState !== 'idle'}
                  className="bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 text-sm font-mono focus:outline-none focus:border-amber-500/40"
                >
                  <option value={100}>100 words</option>
                  <option value={250}>250 words</option>
                  <option value={300}>300 words</option>
                  <option value={500}>500 words</option>
                  <option value={1000}>1000 words</option>
                </select>
              </div>
            </div>

            {/* Streak & Grace Token Indicators */}
            <div className="border-t border-stone-900/60 pt-4 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xxs font-mono text-stone-500 uppercase">Streak count</span>
                <span className="text-lg text-amber-500 font-serif font-semibold">{streak} Days 🔥</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xxs font-mono text-stone-500 uppercase">Grace Tokens</span>
                <span className="text-lg text-stone-200 font-mono">{graceTokens} Available 🛡️</span>
              </div>
            </div>

            {/* State Trigger Mock buttons (For Review Phase) */}
            <div className="border-t border-stone-900/60 pt-4">
              <span className="text-xxs font-mono text-stone-500 uppercase block mb-2">Simulate State Transition</span>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSessionState('idle')} className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-400 text-xxs font-mono hover:text-stone-200 transition">Idle</button>
                <button onClick={() => setSessionState('writing')} className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-400 text-xxs font-mono hover:text-stone-200 transition">Writing</button>
                <button onClick={() => setSessionState('warning')} className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-400 text-xxs font-mono hover:text-stone-200 transition">Warning</button>
                <button onClick={() => setSessionState('guillotined')} className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-400 text-xxs font-mono hover:text-stone-200 transition">Guillotined</button>
              </div>
            </div>
          </div>

          {/* 3. FOCUS AUDIO / NEURO-ACOUSTIC PANEL */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-mono uppercase tracking-widest text-stone-400">Sensory Layer</h2>
              
              {/* Mute Button */}
              <button 
                onClick={() => setIsMuted(prev => !prev)}
                className="text-stone-400 hover:text-stone-200 transition text-sm"
              >
                {isMuted ? '🔇 Muted' : '🔊 Unmuted'}
              </button>
            </div>

            {/* Binaural Frequency Selection */}
            <div className="grid grid-cols-3 gap-2">
              {['alpha', 'beta', 'off'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAudioTone(mode)}
                  className={`py-2 rounded-lg border text-xs font-mono uppercase tracking-wider transition
                    ${audioTone === mode 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                      : 'bg-stone-900/60 border-stone-800/80 text-stone-500 hover:text-stone-300'}`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <p className="text-xxs text-stone-500 font-mono leading-relaxed mt-1">
              Synthesizes raw {audioTone !== 'off' ? `${audioTone} waves` : 'silence'} directly in the browser using the Web Audio API to aid cognitive flow alignment.
            </p>
          </div>
          
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-8 pt-4 border-t border-stone-900/40 flex justify-between items-center text-stone-500 text-xxs font-mono">
        <span>DeepFlow ADHD Writing Instrument © 2026</span>
        <span>Version 0.2.0 (Phase 4 Init)</span>
      </footer>
    </div>
  );
}
