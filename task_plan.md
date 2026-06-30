# DeepFlow — v1.0.0 Production Seal

## ✅ All Phases Complete — Ready for Play Store Submission

### P1 — Mobile Wrapper (React Native)
- [x] React Native project scaffolded (`DeepFlowMobile/`)
- [x] React Native app ID: `com.deepflowmobile`, versionCode 1, versionName "1.0"
- [x] Debug APK builds and installs on device via `npx react-native run-android --active-arch-only`
- [x] Hermes enabled (JS → bytecode compilation)
- [x] `react-native-config` wired via `dotenv.gradle` for `.env` injection
- [x] RevenueCat + Superwall SDK initialized and authenticated
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

### P6 — Post-Purchase Review Trigger (v1.0 Launch)
- [x] Architecture document: `architecture/review_protocol.md`
- [x] DB columns: `has_been_prompted`, `purchase_count`, `review_cooldown_until` on profiles
- [x] Review manager: `src/lib/reviewManager.js` with Supabase gate
- [x] RevenueCat listener: `addCustomerInfoUpdateListener` detects first purchase
- [x] Modal: `FirstPurchaseReviewModal.jsx` with Midnight Luxe styling, confetti, noise
- [x] Review prompt fires after first successful payment; single-pass + 30d cooldown

### P7 — Launch Sequence & Security Hardening
- [x] Architecture pivot: React Native reactivated as primary mobile layer, Capacitor retired
- [x] `dotenv.gradle` applied to fix `react-native-config` env loading on Android
- [x] `android:debuggable="false"` enforced in release manifest
- [x] `PRIVACY_URL` crash fixed in `SettingsScreen.js`
- [x] `mobile_release_protocol.md` rewritten for React Native (Hermes + ProGuard)
- [x] `gemini.mmd` updated with Layer Architecture section
- [x] Signed AAB generated with release keystore (app-release.aab, 33MB)
- [x] RLS migration verified on production Supabase (all 4 tables return empty without auth)
- [x] `architecture/findings.md` created with keywords, constraints, metrics scorecard
- [x] `marketing/aso_descriptions.md` drafted (3 Play Store listings)
- [x] `architecture/aso_strategy.md` created with keyword sniping & CSL strategy

## Post-Launch Backlog (v1.1+)
- [ ] iOS: React Native build + Xcode archive + TestFlight
- [ ] Data migration script: anonymous→OAuth `user_id` reassignment
- [ ] Play Store A/B test screenshots via Firebase A/B Testing
- [ ] Mixpanel funnel dashboard for activation/retention cohorts
- [ ] Direct Google Play Billing (fallback if Superwall is removed)
- [ ] Extended subscription tier model (graveyard retention, unlimited sessions)
- [ ] Accessibility Audit (WCAG 2.1 AA compliance for Web SPA)
- [ ] Binaural Audio Engine (`src/lib/audioEngine.js`) for Web SPA

---

## Status Legend
- `[x]` Complete
- `[ ]` Post-launch / v1.1+
