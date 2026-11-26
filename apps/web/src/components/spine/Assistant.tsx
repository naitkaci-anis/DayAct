"use client";

import { useState } from "react";
import { SparkIcon, TargetIcon, ClockIcon, CheckIcon } from "@/components/icons";
import { useStore, activeSuggestions, tasksForDate } from "@/lib/store";
import type { DayPlan } from "@/lib/ai/plan";

export function Assistant() {
  const { state, dispatch } = useStore();
  const suggestions = activeSuggestions(state);
  const tasks = tasksForDate(state, state.selectedDate);

  const done = tasks.filter((t) => t.done).length;
  const focusMin = tasks
    .filter((t) => t.done && (t.category === "work" || t.category === "learning"))
    .reduce((s, t) => s + t.durationMin, 0);
  const remaining = tasks.filter((t) => !t.done).length;

  // ── AI day plan ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function planDay() {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          energy: state.settings.energy,
          tasks: tasks.map((t) => ({
            title: t.title,
            time: t.time,
            durationMin: t.durationMin,
            priority: t.priority,
            category: t.category,
            done: t.done,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur de l'IA");
      setPlan(data.plan as DayPlan);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* AI planner */}
      <section className="relative overflow-hidden rounded-md border border-line bg-surface p-4 glow-secondary">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 100% 0%, rgba(167,139,250,0.10) 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-[7px] bg-secondary/15 text-secondary">
              <SparkIcon size={15} />
            </span>
            <span className="text-xs font-medium text-secondary uppercase tracking-wider">
              Assistant IA
            </span>
            <span className="ml-auto text-[10px] text-ink-muted">IA</span>
          </div>

          <button
            onClick={planDay}
            disabled={loading}
            className="w-full px-3 py-2 rounded-sm bg-secondary/15 text-secondary text-sm font-medium hover:bg-secondary/25 disabled:opacity-50 transition-colors"
          >
            {loading ? "Analyse en cours…" : "✨ Planifier ma journée"}
          </button>

          {error && (
            <p className="mt-3 text-xs text-danger bg-danger/10 border border-danger/30 rounded-sm px-3 py-2">
              {error}
            </p>
          )}

          {plan && (
            <div className="mt-4 space-y-3">
              {plan.focus && (
                <div className="rounded-sm border border-line bg-field p-3">
                  <p className="text-[11px] text-ink-muted mb-1">À faire en priorité</p>
                  <p className="text-sm text-ink font-medium">⭐ {plan.focus}</p>
                </div>
              )}

              {plan.order.length > 0 && (
                <div>
                  <p className="text-[11px] text-ink-muted mb-1.5">Ordre conseillé</p>
                  <ol className="space-y-1">
                    {plan.order.map((title, i) => (
                      <li key={i} className="flex items-center gap-2 text-[13px] text-ink">
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-secondary/15 text-secondary text-[10px] shrink-0">
                          {i + 1}
                        </span>
                        <span className="truncate">{title}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {plan.advice.length > 0 && (
                <div>
                  <p className="text-[11px] text-ink-muted mb-1.5">Conseils</p>
                  <ul className="space-y-1.5">
                    {plan.advice.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-ink-muted">
                        <CheckIcon size={13} className="text-success mt-0.5 shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Built-in static suggestions (kept below the AI planner) */}
          {suggestions.length > 0 && (
            <div className="mt-4 space-y-4 border-t border-line pt-4">
              {suggestions.map((s) => (
                <div key={s.id}>
                  <p className="text-sm text-ink font-medium leading-snug">{s.headline}</p>
                  <p className="mt-1.5 text-[13px] text-ink-muted leading-relaxed">{s.body}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => dispatch({ type: "APPLY_SUGGESTION", id: s.id })}
                      className="px-3 py-1.5 rounded-sm bg-secondary/15 text-secondary text-xs font-medium hover:bg-secondary/25 transition-colors"
                    >
                      {s.task ? "Ajouter au planning" : "Appliquer"}
                    </button>
                    <button
                      onClick={() => dispatch({ type: "DISMISS_SUGGESTION", id: s.id })}
                      className="px-3 py-1.5 rounded-sm text-ink-muted text-xs hover:text-ink transition-colors"
                    >
                      Ignorer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick stats */}
      <section className="rounded-md border border-line bg-surface p-4">
        <h2 className="text-sm font-medium text-ink mb-3">Aperçu du jour</h2>
        <div className="space-y-3">
          <StatRow
            icon={<TargetIcon size={15} className="text-primary" />}
            label="Terminées"
            value={`${done} / ${tasks.length}`}
          />
          <StatRow
            icon={<ClockIcon size={15} className="text-secondary" />}
            label="Focus effectué"
            value={`${Math.floor(focusMin / 60)}h${String(focusMin % 60).padStart(2, "0")}`}
          />
          <StatRow
            icon={<SparkIcon size={15} className="text-warning" />}
            label="Restantes"
            value={`${remaining}`}
          />
        </div>
      </section>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm text-ink-muted">{label}</span>
      </div>
      <span className="text-sm text-ink font-medium">{value}</span>
    </div>
  );
}
