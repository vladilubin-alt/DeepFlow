import React, { useEffect, useState } from 'react';
import { track } from '../lib/analytics';

function Confetti() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#EF9F27', '#4ade80', '#C9A84C', '#E24B4A', '#8B5CF6', '#06B6D4'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5,
      size: 6 + Math.random() * 6,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
        }
      `}</style>
    </div>
  );
}

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

function getScoreColor(score) {
  if (score >= 80) return '#4ade80';
  if (score >= 50) return '#EF9F27';
  return '#E24B4A';
}

function getScoreLabel(score) {
  if (score >= 90) return 'Outstanding';
  if (score >= 75) return 'Great focus';
  if (score >= 50) return 'Good effort';
  if (score >= 30) return 'Room to improve';
  return 'Tough session';
}

export default function FocusReportModal({
  visible,
  onDismiss,
  wordsWritten,
  targetWords,
  durationSeconds,
  guillotined,
  graceTokens = 0,
  onUseGraceToken,
  onGiveUp,
}) {
  if (!visible) return null;

  const wpm = durationSeconds > 0
    ? Math.round(wordsWritten / (durationSeconds / 60))
    : 0;
  const targetPct = targetWords > 0
    ? Math.round((wordsWritten / targetWords) * 100)
    : 0;
  const focusScore = calcFocusScore(wordsWritten, targetWords, durationSeconds, guillotined);
  const scoreColor = getScoreColor(focusScore);
  const scoreLabel = getScoreLabel(focusScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 backdrop-blur-md p-4" role="dialog" aria-modal="true" aria-label="Focus report">
      {focusScore >= 80 && <Confetti />}
      <div className="glass-panel rounded-[2rem] w-full max-w-md p-6 md:p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl text-ivory font-serif mb-1">
            {guillotined ? 'Focus Report' : 'Session Complete'}
          </h2>
          <p className="text-xxs text-stone-500 uppercase tracking-widest font-mono-custom">
            {guillotined ? 'Your session was guillotined' : 'Great flow — here\'s how you did'}
          </p>
        </div>

        <div className="bg-deep-slate rounded-2xl p-5 mb-4">
          <div className="text-center mb-4">
            <div className="text-4xl md:text-5xl font-mono-custom font-bold" style={{ color: scoreColor }}>
              {focusScore}
            </div>
            <div className="text-sm mt-1 font-mono-custom" style={{ color: scoreColor }}>
              {scoreLabel}
            </div>
            <div className="text-xxs text-stone-500 uppercase tracking-widest font-mono-custom mt-1">
              Focus Score
            </div>
          </div>

          <div className="flex justify-around">
            <div className="flex flex-col items-center flex-1">
              <div className="text-xl md:text-2xl text-champagne font-mono-custom font-medium">{wordsWritten}</div>
              <div className="text-xxs text-stone-500 uppercase tracking-widest font-mono-custom">Words</div>
              <div className="text-[10px] text-stone-600">of {targetWords}</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="text-xl md:text-2xl text-champagne font-mono-custom font-medium">{wpm}</div>
              <div className="text-xxs text-stone-500 uppercase tracking-widest font-mono-custom">WPM</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="text-xl md:text-2xl text-champagne font-mono-custom font-medium">{targetPct}%</div>
              <div className="text-xxs text-stone-500 uppercase tracking-widest font-mono-custom">Target</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-gray/40 text-center">
            <span className="text-xs text-stone-500 font-mono-custom">
              Duration: {formatDuration(durationSeconds)}
            </span>
          </div>
        </div>

        <button
          onClick={() => track?.('Focus Report Upsell Shown')}
          className="w-full px-4 py-3 rounded-xl bg-champagne/10 text-champagne font-mono-custom text-xs hover:bg-champagne/20 transition mb-3"
        >
          See Full Breakdown → Unlock Premium Insights
        </button>

        {guillotined && onUseGraceToken && (
          <button
            onClick={onUseGraceToken}
            className="w-full px-4 py-3.5 rounded-xl font-mono-custom text-sm font-semibold transition mb-2"
            style={{
              background: 'linear-gradient(135deg, #EF9F27 0%, #D4841F 100%)',
              color: '#1a1a1a',
              boxShadow: '0 2px 12px rgba(239, 159, 39, 0.3)',
            }}
          >
            Use Grace Token ({graceTokens} left)
          </button>
        )}

        {guillotined && onGiveUp && (
          <button
            onClick={onGiveUp}
            className="w-full px-4 py-3 rounded-xl bg-transparent border border-slate-gray/40 text-stone-400 font-mono-custom text-xs hover:text-ivory transition mb-2"
          >
            give up & clear
          </button>
        )}

        {!guillotined && (
          <button
            onClick={onDismiss}
            className="w-full px-4 py-3 rounded-xl bg-deep-slate text-stone-400 font-mono-custom text-xs border border-slate-gray/40 hover:text-ivory transition"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
