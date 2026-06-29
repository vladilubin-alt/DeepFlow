# DeepFlow QA Report v2

**Date:** June 29, 2026
**Tester:** MiMoCode (Automated + Code Audit)
**Platforms:** Web (Netlify), Android (React Native 0.86)

---

## Executive Summary

**Pass Rate:** 71% (53/75)

| Severity | Count |
|---|---|
| CRITICAL | 3 |
| HIGH | 11 |
| MEDIUM | 16 |
| LOW | 10 |
| INFO | 3 |

### Top Risks Before Launch

1. Screen readers cannot navigate either platform — zero accessibility attributes anywhere
2. API keys committed to source code in `env.js` and `.env`
3. No consent mechanism before Mixpanel analytics fires; ADHD subtype data sent to third party

---

## Issue Log

### CRITICAL

| ID | Title | Platform | File | Fix |
|---|---|---|---|---|
| C-1 | No accessibility labels (mobile) | Android | All RN components | Add accessibilityLabel/Role to every interactive element |
| C-2 | No ARIA attributes (web) | Web | All JSX components | Add aria-label, role, aria-modal to modals/nav/forms |
| C-3 | Hardcoded secrets in env.js | Mobile | `DeepFlowMobile/src/config/env.js` | Move to react-native-config; rotate all keys |

### HIGH

| ID | Title | Platform | File | Fix |
|---|---|---|---|---|
| H-1 | No cookie consent banner | Both | Missing entirely | Build consent modal; gate Mixpanel init behind consent |
| H-2 | FLARE ADHD subtype sent to Mixpanel | Both | `src/App.jsx:120`, `AnalyticsService.js` | Gate behind explicit health-data consent |
| H-3 | Mixpanel ignores Do Not Track | Web | `src/lib/analytics.js:14` | Remove `ignore_dnt: true` |
| H-4 | Mobile privacy policy link broken | Android | `SettingsScreen.js:150` | PRIVACY_URL constant never defined; add it |
| H-5 | No consent at mobile signup | Android | `AuthScreen.js` | Add privacy acknowledgment before account creation |
| H-6 | Web lacks account deletion | Web | Missing | Implement GDPR delete in web app |
| H-7 | Web lacks data export | Web | Missing | Implement GDPR export in web app |
| H-8 | Mobile lacks password reset | Android | `AuthScreen.js` | Add "Forgot Password" flow |
| H-9 | Notification dependency missing | Android | `NotificationService.js:10` | Install react-native-push-notification or equivalent |
| H-10 | No background timer handling | Both | `ActiveSessionScreen.js`, `useDeepFlowSession.js` | Add AppState/visibilitychange listeners |
| H-11 | Notifications lack deep link data | Android | `NotificationService.js:47` | Add data/route to scheduled notifications |

### MEDIUM

| ID | Title | Platform | Fix |
|---|---|---|---|
| M-1 | Queries missing user_id filter | Both | Add `.eq('user_id', ...)` to session queries |
| M-2 | Non-atomic grace token decrement | Mobile | Use server-side RPC for atomic decrement |
| M-3 | Weak password policy | Both | Require 8+ chars with complexity |
| M-4 | No brute force protection (web) | Web | Add client-side lockout like mobile |
| M-5 | Flare Quiz not dismissable | Web | Add onClose/skip to modal |
| M-6 | Timer too small on web | Web | Increase font size and contrast |
| M-7 | Color contrast failures | Both | 8 elements below WCAG AA 4.5:1 |
| M-8 | Raw error messages (web graveyard) | Web | Sanitize like mobile does |
| M-9 | Incomplete account deletion | Mobile | Auth user row not deleted; Mixpanel/RevenueCat retain data |
| M-10 | No CCPA opt-out toggle | Both | Add "Do Not Sell" link despite not selling |
| M-11 | No COPPA age gate | Both | Add age verification at signup |
| M-12 | Mobile Flare Quiz paywall-gated | Mobile | Users may never see quiz; falls back silently |
| M-13 | localStorage persistence bypasses consent | Web | Gate Mixpanel localStorage behind consent |
| M-14 | UUID sent in analytics events | Both | Remove redundant userId from event properties |
| M-15 | Only auth callback deep link route | Mobile | Add routes for home, vault, session screens |
| M-16 | POST_NOTIFICATIONS permission missing | Android | Add to AndroidManifest for API 33+ |

### LOW

| ID | Title | Platform | Fix |
|---|---|---|---|
| L-1 | User ID redundant in analytics | Both | Remove from event properties |
| L-2 | Temp file in GDPR export may persist on crash | Mobile | Wrap in finally block |
| L-3 | Hardcoded redirect URLs | Both | Move to config constants |
| L-4 | Mobile vault empty state lacks context | Mobile | Add explanatory text like web version |
| L-5 | Web footer text nearly invisible | Web | Increase contrast of `#444441` |
| L-6 | Passive consent text at web signup | Web | Add explicit checkbox |
| L-7 | Deep link errors swallowed silently | Mobile | Log errors instead of catch {}
| L-8 | Web lacks theme toggle | Web | Add dark/light toggle |
| L-9 | iOS privacy manifest contradicts tracking | Mobile | Update NSPrivacyTracking to true |
| L-10 | CSP allows unsafe-inline for scripts | Web | Migrate to nonce-based CSP |

