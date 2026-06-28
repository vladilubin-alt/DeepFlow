import Purchases from 'react-native-purchases';
import { NativeModules } from 'react-native';
import Superwall from '@superwall/react-native-superwall';
import { supabase } from '../lib/supabase';
import { SUPERWALL_API_KEY, REVENUECAT_API_KEY } from '../config/env';

let initialized = false;

// Diagnostic: check if native module is available
const hasNativeModule = !!NativeModules.SuperwallReactNative;
console.log('[Superwall] Native module available:', hasNativeModule);

async function initRevenueCat() {
  try {
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    console.log('[RevenueCat] Initialized');
  } catch (e) {
    console.warn('[RevenueCat] Init failed:', e.message);
  }
}

function createPurchaseController() {
  return {
    async purchaseFromAppStore(productId) {
      try {
        const { customerInfo } = await Purchases.purchaseProduct(productId);
        if (customerInfo.entitlements.active.length > 0) {
          return { type: 'purchased', toJSON() { return { type: 'purchased' }; } };
        }
        return { type: 'cancelled', toJSON() { return { type: 'cancelled' }; } };
      } catch (e) {
        if (e.userCancelled) {
          return { type: 'cancelled', toJSON() { return { type: 'cancelled' }; } };
        }
        return { type: 'failed', error: e.message, toJSON() { return { type: 'failed', error: e.message }; } };
      }
    },
    async purchaseFromGooglePlay(productId, basePlanId, offerId) {
      try {
        const { customerInfo } = await Purchases.purchaseProduct(productId, null, basePlanId);
        if (customerInfo.entitlements.active.length > 0) {
          return { type: 'purchased', toJSON() { return { type: 'purchased' }; } };
        }
        return { type: 'cancelled', toJSON() { return { type: 'cancelled' }; } };
      } catch (e) {
        if (e.userCancelled) {
          return { type: 'cancelled', toJSON() { return { type: 'cancelled' }; } };
        }
        return { type: 'failed', error: e.message, toJSON() { return { type: 'failed', error: e.message }; } };
      }
    },
    async restorePurchases() {
      try {
        const { customerInfo } = await Purchases.restorePurchases();
        return {
          toJson() { return { result: 'restored' }; },
        };
      } catch (e) {
        return {
          toJson() { return { result: 'failed', errorMessage: e.message }; },
        };
      }
    },
  };
}

export async function initSuperwall() {
  if (initialized) return;
  try {
    await initRevenueCat();
    console.log('[Superwall] Starting configure with key:', SUPERWALL_API_KEY ? SUPERWALL_API_KEY.substring(0, 8) + '...' : 'MISSING');
    const result = await Superwall.configure({
      apiKey: SUPERWALL_API_KEY,
      purchaseController: createPurchaseController(),
    });
    console.log('[Superwall] Configure result:', result);
    initialized = true;
    Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
      const hasExtraTokens = customerInfo.entitlements.active['extra_grace_tokens']?.isActive === true;
      Superwall.shared?.setSubscriptionStatus?.(
        hasExtraTokens
          ? { type: 'active', toJSON() { return { type: 'active' }; } }
          : { type: 'inactive', toJSON() { return { type: 'inactive' }; } }
      );
      if (hasExtraTokens) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('grace_tokens')
              .eq('id', user.id)
              .single();
            const current = profile?.grace_tokens ?? 3;
            await supabase
              .from('profiles')
              .update({ grace_tokens: current + 3 })
              .eq('id', user.id);
          }
        } catch (e) {
          console.warn('[Superwall] Supabase token grant failed:', e.message);
        }
      }
    });
    console.log('[Superwall] Configured with RevenueCat purchase controller');
  } catch (e) {
    console.warn('[Superwall] Init failed:', e.message);
    console.warn('[Superwall] Stack:', e.stack);
  }
}

export async function canPurchaseTokens() {
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const entitled = customerInfo.entitlements.active['extra_grace_tokens']?.isActive === true;
    return !entitled;
  } catch {
    return true;
  }
}

export async function triggerGraceTokenPaywall(onPurchase) {
  try {
    const needsPurchase = await canPurchaseTokens();
    if (!needsPurchase) {
      if (onPurchase) onPurchase();
      return;
    }
    await Superwall.register({
      placement: 'grace_token_refill',
      feature: () => {
        if (onPurchase) onPurchase();
      },
    });
  } catch (e) {
    console.warn('[Superwall] Paywall trigger failed:', e.message);
  }
}
