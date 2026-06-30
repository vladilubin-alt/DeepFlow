# ASO Strategy — DeepFlow (v1.0 Launch)

## Objective

Achieve Top 10 placement for "focus writing app" keyword in Google Play Store search within 90 days of launch, driving sustainable organic acquisition to hit $50k/month MRR trajectory.

## Strategy Pillars

### 1. Keyword Sniping (Title & Short Desc)

The app title MUST contain our highest-volume keyword. Research from `architecture/findings.md` identifies "focus writing app", "Pomodoro timer", and "distraction-free" as top targets.

**Recommended name format:** `FlowWrite — Focus Timer` (leverages both "focus" and "timer" keywords while keeping brand presence).

### 2. Custom Store Listings (CSLs)

Three separate listings targeting different search intents:

| Listing | Primary Keywords | Tone | Screenshot Focus |
|---------|-----------------|------|-----------------|
| ADHD Focus | ADHD writing app, time blindness, focus timer | Empathetic, Knowing Nod | Flow Orb + Streak Calendar |
| Pomodoro Writing | Pomodoro writing, distraction-free, writing sprints | Utility-first, direct | Timer UI + Focus Score |
| Zen Writer | deep work timer, novel writing, Zen writing | Minimalist, aspirational | Binaural UI + Grace Tokens |

### 3. Screenshot A/B Testing

First screenshot in every listing MUST show the most visually impressive feature:
- **ADHD Focus:** Flow Orb (the glowing timer circle)
- **Pomodoro Writing:** Bento Streak Calendar (consistency visualization)
- **Zen Writer:** Dark mode editor with binaural controls

### 4. Review & Rating Management

- Target: 4.0+ rating within first 30 days
- Response time: 24-48h for every review
- Turn fixed bugs (e.g., PRIVACY_URL crash) into response opportunities
- Trigger In-App Review API after high Focus Score sessions (+80) and successful payments

### 5. Content Layering (Long Description)

The first 3 lines of every long description must contain the primary keyword. See `marketing/aso_descriptions.md` for full drafts.

## Post-Launch Monitoring

Track keyword rankings weekly via Play Console. Update `architecture/findings.md` Scorecard with actual metrics vs. targets. Pivot CSL strategy at 30-day mark based on conversion data.

## Keyword Cannibalization Prevention

Ensure each CSL targets distinct keyword clusters. ADHD listing should NOT compete for "Pomodoro" keywords — that listing owns them. Use Play Console Search Analysis to monitor overlap.

---

*Strategy document: v1.0 — Launch Day. Reference findings.md for keyword data and aso_descriptions.md for copy.*
