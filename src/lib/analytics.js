import { getConsent } from '../components/CookieConsent';

const TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || import.meta.env.MIXPANEL_TOKEN;

let initialized = false;
let mixpanel = null;

async function ensureMixpanel() {
  if (mixpanel) return mixpanel;
  const mod = await import('mixpanel-browser');
  mixpanel.mod = mod.default || mod;
  return mixpanel.mod;
}

async function init() {
  if (initialized || !TOKEN) return;
  const consent = getConsent();
  if (consent === 'rejected') return;
  try {
    const mp = await ensureMixpanel();
    mp.init(TOKEN, {
      track_pageview: true,
      persistence: 'localStorage',
    });
    initialized = true;
  } catch (e) {
    console.warn('[Analytics] Init failed:', e.message);
  }
}

export function enableAnalytics() {
  initialized = false;
  mixpanel = null;
  init();
}

export async function track(event, properties) {
  await init();
  if (!initialized) return;
  try {
    mixpanel.mod.track(event, properties);
  } catch (e) {
    console.warn('[Analytics] Track failed:', e.message);
  }
}

function hashUserId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'u_' + Math.abs(hash).toString(36);
}

export async function identify(userId) {
  await init();
  if (!initialized) return;
  try {
    mixpanel.mod.identify(hashUserId(userId));
  } catch (e) {
    console.warn('[Analytics] Identify failed:', e.message);
  }
}

export async function peopleSet(properties) {
  await init();
  if (!initialized) return;
  try {
    mixpanel.mod.people.set(properties);
  } catch (e) {
    console.warn('[Analytics] People set failed:', e.message);
  }
}
