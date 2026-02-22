-- placed-guru is an intentionally open internal page with no auth gate.
-- Allow anon role to insert into experts and availability directly
-- so the form can write without requiring a deployed edge function.

create policy "Anyone can insert experts"
  on public.experts for insert
  with check (true);

create policy "Anyone can insert availability"
  on public.availability for insert
  with check (true);

-- Allow anon to view all bookings start/end times for conflict checking
-- (the existing policy only returns confirmed bookings, which is correct)
