export const FLARE_DEFAULTS = {
  time_warp: { durationMinutes: 45, wordTarget: 500, aiMode: 'silent', sensory: 'off' },
  task_freeze: { durationMinutes: 5, wordTarget: 50, aiMode: 'coach', sensory: 'alpha' },
  hyperfocus: { durationMinutes: 30, wordTarget: 500, aiMode: 'silent', sensory: 'alpha' },
  decision_fog: { durationMinutes: 5, wordTarget: 25, aiMode: 'coach', sensory: 'off' },
  crash_guilt: { durationMinutes: 3, wordTarget: 25, aiMode: 'demon', sensory: 'off' },
};

export function getFlareDefaults(flareId) {
  return FLARE_DEFAULTS[flareId] || FLARE_DEFAULTS.time_warp;
}
