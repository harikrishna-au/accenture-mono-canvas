-- NUCLEAR OPTION: V2 Table
-- The API is stuck on the old table name. We are moving to a new house.

-- 1. Create the new table
CREATE TABLE public.communication_questions_v2 (
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

-- 2. Copy data from the old table (since you confirmed it has data)
INSERT INTO public.communication_questions_v2 
SELECT * FROM public.communication_questions;

-- 3. Enable RLS
ALTER TABLE public.communication_questions_v2 ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
CREATE POLICY "Allow public read access v2"
  ON public.communication_questions_v2
  FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access v2"
  ON public.communication_questions_v2
  FOR ALL
  USING ( auth.role() = 'service_role' );

-- 5. Force refresh just in case
NOTIFY pgrst, 'reload config';
