-- Add placement-related columns to experts
alter table public.experts
  add column if not exists company text,
  add column if not exists interview_date date,
  add column if not exists package_lpa numeric(5, 2),
  add column if not exists proof_url text;

-- Fix storage: allow anon/public uploads since placed-guru has no auth gate
-- (photos and proof documents uploaded directly from browser)

drop policy if exists "Authenticated can upload expert photos" on storage.objects;

create policy "Anyone can upload expert photos"
  on storage.objects for insert
  with check (bucket_id = 'expert-photos');

create policy "Anyone can update expert photos"
  on storage.objects for update
  using (bucket_id = 'expert-photos');

-- Proof documents bucket (offer letters, screenshots, etc.)
insert into storage.buckets (id, name, public)
  values ('expert-proofs', 'expert-proofs', true)
  on conflict (id) do nothing;

create policy "Anyone can view expert proofs"
  on storage.objects for select
  using (bucket_id = 'expert-proofs');

create policy "Anyone can upload expert proofs"
  on storage.objects for insert
  with check (bucket_id = 'expert-proofs');
