#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const patches = [
  {
    file: 'node_modules/mixpanel-react-native/android/build.gradle',
    find: 'minSdkVersion 21',
    replace: 'minSdkVersion 24',
    desc: 'mixpanel minSdk 21→24 for RN 0.86 compat',
  },
  {
    file: 'node_modules/react-native-audio-api/android/build.gradle',
    find: 'excludes = [\n      "META-INF",\n      "META-INF/**",',
    replace: 'excludes = [\n      "META-INF/**",',
    desc: 'audio-api META-INF dedup for androidTest',
  },
];

let patched = 0;
for (const p of patches) {
  const fullPath = path.resolve(__dirname, '..', p.file);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes(p.replace)) continue;
  if (!content.includes(p.find)) {
    console.warn(`[patch] skip ${p.desc}: pattern not found`);
    continue;
  }
  content = content.replace(p.find, p.replace);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`[patch] applied: ${p.desc}`);
  patched++;
}
if (patched === 0) console.log('[patch] all patches already applied or skipped');
