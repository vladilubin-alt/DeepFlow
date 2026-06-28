import { useRef, useEffect, useCallback } from 'react';
import { AudioContext } from 'react-native-audio-api';
import { trigger, HapticFeedbackTypes } from 'react-native-haptic-feedback';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: true,
};

export function useBinauralAudio() {
  const ctxRef = useRef(null);
  const leftOscRef = useRef(null);
  const rightOscRef = useRef(null);
  const gainRef = useRef(null);
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

      const baseFreq = mode === 'alpha' ? 200 : 220;
      const beatFreq = mode === 'alpha' ? 6 : 14;

      const leftOsc = ctx.createOscillator();
      leftOsc.frequency.value = baseFreq;
      leftOsc.type = 'sine';

      const rightOsc = ctx.createOscillator();
      rightOsc.frequency.value = baseFreq + beatFreq;
      rightOsc.type = 'sine';

      const hasStereoPanner = typeof ctx.createStereoPanner === 'function';

      if (hasStereoPanner) {
        const leftPanner = ctx.createStereoPanner();
        leftPanner.pan.value = -1;
        const rightPanner = ctx.createStereoPanner();
        rightPanner.pan.value = 1;

        leftOsc.connect(leftPanner);
        leftPanner.connect(gain);
        rightOsc.connect(rightPanner);
        rightPanner.connect(gain);
      } else {
        leftOsc.connect(gain);
        rightOsc.connect(gain);
      }

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
      if (Array.isArray(pattern)) {
        let delay = 0;
        for (let i = 1; i < pattern.length; i += 2) {
          const pause = pattern[i - 1] || 0;
          delay += pause;
          const dur = pattern[i];
          ((d) => {
            setTimeout(() => {
              try { trigger(HapticFeedbackTypes.impactHeavy, hapticOptions); } catch (_) {}
            }, d);
          })(delay);
          delay += dur;
        }
      } else {
        trigger(HapticFeedbackTypes.impactHeavy, hapticOptions);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop, updateState, vibrate, isPlaying: isPlayingRef.current };
}
