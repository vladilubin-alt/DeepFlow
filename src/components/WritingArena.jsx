import React, { useEffect, useRef, useCallback, useState } from 'react';

function formatTime(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function badgeForState(state) {
  switch (state) {
    case 'writing':
    case 'saved_by_grace': return 'writing';
    case 'warning': return 'warning';
    case 'guillotined': return 'danger';
    default: return 'idle';
  }
}

const NUDGE_PROMPTS = {
  coach: [
    'What happens next? Stay in the scene.',
    'Keep the sentence alive. One more word.',
    'You are in control. Keep writing.',
    'This is where the story turns.',
    'Breathe. Then write the next word.',
  ],
  demon: [
    'You stopped. That\'s failure. Keep writing or lose it all.',
    'The guillotine is patient. It will wait for you to give up.',
    'Every second you stall, your words burn. Keep moving.',
    'Weakness is a choice. Choose to write.',
    'Comfort is the enemy. Stay uncomfortable. Write.',
  ],
};

export default function WritingArena({
  state,
  text,
  onChange,
  timerData,
  wordCount,
  wordTarget,
  graceTokens,
  aiMode,
  onUseGraceToken,
  onGiveUp,
  onReset,
}) {
  const containerRef = useRef(null);
  const areaRef = useRef(null);
  const progressPercent = Math.min(100, Math.round((wordCount / wordTarget) * 100));
  const isDisabled = state === 'guillotined' || state === 'completed';
  const isGuillotined = state === 'guillotined';
  const isCompleted = state === 'completed';
  const isWarning = state === 'warning';
  const isDanger = state === 'guillotined';
  const badge = badgeForState(state);

  const idleMs = timerData ? timerData.idleSinceMs : 0;
  const idleThreshold = 5000;
  const idleRemaining = Math.max(0, Math.ceil((idleThreshold - idleMs) / 1000));
  const showIdleWarn = isWarning && idleRemaining <= 6;
  const isIdleCritical = idleRemaining <= 3;

  const [nudge, setNudge] = useState(null);
  const nudgeTimerRef = useRef(null);

  const showNudge = aiMode !== 'silent' && showIdleWarn && idleRemaining <= 4 && !nudge;

  useEffect(() => {
    if (showNudge && !nudgeTimerRef.current) {
      const prompts = aiMode === 'demon' ? NUDGE_PROMPTS.demon : NUDGE_PROMPTS.coach;
      nudgeTimerRef.current = setTimeout(() => {
        setNudge(prompts[Math.floor(Math.random() * prompts.length)]);
        nudgeTimerRef.current = null;
      }, 500);
    }
    if (!showIdleWarn) {
      if (nudgeTimerRef.current) { clearTimeout(nudgeTimerRef.current); nudgeTimerRef.current = null; }
    }
    if (state === 'writing' || state === 'idle') {
      setNudge(null);
    }
  }, [showNudge, showIdleWarn, state, aiMode]);

  const dismissNudge = useCallback(() => setNudge(null), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isDanger) {
      el.classList.add('danger');
    } else {
      el.classList.remove('danger');
    }
  }, [isDanger]);

  const wpm = timerData && timerData.elapsedMs > 0
    ? Math.round((wordCount / (timerData.elapsedMs / 60000)))
    : 0;
  const wpmPct = Math.min(wpm / 60 * 100, 100);

  return (
    <section
      ref={containerRef}
      className={`writing-panel lg:col-span-3 flex flex-col glass-panel rounded-[2.5rem] overflow-hidden relative h-full ${
        isWarning ? 'ring-1 ring-velvet-crimson/30' : ''
      }`}
    >
      <div className={`header-bar flex justify-between items-center px-3 sm:px-6 py-1.5 sm:py-3 border-b border-slate-gray/60 ${state === 'idle' ? 'py-1 sm:py-3' : ''}`}>
        <div className="flex items-center gap-3">
          <span className={`state-badge ${badge}`}>
            {badge === 'danger' ? 'DANGER' : badge === 'warning' ? 'WARNING' : badge === 'writing' ? 'WRITING' : 'IDLE'}
          </span>
          {timerData && timerData.remainingMs > 0 && (
            <span className="font-mono-custom text-xs text-stone-500 tracking-wider">{formatTime(timerData.remainingMs)}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono-custom text-xs text-stone-500">
            <span className="text-stone-300">{wordCount}</span> / {wordTarget}
          </span>
          {wpm > 0 && (
            <span className="font-mono-custom text-xs text-stone-500">{wpm} wpm</span>
          )}
        </div>
      </div>

      <div className={`w-full h-0.5 bg-slate-gray/80 ${state === 'idle' ? 'hidden sm:block' : ''}`} style={{ background: '#1e1a0e' }} role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Word count progress">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            background: isWarning || isDanger ? '#E24B4A' : isCompleted ? '#1D9E75' : '#EF9F27',
          }}
        ></div>
      </div>

      <div className="flex-1 flex flex-col p-6 relative min-h-0">
        <textarea
          ref={areaRef}
          className={`write-area w-full flex-1 min-h-0 bg-transparent text-ivory placeholder-stone-600 focus:outline-none resize-none font-serif text-base md:text-lg leading-relaxed custom-scrollbar ${
            isDanger ? 'bg-obsidian/40' : ''
          } ${state === 'idle' ? 'max-h-[120px] sm:max-h-none' : ''}`}
          placeholder={
            state === 'idle'
              ? "Press 'Start Session' below to begin…"
              : 'Begin typing to enter flow state. Stopping triggers the warning…'
          }
          aria-label="Writing area"
          aria-describedby="writing-instructions"
          value={text}
          onChange={(e) => {
            onChange(e.target.value);
            dismissNudge();
          }}
          disabled={isDisabled}
        ></textarea>

        {showIdleWarn && (
          <div className="idle-warn">
            <span>idle deletion begins in</span>
            <span
              className="font-mono-custom font-medium"
              style={{ color: isIdleCritical ? '#E24B4A' : '#EF9F27' }}
            >
              {idleRemaining}s
            </span>
          </div>
        )}

        {nudge && (
          <div className={`ai-nudge ${aiMode === 'demon' ? 'demon' : ''}`} onClick={dismissNudge}>
            <span className="ti-sparkles">✦</span>
            <span>{nudge}</span>
          </div>
        )}

        {isGuillotined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian/80 backdrop-blur-md rounded-[2rem] p-4 md:p-6 text-center transition-all duration-500 z-20">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian/80 backdrop-blur-md rounded-[2rem] p-4 md:p-6 text-center transition-all duration-500 z-20">
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

      <div className={`flex justify-between items-center px-6 py-3 border-t border-slate-gray/60 text-xxs font-mono-custom text-stone-500 ${state === 'idle' ? 'hidden sm:flex' : ''}`}>
        <span>Draft saved locally.</span>
        <span>UTF-8</span>
      </div>
    </section>
  );
}
