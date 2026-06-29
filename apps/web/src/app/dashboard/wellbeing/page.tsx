"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { MoodLogger } from "@/components/spine/MoodLogger";
import { Assistant } from "@/components/spine/Assistant";
import { useStore, moodForDate } from "@/lib/store";

const accentVar: Record<string, string> = {
  cyan: "var(--act-cyan)",
  violet: "var(--focus-violet)",
  green: "var(--done-green)",
  amber: "var(--energy-amber)",
};

function Gauge({
  value,
  color,
  label,
  unit,
  note,
}: {
  value: number;
  color: string;
  label: string;
  unit: string;
  note?: string;
}) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);

  return (
    <div className="flex flex-col items-center rounded-md border border-border bg-deep p-5">
      <div className="relative w-[88px] h-[88px]">
        <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-light text-text">{value}</span>
          <span className="text-[9px] text-text-muted -mt-1">{unit}</span>
        </div>
      </div>
      <span className="mt-3 text-sm text-text">{label}</span>
      {note && <span className="text-[11px] text-text-muted">{note}</span>}
    </div>
  );
}

export default function WellbeingPage() {
  const { state } = useStore();
  const mood = moodForDate(state, state.selectedDate) ?? 0;
  const energy = state.settings.energy;

  // Sommeil & stress : illustratifs (dérivés simplement de l'énergie pour rester cohérents)
  const sleep = Math.min(100, Math.round(energy * 1.15));
  const stress = Math.max(0, 100 - energy - 5);

  return (
    <>
      <PageHeader title="Bien-être" subtitle="Ton équilibre du jour, suivi en continu" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Gauge value={mood} color={accentVar.violet} label="Humeur" unit="/100" note={mood === 0 ? "non renseignée" : undefined} />
        <Gauge value={energy} color={accentVar.amber} label="Énergie" unit="/100" note="réglable" />
        <Gauge value={sleep} color={accentVar.cyan} label="Sommeil" unit="/100" />
        <Gauge value={stress} color={accentVar.green} label="Stress" unit="/100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MoodLogger />
        </div>
        <Assistant />
      </div>

      <section className="mt-6 rounded-md border border-border bg-deep p-5 max-w-3xl">
        <h2 className="text-sm font-medium text-text mb-3">Conseils du jour</h2>
        <ul className="space-y-2.5">
          {[
            stress < 50
              ? "Ton niveau de stress est bas — c'est le bon moment pour une tâche exigeante."
              : "Stress élevé : privilégie des tâches courtes et fais des pauses régulières.",
            energy >= 60
              ? "Bonne énergie : profite de ta fenêtre de focus du matin."
              : "Énergie basse : commence par une tâche simple pour relancer la dynamique.",
            "Pense à une pause de 5 min toutes les 90 min pour préserver ton énergie.",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-text-muted">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-done-green shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
