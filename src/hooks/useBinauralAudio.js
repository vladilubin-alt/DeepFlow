import { useRef, useCallback, useEffect } from 'react';

export function useBinauralAudio() {
  const ctxRef = useRef(null);
  const oscLeftRef = useRef(null);
  const oscRightRef = useRef(null);
  const gainRef = useRef(null);
  const stateRef = useRef('idle');

  const stop = useCallback(() => {
    try {
      oscLeftRef.current?.stop();
      oscRightRef.current?.stop();
    } catch {}
    try {
      ctxRef.current?.close();
    } catch {}
    oscLeftRef.current = null;
    oscRightRef.current = null;
    ctxRef.current = null;
    gainRef.current = null;
  }, []);

  const updateState = useCallback((sessionState) => {
    stateRef.current = sessionState;
    const gain = gainRef.current;
    if (!gain) return;

    switch (sessionState) {
      case 'warning':
        gain.gain.linearRampToValueAtTime(0.14, ctxRef.current?.currentTime + 0.3);
        break;
      case 'guillotined':
      case 'completed':
        gain.gain.linearRampToValueAtTime(0, ctxRef.current?.currentTime + 1);
        setTimeout(stop, 1100);
        break;
      default:
        gain.gain.linearRampToValueAtTime(0.08, ctxRef.current?.currentTime + 0.3);
        break;
    }
  }, [stop]);

  const start = useCallback((mode) => {
    stop();

    if (mode === 'off') return;

    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = 0.08;
      gain.connect(ctx.destination);
      gainRef.current = gain;

      const baseFreq = mode === 'alpha' ? 200 : 220;
      const beatFreq = mode === 'alpha' ? 6 : 14;

      const leftPanner = ctx.createStereoPanner();
      leftPanner.pan.value = -1;
      const rightPanner = ctx.createStereoPanner();
      rightPanner.pan.value = 1;

      const oscL = ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.value = baseFreq;
      oscL.connect(leftPanner);
      leftPanner.connect(gain);
      oscL.start();
      oscLeftRef.current = oscL;

      const oscR = ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.value = baseFreq + beatFreq;
      oscR.connect(rightPanner);
      rightPanner.connect(gain);
      oscR.start();
      oscRightRef.current = oscR;

      if (stateRef.current === 'warning') {
        gain.gain.value = 0.14;
      }
    } catch (err) {
      console.warn('Web Audio API not available:', err);
    }
  }, [stop]);

  useEffect(() => {
    return stop;
  }, [stop]);

  return { start, stop, updateState };
}
