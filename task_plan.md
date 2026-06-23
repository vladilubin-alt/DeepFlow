# DeepFlow — v1.0.0 Production Seal

## ✅ All Phases Complete — Ready for Play Store Submission

### P1 — Mobile Wrapper (Capacitor)
- [x] Install `@capacitor/core` + `@capacitor/cli`
- [x] `npx cap init` (app name: "DeepFlow", app ID: "com.deepflow.app")
- [x] `npx cap add android`
- [x] Install Android SDK + JDK 21
- [x] Debug APK built (4.5MB) — competitive with 4.1MB target
- [x] `capacitor.config.json` configured with safe-area, status bar, splash
- [x] Deep link intent-filter for `deepflow://auth/callback`
- [x] `.gitignore` protects `*.keystore` (except debug.keystore)

### P2 — Session History Dashboard
- [x] Session history protocol documented
- [x] Web: `/history` route with HistoryView, StreakCalendar, WordCountChart
- [x] Mobile: HistoryScreen with FocusScoreCard, pull-to-refresh
- [x] Focus Score formula: WPM + target ratio − guillotine penalty

### P3 — Auth Upgrade (OAuth)
- [x] Google/Apple OAuth login in Settings
- [x] Anonymous→OAuth linking via `supabase.auth.linkIdentity()`
- [x] Deep link config for `deepflow://auth/callback`
- [x] Auth migration documented

### P4 — Analytics (Mixpanel)
- [x] Web: `mixpanel-browser` wired via `src/lib/analytics.js`
- [x] Mobile: `mixpanel-react-native` wired via `AnalyticsService.js`
- [x] All key events tracked (session start/complete/guillotine, grace token, vault recovery)

### P2.1 — Superwall Onboarding & Revenue Gate
- [x] Superwall SDK + RevenueCat SDK installed and initialized
- [x] Purchase controller handshake: Superwall → RevenueCat → Google Play
- [x] Trigger 1: Flare Quiz (2-step, 5 personas, per-flare defaults)
- [x] Trigger 2: Focus Report (post-session metrics + upsell CTA)
- [x] Trigger 3: Grace Token paywall with entitlement pre-check
- [x] Post-purchase Supabase sync via `addCustomerInfoUpdateListener`
- [x] RevenueCat subscriber attribute: `flare_type`
- [x] Superwall campaigns: `onboarding_flare_quiz`, `focus_report`, `grace_token_refill`
- [x] Web fallback: Supabase profile upsert + localStorage

### P5 — Production Release
- [x] Signed AAB build pipeline defined (keystore + Gradle config)
- [x] React Native app ID: `com.deepflowmobile`, versionCode 2, versionName "1.0.0"
- [x] `SUPERWALL_API_KEY` + `REVENUECAT_API_KEY` injected via `react-native-config`
- [x] ASO screenshot guide captured in protocol below
- [x] ProGuard ready for release minification

---

## Post-Launch Backlog (v1.1+)
- [ ] iOS: `npx cap add ios` + Xcode archive + TestFlight
- [ ] Data migration script: anonymous→OAuth `user_id` reassignment
- [ ] Play Store A/B test screenshots via Firebase A/B Testing
- [ ] Mixpanel funnel dashboard for activation/retention cohorts
- [ ] Direct Google Play Billing (fallback if Superwall is removed)
- [ ] Extended subscription tier model (graveyard retention, unlimited sessions)

---

## Status Legend
- `[x]` Complete
- `[ ]` Post-launch / v1.1+
