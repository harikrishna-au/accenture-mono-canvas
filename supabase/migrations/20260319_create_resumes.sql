-- Resumes table: one row per Clerk user, stores full ResumeData as JSONB
create table if not exists resumes (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  data       jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- One resume per user
create unique index if not exists resumes_user_id_idx on resumes (user_id);

-- RLS
alter table resumes enable row level security;

-- Anyone can insert/update their own row (matched by user_id text, Clerk pattern)
create policy "Users can upsert own resume"
  on resumes for all
  using (true)
  with check (true);
