"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useStore,
  tasksForDate,
  isHabitDone,
  habitStreak,
  formatLongDate,
  todayISO,
  addDays,
  prettyName,
  type Task,
} from "@/lib/store";
import { useUI } from "@/components/dashboard/UIShell";
import { SunArc } from "@/components/today/SunArc";
import { TaskRow, CategoryGlyph } from "@/components/today/TaskRow";
import { MoodLogger } from "@/components/spine/MoodLogger";
import { Assistant } from "@/components/spine/Assistant";
import { AlertIcon, CheckIcon, PlusIcon, ChevronRightIcon, FlameIcon } from "@/components/icons";

// ── Helpers ────────────────────────────────────────────────────────────────

type Moment = "matin" | "journee" | "soir";

const MOMENTS: { id: Moment; label: string }[] = [
  { id: "matin", label: "Matin" },
  { id: "journee", label: "Journée" },
  { id: "soir", label: "Soir" },
];

const PLANNED_KEY = (date: string) => `dayact-planned-${date}`;

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function hoursLabel(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

function defaultMoment(today: string): Moment {
  const h = new Date().getHours();
  if (h >= 19) return "soir";
  let planned = false;
  try {
    planned = localStorage.getItem(PLANNED_KEY(today)) === "1";
  } catch {}
  if (h < 12 && !planned) return "matin";
  return "journee";
}

/** Re-render every 30 s so the sun and "dans X min" stay current. */
function useNow() {
  const [now, setNow] = useState(nowMinutes);
  useEffect(() => {
    const id = setInterval(() => setNow(nowMinutes()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ── Shared pieces ─────────────────────────────────────────────────────────

function MomentTabs({ value, onChange }: { value: Moment; onChange: (m: Moment) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Moment de la journée"
      className="grid grid-cols-3 gap-1 p-1 rounded-full bg-cream max-w-md"
    >
      {MOMENTS.map((m) => {
        const active = m.id === value;
        return (
          <button
            key={m.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(m.id)}
            className={`h-11 rounded-full text-[15px] font-medium transition-colors ${
              active ? "bg-primary text-on-fill" : "text-ink/75 hover:text-ink"
            }`}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

function HabitsCard() {
  const { state, dispatch } = useStore();
  const today = todayISO();
  const done = state.habits.filter((h) => isHabitDone(state, h.id, today)).length;

  return (
    <section className="rounded-[24px] border border-line bg-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl text-ink">Habitudes</h2>
        <span className="text-sm text-ink-muted">
          {done} / {state.habits.length}
        </span>
      </div>
      {state.habits.length === 0 ? (
        <Link href="/dashboard/habits" className="block py-4 text-sm text-primary hover:underline">
          Créer ta première habitude
        </Link>
      ) : (
        <ul className="flex flex-col gap-1">
          {state.habits.slice(0, 6).map((h) => {
            const checked = isHabitDone(state, h.id, today);
            const streak = habitStreak(state, h.id);
            return (
              <li key={h.id}>
                <button
                  onClick={() => dispatch({ type: "TOGGLE_HABIT", habitId: h.id, date: today })}
                  aria-pressed={checked}
                  className="w-full flex items-center gap-3 min-h-[44px] rounded-[12px] px-2 hover:bg-ink/[0.04] text-left"
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 shrink-0 rounded-[8px] border-2 ${
                      checked ? "text-on-fill" : "border-line-strong"
                    }`}
                    style={checked ? { background: h.color, borderColor: h.color } : undefined}
                  >
                    {checked && <CheckIcon size={14} />}
                  </span>
                  <span className="text-lg leading-none">{h.emoji}</span>
                  <span className={`flex-1 text-[15px] ${checked ? "text-ink-muted line-through" : "text-ink"}`}>
                    {h.name}
                  </span>
                  {streak > 1 && (
                    <span className="flex items-center gap-1 text-xs text-warning">
                      <FlameIcon size={13} />
                      {streak} j
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Link
        href="/dashboard/habits"
        className="mt-2 flex items-center justify-center gap-1 min-h-[40px] text-sm text-ink-muted hover:text-primary"
      >
        Toutes les habitudes <ChevronRightIcon size={14} />
      </Link>
    </section>
  );
}

function AddTaskButton({ label = "Ajouter une tâche" }: { label?: string }) {
  const { openNew } = useUI();
  return (
    <button
      onClick={() => openNew({ date: todayISO() })}
      className="w-full flex items-center justify-center gap-2 min-h-[52px] rounded-[18px] border-2 border-dashed border-line-strong text-[15px] text-ink/80 hover:border-primary hover:text-primary transition-colors"
    >
      <PlusIcon size={18} />
      {label}
    </button>
  );
}

// ── Journée : agir ────────────────────────────────────────────────────────

function NextCard({ task, now, onAllDone }: { task: Task | null; now: number; onAllDone: () => void }) {
  const { dispatch } = useStore();
  const { openActions, toast } = useUI();

  if (!task) {
    return (
      <section className="rounded-[24px] bg-primary text-on-fill p-6">
        <p className="font-display text-2xl">Tout est fait pour aujourd'hui</p>
        <p className="mt-1 text-[15px] text-cream">Profite de ta soirée, ou prends un moment pour faire le bilan.</p>
        <button
          onClick={onAllDone}
          className="mt-4 min-h-[48px] px-6 rounded-full bg-canvas text-primary font-semibold text-[15px]"
        >
          Faire le bilan
        </button>
      </section>
    );
  }

  const start = toMin(task.time);
  const end = start + task.durationMin;
  const label =
    now < start
      ? start - now <= 90
        ? `Ensuite · dans ${hoursLabel(start - now)}`
        : `Ensuite · à ${task.time}`
      : now < end
      ? "Maintenant"
      : `En retard · depuis ${hoursLabel(now - start)}`;

  return (
    <section className="rounded-[24px] bg-primary text-on-fill p-5 lg:p-6">
      <div className="flex items-center gap-4">
        <span className="flex items-center justify-center w-12 h-12 shrink-0 rounded-[14px] bg-primary-hover text-cream">
          <CategoryGlyph category={task.category} size={24} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-[0.06em] uppercase text-cream">{label}</p>
          <p className="font-display text-[22px] leading-tight mt-0.5">{task.title}</p>
          <p className="text-[13px] text-cream/90 mt-0.5">
            {task.time} · {hoursLabel(task.durationMin)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          onClick={() => {
            dispatch({ type: "TOGGLE_TASK", id: task.id });
            toast("Bravo, c'est fait");
          }}
          className="min-h-[48px] rounded-full bg-canvas text-primary font-semibold text-[15px]"
        >
          C'est fait
        </button>
        <button
          onClick={() => openActions(task, "postpone")}
          className="min-h-[48px] rounded-full border border-cream/40 text-on-fill font-medium text-[15px] hover:bg-on-fill/10"
        >
          Plus tard
        </button>
      </div>
    </section>
  );
}

function DayMoment({ tasks, now, goTo }: { tasks: Task[]; now: number; goTo: (m: Moment) => void }) {
  const { openActions } = useUI();
  const todo = tasks.filter((t) => !t.done);
  // Next = the first unfinished task, overdue ones included (oldest first).
  const next = todo[0] ?? null;
  const rest = todo.slice(1);
  const done = tasks.filter((t) => t.done);

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-5">
        <SunArc tasks={tasks} nowMin={now} onPick={(t) => openActions(t)} />
        <NextCard task={next} now={now} onAllDone={() => goTo("soir")} />
      </div>

      <div className="flex flex-col gap-6">
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-2xl text-ink">La suite</h2>
            <Link href="/dashboard/calendar" className="text-sm text-primary hover:underline">
              Agenda
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {rest.length === 0 && next && (
              <p className="text-[15px] text-ink-muted py-2">Rien d'autre de prévu après ça.</p>
            )}
            {rest.map((t) => (
              <TaskRow key={t.id} task={t} hint={toMin(t.time) + t.durationMin < now ? "en retard" : undefined} />
            ))}
            <AddTaskButton />
          </div>
        </section>

        {done.length > 0 && (
          <details className="group">
            <summary className="flex items-center justify-between min-h-[44px] cursor-pointer list-none text-[15px] text-ink-muted">
              <span>Déjà fait ({done.length})</span>
              <ChevronRightIcon size={16} className="transition-transform group-open:rotate-90" />
            </summary>
            <div className="flex flex-col gap-2 mt-2">
              {done.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          </details>
        )}

        <HabitsCard />
      </div>
    </div>
  );
}

// ── Matin : planifier ─────────────────────────────────────────────────────

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const;

function MorningMoment({ tasks, now, onValidate }: { tasks: Task[]; now: number; onValidate: () => void }) {
  const { dispatch } = useStore();
  const { toast } = useUI();
  const todo = tasks.filter((t) => !t.done);
  const planned = todo.reduce((s, t) => s + t.durationMin, 0);
  const free = Math.max(0, 23 * 60 - Math.max(now, 7 * 60));
  const overloaded = planned > free && todo.length > 1;
  // Suggest postponing the least important, longest task.
  const candidate = overloaded
    ? [...todo].sort(
        (a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || b.durationMin - a.durationMin
      )[0]
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-start">
      <div className="flex flex-col gap-4">
        <p className="text-[15px] text-ink-muted max-w-prose">
          Prends deux minutes pour regarder ta journée : garde l'essentiel, reporte le reste, puis valide.
        </p>

        {overloaded && candidate && (
          <div className="flex gap-3 items-start rounded-[18px] border border-warning/30 bg-warning/10 p-4" role="alert">
            <AlertIcon size={20} className="text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[15px] text-ink">
                Tu as prévu {hoursLabel(planned)} de tâches pour {hoursLabel(free)} de libre.
                Je te propose de reporter « {candidate.title} ».
              </p>
              <button
                onClick={() => {
                  const prev = candidate.date;
                  dispatch({ type: "UPDATE_TASK", id: candidate.id, patch: { date: addDays(todayISO(), 1) } });
                  toast("Reportée à demain", () =>
                    dispatch({ type: "UPDATE_TASK", id: candidate.id, patch: { date: prev } })
                  );
                }}
                className="mt-3 min-h-[44px] px-5 rounded-full bg-ink text-on-fill text-sm font-medium"
              >
                Reporter à demain
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {todo.length === 0 && (
            <p className="text-[15px] text-ink-muted py-2">
              {tasks.length === 0
                ? "Rien de prévu pour l'instant. Ajoute ce que tu veux faire aujourd'hui."
                : "Tout ce qui était prévu est déjà fait."}
            </p>
          )}
          {todo.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
          {tasks.length > todo.length && (
            <p className="text-sm text-ink-muted px-1">
              {tasks.length - todo.length} déjà faite{tasks.length - todo.length > 1 ? "s" : ""} aujourd'hui
            </p>
          )}
          <AddTaskButton />
        </div>

        <button
          onClick={onValidate}
          className="mt-2 min-h-[56px] rounded-full bg-primary text-on-fill text-base font-semibold hover:bg-primary-hover transition-colors"
        >
          Valider ma journée
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <Assistant />
      </div>
    </div>
  );
}

// ── Soir : faire le bilan ─────────────────────────────────────────────────

function EveningMoment({ tasks }: { tasks: Task[] }) {
  const { state, dispatch } = useStore();
  const { openActions, toast } = useUI();
  const today = todayISO();
  const tomorrow = addDays(today, 1);
  const done = tasks.filter((t) => t.done);
  const left = tasks.filter((t) => !t.done);
  const focusMin = done.reduce((s, t) => s + Math.max(t.timeSpentMin, t.category === "work" || t.category === "learning" ? t.durationMin : 0), 0);
  const habitsDone = state.habits.filter((h) => isHabitDone(state, h.id, today)).length;
  const tomorrowCount = tasksForDate(state, tomorrow).length;

  const stats = [
    { value: `${done.length}/${tasks.length}`, label: "tâches faites" },
    { value: hoursLabel(focusMin), label: "de focus" },
    { value: `${habitsDone}/${state.habits.length}`, label: "habitudes" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-6">
        <section className="rounded-[24px] bg-ink text-on-fill p-5 lg:p-6">
          <p className="font-display text-2xl">
            {left.length === 0 && tasks.length > 0 ? "Journée bouclée" : "Ta journée en bref"}
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-[16px] bg-on-fill/10 px-3 py-3">
                <p className="font-display text-2xl leading-none">{s.value}</p>
                <p className="text-xs text-cream mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink mb-3">Ce qui reste</h2>
          {left.length === 0 ? (
            <p className="text-[15px] text-ink-muted">Rien. Tout est fait, bravo.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {left.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-[18px] border border-line bg-surface pl-4 pr-2 py-2">
                  <button onClick={() => openActions(t)} className="flex-1 min-w-0 text-left min-h-[44px]">
                    <span className="block text-[15px] text-ink truncate">{t.title}</span>
                    <span className="block text-xs text-ink-muted">{t.time}</span>
                  </button>
                  <button
                    onClick={() => {
                      dispatch({ type: "UPDATE_TASK", id: t.id, patch: { date: tomorrow } });
                      toast("Reportée à demain", () =>
                        dispatch({ type: "UPDATE_TASK", id: t.id, patch: { date: today } })
                      );
                    }}
                    className="min-h-[44px] px-4 rounded-full border border-line-strong text-sm font-medium text-ink hover:border-primary hover:text-primary"
                  >
                    Demain
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-col gap-6">
        <MoodLogger />
        <section className="rounded-[24px] border border-line bg-surface p-5">
          <h2 className="font-display text-xl text-ink">Demain</h2>
          <p className="text-[15px] text-ink-muted mt-1">
            {tomorrowCount === 0
              ? "Rien de prévu pour l'instant."
              : `${tomorrowCount} tâche${tomorrowCount > 1 ? "s" : ""} déjà prête${tomorrowCount > 1 ? "s" : ""}.`}
          </p>
          <Link
            href="/dashboard/calendar"
            className="mt-3 inline-flex items-center gap-1 min-h-[44px] text-[15px] font-medium text-primary"
          >
            Voir l'agenda <ChevronRightIcon size={14} />
          </Link>
        </section>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function TodayPage() {
  const { state, userEmail } = useStore();
  const { toast } = useUI();
  const today = todayISO();
  const now = useNow();
  const [moment, setMoment] = useState<Moment>("journee");

  useEffect(() => setMoment(defaultMoment(today)), [today]);

  const tasks = useMemo(() => tasksForDate(state, today), [state, today]);
  const name = prettyName(state, userEmail);
  const hour = Math.floor(now / 60);
  const greeting = hour < 5 ? "Bonne nuit" : hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const validate = () => {
    try {
      localStorage.setItem(PLANNED_KEY(today), "1");
    } catch {}
    setMoment("journee");
    toast("C'est parti, bonne journée");
  };

  return (
    <div className="flex flex-col gap-6 pb-4">
      <header className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-ink-muted">{formatLongDate(today)}</p>
          <h1 className="font-display text-[2rem] lg:text-[2.6rem] leading-tight text-ink tracking-tight mt-1">
            {moment === "matin" ? "Voici ta journée" : greeting}
            {name ? (
              <>
                , <span className="italic text-primary">{name}</span>
              </>
            ) : null}
          </h1>
          {!name && (
            <p className="text-sm text-ink-muted mt-1">
              <Link href="/dashboard/settings" className="text-primary hover:underline">
                Ajoute ton prénom
              </Link>{" "}
              pour une salutation personnalisée.
            </p>
          )}
        </div>
        <MomentTabs value={moment} onChange={setMoment} />
      </header>

      {moment === "matin" && <MorningMoment tasks={tasks} now={now} onValidate={validate} />}
      {moment === "journee" && <DayMoment tasks={tasks} now={now} goTo={setMoment} />}
      {moment === "soir" && <EveningMoment tasks={tasks} />}
    </div>
  );
}
