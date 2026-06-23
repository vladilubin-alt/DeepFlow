import React from 'react';

export default function SessionSetup({
  duration,
  onDurationChange,
  wordTarget,
  onTargetChange,
  onStart,
  isRunning,
  sessionState,
  graceTokens,
  streak,
}) {
  const isIdle = sessionState === 'idle';

  return (
    <div className="glass-panel rounded-[2rem] p-6 flex flex-col justify-between gap-4">
      <h2 className="text-xs font-sans font-bold uppercase tracking-[0.15em] text-slate-heading">Session Setup</h2>

      <div className="grid grid-cols-2 gap-4 my-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xxs font-mono-custom text-champagne tracking-wider">Duration (Min)</label>
          <select
            value={duration}
            onChange={(e) => onDurationChange(Number(e.target.value))}
            disabled={!isIdle}
            className="bg-deep-slate text-[#EAEAEA] border border-slate-gray rounded-xl px-3 py-2.5 text-sm font-mono-custom focus:outline-none focus:border-champagne/40 disabled:opacity-40"
          >
            <option value={5}>5 Min</option>
            <option value={15}>15 Min</option>
            <option value={25}>25 Min</option>
            <option value={45}>45 Min</option>
            <option value={60}>60 Min</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xxs font-mono-custom text-champagne tracking-wider">Word Target</label>
          <select
            value={wordTarget}
            onChange={(e) => onTargetChange(Number(e.target.value))}
            disabled={!isIdle}
            className="bg-deep-slate text-[#EAEAEA] border border-slate-gray rounded-xl px-3 py-2.5 text-sm font-mono-custom focus:outline-none focus:border-champagne/40 disabled:opacity-40"
          >
            <option value={100}>100 words</option>
            <option value={250}>250 words</option>
            <option value={300}>300 words</option>
            <option value={500}>500 words</option>
            <option value={1000}>1000 words</option>
          </select>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={!isIdle}
        className="magnetic-btn w-full py-3 rounded-xl bg-champagne text-obsidian font-bold font-sans text-sm uppercase tracking-[0.12em] hover:brightness-110 transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {isIdle ? 'Start Session' : 'Session in Progress…'}
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
