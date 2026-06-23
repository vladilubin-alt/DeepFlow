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

On initial launch, users are bucketed into one of three personas via a 3-question quiz rendered by Superwall.

### Question 1 — Primary Pain Point
> "When writing, I most often struggle with:"
- Running out of time without noticing → **Time Warp**
- Staring at a blank page, unable to start → **Task Freeze**
- Feeling overwhelmed by too many choices → **Decision Fog**

### Question 2 — Secondary Signal
> "My ideal writing session feels:"
- Like a race against the clock → **Time Warp**
- Like a guided meditation → **Task Freeze**
- Like a clear, simple path forward → **Decision Fog**

### Question 3 — Tertiary Confirmation
> "The most important feature for me is:"
- Timer and streak tracking → **Time Warp**
- Prompts and encouragement → **Task Freeze**
- Minimal setup, just write → **Decision Fog**

**Bucket assignment:** Majority vote across 3 questions. Tie → default to Time Warp.

### Per-Flare UI Treatment

| Flare | Default Duration | AI Mode | Sensory Layer | Setup Complexity |
|-------|-----------------|---------|---------------|------------------|
| Time Warp | 45 min | silent | off | Full (all 4 controls) |
| Task Freeze | 25 min | coach | alpha | Simplified (duration + AI mode only) |
| Decision Fog | 25 min | coach | off | Minimal (preset: 25 min, 300 words, coach) |

---

## 4. Trigger Logic

### Trigger 1 — Initial Launch (Flare Quiz)
- **When:** First app open after install (checked via `AsyncStorage` / `localStorage` key `@deepflow/onboarding_complete`).
- **Action:** Superwall presents the Flare Quiz campaign (`campaign_id: onboarding_flare_quiz`).
- **On completion:** Write `@deepflow/flare` to storage with the assigned bucket name. Proceed to session setup with per-flare defaults.
- **Control group:** 10% of users skip the quiz and receive default settings (Time Warp defaults). Measured against quiz-takers for activation lift.

### Trigger 2 — Post-Session "Focus Report"
- **When:** Session transitions to `completed` or `guillotined`.
- **Action:** Superwall presents a "Focus Report" card showing: words written, time elapsed, streak count, focus score. This is a **soft paywall** — no purchase required, but includes an upsell CTA for premium features.
- **A/B Variant A:** Full report with soft upsell at bottom.
- **A/B Variant B:** Teaser report (3 of 5 metrics shown) with gate: "Upgrade to see your full Focus Score breakdown."
- **Measured metric:** Tap-through rate on upsell CTA.

### Trigger 3 — Locked 4th Grace Token
- **When:** User has 0 grace tokens remaining and attempts to use one (either via guillotine rescue or vault recovery).
- **Action:** Superwall presents a paywall offering a 3-pack of Grace Tokens for $0.99.
- **RevenueCat Entitlement:** `extra_grace_tokens` — checked before showing paywall. If already entitled, silently grant the token without paywall.
- **A/B Variant A:** Paywall with one option ($0.99 / 3 tokens).
- **A/B Variant B:** Paywall with two options ($0.99 / 3 tokens, $2.99 / 10 tokens).
- **Measured metric:** Conversion rate, average revenue per paying user (ARPPU).

---

## 5. Superwall → RevenueCat Handshake

```
1. User taps purchase CTA on Superwall paywall
2. Superwall calls RevenueCat.purchasePackage(package)
3. RevenueCat processes through Google Play Billing
4. RevenueCat returns entitlement result (granted / failed)
5. RevenueCat fires entitlement update listener
6. Superwall observes entitlement change → dismisses paywall
7. App reads entitlement state → unlocks feature
```

**Implementation notes:**
- RevenueCat SDK must be initialised **before** Superwall SDK.
- Superwall SDK configured with `purchaseController: 'revenuecat'` (or equivalent API).
- StoreKit Config / Play Billing config files remain in RevenueCat dashboard — not duplicated in Superwall.

---

## 6. Superwall Campaign Configuration

| Campaign ID | Trigger | Paywall Template | Audience |
|-------------|---------|-----------------|----------|
| `onboarding_flare_quiz` | App launch (first) | Quiz (3-step) | New users |
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
| `.env` | `SUPERWALL_API_KEY` (placeholder) |
| `tools/verify_superwall.py` | API key validity + campaign reachability check |
| `gemini.mmd` | Integrations section with Superwall + RevenueCat + Flare schema |
| `task_plan.md` | P2.1 task list inserted before P5 |
