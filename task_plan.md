# DeepFlow — Expanded Phase 5 Task Plan

## Priority Queue (Mobile Release & Marketplace)

### P1 — Mobile Wrapper (Capacitor) — ✅ Complete
- [x] Install `@capacitor/core` + `@capacitor/cli`
- [x] `npx cap init` (app name: "DeepFlow", app ID: "com.deepflow.app")
- [x] `npx cap add android`
- [x] Install Android SDK + JDK 21 (prerequisite)
- [x] Build APK: `npm run build && npx cap sync android && cd android && ./gradlew assembleDebug`
- [x] Configure `capacitor.config.json` with safe-area insets, status bar, splash screen
- [ ] Test on Android emulator / physical device
- [ ] iOS: Requires macOS Xcode + `npx cap add ios`

### P2 — Session History Dashboard — [/] In Progress
- [x] Create `architecture/session_history_protocol.md` with data fetching, Focus Score, streak logic
- [x] Install react-router-dom + recharts
- [x] Create `/history` route with `HistoryView` component
- [x] Streak calendar (Bento grid style) via `StreakCalendar` component
- [x] Word count trend chart via `WordCountChart` (Recharts AreaChart)
- [x] Focus Score per session (WPM variance + target completion)
- [ ] Generate signed APK for Play Store

### P3 — Auth Upgrade (OAuth)
- [ ] Add Google/Apple OAuth login
- [ ] Link anonymous `uid()` to permanent OAuth identity
- [ ] Data migration script: reassign `user_id` from anonymous to OAuth UUID
- [ ] Documented in `architecture/auth_migration.md`

### P4 — Analytics (Mixpanel)
- [ ] Wire Mixpanel token from `.env`
- [ ] Track: session start, guillotine, grace token use, recovery
- [ ] Dashboard for funnel analysis

### P5 — Revenue (Google Play Billing)
- [ ] Implement Google Play Billing Library for in-app purchases
- [ ] Premium feature gate: extra Grace Tokens, extended graveyard retention
- [ ] Subscription tier model documentation
- [ ] Test with Google Play Console license testing

---

## Status Legend
- `[ ]` Not started
- `[/]` In progress
- `[x]` Complete
