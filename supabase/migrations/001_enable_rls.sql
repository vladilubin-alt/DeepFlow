-- ============================================================
-- DeepFlow — Enable Row-Level Security (RLS)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE)
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "profiles: select own"
    ON profiles FOR SELECT
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "profiles: insert own"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "profiles: update own"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "profiles: delete own"
    ON profiles FOR DELETE
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── writing_sessions ────────────────────────────────────────
ALTER TABLE writing_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "writing_sessions: select own"
    ON writing_sessions FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "writing_sessions: insert own"
    ON writing_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "writing_sessions: update own"
    ON writing_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "writing_sessions: delete own"
    ON writing_sessions FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── graveyard ───────────────────────────────────────────────
ALTER TABLE graveyard ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "graveyard: select own"
    ON graveyard FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "graveyard: insert own"
    ON graveyard FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "graveyard: update own"
    ON graveyard FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "graveyard: delete own"
    ON graveyard FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── drafts (not actively used in app, but exists in schema) ─
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "drafts: select own"
    ON drafts FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "drafts: insert own"
    ON drafts FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "drafts: update own"
    ON drafts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "drafts: delete own"
    ON drafts FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── Verify ──────────────────────────────────────────────────
-- After running, confirm with:
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public'
--     AND tablename IN ('profiles', 'writing_sessions', 'graveyard', 'drafts');
-- All four should show rowsecurity = true
--
-- Then verify policies exist:
--   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
--   FROM pg_policies
--   WHERE schemaname = 'public'
--   ORDER BY tablename, policyname;
