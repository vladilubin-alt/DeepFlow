import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const QUEUE_KEY = '@deepflow/sync_queue';

export async function enqueue(payload) {
  try {
    const queue = JSON.parse(await AsyncStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({ ...payload, queuedAt: Date.now() });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {}
}

export async function processQueue() {
  try {
    const queue = JSON.parse(await AsyncStorage.getItem(QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const remaining = [];
    for (const item of queue) {
      try {
        if (item.table === 'writing_sessions') {
          const { error } = await supabase.from('writing_sessions').upsert(item.payload, { onConflict: 'id' });
          if (error) remaining.push(item);
        } else if (item.table === 'graveyard') {
          const { error } = await supabase.from('graveyard').insert(item.payload);
          if (error) remaining.push(item);
        }
      } catch (e) {
        remaining.push(item);
      }
    }

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } catch (e) {}
}

export async function getQueueLength() {
  try {
    const queue = JSON.parse(await AsyncStorage.getItem(QUEUE_KEY) || '[]');
    return queue.length;
  } catch (e) {
    return 0;
  }
}
