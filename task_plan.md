# DeepFlow — Expanded Phase 5 Task Plan

## Priority Queue (Mobile Release & Marketplace)

### P1 — Mobile Wrapper (Capacitor)
- [ ] Install `@capacitor/core` + `@capacitor/cli`
- [ ] `npx cap init` (app name: "DeepFlow", app ID: "com.deepflow.app")
- [ ] `npx cap add android`
- [ ] Install Android SDK + JDK 17 (prerequisite)
- [ ] Build APK: `npx cap sync && npx cap open android`
- [ ] Configure `capacitor.config.ts` with safe-area insets, status bar, splash screen
- [ ] Test on Android emulator / physical device
- [ ] iOS: Requires macOS Xcode + `npx cap add ios`

### P2 — Session History Dashboard
- [ ] Create `/history` view querying `writing_sessions` table
- [ ] Streak calendar (GitHub-style contribution graph)
- [ ] Word count trends over time
- [ ] Guillotine rate analytics (optional)

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
