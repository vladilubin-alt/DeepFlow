# Session History Protocol — Retention & Focus Analytics

**Classification:** Data Logic  
**Scope:** Daily writing volume tracking, streak preservation mechanics, Focus Score calculation, and Supabase query patterns for the /history dashboard.

---

## 1. Word Count Trend

### 1.1 Data Source

The `writing_sessions` table records every completed timer session. The trend aggregates daily word counts:

```sql
select
  started_at::date as day,
  sum(words_written) as total_words,
  count(*) as session_count,
  bool_or(guillotine_triggered) as had_guillotine
from writing_sessions
where user_id = auth.uid()
  and started_at >= now() - interval '30 days'
  and status in ('completed', 'saved_by_grace', 'guillotined')
group by started_at::date
order by day asc;
```

### 1.2 Chart Rendering

- **Library:** Recharts `AreaChart` (already installed)
- **Granularity:** 1 bar per day for the last 30 days
- **Fill:** Gradient from `#EF9F27` (champagne) to transparent
- **Tooltip:** Day, total words, session count
- **Empty state:** Grey placeholder line at 25% height with "Start your first session to see your trend"

### 1.3 Weekly Rolling Average

Overlay a dashed `Line` component showing the 7-day rolling average to smooth ADHD variability spikes:
```sql
avg(words_written) over (order by day rows between 6 preceding and current row)
```

(Calculated client-side from the aggregated daily data.)

---

## 2. Streak Preservation Logic

### 2.1 Definition

A **streak** is the number of consecutive calendar days (UTC) on which the user completed at least one writing session with status `completed` or `saved_by_grace`.

```js
function calcStreak(sessions) {
  const activeDates = new Set(
    sessions.map(s => s.started_at.split('T')[0])
  );
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split('T')[0];
    if (activeDates.has(key)) {
      streak++;
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
```

### 2.2 Grace Token Streak Protection

Using a Grace Token does **not** break the streak. If a session transitions to `guillotined` and the user burns a token to reach `saved_by_grace`, the day still counts as active.

| Session Status | Counts Toward Streak? |
|---------------|----------------------|
| `completed` | ✅ Yes |
| `saved_by_grace` | ✅ Yes (token was used) |
| `guillotined` | ❌ No (user gave up or token exhausted) |
| `active` | ❌ No (session in progress / incomplete) |

### 2.3 UI Reflection

The StreakCalendar component highlights:
- **Solid gold** (`bg-champagne text-deep-slate`): Days with at least one completed/saved_by_grace session
- **Muted active** (`bg-champagne/15 text-champagne`): Today (if no session yet today)
- **Dark** (`bg-deep-slate text-stone-600`): Days with no session

### 2.4 Streak Reset

Streak resets to 0 when:
- The `giveUp()` action is called
- A full calendar day passes with zero completed sessions AND the user has no Grace Tokens remaining

---

## 3. Focus Score

### 3.1 Formula

A per-session quality metric combining writing velocity and target achievement, penalized by guillotine events:

```
focusScore = (wpm / 40) * 50 + targetRatio * 50 - guillotinePenalty * 100
```

Where:
- **wpm** = `words_written / (duration_seconds / 60)`
- **targetRatio** = `min(1, words_written / target_words)`
- **guillotinePenalty** = `0.3` if `guillotine_triggered`, else `0`
- **Clamp**: `max(0, min(100, result))`

### 3.2 Interpretation

| Score Range | Label | Colour |
|-------------|-------|--------|
| 80–100 | Deep Flow | `#1D9E75` (emerald) |
| 50–79 | Steady | `#EF9F27` (champagne) |
| 20–49 | Rough | `#E24B4A` (danger) |
| 0–19 | Guillotined | `#A32D2D` (danger dark) |

### 3.3 Display

Shown as a stat card when tapping a session row in the history list:
```
┌─────────────────────────────────┐
│  Focus Score     WPM     Target │
│      72          18       84%   │
└─────────────────────────────────┘
```

---

## 4. Supabase Query Patterns

### 4.1 Session List (Last 50)

```js
const { data, error } = await supabase
  .from('writing_sessions')
  .select('*')
  .order('started_at', { ascending: false })
  .limit(50);
```

### 4.2 Daily Aggregate (30-Day Trend)

```js
const { data, error } = await supabase
  .from('writing_sessions')
  .select('started_at, words_written, guillotine_triggered, status')
  .gte('started_at', new Date(Date.now() - 30 * 86400000).toISOString())
  .in('status', ['completed', 'saved_by_grace', 'guillotined'])
  .order('started_at', { ascending: true });
```

### 4.3 Caching Strategy

- **localStorage** key: `deepflow_session_history`
- Written after every successful fetch
- Served on next load while the network request is in flight (stale-while-revalidate)
- Cleared on sign-out

---

*Document version: 1.0 — Phase 5.2 Session History Protocol*
