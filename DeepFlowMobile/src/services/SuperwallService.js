import Purchases from 'react-native-purchases';
import { NativeModules } from 'react-native';
import Superwall from '@superwall/react-native-superwall';
import { supabase } from '../lib/supabase';
import { SUPERWALL_API_KEY, REVENUECAT_API_KEY } from '../config/env';
import { canShowReviewPrompt, markReviewPrompted, incrementPurchaseCount } from '../lib/reviewManager';

let initialized = false;
let onFirstPurchaseCallback = null;

const hasNativeModule = !!NativeModules.SuperwallReactNative;

export function setOnFirstPurchase(callback) {
  onFirstPurchaseCallback = callback;
}

async function initRevenueCat() {
  try {
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
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
        return { type: e.userCancelled ? 'cancelled' : 'failed', error: e.message, toJSON() { return { type: this.type, error: this.error }; } };
      }
    },
    async purchaseFromGooglePlay(productId, basePlanId) {
      try {
        const { customerInfo } = await Purchases.purchaseProduct(productId, null, basePlanId);
        if (customerInfo.entitlements.active.length > 0) {
          return { type: 'purchased', toJSON() { return { type: 'purchased' }; } };
        }
        return { type: 'cancelled', toJSON() { return { type: 'cancelled' }; } };
      } catch (e) {
        return { type: e.userCancelled ? 'cancelled' : 'failed', error: e.message, toJSON() { return { type: this.type, error: this.error }; } };
      }
    },
    async restorePurchases() {
      try {
        const { customerInfo } = await Purchases.restorePurchases();
        return { toJson() { return { result: 'restored' }; } };
      } catch (e) {
        return { toJson() { return { result: 'failed', errorMessage: e.message }; } };
      }
    },
  };
}

export async function initSuperwall() {
  if (initialized) return;
  try {
    await initRevenueCat();
    await Superwall.configure({
      apiKey: SUPERWALL_API_KEY,
      purchaseController: createPurchaseController(),
    });
    initialized = true;

    Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
      const hasExtraTokens = customerInfo.entitlements.active['extra_grace_tokens']?.isActive === true;
      Superwall.shared?.setSubscriptionStatus?.(
        hasExtraTokens
          ? { type: 'active', toJSON() { return { type: 'active' }; } }
          : { type: 'inactive', toJSON() { return { type: 'inactive' }; } }
      );

      const entitlements = customerInfo.entitlements.active;
      const hasAnyEntitlement = Object.keys(entitlements).length > 0;
      if (hasAnyEntitlement) {
        await incrementPurchaseCount();
        const shouldPrompt = await canShowReviewPrompt();
        if (shouldPrompt && onFirstPurchaseCallback) {
          onFirstPurchaseCallback();
        }
      }
    });
  } catch (e) {
    console.warn('[Superwall] Init failed:', e.message);
  }
}

export async function canPurchaseTokens() {
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return !customerInfo.entitlements.active['extra_grace_tokens']?.isActive;
  } catch {
    return true;
  }
}

export async function grantEntitlementTokens() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
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
  } catch (e) {
    console.warn('[Superwall] Token grant failed:', e.message);
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

export async function triggerFocusReportUpsell() {
  try {
    await Superwall.register({
      placement: 'focus_report',
      feature: () => {},
    });
  } catch (e) {
    console.warn('[Superwall] Focus report upsell failed:', e.message);
  }
}
