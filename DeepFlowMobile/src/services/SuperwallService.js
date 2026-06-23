import Purchases from 'react-native-purchases';
import Config from 'react-native-config';
import { supabase } from '../lib/supabase';

const SUPERWALL_API_KEY = Config.SUPERWALL_API_KEY;
const REVENUECAT_API_KEY = Config.REVENUECAT_API_KEY;

let initialized = false;

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
    const Superwall = require('@superwall/react-native-superwall').default;
    await Superwall.configure({
      apiKey: SUPERWALL_API_KEY,
      purchaseController: createPurchaseController(),
      options: {
        shouldPreload: true,
      },
    });
    initialized = true;
    Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
      const hasExtraTokens = customerInfo.entitlements.active['extra_grace_tokens']?.isActive === true;
      Superwall.shared.setSubscriptionStatus(
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
