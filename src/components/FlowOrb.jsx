import React, { useEffect, useRef } from 'react';

const STATE_META = {
  idle: { icon: '○', label: 'Dormant' },
  writing: { icon: '✨', label: 'In Flow' },
  warning: { icon: '⚠️', label: 'Idle Warning' },
  guillotined: { icon: '☠️', label: 'Guillotined' },
  saved_by_grace: { icon: '🛡️', label: 'Redeemed' },
  completed: { icon: '🏆', label: 'Complete' },
};

export default function FlowOrb({ state, velocity, streak, graceTokens, wordCount, wordTarget }) {
  const orbRef = useRef(null);
  const meta = STATE_META[state] || STATE_META.idle;

  const isWarning = state === 'warning';
  const isGuillotined = state === 'guillotined';
  const isWriting = state === 'writing' || state === 'saved_by_grace';
  const isCompleted = state === 'completed';
  const isDanger = isGuillotined;

  const ringColour = isDanger ? '#E24B4A' : isWarning ? '#E24B4A' : isWriting ? '#EF9F27' : '#EF9F27';
  const dotColour = isDanger ? '#E24B4A' : isWarning ? '#EF9F27' : isWriting ? '#EF9F27' : '#EF9F27';
  const glowColour = isDanger ? 'rgba(226,75,74,0.15)' : isWarning ? 'rgba(226,75,74,0.12)' : isWriting ? 'rgba(239,159,39,0.15)' : 'rgba(239,159,39,0.08)';

  const flowScore = wordTarget > 0 ? Math.min(Math.round((wordCount / wordTarget) * 100), 100) : 0;

  return (
    <div className="glass-panel rounded-[1rem] orb-strip">
      <div className="relative flex items-center justify-center" style={{ width: 40, height: 40 }}>
        <div
          ref={orbRef}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '1.5px solid', borderColor: ringColour,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color 0.3s ease',
          }}
        >
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            background: dotColour,
            transition: 'background 0.3s ease',
          }} />
        </div>
        <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColour} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      </div>

      <div className="stat-chip">
        <span className="stat-label">streak</span>
        <span className="stat-value">{streak}d</span>
      </div>
      <div className="stat-chip">
        <span className="stat-label">tokens</span>
        <span className="stat-value">{graceTokens}</span>
      </div>
      <div className="stat-chip">
        <span className="stat-label">flow</span>
        <span className="stat-value">{flowScore}%</span>
      </div>
    </div>
  );
}
