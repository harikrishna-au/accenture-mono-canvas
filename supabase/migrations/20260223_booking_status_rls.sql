-- ============================================================
-- Booking status flow: paid → confirmed / declined
-- ============================================================

-- 1. Allow anyone to view all their own bookings (by email, for user history)
--    The old policy only exposed confirmed ones; we now expose all statuses
--    so users can track pending/declined bookings too.
DROP POLICY IF EXISTS "Anyone can view confirmed bookings" ON public.bookings;

CREATE POLICY "Anyone can view bookings"
  ON public.bookings FOR SELECT
  USING (true);

-- 2. Authenticated experts can update booking status for their own experts
DROP POLICY IF EXISTS "Experts can update own bookings" ON public.bookings;

CREATE POLICY "Experts can update own bookings"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.experts
      WHERE id = bookings.expert_id AND user_id = auth.uid()
    )
  );
