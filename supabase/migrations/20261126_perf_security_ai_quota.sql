-- DayAct — performance & security hardening + daily AI quota
-- Applied 2026-11-26. Safe to re-run.

-- 1. RLS policies: evaluate auth.uid() once per query instead of once per row,
--    and only for signed-in users.
drop policy if exists "own profile - select" on public.profiles;
drop policy if exists "own profile - update" on public.profiles;
drop policy if exists "own profile - insert" on public.profiles;
create policy "own profile - select" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "own profile - update" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "own profile - insert" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "own tasks - all" on public.tasks;
create policy "own tasks - all" on public.tasks
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own moods - all" on public.moods;
create policy "own moods - all" on public.moods
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own habits - all" on public.habits;
create policy "own habits - all" on public.habits
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own habit_logs - all" on public.habit_logs;
create policy "own habit_logs - all" on public.habit_logs
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 2. Missing index: habit logs are always read per user and date range.
create index if not exists habit_logs_user_date_idx on public.habit_logs (user_id, log_date);

-- 3. The sign-up trigger function must not be callable through the public API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 4. Daily AI quota (protects the free Gemini key from abuse).
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  count integer not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
drop policy if exists "own ai_usage - select" on public.ai_usage;
create policy "own ai_usage - select" on public.ai_usage
  for select to authenticated using ((select auth.uid()) = user_id);

-- Atomically uses one AI request for the signed-in user.
-- Returns the number of requests left today, or -1 if the limit is reached.
create or replace function public.consume_ai_quota(daily_limit integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  used integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.ai_usage as u (user_id, day, count)
  values (uid, current_date, 1)
  on conflict (user_id, day) do update
    set count = u.count + 1
    where u.count < daily_limit
  returning u.count into used;

  if used is null then
    return -1;
  end if;
  return daily_limit - used;
end;
$$;
revoke execute on function public.consume_ai_quota(integer) from public, anon;
grant execute on function public.consume_ai_quota(integer) to authenticated;
