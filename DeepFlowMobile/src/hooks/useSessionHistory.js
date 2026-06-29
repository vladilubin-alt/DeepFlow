import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const STORE_KEY = '@deepflow/session_history';

function calcFocusScore(session) {
  const durationMin = session.duration_seconds / 60;
  const wpm = durationMin > 0 ? session.words_written / durationMin : 0;
  const targetRatio = session.target_words > 0
    ? Math.min(1, session.words_written / session.target_words)
    : 0;
  const penalty = session.guillotine_triggered ? 0.3 : 0;
  return Math.round(Math.max(0, Math.min(100,
    (wpm / 40) * 50 + targetRatio * 50 - penalty * 100
  )));
}

function calcStreak(sessions) {
  const activeDates = new Set(
    sessions.map(s => s.started_at.split('T')[0])
  );
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split('T')[0];
    if (activeDates.has(key)) {
      streak++;
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function useSessionHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cached = await AsyncStorage.getItem(STORE_KEY).catch(() => null);
      const parsed = cached ? JSON.parse(cached) : null;

      const { data, error: err } = await supabase
        .from('writing_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);

      if (err) {
        if (parsed) {
          setSessions(parsed);
          setLoading(false);
          return;
        }
        setError('Could not load session history.');
        setSessions([]);
      } else {
        setSessions(data || []);
        if (data) {
          await AsyncStorage.setItem(STORE_KEY, JSON.stringify(data)).catch(() => {});
        }
      }
    } catch (e) {
      setError('Could not load session history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const streak = calcStreak(sessions);
  const totalWords = sessions.reduce((s, x) => s + (x.words_written || 0), 0);
  const totalSessions = sessions.length;

  return {
    sessions,
    loading,
    error,
    streak,
    totalWords,
    totalSessions,
    selected,
    setSelected,
    focusScore: selected ? calcFocusScore(selected) : null,
    refresh: fetchSessions,
  };
}
