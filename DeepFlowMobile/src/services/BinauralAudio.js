import { useRef, useEffect, useCallback } from 'react';
import { AudioContext } from 'react-native-audio-api';

let hapticModule = null;

try {
  hapticModule = require('react-native').Vibration;
} catch (e) {}

export function useBinauralAudio() {
  const ctxRef = useRef(null);
  const leftOscRef = useRef(null);
  const rightOscRef = useRef(null);
  const gainRef = useRef(null);
  const mergerRef = useRef(null);
  const isPlayingRef = useRef(false);
  const modeRef = useRef('off');

  const stop = useCallback(() => {
    try {
      if (leftOscRef.current) { leftOscRef.current.stop(); leftOscRef.current = null; }
      if (rightOscRef.current) { rightOscRef.current.stop(); rightOscRef.current = null; }
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close();
      }
    } catch (e) {}
    ctxRef.current = null;
    gainRef.current = null;
    mergerRef.current = null;
    isPlayingRef.current = false;
    modeRef.current = 'off';
  }, []);

  const start = useCallback((mode) => {
    if (!AudioContext || mode === 'off') { stop(); return; }
    if (isPlayingRef.current && modeRef.current === mode) return;

    stop();

    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = 0.08;
      gainRef.current = gain;

      const merger = ctx.createChannelMerger(2);
      mergerRef.current = merger;

      const baseFreq = mode === 'alpha' ? 200 : 220;
      const beatFreq = mode === 'alpha' ? 6 : 14;

      const leftOsc = ctx.createOscillator();
      leftOsc.frequency.value = baseFreq;
      leftOsc.type = 'sine';
      leftOsc.connect(merger, 0, 0);

      const rightOsc = ctx.createOscillator();
      rightOsc.frequency.value = baseFreq + beatFreq;
      rightOsc.type = 'sine';
      rightOsc.connect(merger, 0, 1);

      merger.connect(gain);
      gain.connect(ctx.destination);

      leftOsc.start();
      rightOsc.start();

      leftOscRef.current = leftOsc;
      rightOscRef.current = rightOsc;
      isPlayingRef.current = true;
      modeRef.current = mode;
    } catch (e) {
      console.warn('[BinauralAudio] start error:', e.message);
    }
  }, [stop]);

  const updateState = useCallback((appState) => {
    if (!gainRef.current || !ctxRef.current) return;
    try {
      const now = ctxRef.current.currentTime;
      switch (appState) {
        case 'warning':
          gainRef.current.gain.linearRampToValueAtTime(0.14, now + 0.3);
          break;
        case 'guillotined':
        case 'completed':
          gainRef.current.gain.linearRampToValueAtTime(0, now + 1);
          setTimeout(stop, 1100);
          break;
        default:
          gainRef.current.gain.linearRampToValueAtTime(0.08, now + 0.3);
      }
    } catch (e) {}
  }, [stop]);

  const vibrate = useCallback((pattern) => {
    try {
      if (hapticModule && hapticModule.vibrate) {
        hapticModule.vibrate(pattern);
      }
    } catch (e) {
      // Permission not granted — silent fallback
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop, updateState, vibrate, isPlaying: isPlayingRef.current };
}
