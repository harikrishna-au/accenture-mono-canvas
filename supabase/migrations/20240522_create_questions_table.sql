-- Create the table
create table public.communication_questions (
  id text primary key,
  section text not null,
  prompt_text text,
  context_audio_src text,
  audio_src text,
  follow_up_question text,
  correct_answer text,
  time_limit integer,
  sub_questions jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.communication_questions enable row level security;

-- Create policy to allow read access for all users (public)
create policy "Allow public read access"
  on public.communication_questions
  for select
  using (true);

-- Create policy to allow insert/update/delete only for authenticated users (or service role)
-- For development simplicity, we might allow full access if needed, but best practice:
create policy "Allow service role full access"
  on public.communication_questions
  for all
  using ( auth.role() = 'service_role' );

-- Optional: Allow anon insert for the seeding script if running from client without service role
-- (Remove this after seeding if production security is concern)
create policy "Allow anon insert for seeding"
  on public.communication_questions
  for insert
  with check (true);
