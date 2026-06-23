import { Platform } from 'react-native';

const SUPERWALL_API_KEY = 'pk_juRmfRkHQLkLPY7CiDMiGPsC60Yf';

let initialized = false;

export async function initSuperwall() {
  if (initialized) return;
  try {
    const Superwall = require('@superwall/react-native-superwall').default;
    await Superwall.configure({
      apiKey: SUPERWALL_API_KEY,
      options: {
        shouldPreload: true,
      },
    });
    initialized = true;
    console.log('[Superwall] Initialized');
  } catch (e) {
    console.warn('[Superwall] Init failed (native not linked):', e.message);
  }
}

export async function triggerGraceTokenPaywall(onPurchase) {
  try {
    const Superwall = require('@superwall/react-native-superwall').default;
    await Superwall.shared.register({
      placement: 'grace_token_refill',
      feature: () => {
        if (onPurchase) onPurchase();
      },
    });
  } catch (e) {
    console.warn('[Superwall] Paywall trigger failed:', e.message);
  }
}
