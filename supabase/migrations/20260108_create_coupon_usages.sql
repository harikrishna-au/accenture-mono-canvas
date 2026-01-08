create table if not exists public.coupon_usages (
    id uuid not null default gen_random_uuid(),
    coupon_code text not null,
    amount numeric,
    created_at timestamp with time zone not null default now(),
    constraint coupon_usages_pkey primary key (id)
);

alter table public.coupon_usages enable row level security;

-- Allow public read access (for the dashboard)
create policy "Allow public read access"
on public.coupon_usages
for select
to public
using (true);

-- Allow service role to insert (from edge function)
create policy "Allow service role insert"
on public.coupon_usages
for insert
to service_role
with check (true);
