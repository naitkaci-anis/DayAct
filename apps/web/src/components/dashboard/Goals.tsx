"use client";

import { useEffect, useState } from "react";
import { TargetIcon } from "@/components/icons";
import { useStore, tasksForDate, todayISO, addDays } from "@/lib/store";

const STORAGE_KEY = "dayact-goals";

interface GoalsState {
  dailyTasks: number;
  weeklyFocusMin: number;
}

const DEFAULTS: GoalsState = { dailyTasks: 5, weeklyFocusMin: 600 };

function Bar({ value, goal, color, label, valueLabel }: {
  value: number;
  goal: number;
  color: string;
  label: string;
  valueLabel: string;
}) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-ink">{label}</span>
        <span className="text-xs text-ink-muted">{valueLabel}</span>
      </div>
      <div className="h-2 rounded-full bg-field overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function Goals() {
  const { state } = useStore();
  const [goals, setGoals] = useState<GoalsState>(DEFAULTS);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setGoals({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<GoalsState>) });
    } catch {
      /* ignore */
    }
  }, []);

  function save(next: GoalsState) {
    setGoals(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const today = todayISO();
  const doneToday = tasksForDate(state, today).filter((t) => t.done).length;

  // focus this week = tracked time on tasks dated within the current week
  const [yy, mm, dd] = today.split("-").map(Number);
  const weekday = (new Date(yy, mm - 1, dd).getDay() + 6) % 7; // Mon=0
  const weekStart = addDays(today, -weekday);
  const weekEnd = addDays(weekStart, 6);
  const weekFocus = state.tasks
    .filter((t) => t.date >= weekStart && t.date <= weekEnd)
    .reduce((s, t) => s + t.timeSpentMin, 0);

  return (
    <section className="rounded-md border border-line bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TargetIcon size={16} className="text-primary" />
          <h2 className="text-sm font-medium text-ink">Objectifs</h2>
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-xs text-ink-muted hover:text-ink"
        >
          {editing ? "Terminé" : "Modifier"}
        </button>
      </div>

      {editing ? (
        <div className="space-y-3">
          <label className="flex items-center justify-between gap-3 text-sm text-ink">
            Tâches / jour
            <input
              type="number"
              min={1}
              value={goals.dailyTasks}
              onChange={(e) => save({ ...goals, dailyTasks: Math.max(1, Number(e.target.value) || 1) })}
              className="w-20 px-2 py-1.5 rounded-sm bg-field border border-line text-ink text-right outline-none focus:border-primary"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm text-ink">
            Focus / semaine (min)
            <input
              type="number"
              min={0}
              step={30}
              value={goals.weeklyFocusMin}
              onChange={(e) =>
                save({ ...goals, weeklyFocusMin: Math.max(0, Number(e.target.value) || 0) })
              }
              className="w-20 px-2 py-1.5 rounded-sm bg-field border border-line text-ink text-right outline-none focus:border-primary"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <Bar
            label="Tâches du jour"
            value={doneToday}
            goal={goals.dailyTasks}
            color="var(--primary)"
            valueLabel={`${doneToday} / ${goals.dailyTasks}`}
          />
          <Bar
            label="Focus cette semaine"
            value={weekFocus}
            goal={goals.weeklyFocusMin}
            color="var(--secondary)"
            valueLabel={`${Math.floor(weekFocus / 60)}h${String(weekFocus % 60).padStart(2, "0")} / ${Math.floor(
              goals.weeklyFocusMin / 60
            )}h`}
          />
        </div>
      )}
    </section>
  );
}
