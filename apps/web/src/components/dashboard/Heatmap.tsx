"use client";

import { useStore, todayISO, addDays } from "@/lib/store";
import { mondayOf } from "@/lib/calendar";

const WEEKS = 26; // ~6 months
const DAY_LABELS = ["L", "", "M", "", "V", "", "D"];

function level(count: number) {
  if (count === 0) return "var(--border)";
  if (count <= 1) return "color-mix(in srgb, var(--act-cyan) 30%, transparent)";
  if (count <= 3) return "color-mix(in srgb, var(--act-cyan) 55%, transparent)";
  if (count <= 5) return "color-mix(in srgb, var(--act-cyan) 80%, transparent)";
  return "var(--act-cyan)";
}

export function Heatmap() {
  const { state } = useStore();

  // count completed tasks per date
  const counts = new Map<string, number>();
  for (const t of state.tasks) {
    if (t.done) counts.set(t.date, (counts.get(t.date) ?? 0) + 1);
  }

  const startMonday = mondayOf(addDays(todayISO(), -(WEEKS - 1) * 7));
  const today = todayISO();

  const cols: string[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const col: string[] = [];
    for (let d = 0; d < 7; d++) col.push(addDays(startMonday, w * 7 + d));
    cols.push(col);
  }

  const total = state.tasks.filter((t) => t.done).length;

  return (
    <section className="rounded-md border border-border bg-deep p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-text">Activité</h2>
        <span className="text-xs text-text-muted">{total} tâches terminées (6 mois)</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {/* day labels */}
        <div className="flex flex-col gap-[3px] pt-0.5 shrink-0">
          {DAY_LABELS.map((l, i) => (
            <span key={i} className="h-[12px] text-[9px] text-text-muted leading-[12px]">
              {l}
            </span>
          ))}
        </div>

        {/* week columns */}
        <div className="flex gap-[3px]">
          {cols.map((col, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {col.map((date) => {
                const c = counts.get(date) ?? 0;
                const future = date > today;
                return (
                  <div
                    key={date}
                    title={`${date} · ${c} terminée${c > 1 ? "s" : ""}`}
                    className="w-[12px] h-[12px] rounded-[3px]"
                    style={{
                      background: future ? "transparent" : level(c),
                      border: date === today ? "1px solid var(--act-cyan)" : undefined,
                      opacity: future ? 0.25 : 1,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-text-muted">moins</span>
        {[0, 1, 3, 5, 6].map((n) => (
          <span key={n} className="w-[11px] h-[11px] rounded-[3px]" style={{ background: level(n) }} />
        ))}
        <span className="text-[10px] text-text-muted">plus</span>
      </div>
    </section>
  );
}
