"use client";

import Link from "next/link";
import {
  useStore,
  tasksForDate,
  moodForDate,
  isHabitDone,
  habitStreak,
  formatLongDate,
  todayISO,
  prettyName,
} from "@/lib/store";
import { useUI } from "@/components/dashboard/UIShell";
import { Timeline } from "@/components/dashboard/Timeline";
import { TaskPanel } from "@/components/spine/TaskPanel";
import { MoodLogger } from "@/components/spine/MoodLogger";
import { Assistant } from "@/components/spine/Assistant";
import {
  PlusIcon,
  BoltIcon,
  ClockIcon,
  TargetIcon,
  FlameIcon,
  CheckIcon,
  WellbeingIcon,
  ChevronRightIcon,
} from "@/components/icons";

// Small bento stat tile.
function StatTile({
  icon,
  label,
  value,
  hint,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  color: string;
  delay: number;
}) {
  return (
    <div
      className="glass lift rounded-[18px] p-4 relative overflow-hidden rise"
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        aria-hidden
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none float-soft"
        style={{ background: color }}
      />
      <span
        className="flex items-center justify-center w-8 h-8 rounded-[10px] mb-3"
        style={{ color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}
      >
        {icon}
      </span>
      <p className="text-xl font-light text-ink" style={{ letterSpacing: "-0.02em" }}>
        {value}
      </p>
      <p className="text-[11px] text-ink-muted mt-0.5">
        {label} · <span className="text-ink-muted/70">{hint}</span>
      </p>
    </div>
  );
}

// One-tap habit validation card.
function HabitsQuickCard({ delay }: { delay: number }) {
  const { state, dispatch } = useStore();
  const today = todayISO();
  const habits = state.habits.slice(0, 5);
  const done = state.habits.filter((h) => isHabitDone(state, h.id, today)).length;

  return (
    <div
      className="glass lift rounded-[20px] p-5 rise flex flex-col"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FlameIcon size={15} className="text-warning" />
          <h2 className="text-sm font-medium text-ink">Habitudes</h2>
        </div>
        <span className="text-xs text-ink-muted">
          {done}/{state.habits.length}
        </span>
      </div>

      {habits.length === 0 ? (
        <Link
          href="/dashboard/habits"
          className="flex-1 flex items-center justify-center text-xs text-primary hover:underline py-6"
        >
          + Créer ta première habitude
        </Link>
      ) : (
        <ul className="space-y-1.5 flex-1">
          {habits.map((h) => {
            const checked = isHabitDone(state, h.id, today);
            const streak = habitStreak(state, h.id);
            return (
              <li key={h.id}>
                <button
                  onClick={() => dispatch({ type: "TOGGLE_HABIT", habitId: h.id, date: today })}
                  className="w-full flex items-center gap-2.5 rounded-[10px] px-2 py-1.5 hover:bg-ink/[0.04] transition-colors text-left"
                >
                  <span
                    className={`flex items-center justify-center w-[18px] h-[18px] shrink-0 rounded-[6px] border transition-colors ${
                      checked ? "text-on-fill" : "border-line-strong"
                    }`}
                    style={checked ? { background: h.color, borderColor: h.color } : { color: h.color }}
                  >
                    {checked && <CheckIcon size={12} />}
                  </span>
                  <span className="text-base leading-none">{h.emoji}</span>
                  <span
                    className={`flex-1 text-[13px] truncate ${
                      checked ? "text-ink-muted line-through" : "text-ink"
                    }`}
                  >
                    {h.name}
                  </span>
                  {streak > 0 && (
                    <span className="text-[10px] text-warning shrink-0">🔥{streak}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/dashboard/habits"
        className="mt-2 flex items-center justify-center gap-1 text-[11px] text-ink-muted hover:text-primary transition-colors"
      >
        Tout voir <ChevronRightIcon size={12} />
      </Link>
    </div>
  );
}

export default function TodayPage() {
  const { state, userEmail } = useStore();
  const { openNew, openEdit } = useUI();

  const tasks = tasksForDate(state, state.selectedDate);
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const remaining = tasks.length - done;

  const focusMin = tasks
    .filter((t) => t.done && (t.category === "work" || t.category === "learning"))
    .reduce((s, t) => s + t.durationMin, 0);
  const mood = moodForDate(state, state.selectedDate);

  const name = prettyName(state, userEmail);

  // progress ring geometry
  const r = 40;
  const circ = 2 * Math.PI * r;

  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Bonne nuit" : hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <>
      {/* ── Bento top ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Hero */}
        <div
          className="col-span-2 lg:col-span-3 glass border-glow rounded-[24px] p-6 lg:p-8 relative overflow-hidden rise"
          style={{ animationDelay: "0s" }}
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 85% 20%, rgba(95,101,86,0.14), transparent 65%)",
            }}
          />
          <div className="relative flex items-center gap-6">
            <div className="min-w-0 flex-1">
              <h1
                className="font-display text-[1.75rem] lg:text-4xl font-normal text-ink tracking-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                {name ? (
                  <>
                    {greeting},{" "}
                    <span className="italic text-primary">{name}</span>
                  </>
                ) : (
                  <>
                    {greeting} <span className="italic text-primary">toi</span>
                  </>
                )}{" "}
                <span className="wave">👋</span>
              </h1>
              {!name && (
                <p className="text-[11px] text-ink-muted mt-1">
                  <Link href="/dashboard/settings" className="text-primary hover:underline">
                    Ajoute ton prénom dans les paramètres
                  </Link>{" "}
                  pour une salutation personnalisée.
                </p>
              )}
              <p className="text-sm text-ink-muted mt-1.5">
                {formatLongDate(state.selectedDate)}
              </p>
              <p className="text-sm text-ink-muted mt-4">
                {tasks.length === 0
                  ? "Journée libre — planifie ta première tâche."
                  : remaining === 0
                  ? "Tout est fait. Chapeau ! 🎉"
                  : `${remaining} tâche${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""} aujourd'hui.`}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 mt-5">
                <button
                  onClick={() => openNew()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-primary text-on-fill text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <PlusIcon size={15} />
                  Nouvelle tâche
                </button>
                <Link
                  href="/dashboard/calendar"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] glass text-sm text-ink-muted hover:text-ink transition-colors"
                >
                  Voir le calendrier
                </Link>
              </div>
            </div>

            {/* progress ring */}
            <div className="hidden sm:flex flex-col items-center shrink-0">
              <div className="relative w-[104px] h-[104px]">
                <svg width="104" height="104" viewBox="0 0 104 104" className="-rotate-90">
                  <circle cx="52" cy="52" r={r} fill="none" stroke="rgba(89,9,7,0.08)" strokeWidth="8" />
                  <circle
                    cx="52"
                    cy="52"
                    r={r}
                    fill="none"
                    stroke="url(#heroRing)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - pct / 100)}
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                  <defs>
                    <linearGradient id="heroRing" x1="0" y1="0" x2="104" y2="104">
                      <stop stopColor="#590907" />
                      <stop offset="1" stopColor="#5F6556" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-light text-ink">{pct}%</span>
                  <span className="text-[9px] text-ink-muted">du jour</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Habits quick card */}
        <div className="col-span-2 lg:col-span-1">
          <HabitsQuickCard delay={0.05} />
        </div>

        {/* Stat tiles */}
        <StatTile
          icon={<TargetIcon size={16} />}
          label="Tâches"
          value={`${done}/${tasks.length}`}
          hint={remaining > 0 ? `${remaining} restantes` : "terminé 🎉"}
          color="#590907"
          delay={0.1}
        />
        <StatTile
          icon={<ClockIcon size={16} />}
          label="Focus"
          value={`${Math.floor(focusMin / 60)}h${String(focusMin % 60).padStart(2, "0")}`}
          hint="objectif 4h"
          color="#5F6556"
          delay={0.15}
        />
        <StatTile
          icon={<BoltIcon size={16} />}
          label="Énergie"
          value={`${state.settings.energy}%`}
          hint={state.settings.energy >= 60 ? "en forme" : "à recharger"}
          color="#A0661A"
          delay={0.2}
        />
        <StatTile
          icon={<WellbeingIcon size={16} />}
          label="Humeur"
          value={mood != null ? `${mood}` : "—"}
          hint={mood != null ? "/100" : "à renseigner"}
          color="#4E6B35"
          delay={0.25}
        />
      </div>

      {/* ── Planning + panels ─────────────────────────────────────── */}
      <div className="rise" style={{ animationDelay: "0.3s" }}>
        <Timeline />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 rise" style={{ animationDelay: "0.35s" }}>
          <TaskPanel onAdd={() => openNew()} onEdit={openEdit} />
        </div>
        <div className="space-y-6 rise" style={{ animationDelay: "0.4s" }}>
          <Assistant />
          <MoodLogger />
        </div>
      </div>
    </>
  );
}
