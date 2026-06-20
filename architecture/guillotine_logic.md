# Forgiving Guillotine Consequence Tiers & Streak Preservation

This document details the deterministic rules and consequence tiers of the Forgiving Guillotine mechanism in DeepFlow.

---

## 1. Consequence Tiers

The writing session runs on a hierarchical safety system designed to balance high-stakes motivation (painkiller) with ADHD-sympathetic resilience (forgiveness).

### Tier 1: Warning (Active Idle State)
- **Trigger**: No valid keystrokes detected for **5 seconds**.
- **Visuals**: Editor screen tints red, warning banner ticks down from 10 seconds, and tension sounds/pulses activate.
- **Consequence**: None. Writing valid content immediately resets the idle timer and restores normal UI state.

### Tier 2: Guillotined (Suspended State)
- **Trigger**: Warning countdown reaches **0 seconds**.
- **System Actions**:
  - The editor textarea is immediately **disabled** and its contents are **visually blurred**.
  - A copy of the draft is force-flushed to local persistent storage.
  - A backup is silently synced to the remote `graveyard` table (Tiered Vault) to prevent total data loss.
  - The state machine transitions to `GUILLOTINED`.
- **Options**:
  1. **Spend a Grace Token**: Restores the editor, unblurs the text, and allows the user to continue writing. The user's active streak is preserved.
  2. **Give Up / Abandon**: Wipes the screen text completely, terminates the session, and resets the user's active writing streak to `0`.

### Tier 3: Permanent Loss (Wipe State)
- **Trigger**: User selects "Give Up" or closes the app while in the `GUILLOTINED` state.
- **Consequence**: The active draft is deleted from local memory and cannot be recovered in-app. The writing session status is permanently marked as `guillotined`.
- **Mitigation (Tiered Vault)**: The draft is archived in the database `graveyard` table, allowing recovery only through external/premium administrative tools (e.g. paying to rescue a long-term draft or streak).

---

## 2. Streak Preservation Rules

Streaks incentivize daily writing, but streak loss is a primary driver of app abandonment for ADHD individuals due to shame.

1. **Daily Target**: A streak increments when the user completes at least one writing session meeting their target duration and word count.
2. **Grace Token Buffer**:
   - Each user starts with `3` Grace Tokens.
   - Using a Grace Token during a session prevents the session status from becoming `guillotined` (it transitions to `saved_by_grace` and then back to `active` when writing resumes).
   - If the session is successfully completed after using a Grace Token, the daily streak is **preserved**.
3. **Recovery Rule**: Grace Tokens can be earned back (e.g. every 5 consecutive days of completing sessions without using a token grants +1 Grace Token, up to a maximum of 5).
