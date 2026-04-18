-- Add subscription columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text;

-- Existing premium users are grandfathered as lifetime
UPDATE profiles SET plan_type = 'lifetime' WHERE is_premium = true AND plan_type = 'none';
