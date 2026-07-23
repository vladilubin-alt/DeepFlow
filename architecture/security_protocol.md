# CORS & OAuth Redirect SOP — Supabase

## Supabase CORS Default

Supabase enforces `Access-Control-Allow-Origin: *` at the Cloudflare/Kong proxy level for all core APIs (PostgREST, Auth, Storage). This is by design and **not configurable** in the Supabase Dashboard.

**Why this is safe:**
- CORS is browser-only; native mobile apps (React Native) and server-to-server calls are unaffected.
- RLS (Row-Level Security) is the real auth boundary — the anon key is public by design.
- The Supabase JS SDK does not use `credentials: 'include'`, so wildcard responses are not blocked.

**RLS verification:** Unauthenticated requests return `[]` (empty array) not data. This is confirmed by RLS policies on all 4 tables (profiles, writing_sessions, graveyard, drafts).

*For full technical background, see `directives/security_protocol.md §CORS Architecture`.*

---

## SOP: OAuth Redirect Whitelisting

Broken OAuth redirects (Google/Apple login failing after authentication) are caused by missing or incorrect Site URL / Redirect URL configuration in the Supabase Dashboard.

### Steps

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Set **Site URL** to: `https://gleeful-liger-6f788b.netlify.app`
3. Add to **Redirect URLs**:
   - `https://gleeful-liger-6f788b.netlify.app/auth/confirm`
   - `http://localhost:5173/auth/confirm` (dev)
   - `deepflow://auth/callback` (mobile deep link)
4. Click **Save**
5. Verify with a test OAuth sign-in on the production Web SPA and the Android APK

### Common Failure Modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| OAuth callback redirects to `localhost` | Site URL still set to dev | Update to Netlify production URL |
| "Invalid redirect" error | Redirect URL not whitelisted | Add exact URL to redirect list |
| Mobile OAuth hangs after Google/Apple auth | Deep link `deepflow://auth/callback` not in redirect list | Add deep link URL |

---

## Gate 6: Network Security

Status: **CONFIG DEPLOYED** — headers active in `netlify.toml` and pushed to `main`.

| Header | Value | Status |
|--------|-------|--------|
| Content-Security-Policy | restrictive (self + supabase + fonts) | ✅ |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | ✅ |
| X-Frame-Options | DENY | ✅ |
| X-Content-Type-Options | nosniff | ✅ |
| Referrer-Policy | strict-origin-when-cross-origin | ✅ |
| Permissions-Policy | camera=(), microphone=(), geolocation=(), payment=() | ✅ |

Verify: `curl -I https://gleeful-liger-6f788b.netlify.app | grep -E 'Content-Security|X-Frame|X-Content|Strict-Transport'`
