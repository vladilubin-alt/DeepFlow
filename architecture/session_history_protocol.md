# Session History Protocol — Analytics, Streaks & ASO

**Classification:** Retention Metrics  
**Scope:** Data fetching logic for `writing_sessions`, streak preservation via Grace Tokens, and ASO keyword placement.

---

## 1. Data Fetching — `writing_sessions` Query

The history view queries Supabase with RLS enforcement:

```sql
select
  id,
  started_at,
  ended_at,
  duration_seconds,
  target_words,
  words_written,
  guillotine_triggered,
  grace_token_used,
  status
from public.writing_sessions
where user_id = auth.uid()
order by started_at desc
limit 50;
```

**Frontend:** `supabase.from('writing_sessions').select('*').order('started_at', { ascending: false }).limit(50)`

### Focus Score Calculation
Each session gets a **Focus Score** derived from WPM variance and completion rate:

```js
function focusScore(session) {
  const durationMin = session.duration_seconds / 60;
  const wpm = durationMin > 0 ? session.words_written / durationMin : 0;
  const targetRatio = session.target_words > 0
    ? Math.min(1, session.words_written / session.target_words)
    : 0;
  const penalty = session.guillotine_triggered ? 0.3 : 0;
  return Math.round(Math.max(0, Math.min(100,
    (wpm / 40) * 50 + targetRatio * 50 - penalty * 100
  )));
}
```

| Factor | Weight | Notes |
|--------|--------|-------|
| WPM (vs 40 wpm baseline) | 50% | 40+ wpm = full score |
| Target completion ratio | 50% | words_written / target_words |
| Guillotine penalty | -30% | Applied if guillotine_triggered = true |

---

## 2. Streak Preservation Logic

Per the Constitution, a "missed day" automatically consumes a **Grace Token** to preserve the streak. This logic lives in the history view's streak calendar.

### 2.1 Algorithm

1. Query all sessions from the last 365 days.
2. Group by date (UTC). Any date with ≥1 session = "active day."
3. Starting from today, walk backward:
   - Active day → streak continues.
   - Missed day → if `grace_tokens > 0`, auto-consume 1 token and mark day as "grace-saved."
   - If no tokens remaining, streak breaks at that date.
4. Display: consecutive streak length, tokens consumed this streak.

### 2.2 Edge Cases

- **Same-day sessions**: Multiple sessions on one day count as a single active day.
- **Midnight rollover**: UTC dates prevent timezone ambiguity.
- **Token exhaustion**: When tokens = 0 and a day is missed, streak resets to 0. Tokens regenerate at 1 per 7 consecutive active days.

### 2.3 Frontend Implementation

```js
function calculateStreak(sessions) {
  const activeDates = new Set(
    sessions.map(s => s.started_at.split('T')[0])
  );
  let streak = 0;
  let tokensUsed = 0;
  let d = new Date();
  while (true) {
    const key = d.toISOString().split('T')[0];
    if (activeDates.has(key)) {
      streak++;
    } else if (tokensUsed < maxTokens) {
      tokensUsed++; // auto-consume
      streak++;
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return { streak, tokensUsed };
}
```

---

## 3. ASO Metadata — Keyword Clusters

Headers and labels in the history view reinforce Play Store search keywords.

| Cluster | Keywords | Used In |
|---------|----------|---------|
| **Focus Timer** | "focus timer, deep work timer, flow state" | History page title, Focus Score labels |
| **ADHD Writing** | "ADHD writing app, writing timer for ADHD" | Session header, streak calendar subtitle |
| **Pomodoro** | "Pomodoro writing, ADHD pomodoro" | Session duration labels, WPM display |

### 3.1 UI Header Copy Guidelines

- Page title: **"Flow History — Focus Timer Analytics"**
- Streak section: **"Focus Streak — ADHD Writing Consistency"**
- Chart heading: **"Word Count Trend — Deep Work Timer"**
- Session card subtitle: **"Pomodoro Session · WPM Analysis"**

---

*Document version: 1.0 — Phase 5 Expansion (P2)*
