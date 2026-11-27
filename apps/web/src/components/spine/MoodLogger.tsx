"use client";

import { WellbeingIcon } from "@/components/icons";
import { useStore, moodForDate, addDays } from "@/lib/store";

const levels = [
  { score: 20, emoji: "😞", label: "Difficile" },
  { score: 40, emoji: "😕", label: "Bof" },
  { score: 60, emoji: "😐", label: "Correct" },
  { score: 80, emoji: "🙂", label: "Bien" },
  { score: 100, emoji: "😄", label: "Excellent" },
];

function moodColor(score: number) {
  if (score >= 70) return "var(--success)";
  if (score >= 55) return "var(--primary)";
  if (score >= 40) return "var(--warning)";
  return "var(--danger)";
}

export function MoodLogger() {
  const { state, dispatch } = useStore();
  const { selectedDate } = state;
  const current = moodForDate(state, selectedDate);

  // build last 7 days ending on selectedDate
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(selectedDate, i - 6);
    return { date, score: moodForDate(state, date) };
  });
  const max = Math.max(...week.map((w) => w.score ?? 0), 100);

  return (
    <section className="rounded-md border border-line bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <WellbeingIcon size={15} className="text-secondary-ink" />
          <h2 className="text-sm font-medium text-ink">Humeur</h2>
        </div>
        {current != null && <span className="text-xs text-ink-muted">{current}/100</span>}
      </div>

      {/* level picker */}
      <div className="flex items-center justify-between gap-1 mb-4">
        {levels.map((lvl) => {
          const active = current === lvl.score;
          return (
            <button
              key={lvl.score}
              onClick={() =>
                dispatch({ type: "LOG_MOOD", date: selectedDate, score: lvl.score })
              }
              title={lvl.label}
              className={`flex-1 flex items-center justify-center text-xl rounded-sm py-1.5 transition-all ${
                active
                  ? "bg-secondary/15 scale-110"
                  : "opacity-50 hover:opacity-100 hover:bg-field"
              }`}
            >
              {lvl.emoji}
            </button>
          );
        })}
      </div>

      {/* week mini chart */}
      <div className="flex items-end justify-between gap-1.5 h-14">
        {week.map((w, i) => {
          const isLast = i === 6;
          const h = w.score != null ? (w.score / max) * 100 : 4;
          return (
            <div key={w.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center h-full">
                <div
                  className="w-full max-w-[12px] rounded-[2px] transition-all"
                  style={{
                    height: `${h}%`,
                    background: w.score != null ? moodColor(w.score) : "var(--line)",
                    opacity: w.score == null ? 0.5 : isLast ? 1 : 0.5,
                  }}
                  title={w.score != null ? `${w.score}` : "non renseigné"}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-ink-muted text-center mt-1.5">
        {current == null
          ? "Comment te sens-tu aujourd'hui ?"
          : "Humeur enregistrée — modifiable à tout moment"}
      </p>
    </section>
  );
}
