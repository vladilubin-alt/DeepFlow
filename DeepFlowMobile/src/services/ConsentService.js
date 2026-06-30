import AsyncStorage from '@react-native-async-storage/async-storage';

const CONSENT_KEY = '@deepflow/analytics_consent';

export async function getAnalyticsConsent() {
  try {
    const val = await AsyncStorage.getItem(CONSENT_KEY);
    return val;
  } catch {
    return null;
  }
}

export async function setAnalyticsConsent(value) {
  try {
    await AsyncStorage.setItem(CONSENT_KEY, value);
  } catch {}
}
