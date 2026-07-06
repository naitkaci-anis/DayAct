-- ============================================================================
-- DayAct — Migration 4 : sonnerie à l'heure exacte de la tâche
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run.
-- Idempotent : peut être relancé sans danger.
-- ============================================================================

alter table public.tasks
  add column if not exists ring_at_start boolean not null default false;
