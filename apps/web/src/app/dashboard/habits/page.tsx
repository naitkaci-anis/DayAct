"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CheckIcon, TrashIcon, PlusIcon, FlameIcon, TargetIcon } from "@/components/icons";
import {
  useStore,
  isHabitDone,
  habitStreak,
  habitBestStreak,
  habitCompletionRate,
  todayISO,
  addDays,
  type Habit,
  type State,
} from "@/lib/store";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const EMOJIS = ["💧", "🏃", "🧘", "📚", "🥗", "😴", "✍️", "🎯", "🎸", "💊", "🚭", "🌱"];
const COLORS = ["#06b6d4", "#4ade80", "#a78bfa", "#fbbf24", "#f87171", "#f9fafb"];

function weekdayLetter(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAYS[(new Date(y, m - 1, d).getDay() + 6) % 7];
}

// ── Gamification helpers ─────────────────────────────────────────────────
function bestStreakAll(state: State) {
  return state.habits.reduce((mx, h) => Math.max(mx, habitBestStreak(state, h.id)), 0);
}

function buildBadges(state: State, doneToday: number, total: number) {
  const totalDone = state.habitLogs.length;
  const anyStreak7 = state.habits.some(
    (h) => habitStreak(state, h.id) >= 7 || habitBestStreak(state, h.id) >= 7
  );
  return [
    { icon: "🌱", label: "Premier pas", desc: "Créer une habitude", earned: total >= 1 },
    { icon: "🔥", label: "En feu", desc: "7 jours de série", earned: anyStreak7 },
    { icon: "💎", label: "Discipliné", desc: "30 jours de série", earned: bestStreakAll(state) >= 30 },
    { icon: "🏆", label: "Centurion", desc: "100 validations", earned: totalDone >= 100 },
    {
      icon: "⭐",
      label: "Journée parfaite",
      desc: "Tout coché aujourd'hui",
      earned: total > 0 && doneToday === total,
    },
  ];
}

