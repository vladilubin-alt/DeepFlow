import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { enqueue, processQueue } from './SyncQueue';

let currentSessionId = null;
let sessionStartedAt = null;

export function startSession() {
  currentSessionId = uuidv4();
  sessionStartedAt = new Date().toISOString();
  return currentSessionId;
}

export async function saveSession({
  targetWords,
  wordsWritten,
  durationSeconds,
  guillotined,
  graceTokenUsed,
}) {
  if (!currentSessionId) return null;

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return null;

  const status = guillotined
    ? (graceTokenUsed ? 'saved_by_grace' : 'guillotined')
    : 'completed';

  const payload = {
    id: currentSessionId,
    user_id: user.id,
    started_at: sessionStartedAt,
    ended_at: new Date().toISOString(),
    duration_seconds: durationSeconds,
    target_words: targetWords,
    words_written: wordsWritten,
    guillotine_triggered: guillotined,
    grace_token_used: graceTokenUsed,
    status,
  };

  const { error } = await supabase
    .from('writing_sessions')
    .upsert(payload, { onConflict: 'id' });

  currentSessionId = null;
  sessionStartedAt = null;

  if (error) {
    console.warn('[SessionService] save error:', error.message);
    await enqueue({ table: 'writing_sessions', payload });
    return null;
  }
  return payload;
}

export async function saveToGraveyard(content, wordCount) {
  if (!currentSessionId) return null;

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return null;

  const payload = {
    session_id: currentSessionId,
    user_id: user.id,
    content,
    word_count: wordCount,
    deleted_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('graveyard')
    .insert(payload);

  if (error) {
    console.warn('[SessionService] graveyard error:', error.message);
    await enqueue({ table: 'graveyard', payload });
  }
  return payload;
}

export async function syncGraceTokens(newCount) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;
    await supabase.from('profiles').update({ grace_tokens: newCount }).eq('id', user.id);
  } catch (e) {
    console.warn('[SessionService] token sync error:', e.message);
  }
}
