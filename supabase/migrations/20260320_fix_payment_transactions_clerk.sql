-- Fix payment_transactions to support Clerk user IDs (text strings, not Supabase UUIDs)
-- Same pattern as 20251222_fix_clerk_compatibility.sql which fixed the profiles table

ALTER TABLE public.payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_user_id_fkey;

ALTER TABLE public.payment_transactions ALTER COLUMN user_id TYPE text;
