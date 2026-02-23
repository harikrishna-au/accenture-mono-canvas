-- ============================================================
-- Add user_id to experts table + proper per-user RLS
-- This replaces the old "anyone can insert" open policies.
-- Placed-guru page now requires Supabase Auth (email/password).
-- ============================================================

-- 1. Add user_id column (nullable so existing rows aren't broken)
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Drop old permissive anon-insert policies
DROP POLICY IF EXISTS "Anyone can insert experts"     ON public.experts;
DROP POLICY IF EXISTS "Anyone can insert availability" ON public.availability;

-- 3. Experts: authenticated users can insert/update/delete their own rows
DROP POLICY IF EXISTS "Users can insert own experts"  ON public.experts;
DROP POLICY IF EXISTS "Users can update own experts"  ON public.experts;
DROP POLICY IF EXISTS "Users can delete own experts"  ON public.experts;

CREATE POLICY "Users can insert own experts"
  ON public.experts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own experts"
  ON public.experts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experts"
  ON public.experts FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Availability: authenticated users can insert/delete rows for their own experts
DROP POLICY IF EXISTS "Users can insert own availability" ON public.availability;
DROP POLICY IF EXISTS "Users can delete own availability" ON public.availability;

CREATE POLICY "Users can insert own availability"
  ON public.availability FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.experts
      WHERE id = expert_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own availability"
  ON public.availability FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.experts
      WHERE id = expert_id AND user_id = auth.uid()
    )
  );

-- 5. Storage: require auth for uploads (drop open anon policies)
DROP POLICY IF EXISTS "Anyone can upload expert photos"          ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update expert photos"          ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload expert proofs"          ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload expert photos"   ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update expert photos"   ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload expert proofs"   ON storage.objects;

CREATE POLICY "Authenticated can upload expert photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'expert-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update expert photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'expert-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated can upload expert proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'expert-proofs' AND auth.role() = 'authenticated');
