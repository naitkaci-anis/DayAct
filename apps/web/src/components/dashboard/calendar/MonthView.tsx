"use client";

import { useStore, categoryMeta, todayISO, type Task } from "@/lib/store";
import { useUI } from "@/components/dashboard/UIShell";
import { WEEKDAYS, monthMatrix, sameMonth } from "@/lib/calendar";

export function MonthView({
  anchor,
  onOpenDay,
}: {
  anchor: string;
  onOpenDay: (date: string) => void;
}) {
  const { state } = useStore();
  const { openNew, openEdit } = useUI();
  const weeks = monthMatrix(anchor);
  const today = todayISO();

  const tasksByDate = new Map<string, Task[]>();
  for (const t of state.tasks) {
    const arr = tasksByDate.get(t.date) ?? [];
    arr.push(t);
    tasksByDate.set(t.date, arr);
  }

  // Completed-habit colors per date (surfaces habit chains on the calendar).
  const habitById = new Map(state.habits.map((h) => [h.id, h]));
  const habitColorsByDate = new Map<string, string[]>();
  for (const l of state.habitLogs) {
    const h = habitById.get(l.habitId);
    if (!h) continue;
    const arr = habitColorsByDate.get(l.date) ?? [];
    arr.push(h.color);
    habitColorsByDate.set(l.date, arr);
  }

  return (
    <div className="rounded-md border border-border bg-deep overflow-hidden">
      {/* weekday header */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[11px] text-text-muted border-r border-border last:border-r-0"
          >
            {d}
          </div>
        ))}
      </div>

      {/* weeks */}
      <div className="grid grid-rows-6">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
            {week.map((date) => {
              const inMonth = sameMonth(date, anchor);
              const isToday = date === today;
              const dayNum = Number(date.split("-")[2]);
              const dayTasks = (tasksByDate.get(date) ?? []).sort((a, b) =>
                a.time.localeCompare(b.time)
              );
              const shown = dayTasks.slice(0, 3);
              const extra = dayTasks.length - shown.length;

              return (
                <div
                  key={date}
                  onClick={() => openNew({ date, time: "09:00" })}
                  title="Cliquer pour ajouter une tâche"
                  className={`min-h-[96px] border-r border-border last:border-r-0 p-1.5 cursor-copy hover:bg-act-cyan/[0.04] transition-colors ${
                    inMonth ? "" : "bg-[#0a0a14]/40"
                  }`}
                >
                  {/* day number */}
                  <div className="flex justify-end mb-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDay(date);
                      }}
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-xs transition-colors ${
                        isToday
                          ? "bg-act-cyan text-[#0a0a14] font-medium"
                          : inMonth
                          ? "text-text hover:bg-[#1f2937]"
                          : "text-text-muted/50 hover:bg-[#1f2937]"
                      }`}
                    >
                      {dayNum}
                    </button>
                  </div>

                  {/* task chips */}
                  <div className="space-y-1">
                    {shown.map((t) => {
                      const color = categoryMeta[t.category].color;
                      return (
                        <button
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(t);
                          }}
                          title={`${t.title} · ${t.time}`}
                          className="flex w-full items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-left overflow-hidden hover:brightness-125 transition-all"
                          style={{
                            background: `color-mix(in srgb, ${color} 16%, transparent)`,
                            opacity: t.done ? 0.5 : 1,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: color }}
                          />
                          <span
                            className={`text-[10px] truncate ${
                              t.done ? "line-through text-text-muted" : "text-text"
                            }`}
                          >
                            {t.title}
                          </span>
                        </button>
                      );
                    })}
                    {extra > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDay(date);
                        }}
                        className="text-[10px] text-text-muted hover:text-text px-1.5"
                      >
                        +{extra} autre{extra > 1 ? "s" : ""}
                      </button>
                    )}
                  </div>

                  {/* habit pastilles */}
                  {(() => {
                    const done = habitColorsByDate.get(date) ?? [];
                    const remaining = isToday
                      ? Math.max(0, state.habits.length - done.length)
                      : 0;
                    if (done.length === 0 && remaining === 0) return null;
                    return (
                      <div
                        className="flex items-center gap-0.5 flex-wrap mt-1 px-1"
                        title="Habitudes"
                      >
                        {done.slice(0, 6).map((c, i) => (
                          <span
                            key={`d${i}`}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: c }}
                          />
                        ))}
                        {Array.from({ length: Math.min(remaining, 6 - Math.min(done.length, 6)) }).map(
                          (_, i) => (
                            <span
                              key={`r${i}`}
                              className="w-1.5 h-1.5 rounded-full border border-text-muted/40"
                            />
                          )
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
