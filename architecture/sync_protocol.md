# Cloud-Sync Guardrails & Graveyard Protocol

This document outlines the synchronization rules, offline resilience protocols, and vault backup routines for the DeepFlow local-first architecture.

---

## 1. Local-First Write Path

To ensure zero writing data is ever lost due to network latency, connection drops, or database errors:

```mermaid
graph TD
    A[User Keystroke] --> B[Local Draft Storage]
    B --> C{Network Status}
    C -- Online --> D[Debounced Supabase Push]
    C -- Offline --> E[Mark Local Draft Unsynced]
    E --> F[Retransmit Queue on Connection Restore]
```

1. **Keystroke Capture**: When the user types, the draft content is immediately persisted to `localStorage` (via `SyncService.saveDraftLocally`) under the key `draft:<session_id>`.
2. **Debounce Queue**: The remote synchronization to the Supabase `drafts` table is debounced by `5000ms`.
3. **Synchronous Flush**: During critical transitions (e.g. Session Completed, Guillotined, Give Up), the debounce timer is bypassed, and the sync service executes a blocking flush of the draft to ensure the cloud record is up-to-date.

---

## 2. The Graveyard Protocol (Tiered Vault Backup)

When a session enters the `GUILLOTINED` state (idle warning expires), the app must execute a backup of the text to a secure, isolated schema. This isolates abandoned draft data from the active writing environment but preserves it for potential recovery.

1. **Trigger**: Transition to `STATES.GUILLOTINED`.
2. **Action**:
   - The sync service executes `flush()` to write the latest draft content to the database.
   - A copy is inserted into the `graveyard` table:
     ```sql
     insert into public.graveyard (session_id, user_id, content, word_count, deleted_at)
     values (session_id, user_id, content, word_count, now());
     ```
   - Once successfully written to the graveyard, the active draft record in `drafts` can be pruned to keep the active database light.
3. **Recovery Window**:
   - Graveyard backups are held for `30 days`. After 30 days, a cron job or database trigger deletes expired graveyard items.
   - Recovery is restricted: users cannot query the `graveyard` table directly from the app interface unless they trigger the recovery protocol (requiring a token or premium status).

---

## 3. Row Level Security (RLS) Guardrails

All synchronization tables must enforce strict RLS to isolate user data.
- **Profiles Table**: Users can view and update only their own profile row.
- **Writing Sessions Table**: Users can view, insert, and update only sessions where `auth.uid() = user_id`.
- **Drafts Table**: Users can view, insert, update, and delete only drafts where `auth.uid() = user_id`.
- **Graveyard Table**: Users can insert only their own records, and query them only during an active authorized recovery phase.

---

## 4. Anonymous Auth Flow

The client must obtain an authenticated Supabase session before any RLS-protected writes can succeed. Since DeepFlow does not require a traditional sign-up, it uses Supabase Anonymous Auth (`signInAnonymously()`) to provision a stable `auth.uid()` for each device.

### 4.1 App Mount Handshake

```mermaid
sequenceDiagram
    participant App as App Mount
    participant Supabase as Supabase Auth
    participant Session as DeepFlowSession
    participant Sync as SyncService

    App->>Supabase: signInAnonymously()
    Supabase-->>App: { user, session }
    App->>Sync: setAuthToken(session.access_token)
    App->>Session: start(user.id)
    Note over Session,Sync: All subsequent REST API calls<br/>use Bearer {access_token}
    Note over Supabase: RLS: auth.uid() = user_id
```

### 4.2 Implementation Rules

1. **Timing**: `signInAnonymously()` fires once on application mount (in `App.jsx` root effect), before any session can be started.
2. **Token Propagation**: The returned `session.access_token` is passed to `SyncService.setAuthToken()` so every Supabase REST request includes `Authorization: Bearer <access_token>` instead of the anon key.
3. **User ID Propagation**: The `user.id` (a UUID) replaces the placeholder `'local'` string in `DeepFlowSession.start()`.
4. **Session Persistence**: Supabase stores the anonymous session in `localStorage`, so returning users keep the same `auth.uid()` across page reloads — preserving their RLS identity and profile data.
5. **RLS Enforcement**: Every table policy checks `auth.uid() = user_id`. Without an authenticated session, all writes return 401/403 and silently fail (logged as errors). The Graveyard table additionally has a FK constraint referencing `profiles(id)`, so a profile must exist (auto-created by the `handle_new_user` trigger on `auth.users` insert).

### 4.3 Auth State Lifecycle

| Phase | Action | RLS Outcome |
|-------|--------|-------------|
| App mount | `signInAnonymously()` | `auth.uid()` available |
| Session start | `start(user.id)` | All writes pass RLS |
| Guillotine | `saveToGraveyard()` | Insert succeeds (auth.uid() = user_id) |
| Page reload | Supabase restores session from localStorage | `auth.uid()` restored |
| Clear data / incognito | New anonymous session created | New user, new RLS identity |
