# DeepFlow — Onboarding Experiment Protocol

**Status:** Draft  
**Owner:** Product / Growth  
**Dependencies:** Superwall SDK → RevenueCat (purchase controller)  
**Last Updated:** 2026-06-23

---

## 1. Purpose

A/B test onboarding flows and paywall triggers to optimise activation (session 1 completion) and retention (day 7 return). Superwall enables server-side campaign changes without app store submissions.

---

## 2. Architecture

```
User Action → Superwall Trigger → Campaign Rule → Paywall / Quiz / Report
                                      │
                                      ▼
                               RevenueCat
                           (entitlement check,
                            receipt validation)
```

**Key constraint:** Superwall **must** use RevenueCat as the underlying purchase controller. All entitlement state (has_grace_tokens, vault_retention_days) lives in RevenueCat. Superwall handles presentation logic only.

---

## 3. Onboarding Schema — The "Flare" Quiz

On initial launch, users are bucketed into one of five Flare personas via a multi-step survey rendered by Superwall (placement: `onboarding_flare_quiz`). The quiz uses a single self-identification question with five options, followed by confirmation.

### Question 1 — Primary Pain Point (single-select)
> "Which feels most like you when you sit down to write?"
1. **"I lose track of time and suddenly the day is gone."** → **Time Warp**
2. **"I stare at a blank page and can't type the first word."** → **Task Freeze**
3. **"I get hyper-focused on formatting, research, or perfecting one sentence."** → **Hyperfocus Hijack**
4. **"There are too many choices — font, topic, structure — I shut down."** → **Decision Fog**
5. **"I write a bit, hate it, delete it, and feel like a fraud."** → **Crash & Guilt**

### Question 2 — Confirmation (single-select)
> "I'd most like my writing session to feel like:"
1. A race I'm afraid of losing → **Time Warp**
2. A safe space with a gentle guide → **Task Freeze**
3. Deep immersion where nothing else exists → **Hyperfocus Hijack**
4. A clear, minimal path with no options → **Decision Fog**
5. Permission to write badly and keep going → **Crash & Guilt**

**Assignment:** The answer to Question 1 determines the Flare. Question 2 confirms or adjusts (if the user picks a conflict, Q1 takes priority). Ties resolve to Time Warp as default.

### Per-Flare UI Treatment

| Flare | Default Duration | AI Mode | Sensory Layer | Setup Complexity | Tone |
|-------|-----------------|---------|---------------|------------------|------|
| Time Warp | 45 min | silent | off | Full (all 4 controls) | Urgent, race-against-clock |
| Task Freeze | 25 min | coach | alpha | Simplified (duration + AI mode) | Gentle, encouraging |
| Hyperfocus Hijack | 30 min | silent | theta | Full (all 4 controls) | Deep-work, minimise friction |
| Decision Fog | 25 min | coach | off | Minimal (preset: 25 min/300w/coach) | Minimal, one-tap start |
| Crash & Guilt | 15 min | demon | off | Minimal (preset: 15 min/100w/demon) | Permission to write badly |

---

## 4. Trigger Logic

### Trigger 1 — Initial Launch (Flare Quiz)
- **Placement:** `onboarding_flare_quiz` (Superwall campaign).
- **When:** First app open after install (checked via `AsyncStorage` / `localStorage` key `@deepflow/onboarding_complete`).
- **Content:** 2-step survey — Question 1 (5 Flare self-ID) → Question 2 (confirmation). Superwall renders the survey natively.
- **Action:** Superwall presents the Flare Quiz campaign. Quiz answers determine the assigned Flare persona.
- **On completion:**
  1. Write `@deepflow/flare` to AsyncStorage with the assigned bucket name (e.g. `"time_warp"`).
  2. Store the flare name as a RevenueCat subscriber attribute: `Purchases.setAttributes({ flare: "time_warp" })` for later segment auditing.
  3. Write `@deepflow/onboarding_complete` to AsyncStorage to prevent re-trigger.
  4. Proceed to Home screen with per-flare defaults applied to SessionSetup (duration, AI mode, sensory layer).
- **Control group:** 10% of users skip the quiz and receive default settings (Time Warp defaults: 45 min, silent, off). Measured against quiz-takers for activation lift.
- **RevenueCat attribute:** `flare` — stored on the customer record for cohort analysis and campaign targeting.

### Trigger 2 — Post-Session "Focus Report"
- **When:** Session transitions to `completed` or `guillotined`.
- **Action:** Superwall presents a "Focus Report" card showing: words written, time elapsed, streak count, focus score. This is a **soft paywall** — no purchase required, but includes an upsell CTA for premium features.
- **A/B Variant A:** Full report with soft upsell at bottom.
- **A/B Variant B:** Teaser report (3 of 5 metrics shown) with gate: "Upgrade to see your full Focus Score breakdown."
- **Measured metric:** Tap-through rate on upsell CTA.

