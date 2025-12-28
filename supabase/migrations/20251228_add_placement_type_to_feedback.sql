-- Add placement_type and mobile_number columns to feedback table
alter table public.feedback 
add column if not exists mobile_number text,
add column if not exists placement_type text default 'On-Campus';

-- Add comments to describe the columns
comment on column public.feedback.mobile_number is 'User mobile/phone number';
comment on column public.feedback.placement_type is 'Type of placement: On-Campus or Off-Campus';
