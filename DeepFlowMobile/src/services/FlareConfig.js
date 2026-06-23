export const FLARE_DEFAULTS = {
  time_warp: { durationMinutes: 45, wordTarget: 500, aiMode: 'silent', sensory: 'off' },
  task_freeze: { durationMinutes: 25, wordTarget: 300, aiMode: 'coach', sensory: 'alpha' },
  hyperfocus: { durationMinutes: 30, wordTarget: 500, aiMode: 'silent', sensory: 'theta' },
  decision_fog: { durationMinutes: 25, wordTarget: 300, aiMode: 'coach', sensory: 'off' },
  crash_guilt: { durationMinutes: 15, wordTarget: 100, aiMode: 'demon', sensory: 'off' },
};

export function getFlareDefaults(flareId) {
  return FLARE_DEFAULTS[flareId] || FLARE_DEFAULTS.time_warp;
}
