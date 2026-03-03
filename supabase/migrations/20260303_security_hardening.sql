-- ─────────────────────────────────────────────────────────────────────────────
-- Security hardening migration
-- Run this in Supabase SQL Editor before launch
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Partial unique index: prevents two active bookings for the same expert slot
--    Allows re-booking a slot only after it has been declined/cancelled
CREATE UNIQUE INDEX IF NOT EXISTS unique_expert_active_slot
  ON bookings (expert_id, date, start_time)
  WHERE status IN ('paid', 'confirmed');

-- 2. Audit column: track when booking status last changed (confirmed, declined, etc.)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. Fix messages table Relationships (FK to experts)
--    The table was created without an explicit FK constraint name — add it now
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'messages_expert_id_fkey'
      AND table_name = 'messages'
  ) THEN
    ALTER TABLE messages
      ADD CONSTRAINT messages_expert_id_fkey
      FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Tighten bookings RLS
--    Drop the fully-open SELECT policy; replace with one that at minimum
--    documents the intended scope. A full fix requires moving My Bookings
--    queries to a SECURITY DEFINER RPC (scheduled for next sprint).
DROP POLICY IF EXISTS "Anyone can view bookings" ON bookings;

-- Users can read bookings where they know the email (used by My Bookings modal)
-- Experts can read bookings for their own profiles (filtered by expert_id in app)
-- NOTE: This still permits anon SELECT; full row-level isolation requires
--       moving the query to an edge function with auth context.
CREATE POLICY "Anon can read bookings" ON bookings
  FOR SELECT USING (true);

-- 5. Rate-limit helper: track DM sends per sender+expert (one row per combo)
--    The app enforces a 30s client-side cooldown; this table lets you add
--    server-side enforcement via a trigger or edge function if needed.
CREATE TABLE IF NOT EXISTS message_rate_limits (
  sender_email  text NOT NULL,
  expert_id     uuid NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  last_sent_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (sender_email, expert_id)
);

ALTER TABLE message_rate_limits ENABLE ROW LEVEL SECURITY;
-- Only the service role can read/write this table
CREATE POLICY "Service role only" ON message_rate_limits
  FOR ALL USING (false);
