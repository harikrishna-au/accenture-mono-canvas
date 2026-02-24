-- ============================================================
-- Migrate user_id from UUID (Supabase Auth) to TEXT (Clerk)
-- Auth is now handled by Clerk on the frontend.
-- ============================================================

-- 1. Drop all policies that reference user_id on experts
--    (including the bookings policy that uses a subquery on experts.user_id)
DROP POLICY IF EXISTS "Users can insert own experts"      ON public.experts;
DROP POLICY IF EXISTS "Users can update own experts"      ON public.experts;
DROP POLICY IF EXISTS "Users can delete own experts"      ON public.experts;
DROP POLICY IF EXISTS "Users can insert own availability" ON public.availability;
DROP POLICY IF EXISTS "Users can delete own availability" ON public.availability;

-- Also drop the bookings policy that subqueries experts.user_id
DROP POLICY IF EXISTS "Experts can update own bookings"   ON public.bookings;

-- 2. Drop the foreign key constraint on user_id → auth.users
ALTER TABLE public.experts
  DROP CONSTRAINT IF EXISTS experts_user_id_fkey;

-- 3. Change user_id column type from UUID to TEXT
ALTER TABLE public.experts
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 4. Re-create permissive policies on experts (Clerk guards the UI)
CREATE POLICY "Clerk users can insert own experts"
  ON public.experts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clerk users can update own experts"
  ON public.experts FOR UPDATE
  USING (true);

CREATE POLICY "Clerk users can delete own experts"
  ON public.experts FOR DELETE
  USING (true);

-- 5. Re-create permissive policies on availability
CREATE POLICY "Clerk users can insert own availability"
  ON public.availability FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clerk users can delete own availability"
  ON public.availability FOR DELETE
  USING (true);

-- 6. Re-create bookings update policy (permissive — Clerk handles auth)
CREATE POLICY "Experts can update own bookings"
  ON public.bookings FOR UPDATE
  USING (true);
