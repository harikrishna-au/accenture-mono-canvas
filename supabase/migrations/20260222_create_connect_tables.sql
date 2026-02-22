-- ============================================================
-- Connect Feature: Experts, Availability, Bookings
-- ============================================================

-- Experts table
create table if not exists public.experts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text,
  bio text,
  skills text[],
  photo_url text,
  price_inr integer default 100,
  created_at timestamp with time zone default now()
);

-- Availability table (recurring weekly slots per expert)
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid references public.experts(id) on delete cascade,
  day_of_week integer, -- 0=Sun, 1=Mon, ..., 6=Sat
  start_time time not null,
  end_time time not null
);

-- Bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid references public.experts(id) on delete set null,
  user_name text,
  user_email text,
  message text,
  date date,
  start_time time,
  end_time time,
  razorpay_order_id text,
  razorpay_payment_id text,
  status text default 'pending', -- pending | confirmed | cancelled
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.experts enable row level security;
alter table public.availability enable row level security;
alter table public.bookings enable row level security;

-- Experts: public read, service role full access
create policy "Anyone can view experts"
  on public.experts for select using (true);

create policy "Service role can manage experts"
  on public.experts for all using (auth.role() = 'service_role');

-- Availability: public read, service role full access
create policy "Anyone can view availability"
  on public.availability for select using (true);

create policy "Service role can manage availability"
  on public.availability for all using (auth.role() = 'service_role');

-- Bookings: anyone can read confirmed bookings (for slot conflict checks)
-- service role handles inserts after payment verification
create policy "Anyone can view confirmed bookings"
  on public.bookings for select using (status = 'confirmed');

create policy "Service role can manage bookings"
  on public.bookings for all using (auth.role() = 'service_role');

-- Storage bucket for expert profile photos
insert into storage.buckets (id, name, public)
  values ('expert-photos', 'expert-photos', true)
  on conflict (id) do nothing;

-- Storage policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects'
    and policyname = 'Anyone can view expert photos'
  ) then
    create policy "Anyone can view expert photos"
      on storage.objects for select
      using (bucket_id = 'expert-photos');
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'objects'
    and policyname = 'Authenticated can upload expert photos'
  ) then
    create policy "Authenticated can upload expert photos"
      on storage.objects for insert
      with check (bucket_id = 'expert-photos' and auth.role() in ('authenticated', 'service_role'));
  end if;
end $$;
