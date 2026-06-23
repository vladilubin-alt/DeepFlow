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
