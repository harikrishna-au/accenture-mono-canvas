-- Add usernames to profiles and keep a separate premium members table in sync.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text;

UPDATE public.profiles
SET username = COALESCE(
  NULLIF(username, ''),
  lower(regexp_replace(split_part(COALESCE(email, ''), '@', 1), '[^a-z0-9]+', '_', 'g'))
    || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)
)
WHERE username IS NULL OR btrim(username) = '';

ALTER TABLE public.profiles
  ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key
  ON public.profiles (username);

CREATE TABLE IF NOT EXISTS public.premium_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  email text NOT NULL,
  username text NOT NULL,
  plan_type text NOT NULL DEFAULT 'premium',
  subscription_id text,
  subscription_status text NOT NULL DEFAULT 'active',
  premium_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage premium members" ON public.premium_members;
CREATE POLICY "Service role can manage premium members"
  ON public.premium_members
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.ensure_profile_username()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS NULL OR btrim(NEW.username) = '' THEN
    NEW.username :=
      lower(regexp_replace(split_part(COALESCE(NEW.email, ''), '@', 1), '[^a-z0-9]+', '_', 'g'))
      || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profile_username ON public.profiles;
CREATE TRIGGER set_profile_username
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.ensure_profile_username();

CREATE OR REPLACE FUNCTION public.sync_premium_member_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_premium THEN
    INSERT INTO public.premium_members (
      user_id,
      email,
      username,
      plan_type,
      subscription_id,
      subscription_status,
      premium_expires_at,
      updated_at
    )
    VALUES (
      NEW.user_id,
      NEW.email,
      NEW.username,
      'premium',
      NEW.stripe_customer_id,
      'active',
      NEW.premium_expires_at,
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      username = EXCLUDED.username,
      plan_type = EXCLUDED.plan_type,
      subscription_id = EXCLUDED.subscription_id,
      subscription_status = EXCLUDED.subscription_status,
      premium_expires_at = EXCLUDED.premium_expires_at,
      updated_at = now();
  ELSE
    DELETE FROM public.premium_members
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_premium_member_record ON public.profiles;
CREATE TRIGGER sync_premium_member_record
AFTER INSERT OR UPDATE OF is_premium, username, email, premium_expires_at, stripe_customer_id
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_premium_member_record();

INSERT INTO public.premium_members (
  user_id,
  email,
  username,
  plan_type,
  subscription_id,
  subscription_status,
  premium_expires_at,
  updated_at
)
SELECT
  user_id,
  email,
  username,
  'premium',
  stripe_customer_id,
  'active',
  premium_expires_at,
  now()
FROM public.profiles
WHERE is_premium = true
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  plan_type = EXCLUDED.plan_type,
  subscription_id = EXCLUDED.subscription_id,
  subscription_status = EXCLUDED.subscription_status,
  premium_expires_at = EXCLUDED.premium_expires_at,
  updated_at = now();
