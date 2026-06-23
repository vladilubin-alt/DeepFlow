import mixpanel from 'mixpanel-browser';

const TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || import.meta.env.MIXPANEL_TOKEN;

let initialized = false;

function init() {
  if (initialized || !TOKEN) return;
  try {
    mixpanel.init(TOKEN, {
      track_pageview: true,
      persistence: 'localStorage',
      ignore_dnt: true,
    });
    initialized = true;
  } catch (e) {
    console.warn('[Analytics] Init failed:', e.message);
  }
}

export function track(event, properties) {
  init();
  if (!initialized) return;
  try {
    mixpanel.track(event, properties);
  } catch (e) {
    console.warn('[Analytics] Track failed:', e.message);
  }
}

export function identify(userId) {
  init();
  if (!initialized) return;
  try {
    mixpanel.identify(userId);
  } catch (e) {
    console.warn('[Analytics] Identify failed:', e.message);
  }
}

export function peopleSet(properties) {
  init();
  if (!initialized) return;
  try {
    mixpanel.people.set(properties);
  } catch (e) {
    console.warn('[Analytics] People set failed:', e.message);
  }
}
