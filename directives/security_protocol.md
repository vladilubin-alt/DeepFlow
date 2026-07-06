# Security Deployment Gates

**Rule:** The following checks must pass before any production release.

---

## Gate 1: RLS Enforcement
- [ ] Verify unauthenticated API calls return `[]` or `401`, not data
- [ ] Command: `curl -H "apikey: $SUPABASE_ANON_KEY" $SUPABASE_URL/rest/v1/profiles`

## Gate 2: Secret Management
- [ ] `.env` files are NOT tracked by git (`git ls-files .env` returns empty)
- [ ] `.env.example` checked in with placeholder values
- [ ] No hardcoded keys in source (`grep -r 'eyJ\|pk_\|sk_' src/ --include='*.js'`)
- [ ] Production keys only in CI/CD secrets, not in repo

## Gate 3: Analytics Consent
- [ ] Web: `CookieConsent.jsx` renders on first visit, blocks track() until accept
- [ ] Mobile: `CookieConsent.js` renders on first launch, blocks track() until accept
- [ ] `identify()` sends hashed ID, not raw UUID
- [ ] Consent state persists (localStorage / AsyncStorage)

## Gate 4: Release Build Hardening
- [ ] ProGuard enabled (`def enableProguardInReleaseBuilds = true`)
- [ ] `android:debuggable="false"` in release manifest
- [ ] Signed AAB generated with release keystore
- [ ] APK scanned for plaintext keys: `strings app-release.apk | grep -E 'eyJ|pk_'`

## Gate 5: GDPR Compliance
- [ ] `deleteAccount()` removes: profiles, writing_sessions, graveyard, drafts, auth.users
- [ ] Data export produces JSON with all user tables
- [ ] Privacy policy accessible without auth

## Gate 6: Network Security
- [ ] `netlify.toml` headers deployed: CSP, HSTS, XFO, XCTO, RP, PP
- [ ] Verify: `curl -I https://gleeful-liger-6f788b.netlify.app | grep -E 'Content-Security|X-Frame|X-Content|Strict-Transport'`
- [ ] Auth redirect URLs whitelisted in Supabase Dashboard → Authentication → URL Configuration

---

# CORS Architecture & Troubleshooting

## Supabase CORS Design (v2.95+)

Supabase's core API layer (PostgREST, Auth, Storage) enforces **`Access-Control-Allow-Origin: *`** at the Cloudflare/Kong proxy level. This is by design and not configurable in the Supabase Dashboard.

### Why This Is Safe
- **CORS is browser-only**: It prevents *websites* from reading responses cross-origin. Native mobile apps (React Native), server-to-server calls (curl, Python), and API clients are unaffected.
- **RLS is the real security boundary**: The anon key is public by design. Row-Level Security policies gate what data any request can read/write, regardless of origin.
- **No credentials passed cross-origin**: The Supabase JS SDK does not use `credentials: 'include'`, so wildcard responses are not blocked by the browser.

### What This Means for Deployment
| Concern | Status |
|---------|--------|
| CORS wildcard `*` allowed | ✅ By design — not a vulnerability |
| Browser-based XSS via API | ❌ Blocked by RLS + anon key restrictions |
| Mobile app CORS errors | ❌ Not applicable — native HTTP client |
| Web SPA CORS errors | ✅ Safe — SDK does not use `credentials:'include'` |

### CORS Troubleshooting Guide

If you encounter a **generic CORS error** in the browser console on standard Supabase queries (`supabase.from('table').select()`), the real cause is almost always one of these:

#### 1. Invalid API Key or URL
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` match between `.env` files (root + DeepFlowMobile/)
- Verify: `curl $SUPABASE_URL/rest/v1/` returns a valid JSON response
- Common mismatch: trailing slash, wrong project URL, stale key

#### 2. RLS Policy Rejection
- If RLS is enabled without a permissive policy, Supabase returns `[]` (empty array), not a CORS error
- But if the request itself is malformed or the table is excluded from the REST API, the error surfaces as a generic network failure
- Debug: Run the same query via `curl` with the anon key. If curl succeeds, the issue is client-side (browser extension, proxy, CSP)

#### 3. Wildcard + `credentials: 'include'` Conflict
- Browsers **block** any response with `Access-Control-Allow-Origin: *` if the request includes `credentials: 'include'`
- The Supabase JS SDK does NOT set this flag by default
- If you manually add `credentials: 'include'` to a fetch/axios call against Supabase, you must also set `Access-Control-Allow-Origin` to an explicit origin (not `*`)
- **Fix:** Remove `credentials: 'include'` from any Supabase API calls

### Auth Redirect Whitelisting
Even though the REST API uses wildcard CORS, **OAuth redirects** must be explicitly whitelisted:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://gleeful-liger-6f788b.netlify.app`
3. Add to **Redirect URLs**:
   - `https://gleeful-liger-6f788b.netlify.app/auth/confirm`
   - `http://localhost:5173/auth/confirm` (development)
   - `deepflow://auth/callback` (mobile deep link)

This ensures OAuth providers (Google, Apple) redirect users back to the correct origin after authentication.

### Edge Functions CORS (If Used)
If custom Edge Functions are added in the future, CORS must be handled in-function:

```ts
import { corsHeaders } from 'npm:@supabase/supabase-js@^2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
```

Current status: No Edge Functions deployed — not applicable.

---

## QA Mapping: S-04 (formerly "CRITICAL — CORS wildcard")

| Field | Value |
|-------|-------|
| **Original Severity** | CRITICAL |
| **Resolution** | Closed — Architecture Handled |
| **Rationale** | Supabase API design enforces wildcard CORS by proxy design. RLS is the effective security layer. No code change required. |
| **Documentation** | See CORS Architecture section above |
