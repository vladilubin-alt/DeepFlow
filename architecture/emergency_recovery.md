# Emergency Recovery SOP — Graveyard Vault Access

**Classification:** Break-Glass Procedure  
**Scope:** Manual recovery of abandoned drafts from the `graveyard` table when the Sync Service is unresponsive or the client-side UI cannot initiate recovery.

---

## 1. When to Break Glass

Initiate this SOP if:
- A user reports a draft was lost during a `GUILLOTINED` event but the `graveyard` backup did not appear in the app.
- The Sync Service reports persistent `ERROR` or `OFFLINE` status and the local `localStorage` draft key is corrupted or missing.
- A database audit reveals orphaned graveyard records without corresponding session records.

## 2. Prerequisites

- **Supabase Dashboard Access** — you need a role with `service_role` or `tableowner` privileges on the project.
- **Target User UUID** — obtain from the user's Supabase `auth.users` table (from support ticket or session logs).
- **Recovery Window** — graveyard records are auto-purged after **30 days** via cron trigger. Act within that window.

## 3. Manual Recovery — Supabase SQL Editor

### 3.1 Locate the Graveyard Record

```sql
-- Find all graveyard entries for a user within the last 30 days
select
  g.id,
  g.session_id,
  g.word_count,
  g.deleted_at,
  g.content
from public.graveyard g
where g.user_id = '<target-user-uuid>'
  and g.deleted_at > now() - interval '30 days'
order by g.deleted_at desc;
```

### 3.2 Recover Draft to a New Session

```sql
-- 1. Create a new writing session for the recovered content
insert into public.writing_sessions (
  user_id, started_at, ended_at,
  duration_seconds, target_words, words_written,
  guillotine_triggered, grace_token_used, status
) values (
  '<target-user-uuid>',
  now(),
  now(),
  0,      -- duration is unknown; treat as unsessioned
  0,      -- no target word goal set
  <word_count>,
  false,  -- recovered draft is not guillotined
  false,
  'completed'
)
returning id into recovered_session_id;

-- 2. Insert the recovered draft
insert into public.drafts (
  session_id, user_id, content, word_count
) values (
  recovered_session_id,
  '<target-user-uuid>',
  '<graveyard-content>',
  <word_count>
);

-- 3. Optionally, delete the graveyard record to avoid double-recovery
-- delete from public.graveyard where id = '<graveyard-record-id>';
```

### 3.3 Export for Offline Delivery

If the user's session is still broken and they cannot receive the draft in-app:

```sql
-- Output the content as a plain-text export
copy (
  select content
  from public.graveyard
  where id = '<graveyard-record-id>'
) to '/tmp/recovered_draft.txt';
```

Then deliver the file to the user through a secure side-channel (encrypted email, support ticket attachment).

---

## 4. Sync Service Reset Procedure

If the Sync Service is stuck in `ERROR` or `OFFLINE` state and cannot recover:

1. **Verify Supabase key rotation hasn't invalidated the client key:**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" \
     -H "apikey: $VITE_SUPABASE_ANON_KEY" \
     "https://<project>.supabase.co/rest/v1/profiles?limit=1"
   ```
   Expected: `200` (or `401` if RLS is blocking — this is actually normal).

2. **Force the client to re-authenticate:**
   In the browser console:
   ```js
   localStorage.removeItem('sb-<project-ref>-auth-token');
   location.reload();
   ```
   This clears the cached Supabase auth session and forces a fresh `signInAnonymously()` handshake.

3. **Escalate:** If step 2 does not resolve the issue, escalate to the Supabase project owner. Provide:
   - The user's `auth.uid()` (from browser console: `localStorage` key `sb-<project-ref>-auth-token` → parse `user.id`)
   - The exact error from the browser console's Network tab for `POST /rest/v1/...`

---

## 5. Preventing Recurrence

Update the Sync Service debounce parameters or add a health-check endpoint if this pattern repeats:
- Add a periodic `GET /rest/v1/health` ping in the `onTick` handler.
- Log the `sessionId` and `_syncStatus` to a local metrics store (`localStorage['deepflow_metrics']`).

---

*Document version: 1.0 — Phase 5 (Trigger)*
