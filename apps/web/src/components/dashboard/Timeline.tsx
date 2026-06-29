"use client";

import { useEffect, useState } from "react";
import { ClockIcon } from "@/components/icons";
import {
  useStore,
  tasksForDate,
  categoryMeta,
  todayISO,
  type Task,
} from "@/lib/store";
import { useUI } from "./UIShell";

const DAY_START = 8 * 60;
const DAY_END = 21 * 60;
const SPAN = DAY_END - DAY_START;

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function Timeline() {
  const { state } = useStore();
  const { openEdit } = useUI();
  const tasks = tasksForDate(state, state.selectedDate);
  const isToday = state.selectedDate === todayISO();

  const [nowMin, setNowMin] = useState<number | null>(null);
  useEffect(() => {
    if (!isToday) {
      setNowMin(null);
      return;
    }
    const update = () => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [isToday]);

  const nowPct = nowMin != null ? ((nowMin - DAY_START) / SPAN) * 100 : null;
  const nowVisible = nowPct != null && nowPct >= 0 && nowPct <= 100;

  return (
    <section className="rounded-md border border-border bg-deep p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ClockIcon size={16} className="text-act-cyan" />
          <h2 className="text-sm font-medium text-text">Planning du jour</h2>
        </div>
        <span className="text-xs text-text-muted">08:00 — 21:00</span>
      </div>

      <div className="relative h-[88px] rounded-sm bg-[#0a0a14] border border-border overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-px bg-border/50"
            style={{ left: `${(i / 13) * 100}%` }}
          />
        ))}

        {tasks.map((task: Task) => {
          const startM = toMinutes(task.time);
          const left = ((startM - DAY_START) / SPAN) * 100;
          const width = (task.durationMin / SPAN) * 100;
          if (left < 0 || left > 100) return null;
          const color = categoryMeta[task.category].color;
          return (
            <button
              key={task.id}
              onClick={() => openEdit(task)}
              title={`${task.title} · ${task.time}`}
              className="absolute top-2 bottom-2 rounded-[6px] px-2 py-1 overflow-hidden text-left hover:brightness-125 transition-all"
              style={{
                left: `${left}%`,
                width: `${Math.max(width, 4)}%`,
                background: `color-mix(in srgb, ${color} 16%, transparent)`,
                borderLeft: `2px solid ${color}`,
                opacity: task.done ? 0.55 : 1,
              }}
            >
              <p
                className={`text-[10px] leading-tight truncate ${
                  task.done ? "line-through text-text-muted" : "text-text"
                }`}
              >
                {task.title}
              </p>
              <p className="text-[9px] leading-tight text-text-muted">{task.time}</p>
            </button>
          );
        })}

        {nowVisible && (
          <div
            className="absolute top-0 h-full w-px bg-act-cyan z-10"
            style={{ left: `${nowPct}%`, boxShadow: "0 0 8px rgba(6,182,212,0.6)" }}
          >
            <span className="absolute top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-act-cyan" />
          </div>
        )}
      </div>

      <div className="flex justify-between mt-2 px-0.5">
        {["08h", "11h", "14h", "17h", "20h"].map((h) => (
          <span key={h} className="text-[10px] text-text-muted">
            {h}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4">
        {Object.entries(categoryMeta).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
            <span className="text-[11px] text-text-muted">{meta.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
