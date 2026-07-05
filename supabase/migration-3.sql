-- ============================================================================
-- DayAct — Migration 3 : préférence de rappel par tâche
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run.
-- Idempotent : peut être relancé sans danger.
-- ============================================================================

alter table public.tasks
  add column if not exists reminder text not null default 'auto'
  check (reminder in ('auto', 'none', '10m', '30m', '1h', '3h', '1d'));
