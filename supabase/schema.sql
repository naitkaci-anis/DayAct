-- ============================================================================
-- DayAct — Schéma de base de données (Supabase / PostgreSQL)
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run.
-- Idempotent : peut être relancé sans danger.
-- ============================================================================

-- ── PROFILES ────────────────────────────────────────────────────────────────
-- Une ligne par utilisateur, créée automatiquement à l'inscription.
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  energy       int  not null default 72 check (energy between 0 and 100),
  notifications boolean not null default true,
  ai_suggestions boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── TASKS ───────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null,
  task_date    date not null,
  task_time    text not null,                -- "HH:MM"
  duration_min int  not null default 30,
  priority     text not null default 'medium' check (priority in ('high','medium','low')),
  category     text not null default 'work'  check (category in ('work','health','personal','learning')),
  done         boolean not null default false,
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists tasks_user_date_idx on public.tasks (user_id, task_date);

-- ── MOODS ───────────────────────────────────────────────────────────────────
-- Une humeur par jour et par utilisateur.
create table if not exists public.moods (
  user_id    uuid not null references auth.users (id) on delete cascade,
  mood_date  date not null,
  score      int  not null check (score between 0 and 100),
  created_at timestamptz not null default now(),
  primary key (user_id, mood_date)
);

-- ============================================================================
-- ROW LEVEL SECURITY : chaque utilisateur ne voit que SES données.
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.tasks    enable row level security;
alter table public.moods    enable row level security;

-- profiles
drop policy if exists "own profile - select" on public.profiles;
create policy "own profile - select" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "own profile - update" on public.profiles;
create policy "own profile - update" on public.profiles
  for update using (auth.uid() = id);
drop policy if exists "own profile - insert" on public.profiles;
create policy "own profile - insert" on public.profiles
  for insert with check (auth.uid() = id);

-- tasks
drop policy if exists "own tasks - all" on public.tasks;
create policy "own tasks - all" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- moods
drop policy if exists "own moods - all" on public.moods;
create policy "own moods - all" on public.moods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER : créer automatiquement un profil à l'inscription d'un utilisateur.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
