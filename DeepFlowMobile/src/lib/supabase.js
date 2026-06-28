import { createClient } from '@supabase/supabase-js';
import EncryptedStorage from 'react-native-encrypted-storage';
import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';

// S-08: Use encrypted storage (Android Keystore / iOS Keychain) so auth tokens
// are protected at rest instead of stored in plaintext AsyncStorage.
// react-native-encrypted-storage wraps:
//   Android → EncryptedSharedPreferences (AES-256-GCM via Keystore)
//   iOS     → Keychain
const EncryptedStorageAdapter = {
  getItem: async (key) => {
    try {
      return await EncryptedStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await EncryptedStorage.setItem(key, value);
    } catch (err) {
      console.warn('[DeepFlow] EncryptedStorage.setItem failed:', err);
    }
  },
  removeItem: async (key) => {
    try {
      await EncryptedStorage.removeItem(key);
    } catch (err) {
      console.warn('[DeepFlow] EncryptedStorage.removeItem failed:', err);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: EncryptedStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