### Trigger 3 — Locked Grace Token Paywall
- **Trigger Condition:** `grace_tokens_available <= 0` AND user taps "Recover" (guillotine rescue or vault recovery).
- **Entitlement Pre-check:** Before showing paywall, check RevenueCat entitlement `extra_grace_tokens`. If already entitled, silently grant 3 tokens and skip paywall entirely.
- **Action:** Superwall presents paywall `grace_token_refill` (campaign `grace_token_pack`). Paywall offers token packs.
- **Post-Purchase Flow:** Upon successful RevenueCat receipt validation:
  1. RevenueCat fires entitlement update listener → app detects `extra_grace_tokens` granted
  2. App increments `grace_tokens` in Supabase `users` table (`UPDATE users SET grace_tokens = grace_tokens + 3 WHERE id = $userId`)
  3. App reads updated token count from Supabase and updates local state
  4. The blocked action (guillotine rescue or vault recovery) proceeds
- **A/B Variant A:** Paywall with one option ($0.99 / 3 tokens).
- **A/B Variant B:** Paywall with two options ($0.99 / 3 tokens, $2.99 / 10 tokens).
- **Measured metric:** Conversion rate, average revenue per paying user (ARPPU).
- **Paywall UI:** Midnight Luxe palette (`#0D0D12` background, `#C9A84C` accent, `#FAF8F5` text). Magnetic button style with 1.03 hover scale. Close button respects safe-area insets (`env(safe-area-inset-top)` on web, `SafeAreaView` on RN).

---

## 5. Superwall → RevenueCat Handshake

```
1. User taps purchase CTA on Superwall paywall
2. Superwall calls RevenueCat.purchasePackage(package)
3. RevenueCat processes through Google Play Billing
4. RevenueCat returns entitlement result (granted / failed)
5. RevenueCat fires entitlement update listener → app detects `extra_grace_tokens`
6. App calls Supabase: `UPDATE users SET grace_tokens = grace_tokens + 3 WHERE id = $userId`
7. App updates local `graceTokens` state from Supabase response
8. Superwall observes entitlement change → dismisses paywall
9. The blocked action (guillotine rescue / vault recovery) proceeds with updated token count
```

**Implementation notes:**
- RevenueCat SDK must be initialised **before** Superwall SDK.
- Superwall SDK configured with `purchaseController: 'revenuecat'` (or equivalent API).
- StoreKit Config / Play Billing config files remain in RevenueCat dashboard — not duplicated in Superwall.

---

## 6. Superwall Campaign Configuration

| Campaign ID | Trigger | Paywall Template | Audience |
|-------------|---------|-----------------|----------|
| `onboarding_flare_quiz` | App launch (first) | Quiz (2-step, 5 Flares) | New users |
| `focus_report` | Session end | Card (metrics + upsell) | All active users |
| `grace_token_pack` | 0 tokens → use attempt | Paywall (1-2 options) | Users at 0 tokens |

**iOS / Android:** Separate campaigns if paywall designs differ by platform.

---

## 7. Metrics & Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Activation rate (session 1 completion) | +15% vs control | Superwall campaign A/B |
| Day 7 retention | +10% vs control | Mixpanel retention cohort |
| Paywall conversion rate (Trigger 3) | ≥5% | RevenueCat dashboard |
| Post-report upsell CTR (Trigger 2) | ≥3% | Superwall analytics |
| ARPPU (first 30 days) | ≥$1.50 | RevenueCat + Mixpanel |

---

## 8. Rollout Plan

1. **Phase 1 — SDK wiring:** Install Superwall + RevenueCat SDKs, configure API keys, verify handshake.
2. **Phase 2 — Trigger 3 (Paywall):** Ship the locked Grace Token purchase flow first — highest revenue impact, simplest UX.
3. **Phase 3 — Trigger 1 (Flare Quiz):** Ship onboarding quiz with per-flare defaults.
4. **Phase 4 — Trigger 2 (Focus Report):** Ship post-session report with A/B variants.
5. **Phase 5 — Full campaign:** All triggers live, 3-way A/B running across onboarding + paywall.

---

## 9. Rollback Procedure

- **Superwall:** Disable any campaign in Superwall dashboard → triggers become no-ops. App continues without paywalls/quizzes.
- **RevenueCat:** Purchases are validated server-side. If Superwall is removed, the app should still check RevenueCat entitlements directly for feature gating.
- **Emergency:** Set `SUPERWALL_API_KEY` to empty string in `.env` → app skips all Superwall initialisation.

---

## 10. Files

| File | Purpose |
|------|---------|
| root `.env` | `SUPERWALL_API_KEY`, `REVENUECAT_API_KEY` (gitignored) |
| `DeepFlowMobile/.env` | Same keys for RN (gitignored, loaded via `react-native-config`) |
| `tools/verify_superwall.py` | API key validity + campaign reachability check |
| `gemini.mmd` | Integrations section with Superwall + RevenueCat + Flare schema |
| `task_plan.md` | P2.1 task list inserted before P5 |
