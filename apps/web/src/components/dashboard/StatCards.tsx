"use client";

import { useStore, tasksForDate, moodForDate } from "@/lib/store";

const accentVar: Record<string, string> = {
  cyan: "var(--primary)",
  violet: "var(--secondary)",
  green: "var(--success)",
  amber: "var(--warning)",
};

function Card({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent: keyof typeof accentVar;
}) {
  return (
    <div className="relative overflow-hidden rounded-md border border-line bg-surface p-4 hover:border-line-strong transition-colors">
      <span
        className="absolute left-0 top-0 h-full w-[2px]"
        style={{ background: accentVar[accent], opacity: 0.7 }}
      />
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-2 text-2xl font-light text-ink" style={{ letterSpacing: "-0.02em" }}>
        {value}
      </p>
      <p className="mt-1 text-xs text-ink-muted">{hint}</p>
    </div>
  );
}

export function StatCards() {
  const { state } = useStore();
  const tasks = tasksForDate(state, state.selectedDate);
  const done = tasks.filter((t) => t.done).length;
  const remaining = tasks.length - done;

  // focus = durée cumulée des tâches travail/études terminées
  const focusMin = tasks
    .filter((t) => t.done && (t.category === "work" || t.category === "learning"))
    .reduce((s, t) => s + t.durationMin, 0);

  const mood = moodForDate(state, state.selectedDate);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <Card
        label="Tâches du jour"
        value={`${done} / ${tasks.length}`}
        hint={remaining > 0 ? `${remaining} restantes` : "tout est fait 🎉"}
        accent="cyan"
      />
      <Card
        label="Temps de focus"
        value={`${Math.floor(focusMin / 60)}h${String(focusMin % 60).padStart(2, "0")}`}
        hint="objectif 4h"
        accent="violet"
      />
      <Card
        label="Énergie"
        value={`${state.settings.energy} %`}
        hint={state.settings.energy >= 60 ? "en forme" : "à recharger"}
        accent="amber"
      />
      <Card
        label="Humeur"
        value={mood != null ? `${mood}` : "—"}
        hint={mood != null ? "/100 aujourd'hui" : "non renseignée"}
        accent="green"
      />
    </div>
  );
}
