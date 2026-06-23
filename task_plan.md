# DeepFlow — Expanded Phase 5 Task Plan

## Priority Queue (Mobile Release & Marketplace)

### P1 — Mobile Wrapper (Capacitor) — ✅ Complete (Web)
- [x] Install `@capacitor/core` + `@capacitor/cli`
- [x] `npx cap init` (app name: "DeepFlow", app ID: "com.deepflow.app")
- [x] `npx cap add android`
- [x] Install Android SDK + JDK 21 (prerequisite)
- [x] Build APK: `npm run build && npx cap sync android && cd android && ./gradlew assembleDebug`
- [x] Configure `capacitor.config.json` with safe-area insets, status bar, splash screen
- [x] Deep link intent-filter for `deepflow://auth/callback` in AndroidManifest.xml
- [ ] Test on Android emulator / physical device
- [ ] iOS: Requires macOS Xcode + `npx cap add ios`

### P2 — Session History Dashboard — ✅ Complete
- [x] Create `architecture/session_history_protocol.md` with data fetching, Focus Score, streak logic
- [x] Install react-router-dom + recharts
- [x] Create `/history` route with `HistoryView` component
- [x] Streak calendar (Bento grid style) via `StreakCalendar` component
- [x] Word count trend chart via `WordCountChart` (Recharts AreaChart)
- [x] Focus Score per session (WPM variance + target completion)
- [x] Wire StreakCalendar to live Supabase session data (was hardcoded to all-grey)
- [x] Port useSessionHistory hook + HistoryScreen to React Native with live data
- [ ] Generate signed APK for Play Store

### P3 — Auth Upgrade (OAuth) — ✅ Complete
- [x] Add Google/Apple OAuth login button in Settings screen
- [x] Link anonymous `uid()` to permanent OAuth identity via `supabase.auth.linkIdentity()`
- [x] Deep link config: `deepflow://auth/callback` intent-filter in AndroidManifest.xml
- [x] Documented in `architecture/auth_migration.md` (including §7 Native Deep Link Configuration)
- [ ] Data migration script: reassign `user_id` from anonymous to OAuth UUID (fallback only)

### P4 — Analytics (Mixpanel) — ✅ Complete
- [x] Wire Mixpanel token from `.env`
- [x] Track: session start, guillotine, grace token use, recovery
- [x] Web: `mixpanel-browser` installed + `src/lib/analytics.js` service
- [x] Mobile: `mixpanel-react-native` installed + `AnalyticsService.js`
- [ ] Dashboard for funnel analysis

### P2.1 — Superwall Onboarding & Revenue Gate — [/] In Progress
- [x] Install Superwall SDK (`@superwall/react-native-superwall` v2.1.7 in DeepFlowMobile/)
- [x] Create `architecture/onboarding_experiment_protocol.md` with trigger logic
- [x] Update Trigger 3 SOP with entitlement → Supabase flow, paywall UI spec
- [x] Create `SuperwallService.js` — init + `triggerGraceTokenPaywall()` wrapper
- [x] Wire Trigger 3: Grace Token paywall in `ActiveSessionScreen.js` (0 tokens → Superwall `grace_token_refill` placement)
- [x] Wire Grace Token guard in web `useDeepFlowSession.js` (early return when `graceTokens <= 0`)
- [x] Wire Trigger 1: Flare Quiz (2-step, 5 Flares, localStorage/AsyncStorage, per-flare defaults)
- [x] Flare Quiz UI: Web (`FlareQuizModal.jsx`) + Mobile (`FlareQuizService.js`) with Supabase profile update + Mixpanel event
- [x] RevenueCat attribute: `Purchases.setAttributes({ flare_type })` on quiz completion (mobile) + Supabase `profiles.flare_type` (web + mobile)
- [x] Purchase controller handshake: RevenueCat init → Superwall config with `createPurchaseController()` wrapping `Purchases.purchaseProduct()`
- [x] Entitlement pre-check: `canPurchaseTokens()` checks `extra_grace_tokens` entitlement before showing paywall
- [x] Post-purchase Supabase sync: `Purchases.addCustomerInfoUpdateListener` grants tokens to `profiles` when entitlement detected
- [x] Per-Flare personalized paywall mapping documented in `architecture/onboarding_experiment_protocol.md §11`
- [ ] Wire Trigger 2: Post-session "Focus Report" value demonstration
- [ ] Wire VaultScreen recovery → Superwall paywall when user lacks tokens

### P5 — Revenue (Google Play Billing)
- [ ] Implement Google Play Billing Library for in-app purchases
- [ ] Premium feature gate: extra Grace Tokens, extended graveyard retention
- [ ] Subscription tier model documentation
- [ ] Test with Google Play Console license testing
- [ ] Dependency audit: verify SUPERWALL_API_KEY + REVENUECAT_API_KEY injected via .env → capacitor config
- [ ] Safe-area verification: paywall close button respects notches on Android

---

## Status Legend
- `[ ]` Not started
- `[/]` In progress
- `[x]` Complete
