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

## Metrics Scorecard (Post-Launch KPIs)

| Metric | Target | Week 1 | Week 2 | Week 3 | Week 4 |
|--------|--------|--------|--------|--------|--------|
| Crash rate | < 1% | — | — | — | — |
| API error rate | < 0.1% | — | — | — | — |
| Session abandonment | < 30% | — | — | — | — |
| Trial → paid conversion | > 5% | — | — | — | — |
| DAU | TBD | — | — | — | — |
| Avg session duration | TBD | — | — | — | — |
| Rating | ≥ 4.0 | — | — | — | — |
| Reviews responded | 100% within 48h | — | — | — | — |

## Market Research Archive

### Focus Flare Categories (Onboarding Personas)
1. **Time Warp** — Users who lose track of time. Timer-dominant UI, emphasis on session duration and streaks.
2. **Task Freeze** — Users who struggle to start. AI coach-dominant UI, emphasis on nudge prompts and grace tokens.
3. **Decision Fog** — Users overwhelmed by choices. Simplified setup, minimal controls, opinionated presets.
