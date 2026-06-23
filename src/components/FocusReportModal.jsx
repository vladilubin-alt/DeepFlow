import React from 'react';
import { track } from '../lib/analytics';

function calcFocusScore(wordsWritten, targetWords, durationSeconds, guillotined) {
  const durationMin = durationSeconds / 60;
  const wpm = durationMin > 0 ? wordsWritten / durationMin : 0;
  const targetRatio = targetWords > 0
    ? Math.min(1, wordsWritten / targetWords)
    : 0;
  const penalty = guillotined ? 0.3 : 0;
  return Math.round(Math.max(0, Math.min(100,
    (wpm / 40) * 50 + targetRatio * 50 - penalty * 100
  )));
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

export default function FocusReportModal({
  visible,
  onDismiss,
  wordsWritten,
  targetWords,
  durationSeconds,
  guillotined,
}) {
  if (!visible) return null;

  const wpm = durationSeconds > 0
    ? Math.round(wordsWritten / (durationSeconds / 60))
    : 0;
  const targetPct = targetWords > 0
    ? Math.round((wordsWritten / targetWords) * 100)
    : 0;
  const focusScore = calcFocusScore(wordsWritten, targetWords, durationSeconds, guillotined);

  const metric = (label, value) => (
    <div className="flex flex-col items-center flex-1">
      <div className="text-xl md:text-2xl text-champagne font-mono-custom font-medium mb-0.5">
        {value}
      </div>
      <div className="text-xxs text-stone-500 uppercase tracking-widest font-mono-custom">
        {label}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 backdrop-blur-md p-4">
      <div className="glass-panel rounded-[2.5rem] w-full max-w-sm p-6 md:p-8">
        <div className="text-center">
          <h2 className="text-lg text-ivory font-serif mb-1">
            {guillotined ? 'Focus Report' : 'Session Complete'}
          </h2>
          <p className="text-xxs text-stone-500 uppercase tracking-widest font-mono-custom mb-5">
            {guillotined ? 'Your session was guillotined' : 'Great flow — here\'s how you did'}
          </p>
        </div>

        <div className="bg-deep-slate rounded-2xl p-5 mb-4">
          <div className="text-center mb-3">
            <div className="text-3xl md:text-4xl text-champagne font-mono-custom font-bold">
              {focusScore}
            </div>
            <div className="text-xxs text-stone-500 uppercase tracking-widest font-mono-custom">
              Focus Score
            </div>
          </div>

          <div className="flex justify-around">
            {metric('Words', wordsWritten)}
            {metric('WPM', wpm)}
            {metric('Target', `${targetPct}%`)}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-gray/40 text-center">
            <span className="text-xs text-stone-500 font-mono-custom">
              Duration: {formatDuration(durationSeconds)}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            track?.('Focus Report Upsell Shown');
          }}
          className="magnetic-btn w-full px-4 py-3 rounded-xl bg-champagne/10 text-champagne font-mono-custom text-xs hover:bg-champagne/20 transition mb-2"
        >
          See Full Breakdown → Unlock Premium Insights
        </button>

        <button
          onClick={onDismiss}
          className="magnetic-btn w-full px-4 py-3 rounded-xl bg-deep-slate text-stone-400 font-mono-custom text-xs border border-slate-gray/40 hover:text-ivory transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
