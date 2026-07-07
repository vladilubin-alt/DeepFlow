# Firebase Crashlytics — Setup Verification

## Current Status
| Component | Status |
|-----------|--------|
| `google-services.json` | ✅ Present (`com.deepflowmobile`) |
| Firebase SDK plugin | ✅ `com.google.gms.google-services` in `build.gradle` |
| Crashlytics SDK | ⚠️ Not explicitly added to `build.gradle` dependencies |

## To Enable Crashlytics

Add to `DeepFlowMobile/android/app/build.gradle` dependencies block:

```gradle
implementation("com.google.firebase:firebase-crashlytics:19.4.0")
```

Add the Crashlytics plugin at the top of the file (after `com.google.gms.google-services`):

```gradle
apply plugin: "com.google.firebase.crashlytics"
```

Then add the Crashlytics NDK dependency if needed:

```gradle
implementation("com.google.firebase:firebase-crashlytics-ndk:19.4.0")
```

## Verify After Build

1. Open **Firebase Console** → https://console.firebase.google.com/project/deepflow-500918
2. Go to **Crashlytics** in the left sidebar
3. Launch the debug APK on device and force a crash:
   ```js
   // Add to any screen temporarily:
   throw new Error('Test crash — ignore');
   ```
4. Check the Crashlytics dashboard within 5 minutes for the crash report

## Post-Launch Alert Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Crash-free users | < 99% | Investigate within 24h |
| ANR rate | > 0.05% | Profile with Android Studio |
| New crash group | Any | Auto-assign for triage |

**Note:** Firebase Crashlytics is a post-launch monitoring tool. It does not block the Play Store submission. The AAB is already signed and ready.
