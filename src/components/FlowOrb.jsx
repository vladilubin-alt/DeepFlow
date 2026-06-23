import React, { useRef, useEffect, useState } from 'react';

export default function FlowOrb({ state, velocity, streak, graceTokens, wordCount, wordTarget }) {
  const [burst, setBurst] = useState(0);
  const prevVelRef = useRef(velocity);

  useEffect(() => {
    if (velocity > 0 && velocity !== prevVelRef.current) {
      setBurst(1);
      const t = setTimeout(() => setBurst(0), 250);
      prevVelRef.current = velocity;
      return () => clearTimeout(t);
    }
  }, [velocity]);

  const isWarning = state === 'warning';
  const isGuillotined = state === 'guillotined';
  const isWriting = state === 'writing' || state === 'saved_by_grace';
  const isDanger = isGuillotined;

  const animSpeed = isWriting ? '3s' : isWarning ? '1.5s' : isDanger ? '4s' : '6s';
  const coreColor = isDanger ? '#E24B4A' : isWarning ? '#E24B4A' : isWriting ? '#EF9F27' : '#C9A84C';
  const glowColor = isDanger
    ? 'rgba(226,75,74,0.2)'
    : isWarning
      ? 'rgba(226,75,74,0.15)'
      : isWriting
        ? 'rgba(239,159,39,0.25)'
        : 'rgba(201,168,76,0.08)';

  const flowScore = wordTarget > 0 ? Math.min(Math.round((wordCount / wordTarget) * 100), 100) : 0;

  const burstScale = burst ? 1.3 : 1;
  const coreBurst = burst ? 1.15 : 1;

  return (
    <div className="glass-panel rounded-[1rem] orb-strip">
      <div className="relative flex items-center justify-center" style={{ width: 48, height: 48 }}>
        <div
          className="blob-glow"
          style={{
            position: 'absolute',
            width: 60, height: 60,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            animation: `blob-pulse ${animSpeed} ease-in-out infinite`,
            transform: `scale(${burstScale})`,
            transition: 'transform 0.2s ease-out',
          }}
        />
        <div
          className="blob-core"
          style={{
            width: 30, height: 30,
            background: `radial-gradient(circle at 35% 35%, ${coreColor}bb, ${coreColor})`,
            animation: `blob-morph ${animSpeed} ease-in-out infinite`,
            transform: `scale(${coreBurst})`,
            transition: 'transform 0.2s ease-out, background 0.5s ease',
            boxShadow: `0 0 14px ${coreColor}55`,
          }}
        />
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
