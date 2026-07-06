# QA Annealing Protocol

**Rule:** Every failing test must be traced to its root cause (stack trace or raw data), fixed, verified, and recorded.

## Annealing Loop
1. Read the exact failing condition from the QA report
2. Inspect the relevant source file(s)
3. Apply the fix
4. Verify (build/test/curl)
5. Document the constraint found in this file
6. Update `progress.md`

## Fixed Since QA v3

| ID | Title | Status | Constraint |
|----|-------|--------|------------|
| S-02 | Mobile analytics consent | Fixed | `CookieConsent.js` created, wired in `App.tsx` |
| S-06 | User ID in Mixpanel | Fixed | identify() hashes ID, consent-gated on both platforms |
| S-03 | Keys in APK | Fixed | ProGuard rules: `-repackageclasses`, 5 passes |
| S-09 | textMuted WCAG contrast | Fixed | Dark `#80807A` → `#8C8C84` (4.15→4.69:1) |
| S-12 | CookieConsent parity | Fixed | Ported to React Native |
| S-15 | Web code-splitting | Fixed | 6 lazy chunks via React.lazy |
| S-16 | VaultScreen dot-notation | Fixed | Bracket → dot notation |
| S-11 | SRI on scripts | Documented | Google Fonts vary by UA; HTTPS-only is mitigation |
| S-13 | Binaural audio web parity | Fixed | Added StereoPanner + completed auto-stop |
| S-14 | Notification channels | Fixed | 3 named channels (reminders/sessions/streaks) |
| S-17 | Password client validation | Fixed | Mobile sign-up now checks length < 6 |
| S-19 | Whitespace task names | Deferred | Feature doesn't exist yet; annotated for future |

## Closed (Architecture Handled)

| ID | Title | Reason | Reference |
|----|-------|--------|-----------|
| S-04 | CORS wildcard | Supabase proxy always returns `*` by design — RLS is the effective security layer | `directives/security_protocol.md` §CORS Architecture |

## Remaining

| ID | Title | Reason |
|----|-------|--------|
| S-07 | Netlify headers | Config exists in `netlify.toml`; push to `main` to deploy |
| S-08 | Brute-force | Supabase managed, no server-side config exposed |

## Annealing Log

### 2026-07-06 — S-11: SRI on third-party scripts
- **Root cause:** `index.html` loads Google Fonts and Material Icons from CDN without `integrity` hashes
- **Constraint:** Google Fonts CDN serves different CSS based on user-agent, making static SRI hashes impossible. Mitigated via HTTPS-only delivery.
- **Status:** Documented — no code change needed.

### 2026-07-06 — S-13: Binaural audio web gap
- **Root cause:** Web `useBinauralAudio` hook lacked stereo panning (both tones played in both ears). Missing `completed` auto-stop.
- **Applied:** Added `StereoPannerNode` for left/right channel separation. `completed` state now fades gain to 0 and calls `stop()` after 1.1s timeout (matching mobile behavior).
- **Constraint:** `StereoPannerNode` available in Chrome 45+, Firefox 52+, Safari 14.1+. No polyfill needed.
- **Status:** Fixed in `src/hooks/useBinauralAudio.js`

### 2026-07-06 — S-14: Notification channels not distinguishable
- **Root cause:** `NotificationService.js` created a single channel `'deepflow-reminders'`.
- **Applied:** 3 named channels: `Daily Reminders` (HIGH), `Session Alerts` (DEFAULT), `Streak Updates` (LOW). `ensureChannel()` → `ensureChannels()`.
- **Constraint:** `notifee.createChannel` is idempotent. Channels cannot be renamed after creation, only re-created with different importance.
- **Status:** Fixed in `DeepFlowMobile/src/services/NotificationService.js`

### 2026-07-06 — S-17: Password length validation
- **Root cause:** Mobile `AuthScreen.js` had no client-side check for minimum 6-char password on sign-up.
- **Applied:** Added `if (isSignUp && password.length < 6)` guard before the Supabase API call.
- **Constraint:** Supabase enforces 6-char minimum server-side regardless. Client-side check improves UX only.
- **Status:** Fixed in `DeepFlowMobile/src/screens/AuthScreen.js`

### 2026-07-06 — S-19: Whitespace-only task names
- **Root cause:** No "task name" feature exists in the current codebase. QA test targets a future feature.
- **Status:** Deferred — annotated in `architecture/findings.md` for when task/goal naming is implemented.
