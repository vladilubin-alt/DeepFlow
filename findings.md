# DeepFlow ADHD Writing Timer Research & Findings

## Discoveries & Context
- **North Star**: Help ADHD entrepreneurs master deep work, override task avoidance and initiation paralysis, and convert shame spirals into consistent "Deep Flow".
- **Zero Development Cost Strategy**: Utilizing free tiers of Supabase (backend/auth/db), GitHub (source of truth), Mixpanel/Metabase (behavioral analytics), and Google Play Billing (revenue via in-app purchases).
- **Grace Tokens**: Implementation of streak forgiveness mechanisms to prevent users from deleting the app due to shame after a broken streak.

## Constraints & Key Requirements
- **Primary Source of Truth**: Primary writing and session logs are persisted to the Supabase cloud database to prevent "Catastrophic Crash" data loss.
- **Row Level Security (RLS)**: Users can only see/access their own data. Must enforce this explicitly in Supabase configuration.
- **Apple-esque Minimalist Design**: Clean UI/UX, weighted, intentional animations.
- **Deterministic Backend Logic**: Timer calculations and word count validation handled via deterministic scripts (Python/Dart).
- **Release Payload**: APK binary and ASO metadata (Title: 30 chars, Short Desc: 80 chars, Full Desc: 4000 chars) exported to `stages/05_Trigger/`.

## Git & CI/CD Configuration
- **SSH Key**: ed25519 key at `~/.ssh/github_deploy` for GitHub authentication (`ssh -T git@github.com` verified).
- **Remote**: `git@github.com:Vladi758/DeepFlow.git` (SSH).
- **GitHub Repo**: `https://github.com/Vladi758/DeepFlow`.
- **Netlify CI/CD**: Site `gleeful-liger-6f788b` linked to GitHub — pushes to `main` auto-trigger production builds.
- **Deploy Config**: `netlify.toml` — `npm run build` + `dist/` publish + SPA redirect `/* → /index.html`.

## Mobile Build Environment
- **JDK**: `.tmp/jdk21/Contents/Home` (Temurin 21.0.6 LTS, downloaded from Adoptium)
- **Android SDK**: `~/Library/Android/sdk`
- **SDK Platforms**: `android-34` installed via `sdkmanager`
- **Build Tools**: `34.0.0` installed via `sdkmanager`
- **Gradle**: 8.14.3 (wrapped in `android/gradlew`)
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk` (4.1MB)
- **Capacitor**: v7, with splash-screen and StatusBar plugins
- **Build Command**: See `architecture/mobile_release_protocol.md`

## Recovery Vault
- **Component**: `src/components/VaultModal.jsx` — queries `graveyard` via Supabase client with RLS `auth.uid()`.
- **Trigger**: "Vault ◆" button in Header opens modal.
- **Recovery**: "Recover Last Draft" button restores most recent graveyard content to `WritingArena`.
- **Constraint**: Entries auto-purged after 30 days per `graveyard` table lifecycle.

---

## v1.0 Launch KPI Targets

| Metric | Target | Source |
|--------|--------|--------|
| Crash-free users | > 99% | Firebase Crashlytics |
| Trial → paid conversion | > 5% | RevenueCat |
| DAU (month 1) | > 100 | Mixpanel |
| Avg session duration | > 15 min | Supabase analytics |
| Session abandonment | < 30% | Mixpanel funnel |
| API error rate | < 0.1% | Supabase Dashboard |
| Store rating | > 4.0 | Play Console |
| GDPR request response | < 30 days | Support email |
| Auth failure rate | < 2% | Supabase Auth logs |

## Day 1-7 Telemetry Targets (v1.0 Launch)

| Metric | Target | Tool | Checkpoint |
|--------|--------|------|------------|
| Android Crash Rate | < 1% | Firebase Crashlytics | Day 1 steady-state |
| RevenueCat Trial Conversion | > 5% | RevenueCat Dashboard | Day 7 (trial ends) |
| Session Abandonment | < 30% | Mixpanel funnel | Day 3, Day 7 |
| API Error Rate (4xx/5xx) | < 0.1% | Supabase Dashboard | Daily |
| ANR Rate | < 0.05% | Google Play Console | Day 7 |
| Auth Failure Rate | < 2% | Supabase Auth logs | Daily |
| Cold Start Time | < 2.5s | Firebase Vitals | Day 3 |

### Moment of Delight Hook — Verified

| Trigger | Platform | Mechanism | Status |
|---------|----------|-----------|--------|
| First successful payment | Mobile (RN) | `SuperwallService.js:70` — `addCustomerInfoUpdateListener` detects entitlements → `canShowReviewPrompt()` → `FirstPurchaseReviewModal` with confetti burst | ✅ Wired |
| Focus Score >= 80 | Web SPA | `FocusReportModal.jsx:106` — `{focusScore >= 80 && <Confetti />}` renders confetti animation in session report | ✅ Wired |

## Security Posture (v1.0)

| Control | Status | Evidence |
|---------|--------|----------|
| RLS enabled (all 4 tables) | ✅ Applied | `supabase/migrations/001_enable_rls.sql` |
| RLS policies (auth.uid()) | ✅ Applied | 16 policies: select/insert/update/delete per table |
| `android:debuggable="false"` | ✅ Enforced | `DeepFlowMobile/android/app/build.gradle:128` + `android/app/build.gradle:20` |
| `android:allowBackup="false"` | ✅ Enforced | Both AndroidManifest.xml files |
| Encrypted token storage | ✅ Implemented | `react-native-encrypted-storage` (Keystore/Keychain) |
| Privacy policy accessible | ✅ Without auth | `src/components/PrivacyPolicy.jsx` at route `/privacy` |
| Firebase Crashlytics SDK | ✅ Added | `DeepFlowMobile/android/app/build.gradle:137-138` |
| CSP / security headers | ✅ Config in `netlify.toml` | Push to `main` to deploy |
