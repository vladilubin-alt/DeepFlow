# Mobile Release Protocol — React Native (Hermes + ProGuard)

**Classification:** Release Engineering  
**Scope:** Building and signing the React Native Android APK / AAB for Play Store distribution.

---

## 1. Prerequisites

### Android
| Tool | Required Version | Check Command |
|------|-----------------|---------------|
| Java JDK | 17 (or 21 LTS) | `java -version` |
| Android SDK | API 35+ | `echo $ANDROID_HOME` |
| Node.js | 20+ | `node --version` |
| Gradle | 8.x (bundled) | `android/gradlew --version` |

### Device / Emulator
- Physical device via ADB: `adb devices`
- Or Android Emulator (API 35+)

---

## 2. Build Pipeline (Android)

All commands run from `DeepFlowMobile/`.

### 2.1 Debug APK (fast iteration)
```bash
npx react-native run-android --active-arch-only
```
- Installs directly to connected device
- Uses Metro dev server for hot-reload
- Skips unused architectures for speed

### 2.2 Full Debug APK (all architectures)
```bash
npx react-native run-android
```
- Builds for all `reactNativeArchitectures` (arm64-v8a, armeabi-v7a, x86_64)
- Required before release to confirm no architecture-specific issues

### 2.3 Release AAB (Play Store)
```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

### 2.4 Release APK (sideload / testing)
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

### 2.5 Environment Variables
`.env` values are injected at build time via `react-native-config`'s `dotenv.gradle`. The file is read from `DeepFlowMobile/.env` at Gradle configure phase. After changing `.env`, run a clean build:
```bash
cd android && ./gradlew clean && cd ..
npx react-native run-android --active-arch-only
```

---

## 3. Hermes & ProGuard

Both are enabled in `android/app/build.gradle`:

- **Hermes** (JS-to-bytecode compiler): Enabled by default in RN 0.86+. Reduces JS bundle size and improves startup time.
- **ProGuard** (Java bytecode shrinking): `enableProguardInReleaseBuilds = true` in `build.gradle`. Obfuscates and minifies Java/Kotlin code.

To verify Hermes is working:
```bash
# After a release build, check for hermes bytecode
file android/app/build/generated/assets/createBundleReleaseJsAndAssets/index.android.bundle
# Should say "Hermes JavaScript bundle" not "JSON text"
```

---

## 4. Signing & Keystore

### 4.1 Debug Keystore (built-in)
- Located at: `android/app/debug.keystore`
- Password: `android`
- Used automatically for debug builds

### 4.2 Release Keystore (production)
Create before first Play Store release:
```bash
keytool -genkey -v -keystore android/app/release.keystore \
  -alias deepflow -keyalg RSA -keysize 2048 -validity 10000
```

Then update `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file('release.keystore')
        storePassword System.getenv("DF_STORE_PASSWORD") ?: "your-store-password"
        keyAlias "deepflow"
        keyPassword System.getenv("DF_KEY_PASSWORD") ?: "your-key-password"
    }
}
```
**Never commit passwords** — use `DF_STORE_PASSWORD` / `DF_KEY_PASSWORD` env vars in CI.

---

## 5. Versioning

Update version in:
```groovy
// android/app/build.gradle
defaultConfig {
    versionCode 1  // increment per build
    versionName "1.0.0"
}
```

Version scheme: `MAJOR.MINOR.PATCH` — bump PATCH for hotfixes, MINOR for features, MAJOR for breaking changes.

---

## 6. Release Checklist

- [ ] `npx react-native run-android --active-arch-only` passes (debug)
- [ ] `.env` contains production API keys for RevenueCat + Superwall
- [ ] Hermes enabled: JS bundle compiled to Hermes bytecode
- [ ] ProGuard enabled: `enableProguardInReleaseBuilds = true`
- [ ] Release keystore created and passwords set in env vars
- [ ] `./gradlew bundleRelease` succeeds (signed AAB)
- [ ] AAB tested via `bundletool` or Play Store internal track
- [ ] Supabase Auth Site URL updated to include app's redirect URI
- [ ] Version bump committed before tagging

---

## 7. ASO Metadata (Play Store)

Store in `stages/05_Trigger/`:
- **Title** (30 chars): `DeepFlow — ADHD Writing Timer`
- **Short Desc** (80 chars): `ADHD-focused writing timer with forgiving guillotine mechanics.`
- **Full Desc** (4000 chars): [See `stages/05_Trigger/aso_description.txt`]

---

*Document version: 2.0 — RN v0.4.3 pivot*
