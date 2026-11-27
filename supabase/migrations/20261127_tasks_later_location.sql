-- DayAct — "À reprogrammer", lieu et compteur de reports sur les tâches.
-- Additive only: existing rows keep working.
alter table public.tasks add column if not exists someday boolean not null default false;
alter table public.tasks add column if not exists location text;
alter table public.tasks add column if not exists postpone_count integer not null default 0;
