import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useGraveyard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [graceTokens, setGraceTokens] = useState(0);

  const fetchEntries = useCallback(async (limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setError('Authentication required');
        setEntries([]);
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('grace_tokens')
        .eq('id', user.id)
        .single();
      setGraceTokens(profile?.grace_tokens ?? 0);

      const { data, error: err } = await supabase
        .from('graveyard')
        .select('id, session_id, content, word_count, deleted_at')
        .eq('user_id', user.id)
        .order('deleted_at', { ascending: false })
        .limit(limit);

      if (err) {
        setError('Could not load vault entries.');
        setEntries([]);
      } else {
        setEntries(data || []);
      }
    } catch (e) {
      setError('Could not load vault entries.');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    entries,
    loading,
    error,
    graceTokens,
    setGraceTokens,
    fetchEntries,
  };
}
