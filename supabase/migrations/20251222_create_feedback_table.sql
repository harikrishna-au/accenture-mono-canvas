
create table if not exists public.feedback (
  id uuid not null default gen_random_uuid() primary key,
  user_id text,
  name text not null,
  college text not null,
  selected_round text not null, -- 'Yes', 'No', 'Not Sure'
  rating integer not null check (rating >= 1 and rating <= 5),
  technical_round_exp text,
  expected_price integer not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.feedback enable row level security;

-- Allow anyone to insert feedback (authenticated or anonymous if we want, but dashboard is usually auth)
-- Since user might be signed in via Clerk, we'll allow public insert for now to avoid auth complexity, 
-- but we capture user_id if available.
create policy "Enable insert for all users" on public.feedback for insert with check (true);

-- Only service role can read for now (or add admin policy later)
create policy "Enable read access for service role only" on public.feedback for select using (false);
