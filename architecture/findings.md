# DeepFlow — Findings & Ground Truth (v1.0)

## Production Constraints

| Constraint | Target | Verified |
|-----------|--------|----------|
| APK size (performance moat) | ≤ 4.1 MB | Debug APK ~4.5 MB (Hermes + ProGuard release target) |
| Crash rate (Android) | < 1% | Firebase Crashlytics TBD after launch |
| API error rate | < 0.1% | Supabase Dashboard TBD |
| Session abandonment | < 30% | Mixpanel TBD |
| RevenueCat trial → paid conversion | > 5% | RevenueCat Dashboard TBD |
| Signed AAB for Play Store | Required | Release keystore generated + ProGuard/Hermes enabled |
| RLS on all tables | Required | Verified: profiles, writing_sessions, graveyard, drafts |

## KPI Targets (Post-Launch Scorecard)

| Metric | Target | Tool | Alert Threshold |
|--------|--------|------|-----------------|
| Crash rate | < 1% | Firebase Crashlytics | > 2% → halt feature deploys |
| ANR rate | < 0.05% | Google Play Console | > 0.1% → investigate |
| API error rate (4xx/5xx) | < 1% | Supabase Dashboard | > 5% → rollback |
| Session abandonment rate | < 30% | Mixpanel funnel | > 40% → review onboarding |
| Trial → paid conversion | > 5% | RevenueCat | < 3% → adjust paywall |
| DAU (Week 1) | TBD | Mixpanel | N/A — establish baseline |
| Avg session duration | ≥ 15 min | Mixpanel | < 10 min → review UX |
| App Store rating | ≥ 4.0 | Google Play Console | < 3.5 → respond to reviews |
| Review response time | < 48h | Manual | > 72h → reassign coverage |
| GDPR deletion requests | < 48h response | Support email | > 72h → escalate |
| Auth failure rate | < 1% | Supabase Auth logs | > 5% → rate-limit check |

## ASO Keyword Research

### Primary Keywords (Top Priority)
| Keyword | Search Volume | Competition | Notes |
|---------|--------------|-------------|-------|
| focus writing app | High | Medium | Target for title + first description line |
| distraction-free | Medium | Low | Strong differentiator for AuDHD audience |
| Pomodoro timer | High | High | Use in long-tail: "Pomodoro writing timer" |

### Secondary Keywords
- ADHD writing app
- time blindness timer
- writing sprints
- deep work timer
- novel writing app
- productivity timer
- flow state tool

### Flare-Based Segment Keywords
| Flare | Segment | Keywords |
|-------|---------|----------|
| Time Warp | ADHD/procrastinators | focus timer, time blindness, ADHD writing app |
| Task Freeze | Beginners/anxious | distraction-free, writing sprints, Pomodoro writing |
| Decision Fog | Overwhelmed creatives | deep work timer, flow state, novel writing app |

## ASO Visual Asset Strategy

### Listing 4 — Time Blindness (Priority Screenshot Order)
1. **Hero: Visual Countdown** — Show the FlowOrb growing as time progresses. No numbers, no clock face. Caption: "See time, don't count it."
2. **Forgiving Guillotine** — Split-screen showing the 10-second pause window with the "Grace Token" rescue button. Caption: "Your flow is safe. Even when you pause."
3. **Session Setup** — Minimal controls with duration/word target pickers. Caption: "Set your target. Start writing. Nothing else."
4. **Focus Report** — Post-session metrics (Focus Score, words, streak). Caption: "Data without the shame."
5. **Binaural Audio** — Headphone icon with Alpha/Beta selection. Caption: "Binaural beats for deep focus."

### Screenshot Design Rules
- Dark background (#0D0D12) with Champagne (#C9A84C) accent
- No status bar or device frame — full-bleed app content
- Font: system sans-serif for readability
- Max 3 words per caption overlay
- 16:9 landscape + 9:16 portrait variants per listing

## Market Research Archive

### Focus Flare Categories (Onboarding Personas)
1. **Time Warp** — Users who lose track of time. Timer-dominant UI, emphasis on session duration and streaks.
2. **Task Freeze** — Users who struggle to start. AI coach-dominant UI, emphasis on nudge prompts and grace tokens.
3. **Decision Fog** — Users overwhelmed by choices. Simplified setup, minimal controls, opinionated presets.

### Competitive Moat
- First ADHD-specific writing timer on Play Store with deterministic guillotine mechanic + grace token forgiveness
- Binaural audio engine built into the writing session — not a separate app
- Zero-config onboarding via Flare Quiz — personalises duration, word target, and AI mode in 2 taps
