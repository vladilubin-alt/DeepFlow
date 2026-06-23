import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

function formatTime(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function stateColor(state) {
  switch (state) {
    case 'warning': return 'text-velvet-crimson';
    case 'guillotined': return 'text-velvet-crimson';
    case 'completed': return 'text-emerald-400';
    default: return 'text-champagne';
  }
}

export default function WritingArena({
  state,
  text,
  onChange,
  timerData,
  wordCount,
  wordTarget,
  graceTokens,
  onUseGraceToken,
  onGiveUp,
  onReset,
}) {
  const containerRef = useRef(null);
  const progressPercent = Math.min(100, Math.round((wordCount / wordTarget) * 100));
  const isDisabled = state === 'guillotined' || state === 'completed';
  const isGuillotined = state === 'guillotined';
  const isCompleted = state === 'completed';
  const isWarning = state === 'warning';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y: 12,
        duration: 0.6,
        ease: 'power2.out',
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className={`lg:col-span-3 flex flex-col glass-panel rounded-[2.5rem] overflow-hidden p-8 relative ${
        isWarning ? 'ring-1 ring-velvet-crimson/30' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4 text-xs font-mono-custom text-stone-400">
        <div className="flex items-center gap-4">
          <span>TARGET: <strong className="text-ivory">{wordCount} / {wordTarget} words</strong></span>
          <span className="text-stone-600">•</span>
          <span>PROGRESS: <strong className="text-ivory">{progressPercent}%</strong></span>
        </div>
        <div className="flex items-center gap-3">
          {timerData.remainingMs > 0 && (
            <span className="text-stone-500 font-mono-custom tracking-wider">
              {formatTime(timerData.remainingMs)}
            </span>
          )}
          <span>STATE: <strong className={`uppercase ${stateColor(state)}`}>{state}</strong></span>
        </div>
      </div>

      <div className="w-full bg-slate-gray h-1 rounded-full overflow-hidden mb-6">
        <div
          className={`h-full transition-all duration-300 ${
            isWarning ? 'bg-velvet-crimson' : isCompleted ? 'bg-emerald-500' : 'bg-champagne'
          }`}
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="flex-grow flex flex-col relative">
        <textarea
          className="w-full flex-grow bg-transparent text-ivory placeholder-stone-600 focus:outline-none resize-none font-serif text-base md:text-lg leading-relaxed custom-scrollbar min-h-[180px] md:min-h-[300px]"
          placeholder={
            state === 'idle'
              ? "Press 'Start Session' below to begin…"
              : 'Begin typing to enter flow state. Stopping triggers the warning…'
          }
          value={text}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled}
        ></textarea>

        {isGuillotined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian/80 backdrop-blur-md rounded-[2rem] p-4 md:p-6 text-center transition-all duration-500">
            <div className="text-velvet-crimson text-4xl md:text-5xl mb-3 md:mb-4 font-serif">☠️</div>
            <h3 className="text-xl md:text-2xl text-ivory font-serif mb-2">The Guillotine Has Fallen</h3>
            <p className="text-stone-400 text-xs md:text-sm max-w-md mb-4 md:mb-6 leading-relaxed">
              Your flow was interrupted. Spend a Grace Token to rescue your draft, or abandon it to the Graveyard vault and break your streak.
            </p>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full px-2 md:px-0 md:w-auto">
              <button
                onClick={onUseGraceToken}
                disabled={graceTokens === 0}
                className="magnetic-btn px-5 py-3 md:py-2.5 rounded-xl bg-champagne text-obsidian font-medium hover:brightness-110 font-mono-custom text-sm transition disabled:opacity-40 disabled:cursor-not-allowed w-full md:w-auto"
              >
                Use Grace Token ({graceTokens} Left)
              </button>
              <button
                onClick={onGiveUp}
                className="magnetic-btn px-5 py-3 md:py-2.5 rounded-xl bg-deep-slate text-champagne border border-slate-gray font-mono-custom text-sm hover:brightness-110 transition w-full md:w-auto"
              >
                Give Up & Clear
              </button>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian/80 backdrop-blur-md rounded-[2rem] p-4 md:p-6 text-center transition-all duration-500">
            <div className="text-emerald-400 text-4xl md:text-5xl mb-3 md:mb-4 font-serif">🏆</div>
            <h3 className="text-xl md:text-2xl text-ivory font-serif mb-2">Session Complete</h3>
            <p className="text-stone-400 text-xs md:text-sm max-w-md mb-4 md:mb-6 leading-relaxed">
              You did it. {wordCount} words written — your streak lives on.
            </p>
            <button
              onClick={onReset}
              className="magnetic-btn px-5 py-3 md:py-2.5 rounded-xl bg-champagne text-obsidian font-medium hover:brightness-110 font-mono-custom text-sm transition w-full md:w-auto"
            >
              Start New Session
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-gray/60 flex justify-between items-center text-xs font-mono-custom text-stone-500">
        <span>Draft saved locally.</span>
        <span>UTF-8</span>
      </div>
    </section>
  );
}
