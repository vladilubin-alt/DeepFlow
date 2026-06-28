#!/bin/bash
set -e

echo "Bundling JavaScript for Android..."
mkdir -p android/app/src/main/assets

npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

echo "Bundle complete: android/app/src/main/assets/index.android.bundle"
