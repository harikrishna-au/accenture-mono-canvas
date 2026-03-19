create table if not exists jobs (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  company          text,
  type             text not null default 'Full-time',
  location         text,
  skills_required  text[] default '{}',
  description      text,
  apply_url        text,
  package_lpa      numeric,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

alter table jobs enable row level security;

-- Public can read active jobs
create policy "Public read active jobs" on jobs for select using (active = true);

-- Admin writes (no auth check — protected by admin password on the frontend)
create policy "Admin full access" on jobs for all using (true) with check (true);
