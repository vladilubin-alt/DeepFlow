import { Mixpanel } from 'mixpanel-react-native';
import Config from 'react-native-config';
import { getAnalyticsConsent } from './ConsentService';

const TOKEN = Config.MIXPANEL_TOKEN;

let mixpanelInstance = null;
let consentChecked = false;
let consentGranted = false;

async function checkConsent() {
  if (consentChecked) return consentGranted;
  const consent = await getAnalyticsConsent();
  consentGranted = consent === 'accepted';
  consentChecked = true;
  return consentGranted;
}

function init() {
  if (mixpanelInstance || !TOKEN) return;
  try {
    mixpanelInstance = new Mixpanel(TOKEN, true);
    mixpanelInstance.setUseIpAddressForGeolocation(false);
  } catch (e) {
    console.warn('[Analytics] Init failed:', e.message);
  }
}

export async function track(event, properties) {
  const ok = await checkConsent();
  if (!ok) return;
  init();
  if (!mixpanelInstance) return;
  try {
    mixpanelInstance.track(event, properties);
  } catch (e) {
    console.warn('[Analytics] Track failed:', e.message);
  }
}

export async function identify(userId) {
  const ok = await checkConsent();
  if (!ok) return;
  init();
  if (!mixpanelInstance) return;
  try {
    mixpanelInstance.identify(userId);
  } catch (e) {
    console.warn('[Analytics] Identify failed:', e.message);
  }
}

export async function peopleSet(properties) {
  const ok = await checkConsent();
  if (!ok) return;
  init();
  if (!mixpanelInstance) return;
  try {
    const distinctId = mixpanelInstance.getDistinctId();
    if (distinctId) {
      mixpanelInstance.getPeople().set(properties);
    }
  } catch (e) {
    console.warn('[Analytics] People set failed:', e.message);
  }
}

export function resetConsentCache() {
  consentChecked = false;
  consentGranted = false;
}
