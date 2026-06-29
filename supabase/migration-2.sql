-- ============================================================================
-- DayAct — Migration 2 : suivi du temps, récurrence, habitudes
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run.
-- Idempotent : peut être relancé sans danger.
-- ============================================================================

-- ── Tâches : temps passé + récurrence ───────────────────────────────────────
alter table public.tasks
  add column if not exists time_spent_min int not null default 0;

alter table public.tasks
  add column if not exists recurrence text not null default 'none'
  check (recurrence in ('none', 'daily', 'weekdays', 'weekly'));

-- ── HABITUDES ───────────────────────────────────────────────────────────────
create table if not exists public.habits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  emoji      text not null default '✅',
  color      text not null default '#06b6d4',
  created_at timestamptz not null default now()
);

create index if not exists habits_user_idx on public.habits (user_id);

-- Une coche par habitude et par jour.
create table if not exists public.habit_logs (
  user_id   uuid not null references auth.users (id) on delete cascade,
  habit_id  uuid not null references public.habits (id) on delete cascade,
  log_date  date not null,
  primary key (habit_id, log_date)
);

-- ── Sécurité (RLS) ──────────────────────────────────────────────────────────
alter table public.habits     enable row level security;
alter table public.habit_logs enable row level security;

drop policy if exists "own habits - all" on public.habits;
create policy "own habits - all" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own habit_logs - all" on public.habit_logs;
create policy "own habit_logs - all" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
