-- Add graduating_year column and remove selected_round and rating columns
alter table public.feedback 
add column if not exists graduating_year text;

-- Drop the columns that are no longer needed
alter table public.feedback 
drop column if exists selected_round,
drop column if exists rating;

-- Add comment to describe the new column
comment on column public.feedback.graduating_year is 'Year of graduation (e.g., 2024)';
