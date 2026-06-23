# Mobile Release Protocol — Build-to-APK Pipeline

**Classification:** Release Engineering  
**Scope:** Packaging the DeepFlow Vite web app into Android APK / iOS IPA via Capacitor.

---

## 1. Prerequisites

### Android
| Tool | Required Version | Check Command |
|------|-----------------|---------------|
| Java JDK | 17 (or 21 LTS) | `java -version` |
| Android SDK | API 34+ | `echo $ANDROID_HOME` |
| Node.js | 20+ | `node --version` |
| Gradle | 8.x (bundled) | `android/gradlew --version` |

### iOS (macOS only)
| Tool | Required |
|------|----------|
| Xcode | 15.x+ |
| CocoaPods | `pod --version` |

---

## 2. Build Pipeline (Android)

### 2.1 Web Build
```bash
npm run build
# Output: dist/
```

### 2.2 Sync Web Assets to Native
```bash
npx cap sync android
```
This copies `dist/` into `android/app/src/main/assets/public/` and installs any Capacitor plugins.

### 2.3 Open in Android Studio
```bash
npx cap open android
```
Android Studio handles the Gradle sync and SDK resolution. From there:
- **Build → Build Bundle(s) / APK(s)**
- Select **APK** (or AAB for Play Store)
- Output: `android/app/build/outputs/apk/debug/` or `release/`

### 2.4 Command-Line APK Build (CI/CD)
```bash
cd android
./gradlew assembleRelease
```
Requires `ANDROID_HOME` and a keystore configured in `android/app/build.gradle`.

---

## 3. Build Pipeline (iOS)

```bash
npx cap add ios          # first time only
npx cap sync ios
npx cap open ios          # opens Xcode
```

In Xcode:
- Set signing team (Apple Developer account required)
- Product → Archive
- Distribute via TestFlight or App Store Connect

---

## 4. Versioning

Update version in three places:
```json
// package.json
"version": "0.5.0"

// capacitor.config.json
"appVersion": "0.5.0"

// android/app/build.gradle
versionCode = 1  // increment per build
versionName = "0.5.0"
```

Version scheme: `MAJOR.MINOR.PATCH` — bump PATCH for hotfixes, MINOR for features, MAJOR for breaking changes.

---

## 5. Release Checklist

- [ ] `npm run build` passes (0 errors)
- [ ] `npx cap sync` copies all assets
- [ ] APK builds without errors
- [ ] App installs and launches on Android 12+ emulator
- [ ] Supabase Site URL updated to include `capacitor://localhost` for OAuth redirects (if applicable)
- [ ] `android/app/build.gradle` signing configured for release

---

## 6. ASO Metadata (Play Store)

Store in `stages/05_Trigger/`:
- **Title** (30 chars): `DeepFlow — ADHD Writing Timer`
- **Short Desc** (80 chars): `ADHD-focused writing timer with forgiving guillotine mechanics.`
- **Full Desc** (4000 chars): [See `stages/05_Trigger/aso_description.txt`]

---

*Document version: 1.0 — Phase 5 Expansion*
