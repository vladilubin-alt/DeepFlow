import { useEffect, useRef, useState, useCallback } from 'react';
import { DeepFlowSession, STATES } from '@architect/session';
import { validateKeystroke } from '../utils/keystrokeValidator';

const STREAK_KEY = 'deepflow_streak';
const TOKENS_KEY = 'deepflow_grace_tokens';

function loadStreak() {
  try {
    return parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

function saveStreak(val) {
  try { localStorage.setItem(STREAK_KEY, String(val)); } catch {}
}

function loadTokens() {
  try {
    return parseInt(localStorage.getItem(TOKENS_KEY) || '3', 10);
  } catch {
    return 3;
  }
}

function saveTokens(val) {
  try { localStorage.setItem(TOKENS_KEY, String(val)); } catch {}
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const DEFAULT_TIMER = {
  elapsedMs: 0,
  remainingMs: 0,
  idleSinceMs: 0,
  warningSinceMs: 0,
};

function computeVelocity(idleSinceMs) {
  if (idleSinceMs < 800) return 1;
  if (idleSinceMs > 8000) return 0;
  return 1 - (idleSinceMs - 800) / 7200;
}

export function useDeepFlowSession() {
  const sessionRef = useRef(null);
  const authRef = useRef({ userId: null, accessToken: null });
  const [sessionState, setSessionState] = useState(STATES.IDLE);
  const [timerData, setTimerData] = useState(DEFAULT_TIMER);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [graceTokens, setGraceTokens] = useState(loadTokens);
  const [streak, setStreak] = useState(loadStreak);
  const [velocity, setVelocity] = useState(0);

  const buildSession = useCallback((durationMinutes, targetWords, tokens) => {
    if (sessionRef.current) {
      sessionRef.current.destroy();
      sessionRef.current = null;
    }

    const session = new DeepFlowSession({
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_ANON_KEY,
      durationSeconds: durationMinutes * 60,
      targetWords,
      graceTokens: tokens,
      onTick: (data) => {
        setTimerData({
          elapsedMs: data.elapsedMs,
          remainingMs: data.remainingMs,
          idleSinceMs: data.idleSinceMs,
          warningSinceMs: data.warningSinceMs,
        });
        setVelocity(computeVelocity(data.idleSinceMs));
      },
      onTransition: (entry) => {
        setSessionState(entry.to);
        setGraceTokens(entry.ctx.graceTokens);
        saveTokens(entry.ctx.graceTokens);
      },
      onSyncStatus: (status) => setSyncStatus(status),
    });

    const { userId, accessToken } = authRef.current;
    if (userId) {
      session.setAuth(userId, accessToken);
    }

    sessionRef.current = session;
    return session;
  }, []);

  const setAuth = useCallback((userId, accessToken) => {
    authRef.current = { userId, accessToken };
    if (sessionRef.current) {
      sessionRef.current.setAuth(userId, accessToken);
    }
  }, []);

  const start = useCallback((durationMinutes, targetWords, userId) => {
    const tokens = loadTokens();
    const session = buildSession(durationMinutes, targetWords, tokens);
    session.start(userId || 'local');
    setSessionState(session.state);
    setVelocity(1);
  }, [buildSession]);

  const keystroke = useCallback((text) => {
    if (!sessionRef.current) return;
    const { valid } = validateKeystroke(text);
    if (!valid) return;
    sessionRef.current.keystroke(text);
    setVelocity(1);
  }, []);

  const useGraceToken = useCallback(() => {
    if (sessionRef.current) {
      const ok = sessionRef.current.useGraceToken();
      if (ok) {
        const tokens = sessionRef.current.machine.ctx.graceTokens;
        setGraceTokens(tokens);
        saveTokens(tokens);
      }
      return ok;
    }
    return false;
  }, []);

  const giveUp = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.giveUp();
      setStreak(0);
      saveStreak(0);
      setSessionState(STATES.IDLE);
      setVelocity(0);
    }
  }, []);

  const reset = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.reset();
    }
    setSessionState(STATES.IDLE);
    setTimerData(DEFAULT_TIMER);
    setVelocity(0);
  }, []);

  const finishSession = useCallback(() => {
    const newStreak = loadStreak() + 1;
    setStreak(newStreak);
    saveStreak(newStreak);
    setSessionState(STATES.COMPLETED);
  }, []);

  useEffect(() => {
    const session = sessionRef.current;
    if (!session) return;
    const unsub = session.machine.on('transition', (entry) => {
      if (entry.to === STATES.COMPLETED) finishSession();
    });
    return unsub;
  }, [finishSession]);

  useEffect(() => {
    const session = sessionRef.current;
    if (!session) return;
    const unsub = session.machine.on('transition', (entry) => {
      if (entry.to === STATES.IDLE && entry.event === 'give_up') {
        setStreak(0);
        saveStreak(0);
        setVelocity(0);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.destroy();
        sessionRef.current = null;
      }
    };
  }, []);

  const isRunning = sessionState !== STATES.IDLE;

  return {
    sessionState,
    timerData,
    syncStatus,
    graceTokens,
    streak,
    velocity,
    isRunning,
    start,
    keystroke,
    useGraceToken,
    giveUp,
    reset,
    setAuth,
  };
}