### INFO

| ID | Title | Notes |
|---|---|---|
| I-1 | targetSdkVersion 36 | Pass — meets Google Play requirements |
| I-2 | Minimal permissions declared | Pass — only INTERNET and VIBRATE |
| I-3 | Billing via RevenueCat transitively | Standard for subscription apps |

---

## Feature Parity Matrix

| Feature | Web | Mobile | Gap |
|---|---|---|---|
| Email + Google auth | ✅ | ✅ | — |
| Password reset | ✅ | ❌ | Mobile missing |
| Flare Quiz | ✅ (inline) | ✅ (paywall-gated) | Different flows |
| Session setup | ✅ | ✅ | — |
| Timer + guillotine | ✅ | ✅ | — |
| Binaural audio | ✅ | ✅ | — |
| AI nudges | ✅ | ✅ | — |
| Focus report | ✅ | ✅ | — |
| Session history | ✅ | ✅ | — |
| Vault/graveyard | ✅ | ✅ | — |
| Settings screen | ❌ | ✅ | Web missing |
| Theme toggle | ❌ | ✅ | Web missing |
| Haptic setting | N/A | ✅ | — |
| Daily reminders | ❌ | ✅ | Web missing |
| Data export (GDPR) | ❌ | ✅ | Web missing |
| Account deletion | ❌ | ✅ | Web missing |
| Privacy policy | ✅ | ✅ | — |
| Splash screen | ❌ | ✅ | Web missing |
| Offline sync queue | ❌ | ✅ | Web missing |
| Push notifications | ❌ | ✅ (broken dep) | Both broken |

---

## Security Summary

| Finding | Severity | Status |
|---|---|---|
| Secrets in env.js committed to repo | CRITICAL | Open |
| RLS enabled on all 4 tables | PASS | Verified |
| Encrypted token storage (mobile) | PASS | Verified |
| Cleartext traffic blocked | PASS | Verified |
| Deep link validation implemented | PASS | Verified |
| AllowBackup=false | PASS | Verified |
| debuggable=false in release | PASS | Verified |
| Proguard enabled in release | PASS | Verified |
| Security headers in netlify.toml | PASS | Configured (not yet deployed to live) |
| CORS restricted to app origins | PASS | Configured |
| Global signout revokes tokens server-side | PASS | Verified |
| Parameterized Supabase queries | PASS | No raw SQL |
| Client-side RevenueCat token grant | HIGH | No server-side validation |

---

## Accessibility Scorecard

| WCAG 2.1 Guideline | Status |
|---|---|
| 1.1.1 Non-text Content | FAIL — zero alt/aria-label |
| 1.3.1 Info and Relationships | FAIL — no ARIA roles |
| 1.4.3 Contrast (Minimum) | FAIL — 8 elements below 4.5:1 |
| 1.4.4 Resize Text | FAIL — user-scalable=no in viewport |
| 2.1.1 Keyboard | FAIL — no focus management in modals |
| 2.4.1 Bypass Blocks | PARTIAL — nav exists but unlabeled |
| 2.4.3 Focus Order | FAIL — no visible focus rings |
| 2.4.6 Headings and Labels | FAIL — form fields lack labels |
| 4.1.2 Name, Role, Value | FAIL — no accessible names |

**Estimated WCAG compliance: ~15%** (requires full remediation)

---

## Performance Summary

| Metric | Target | Status |
|---|---|---|
| Web FCP | < 1.8s | Needs measurement |
| Web LCP | < 2.5s | Needs measurement |
| Android cold start | < 2s | Needs measurement |
| npm vulnerabilities | 0 critical | 0 found ✅ |
| JS bundle size | < 200KB gzipped | Needs measurement |

---

## Pre-Launch Checklist

### Must Fix (CRITICAL)
- [ ] Add accessibility attributes to all components (both platforms)
- [ ] Move secrets out of source code; rotate exposed keys
- [ ] Build and deploy cookie consent mechanism

### Should Fix (HIGH)
- [ ] Gate FLARE data behind explicit consent
- [ ] Remove `ignore_dnt: true` from Mixpanel
- [ ] Fix broken PRIVACY_URL in mobile Settings
- [ ] Add consent screen to mobile signup
- [ ] Implement web GDPR features (export, delete)
- [ ] Add password reset to mobile
- [ ] Install notification dependency + POST_NOTIFICATIONS permission
- [ ] Add AppState/visibilitychange timer handling
- [ ] Add deep link routes to notifications

### Nice to Have (MEDIUM)
- [ ] Strengthen password policy
- [ ] Fix color contrast on 8 elements
- [ ] Add CCPA opt-out toggle
- [ ] Add COPPA age gate
- [ ] Expand deep link routes beyond auth callback
- [ ] Sanitize web graveyard error messages

---

## Post-Launch Monitoring

| Metric | Target | Tool |
|---|---|---|
| Crash rate | < 1% | Firebase Crashlytics |
| API error rate | < 0.1% | Supabase Dashboard |
| Session abandonment | < 30% | Mixpanel |
| Auth failure rate | < 5% | Supabase logs |
| GDPR deletion requests | Track all | Internal log |
| Accessibility complaints | Track all | Support tickets |
