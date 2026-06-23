import { Mixpanel } from 'mixpanel-react-native';
import Config from 'react-native-config';

const TOKEN = Config.MIXPANEL_TOKEN;

let mixpanelInstance = null;

function init() {
  if (mixpanelInstance || !TOKEN) return;
  try {
    mixpanelInstance = new Mixpanel(TOKEN, true);
    mixpanelInstance.setUseIpAddressForGeolocation(false);
  } catch (e) {
    console.warn('[Analytics] Init failed:', e.message);
  }
}

export function track(event, properties) {
  init();
  if (!mixpanelInstance) return;
  try {
    mixpanelInstance.track(event, properties);
  } catch (e) {
    console.warn('[Analytics] Track failed:', e.message);
  }
}

export function identify(userId) {
  init();
  if (!mixpanelInstance) return;
  try {
    mixpanelInstance.identify(userId);
  } catch (e) {
    console.warn('[Analytics] Identify failed:', e.message);
  }
}

export function peopleSet(properties) {
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
