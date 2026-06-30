import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import { supabase } from '../lib/supabase';

export const FLARE_STORAGE_KEY = '@deepflow/flare';
export const ONBOARDING_COMPLETE_KEY = '@deepflow/onboarding_complete';

export async function isOnboardingComplete() {
  try {
    const val = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function getStoredFlare() {
  try {
    return await AsyncStorage.getItem(FLARE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function completeOnboarding(flare) {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    await AsyncStorage.setItem(FLARE_STORAGE_KEY, flare);
    await Purchases.setAttributes({ flare_type: flare });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert(
        { id: user.id, flare_type: flare, grace_tokens: 3 },
        { onConflict: 'id' },
      );
    }
  } catch (e) {
    console.warn('[FlareQuiz] Persist failed:', e.message);
  }
}

export const FLARES = [
  { id: 'time_warp', label: 'Time Warp', emoji: '⏰', description: 'You lose track of time when hyperfocused' },
  { id: 'phantom_writer', label: 'Phantom Writer', emoji: '👻', description: 'You write best in bursts, then vanish' },
  { id: 'overthinker', label: 'Overthinker', emoji: '🧠', description: 'You rewrite the same sentence 10 times' },
  { id: 'chaos_crafter', label: 'Chaos Crafter', emoji: '🌪️', description: 'Your best ideas come from controlled chaos' },
  { id: 'deep_diver', label: 'Deep Diver', emoji: '🤿', description: 'You need total immersion to write' },
  { id: 'deadline_demon', label: 'Deadline Demon', emoji: '😈', description: 'Pressure is your fuel' },
];
