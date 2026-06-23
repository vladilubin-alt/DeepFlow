import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

const STATE_META = {
  idle: { icon: '○', label: 'Dormant' },
  writing: { icon: '✨', label: 'In Flow' },
  warning: { icon: '⚠️', label: 'Idle Warning' },
  guillotined: { icon: '☠️', label: 'Guillotined' },
  saved_by_grace: { icon: '🛡️', label: 'Redeemed' },
  completed: { icon: '🏆', label: 'Complete' },
};

export default function FlowOrb({ state, velocity }) {
  const orbRef = useRef(null);
  const glowRef = useRef(null);
  const ringRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const meta = STATE_META[state] || STATE_META.idle;

  const isWarning = state === 'warning';
  const isGuillotined = state === 'guillotined';
  const isWriting = state === 'writing' || state === 'saved_by_grace';
  const isCompleted = state === 'completed';
  const isIdle = state === 'idle';

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseRef.current = {
      x: (e.clientX - cx) / (rect.width / 2),
      y: (e.clientY - cy) / (rect.height / 2),
    };
  }, []);

  useEffect(() => {
    const orb = orbRef.current;
    const glow = glowRef.current;
    const ring = ringRef.current;
    if (!orb) return;

    const ctx = gsap.context(() => {
      gsap.set(orb, { scale: 1, x: 0, y: 0, rotation: 0, filter: 'none', borderRadius: '50%' });
      gsap.set(glow, { scale: 1, opacity: 0.5 });
      if (ring) gsap.set(ring, { scale: 0, opacity: 0 });

      switch (state) {
        case 'idle':
          gsap.to(orb, {
            scale: 1.03,
            duration: 3,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1,
          });
          gsap.to(glow, {
            scale: 1.15,
            opacity: 0.3,
            duration: 2.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
          break;

        case 'writing':
        case 'saved_by_grace':
          gsap.to(orb, {
            scale: 1.1,
            rotation: 15,
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            duration: 1.5,
            ease: 'sine.out',
          });
          gsap.to(glow, {
            scale: 1.3,
            opacity: 0.6,
            duration: 1.2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
          break;

        case 'warning':
          gsap.to(orb, {
            x: 3,
            duration: 0.08,
            ease: 'none',
            yoyo: true,
            repeat: -1,
          });
          gsap.to(glow, {
            opacity: 0.8,
            duration: 0.2,
            yoyo: true,
            repeat: -1,
          });
          break;

        case 'guillotined':
          gsap.to(orb, {
            scale: 0.8,
            filter: 'grayscale(0.8)',
            duration: 0.6,
            ease: 'bounce.out',
          });
          gsap.to(glow, { opacity: 0, duration: 0.5 });
          break;

        case 'completed':
          gsap.to(orb, {
            scale: 1.2,
            duration: 0.4,
            ease: 'back.out(2)',
          });
          if (ring) {
            gsap.fromTo(ring, { scale: 1, opacity: 0.6 }, { scale: 2.5, opacity: 0, duration: 1 });
          }
          break;
      }
    }, containerRef);

    return () => ctx.revert();
  }, [state]);

  useEffect(() => {
    const orb = orbRef.current;
    const glow = glowRef.current;
    if (!orb || state === 'guillotined') return;

    const mapped = 0.6 + velocity * 0.4;

    gsap.to(orb, {
      scale: mapped,
      duration: 0.3,
      ease: 'sine.out',
      overwrite: 'auto',
    });

    if (glow && (state === 'writing' || state === 'saved_by_grace' || state === 'idle')) {
      gsap.to(glow, {
        opacity: 0.2 + velocity * 0.5,
        scale: 1 + velocity * 0.35,
        duration: 0.3,
        ease: 'sine.out',
        overwrite: 'auto',
      });
    }
  }, [velocity, state]);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;

    let rafId;
    const tick = () => {
      const { x, y } = mouseRef.current;
      gsap.set(orb, {
        x: x * 4,
        y: y * 4,
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="glass-panel rounded-[2rem] p-6 flex flex-col items-center justify-center relative overflow-hidden h-64"
    >
      <div className="absolute inset-0 bg-radial from-champagne/5 to-transparent pointer-events-none"></div>

      <div ref={ringRef} className="absolute w-36 h-36 rounded-full border-2 border-champagne/40 pointer-events-none"></div>

      <div className="relative w-36 h-36 flex items-center justify-center">
        <div
          ref={glowRef}
          className={`absolute inset-0 rounded-full blur-xl pointer-events-none ${
            isWarning ? 'bg-velvet-crimson/30' : isCompleted ? 'bg-emerald-500/30' : isGuillotined ? 'bg-slate-gray' : 'bg-champagne/20'
          }`}
        ></div>

        <div
          ref={orbRef}
          className={`w-28 h-28 rounded-full border flex items-center justify-center transition-colors duration-700 will-change-transform ${
            isWarning
              ? 'border-velvet-crimson bg-velvet-crimson/15'
              : isGuillotined
              ? 'border-slate-gray bg-deep-slate'
              : isWriting
              ? 'border-champagne bg-champagne/20'
              : isCompleted
              ? 'border-emerald-400 bg-emerald-500/20'
              : isIdle
              ? 'border-champagne/20 bg-deep-slate'
              : 'border-champagne/30 bg-champagne/5'
          }`}
        >
          <span className={`text-2xl font-serif select-none ${isIdle ? 'text-stone-400 font-light' : ''}`}>
            {meta.icon}
          </span>
        </div>
      </div>

      <div className="mt-4 text-center z-10">
        <span className="text-xs font-mono-custom uppercase tracking-widest text-stone-400">{meta.label}</span>
        <p className="text-stone-500 text-xxs mt-0.5 font-mono-custom">Reacts to typing velocity and warning countdowns</p>
      </div>
    </div>
  );
}
