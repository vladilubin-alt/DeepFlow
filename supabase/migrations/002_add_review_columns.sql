-- ============================================================
-- DeepFlow — Add Review Request columns to profiles
-- Run: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run (uses IF NOT EXISTS)
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_been_prompted boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purchase_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS review_cooldown_until timestamp with time zone;

COMMENT ON COLUMN profiles.has_been_prompted IS 'Single-pass guard: true after first review prompt, never show again';
COMMENT ON COLUMN profiles.purchase_count IS 'Tracks total purchases; review triggers on 0→1 transition';
COMMENT ON COLUMN profiles.review_cooldown_until IS '30-day global cooldown after dismissing the review modal';
