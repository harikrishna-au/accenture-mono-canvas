-- AGGRESSIVE DEBUGGING SCRIPT
-- Run this in Supabase SQL Editor

-- 1. Ensure the schema is accessible
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant explicit SELECT permissions to all roles
GRANT SELECT ON public.communication_questions TO anon, authenticated, service_role;

-- 3. Temporarily DISABLE Row Level Security (RLS) to rule out policy issues
ALTER TABLE public.communication_questions DISABLE ROW LEVEL SECURITY;

-- 4. Force Schema Cache Reload again
NOTIFY pgrst, 'reload config';
