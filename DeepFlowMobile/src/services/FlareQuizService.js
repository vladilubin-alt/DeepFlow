import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';

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
    await Purchases.setAttributes({ flare });
  } catch (e) {
    console.warn('[FlareQuiz] Persist failed:', e.message);
  }
}

export async function presentFlareQuiz() {
  try {
    const Superwall = require('@superwall/react-native-superwall').default;
    await Superwall.shared.register({
      placement: 'onboarding_flare_quiz',
      feature: () => {
        completeOnboarding('time_warp');
      },
    });
  } catch (e) {
    console.warn('[FlareQuiz] Presentation failed:', e.message);
    await completeOnboarding('time_warp');
  }
}
