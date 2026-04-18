-- Add approval status to experts
alter table experts add column if not exists approved boolean not null default false;

-- All existing experts are considered approved (they were manually added before)
update experts set approved = true;
