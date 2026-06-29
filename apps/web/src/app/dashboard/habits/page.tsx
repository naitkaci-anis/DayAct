"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CheckIcon, TrashIcon, PlusIcon, FlameIcon } from "@/components/icons";
import {
  useStore,
  isHabitDone,
  habitStreak,
  todayISO,
  addDays,
} from "@/lib/store";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const EMOJIS = ["💧", "🏃", "🧘", "📚", "🥗", "😴", "✍️", "🎯", "🎸", "💊", "🚭", "🌱"];
const COLORS = ["#06b6d4", "#4ade80", "#a78bfa", "#fbbf24", "#f87171", "#f9fafb"];

function weekdayLetter(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAYS[(new Date(y, m - 1, d).getDay() + 6) % 7];
}

export default function HabitsPage() {
  const { state, dispatch } = useStore();
  const today = todayISO();
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

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

  const doneToday = state.habits.filter((h) => isHabitDone(state, h.id, today)).length;

  return (
    <>
      <PageHeader
        title="Habitudes"
        subtitle={`${doneToday}/${state.habits.length} faites aujourd'hui`}
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

      {/* Add form */}
      {adding && (
        <div className="rounded-md border border-border bg-deep p-4 mb-5 max-w-xl">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="Ex. Boire 2 L d'eau"
            className="w-full px-3 py-2 rounded-sm bg-[#0a0a14] border border-border text-sm text-text placeholder:text-text-muted/60 focus:border-act-cyan outline-none mb-3"
          />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
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

      {/* Habit list */}
      {state.habits.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-md">
          <p className="text-sm text-text-muted">Aucune habitude pour l'instant.</p>
          <button
            onClick={() => setAdding(true)}
            className="mt-3 text-sm text-act-cyan hover:underline"
          >
            + Créer ta première habitude
          </button>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-deep overflow-hidden max-w-3xl">
          {/* header row */}
          <div className="grid grid-cols-[1fr_repeat(7,32px)_60px] items-center gap-2 px-4 py-2 border-b border-border text-[11px] text-text-muted">
            <span>Habitude</span>
            {last7.map((d) => (
              <span key={d} className="text-center">
                {weekdayLetter(d)}
              </span>
            ))}
            <span className="text-center">Série</span>
          </div>

          {state.habits.map((h) => {
            const streak = habitStreak(state, h.id);
            return (
              <div
                key={h.id}
                className="group grid grid-cols-[1fr_repeat(7,32px)_60px] items-center gap-2 px-4 py-3 border-b border-border last:border-b-0 hover:bg-[#0a0a14] transition-colors"
              >
                {/* name */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{h.emoji}</span>
                  <span className="text-sm text-text truncate">{h.name}</span>
                  <button
                    onClick={() => dispatch({ type: "DELETE_HABIT", id: h.id })}
                    className="ml-1 p-1 text-text-muted hover:text-alert-red opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Supprimer"
                  >
                    <TrashIcon size={13} />
                  </button>
                </div>

                {/* 7-day checkboxes */}
                {last7.map((d) => {
                  const done = isHabitDone(state, h.id, d);
                  const isToday = d === today;
                  return (
                    <button
                      key={d}
                      onClick={() => dispatch({ type: "TOGGLE_HABIT", habitId: h.id, date: d })}
                      className={`mx-auto flex items-center justify-center w-7 h-7 rounded-[6px] border transition-colors ${
                        done ? "text-[#0a0a14]" : "border-[#374151] hover:border-current"
                      } ${isToday && !done ? "ring-1 ring-act-cyan/40" : ""}`}
                      style={
                        done
                          ? { background: h.color, borderColor: h.color }
                          : { color: h.color }
                      }
                      title={d}
                    >
                      {done && <CheckIcon size={13} />}
                    </button>
                  );
                })}

                {/* streak */}
                <span className="flex items-center justify-center gap-1 text-sm">
                  {streak > 0 ? (
                    <>
                      <FlameIcon size={13} className="text-energy-amber" />
                      <span className="text-text">{streak}</span>
                    </>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-text-muted mt-4">
        Coche une case pour valider l'habitude ce jour-là. La série compte les jours consécutifs.
      </p>
    </>
  );
}
