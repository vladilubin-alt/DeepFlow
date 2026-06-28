import React from 'react';

const DURATIONS = ['3m', '5m', '10m', '25m', '45m', '60m'];
const WORD_TARGETS = ['25', '50', '100', '300', '500', '750'];
const AI_MODES = ['silent', 'coach', 'demon'];

export default function SessionSetup({
  duration,
  onDurationChange,
  wordTarget,
  onTargetChange,
  aiMode,
  onAiModeChange,
  onStart,
  isRunning,
  sessionState,
  graceTokens,
  streak,
  ready,
}) {
  const isIdle = sessionState === 'idle';

  const durationIdx = [3, 5, 10, 25, 45, 60].indexOf(duration);
  const targetIdx = [25, 50, 100, 300, 500, 750].indexOf(wordTarget);
  const aiIdx = AI_MODES.indexOf(aiMode);

  return (
    <div className="glass-panel rounded-[2rem] p-6 flex flex-col gap-4">
      <h2 className="text-xs font-sans font-bold uppercase tracking-[0.15em] text-slate-heading">Session Setup</h2>

      <div className="flex flex-col gap-1.5">
        <span className="text-xxs font-mono-custom text-champagne tracking-wider">Duration</span>
        <div className="seg-control">
          {DURATIONS.map((opt, i) => (
            <button
              key={opt}
              onClick={() => onDurationChange([3, 5, 10, 25, 45, 60][i])}
              disabled={!isIdle}
              className={`seg-opt ${durationIdx === i ? 'seg-active' : ''} ${!isIdle ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xxs font-mono-custom text-champagne tracking-wider">Word Target</span>
        <div className="seg-control">
          {WORD_TARGETS.map((opt, i) => (
            <button
              key={opt}
              onClick={() => onTargetChange([25, 50, 100, 300, 500, 750][i])}
              disabled={!isIdle}
              className={`seg-opt ${targetIdx === i ? 'seg-active' : ''} ${!isIdle ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xxs font-mono-custom text-champagne tracking-wider">AI Mode</span>
        <div className="seg-control">
          {AI_MODES.map((opt, i) => (
            <button
              key={opt}
              onClick={() => onAiModeChange(opt)}
              disabled={!isIdle}
              className={`seg-opt ${aiIdx === i ? 'seg-active' : ''} ${!isIdle ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={!isIdle || !ready}
        className="magnetic-btn w-full py-3 rounded-xl bg-champagne text-obsidian font-bold font-sans text-sm uppercase tracking-[0.12em] hover:brightness-110 transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {!ready ? 'Connecting...' : isIdle ? 'Start Session' : 'Session in Progress…'}
      </button>

      <div className="border-t border-slate-gray/60 pt-4 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xxs font-mono-custom text-stone-500 uppercase tracking-wider">Streak count</span>
          <span className="text-lg text-champagne font-serif font-semibold">
            <span className="text-champagne mr-1.5">◆</span>{streak} Days
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xxs font-mono-custom text-stone-500 uppercase tracking-wider">Grace Tokens</span>
          <span className="text-lg text-stone-200 font-mono-custom">
            <span className="text-champagne mr-1.5">◇</span>{graceTokens}
          </span>
        </div>
      </div>
    </div>
  );
}
