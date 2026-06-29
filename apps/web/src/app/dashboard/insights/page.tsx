"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Heatmap } from "@/components/dashboard/Heatmap";
import { Goals } from "@/components/dashboard/Goals";
import {
  useStore,
  categoryMeta,
  moodForDate,
  addDays,
  type TaskCategory,
} from "@/lib/store";

const accentVar: Record<string, string> = {
  cyan: "var(--act-cyan)",
  violet: "var(--focus-violet)",
  green: "var(--done-green)",
  amber: "var(--energy-amber)",
};

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function fmt(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

function moodColor(score: number) {
  if (score >= 70) return "var(--done-green)";
  if (score >= 55) return "var(--act-cyan)";
  if (score >= 40) return "var(--energy-amber)";
  return "var(--alert-red)";
}

// Mon=0 weekday from an ISO date string (timezone-safe).
function weekdayLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const idx = (new Date(y, m - 1, d).getDay() + 6) % 7;
  return DAY_LABELS[idx];
}

export default function InsightsPage() {
  const { state } = useStore();
  const base = state.selectedDate;

  // 7 derniers jours (terminant sur la date sélectionnée)
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(base, i - 6);
    const dayTasks = state.tasks.filter((t) => t.date === date);
    const focusMin = dayTasks
      .filter((t) => t.done && (t.category === "work" || t.category === "learning"))
      .reduce((s, t) => s + t.durationMin, 0);
    return {
      date,
      label: weekdayLabel(date),
      focusMin,
      mood: moodForDate(state, date),
      total: dayTasks.length,
      done: dayTasks.filter((t) => t.done).length,
    };
  });

  const weekTasks = state.tasks.filter((t) => days.some((d) => d.date === t.date));
  const totalDone = weekTasks.filter((t) => t.done).length;
  const completion = weekTasks.length
    ? Math.round((totalDone / weekTasks.length) * 100)
    : 0;
  const totalFocus = days.reduce((s, d) => s + d.focusMin, 0);
  const avgFocus = Math.round(totalFocus / 7);
  const maxFocus = Math.max(...days.map((d) => d.focusMin), 60);

  const byCategory = (Object.keys(categoryMeta) as TaskCategory[]).map((cat) => ({
    cat,
    count: weekTasks.filter((t) => t.category === cat).length,
  }));

  const kpis = [
    { label: "Taux de complétion", value: `${completion} %`, detail: `${totalDone}/${weekTasks.length} tâches`, accent: "green" as const },
    { label: "Focus total (7j)", value: fmt(totalFocus), detail: `moy. ${fmt(avgFocus)}/jour`, accent: "cyan" as const },
    { label: "Tâches terminées", value: `${totalDone}`, detail: "sur 7 jours", accent: "violet" as const },
    { label: "Énergie actuelle", value: `${state.settings.energy} %`, detail: "réglable", accent: "amber" as const },
  ];

  return (
    <>
      <PageHeader title="Analyses" subtitle="Tes tendances sur les 7 derniers jours" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="relative overflow-hidden rounded-md border border-border bg-deep p-4"
          >
            <span
              className="absolute left-0 top-0 h-full w-[2px]"
              style={{ background: accentVar[kpi.accent], opacity: 0.7 }}
            />
            <p className="text-xs text-text-muted">{kpi.label}</p>
            <p className="mt-2 text-2xl font-light text-text" style={{ letterSpacing: "-0.02em" }}>
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-text-muted">{kpi.detail}</p>
          </div>
        ))}
      </div>

      {/* Goals + activity heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Goals />
        <div className="lg:col-span-2">
          <Heatmap />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Focus chart */}
        <section className="lg:col-span-2 rounded-md border border-border bg-deep p-5">
          <h2 className="text-sm font-medium text-text mb-5">Temps de focus par jour</h2>
          <div className="flex items-end justify-between gap-3 h-48">
            {days.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full">
                <div className="relative w-full flex-1 flex items-end justify-center">
                  <div
                    className="w-full max-w-[36px] rounded-[4px] transition-all"
                    style={{
                      height: `${(d.focusMin / maxFocus) * 100}%`,
                      background:
                        d.focusMin > 0
                          ? "linear-gradient(to top, #06b6d4, #a78bfa)"
                          : "var(--border)",
                      minHeight: 4,
                    }}
                    title={`${d.label} · ${fmt(d.focusMin)}`}
                  />
                </div>
                <span className="text-[11px] text-text-muted">{d.label}</span>
                <span className="text-[10px] text-text -mt-1">{fmt(d.focusMin)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Category breakdown */}
        <section className="rounded-md border border-border bg-deep p-5">
          <h2 className="text-sm font-medium text-text mb-5">Répartition (7j)</h2>
          <div className="space-y-4">
            {byCategory.map(({ cat, count }) => {
              const meta = categoryMeta[cat];
              const pct = weekTasks.length ? Math.round((count / weekTasks.length) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-text">{meta.label}</span>
                    <span className="text-xs text-text-muted">
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#0a0a14] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: meta.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Mood over week */}
      <section className="mt-6 rounded-md border border-border bg-deep p-5 max-w-md">
        <h2 className="text-sm font-medium text-text mb-4">Humeur (7 jours)</h2>
        <div className="flex items-end justify-between gap-2 h-20">
          {days.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-end justify-center h-full">
                <div
                  className="w-full max-w-[14px] rounded-[3px] transition-all"
                  style={{
                    height: `${d.mood != null ? d.mood : 4}%`,
                    background: d.mood != null ? moodColor(d.mood) : "var(--border)",
                    opacity: d.mood != null ? 0.85 : 0.4,
                  }}
                  title={d.mood != null ? `${d.label} · ${d.mood}` : `${d.label} · —`}
                />
              </div>
              <span className="text-[10px] text-text-muted">{d.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
