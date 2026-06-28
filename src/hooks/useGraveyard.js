import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useGraveyard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recoveredContent, setRecoveredContent] = useState(null);

  const fetchEntries = useCallback(async (limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Sign in to view your vault.');
        setEntries([]);
        setLoading(false);
        return;
      }
      const { data, error: err } = await supabase
        .from('graveyard')
        .select('id, session_id, content, word_count, deleted_at')
        .eq('user_id', user.id)
        .order('deleted_at', { ascending: false })
        .limit(limit);

      if (err) {
        setError(err.message);
        setEntries([]);
      } else {
        setEntries(data || []);
      }
    } catch (e) {
      setError(e.message);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const recoverLatest = useCallback(() => {
    if (entries.length === 0) return;
    const latest = entries[0];
    setRecoveredContent(latest.content);
    return latest;
  }, [entries]);

  const clearRecovered = useCallback(() => {
    setRecoveredContent(null);
  }, []);

  return {
    entries,
    loading,
    error,
    recoveredContent,
    fetchEntries,
    recoverLatest,
    clearRecovered,
  };
}
