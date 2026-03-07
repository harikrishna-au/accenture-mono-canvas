-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: Bookings table PII exposure
-- Replace open anon SELECT policy with a SECURITY DEFINER RPC that scopes
-- results to a single email address, preventing full-table dumps.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Drop the unrestricted SELECT policy
DROP POLICY IF EXISTS "Anon can read bookings" ON bookings;

-- 2. Block direct SELECT on the bookings table entirely
CREATE POLICY "No direct select on bookings" ON bookings
  FOR SELECT USING (false);

-- 3. SECURITY DEFINER function: returns bookings for one email only.
--    Callers cannot enumerate other users' bookings because they must supply
--    an exact email address and only rows matching that email are returned.
CREATE OR REPLACE FUNCTION get_bookings_by_email(p_email text)
RETURNS TABLE (
  id           uuid,
  expert_id    uuid,
  user_name    text,
  user_email   text,
  message      text,
  date         date,
  start_time   time,
  end_time     time,
  meet_link    text,
  status       text,
  created_at   timestamptz,
  updated_at   timestamptz,
  experts      jsonb
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql AS $$
  SELECT
    b.id,
    b.expert_id,
    b.user_name,
    b.user_email,
    b.message,
    b.date,
    b.start_time,
    b.end_time,
    b.meet_link,
    b.status,
    b.created_at,
    b.updated_at,
    jsonb_build_object(
      'id',        e.id,
      'name',      e.name,
      'title',     e.title,
      'photo_url', e.photo_url
    ) AS experts
  FROM bookings b
  LEFT JOIN experts e ON e.id = b.expert_id
  WHERE lower(b.user_email) = lower(p_email)
  ORDER BY b.date DESC;
$$;

-- Allow anon and authenticated roles to call the function
GRANT EXECUTE ON FUNCTION get_bookings_by_email(text) TO anon, authenticated;