// A single motivating habit card.
function HabitCard({ habit }: { habit: Habit }) {
  const { state, dispatch } = useStore();
  const today = todayISO();
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const streak = habitStreak(state, habit.id);
  const best = habitBestStreak(state, habit.id);
  const rate = habitCompletionRate(state, habit.id, 30);
  const doneToday = isHabitDone(state, habit.id, today);

  return (
    <div className="group glass lift rounded-[20px] p-5 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ background: habit.color }}
      />

      <div className="flex items-start gap-3 relative">
        <span
          className="flex items-center justify-center w-11 h-11 rounded-[13px] text-xl shrink-0"
          style={{ background: `color-mix(in srgb, ${habit.color} 18%, transparent)` }}
        >
          {habit.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text truncate">{habit.name}</p>
          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-text-muted">
            <span className="flex items-center gap-1">
              <TargetIcon size={12} /> {rate}% ce mois
            </span>
            <span>Record : {best} j</span>
          </div>
        </div>
        <button
          onClick={() => dispatch({ type: "DELETE_HABIT", id: habit.id })}
          className="p-1.5 text-text-muted hover:text-alert-red opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Supprimer"
        >
          <TrashIcon size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <FlameIcon
          size={18}
          className={streak > 0 ? "text-energy-amber" : "text-text-muted/40"}
        />
        <span className="text-2xl font-light text-text">{streak}</span>
        <span className="text-xs text-text-muted">
          {streak > 0 ? `jour${streak > 1 ? "s" : ""} d'affilée 🔥` : "commence ta série !"}
        </span>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${rate}%`, background: habit.color }}
        />
      </div>

      <div className="grid grid-cols-7 gap-1.5 mt-4">
        {last7.map((d) => {
          const done = isHabitDone(state, habit.id, d);
          const isToday = d === today;
          return (
            <button
              key={d}
              onClick={() => dispatch({ type: "TOGGLE_HABIT", habitId: habit.id, date: d })}
              title={d}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-[9px] text-text-muted">{weekdayLetter(d)}</span>
              <span
                className={`flex items-center justify-center w-full aspect-square rounded-[7px] border transition-all ${
                  done ? "text-[#0a0a14]" : "border-[#374151] hover:border-current"
                } ${isToday && !done ? "ring-1 ring-act-cyan/50" : ""}`}
                style={
                  done ? { background: habit.color, borderColor: habit.color } : { color: habit.color }
                }
              >
                {done && <CheckIcon size={12} />}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => dispatch({ type: "TOGGLE_HABIT", habitId: habit.id, date: today })}
        className={`w-full mt-4 py-2.5 rounded-[12px] text-sm font-medium transition-all ${
          doneToday
            ? "bg-done-green/15 text-done-green border border-done-green/30"
            : "text-[#0a0a14] hover:opacity-90"
        }`}
        style={doneToday ? undefined : { background: habit.color }}
      >
        {doneToday ? "✓ Validé aujourd'hui" : "Valider aujourd'hui"}
      </button>
    </div>
  );
}

export default function HabitsPage() {
  const { state, dispatch } = useStore();
  const today = todayISO();

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);

  function addHabit() {
    if (!name.trim()) return;
    dispatch({ type: "ADD_HABIT", habit: { name: name.trim(), emoji, color } });
    setName("");
    setEmoji(EMOJIS[0]);
    setColor(COLORS[0]);
    setAdding(false);
  }

  const total = state.habits.length;
  const doneToday = state.habits.filter((h) => isHabitDone(state, h.id, today)).length;
  const pct = total ? Math.round((doneToday / total) * 100) : 0;
  const perfectDay = total > 0 && doneToday === total;

  // Level / XP from total check-ins (10 validations = 1 niveau).
  const totalDone = state.habitLogs.length;
  const level = Math.floor(totalDone / 10) + 1;
  const xpInLevel = totalDone % 10;
  const xpPct = (xpInLevel / 10) * 100;

  const badges = buildBadges(state, doneToday, total);
  const earnedCount = badges.filter((b) => b.earned).length;

  const message = perfectDay
    ? "Journée parfaite ! Toutes tes habitudes sont validées 🎉"
    : total === 0
    ? "Crée ta première habitude pour lancer une série 💪"
    : doneToday === 0
    ? "Nouvelle journée, nouvelle série. Coche ta première habitude 👇"
    : `Encore ${total - doneToday} habitude${total - doneToday > 1 ? "s" : ""} pour un carton plein !`;

  return (
    <>
      <PageHeader
        title="Habitudes"
        subtitle="Monte de niveau, débloque des trophées, garde tes séries"
        action={
          <button
            onClick={() => setAdding((a) => !a)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-sm bg-act-cyan text-[#0a0a14] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <PlusIcon size={16} />
            Habitude
          </button>
        }
      />

      {/* Level / momentum banner */}
      {total > 0 && (
        <div
          className={`glass rounded-[20px] p-5 mb-5 relative overflow-hidden ${
            perfectDay ? "border-glow" : ""
          }`}
        >
          {perfectDay && (
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(192,38,255,0.18), transparent 70%)",
              }}
            />
          )}
          <div className="relative flex items-center gap-5">
            {/* level badge */}
            <div className="flex flex-col items-center shrink-0">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-act-cyan via-focus-violet to-accent text-[#050816]">
                <span className="text-2xl font-semibold">{level}</span>
              </div>
              <span className="text-[10px] text-text-muted mt-1">Niveau</span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm text-text mb-2">{message}</p>
              {/* XP bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-act-cyan to-accent transition-all"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
                <span className="text-[11px] text-text-muted whitespace-nowrap">
                  {xpInLevel}/10 XP
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-text-muted">
                <span className="flex items-center gap-1">
                  <FlameIcon size={12} className="text-energy-amber" />
                  {doneToday}/{total} aujourd'hui ({pct}%)
                </span>
                <span>🏆 {earnedCount}/{badges.length} trophées</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badges */}
      {total > 0 && (
        <div className="glass rounded-[16px] p-4 mb-6">
          <p className="text-xs text-text-muted mb-3">Trophées</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {badges.map((b) => (
              <div
                key={b.label}
                title={b.desc}
                className={`flex flex-col items-center text-center rounded-[12px] p-3 border transition-all ${
                  b.earned
                    ? "border-focus-violet/40 bg-focus-violet/10"
                    : "border-border bg-deep opacity-45 grayscale"
                }`}
              >
                <span className="text-2xl">{b.icon}</span>
                <span className="text-[11px] text-text mt-1 leading-tight">{b.label}</span>
                <span className="text-[9px] text-text-muted leading-tight">{b.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="glass rounded-[16px] p-4 mb-5 max-w-xl">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="Ex. Boire 2 L d'eau"
            className="w-full px-3 py-2 rounded-sm bg-[#0a0a14] border border-border text-sm text-text placeholder:text-text-muted/60 focus:border-act-cyan outline-none mb-3"
          />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 flex-wrap">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-8 h-8 rounded-sm text-lg transition-all ${
                    emoji === e ? "bg-act-cyan/15 scale-110" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    color === c ? "border-text" : "border-transparent"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={addHabit}
              disabled={!name.trim()}
              className="px-4 py-2 rounded-sm bg-act-cyan text-[#0a0a14] text-sm font-medium disabled:opacity-40"
            >
              Ajouter
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-4 py-2 rounded-sm text-sm text-text-muted hover:text-text"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Habit cards */}
      {total === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-[16px]">
          <p className="text-sm text-text-muted">Aucune habitude pour l'instant.</p>
          <button
            onClick={() => setAdding(true)}
            className="mt-3 text-sm text-act-cyan hover:underline"
          >
            + Créer ta première habitude
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.habits.map((h) => (
            <HabitCard key={h.id} habit={h} />
          ))}
        </div>
      )}

      <p className="text-[11px] text-text-muted mt-5">
        Chaque validation = +1 XP. Tes habitudes validées apparaissent aussi en pastilles sur le
        calendrier. 📅
      </p>
    </>
  );
}
