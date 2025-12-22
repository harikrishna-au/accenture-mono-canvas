-- Remove foreign key constraint linking to Supabase Auth users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Change user_id to TEXT to support Clerk IDs (strings)
ALTER TABLE profiles ALTER COLUMN user_id TYPE text;

-- Update RLS policies
-- Since we are using Clerk without full integration, existing auth.uid() policies won't work for reads.
-- We'll allow public read access so the frontend can check premium status.
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);
