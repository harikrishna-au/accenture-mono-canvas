-- The API is stubbornly refusing to see the table.
-- We will "wiggle" the table schema to force Supabase to notice it.

-- 1. Add a dummy column (This forces a schema update event)
ALTER TABLE public.communication_questions ADD COLUMN _force_refresh text;

-- 2. Wait a split second (in human time, effectively)
-- 3. Remove the dummy column
ALTER TABLE public.communication_questions DROP COLUMN _force_refresh;

-- 4. Notify again just in case
NOTIFY pgrst, 'reload config';
