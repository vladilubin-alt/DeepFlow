-- ============================================================
-- DeepFlow — Enable Row-Level Security (RLS)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "profiles: select own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (on sign-up)
CREATE POLICY "profiles: insert own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "profiles: delete own"
  ON profiles FOR DELETE
  USING (auth.uid() = id);


-- ── writing_sessions ────────────────────────────────────────
ALTER TABLE writing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "writing_sessions: select own"
  ON writing_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "writing_sessions: insert own"
  ON writing_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "writing_sessions: update own"
  ON writing_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "writing_sessions: delete own"
  ON writing_sessions FOR DELETE
  USING (auth.uid() = user_id);


-- ── graveyard ───────────────────────────────────────────────
ALTER TABLE graveyard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "graveyard: select own"
  ON graveyard FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "graveyard: insert own"
  ON graveyard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "graveyard: update own"
  ON graveyard FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "graveyard: delete own"
  ON graveyard FOR DELETE
  USING (auth.uid() = user_id);


-- ── Verify ──────────────────────────────────────────────────
-- After running, confirm with:
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public'
--     AND tablename IN ('profiles', 'writing_sessions', 'graveyard');
-- All three should show rowsecurity = true
