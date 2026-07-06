"use client";

import { useEffect, useRef, useState } from "react";
import { useStore, categoryMeta, todayISO } from "@/lib/store";
import { useUI } from "@/components/dashboard/UIShell";
import { WEEKDAYS, weekDates, toMinutes, minutesToTime } from "@/lib/calendar";
import { conflictIdSet } from "@/lib/conflicts";

const DAY_START = 0;
const DAY_END = 24 * 60;
const SPAN = DAY_END - DAY_START; // journée complète 0h → 24h
const HEIGHT = 1152; // 48px / heure
const PX_PER_MIN = HEIGHT / SPAN;
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0h → 23h

type Drag = {
  id: string;
  mode: "move" | "resize";
  originY: number;
  baseStart: number;
  baseDur: number;
  baseDate: string;
  moved: boolean;
};

export function WeekView({
  anchor,
  onOpenDay,
}: {
  anchor: string;
  onOpenDay: (date: string) => void;
}) {
  const { state, dispatch } = useStore();
  const { openNew, openEdit } = useUI();
  const dates = weekDates(anchor);
  const today = todayISO();

  const [nowMin, setNowMin] = useState<number | null>(null);
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Drag & drop (time + day + resize) ──────────────────────────────────────
  const [drag, setDrag] = useState<Drag | null>(null);
  const [draft, setDraft] = useState<{ start: number; dur: number; date: string } | null>(null);

  useEffect(() => {
    if (!drag) return;
    function onMove(e: PointerEvent) {
      const deltaMin = (e.clientY - drag!.originY) / PX_PER_MIN;
      if (Math.abs(e.clientY - drag!.originY) > 3) drag!.moved = true;
      if (drag!.mode === "resize") {
        const dur = Math.round((drag!.baseDur + deltaMin) / 5) * 5;
        setDraft({ start: drag!.baseStart, dur: Math.max(5, dur), date: drag!.baseDate });
        return;
      }
      // move: time + day (day from column under the pointer)
      const start = Math.round((drag!.baseStart + deltaMin) / 5) * 5;
      let date = drag!.baseDate;
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const col = el?.closest("[data-day]") as HTMLElement | null;
      if (col?.dataset.day) date = col.dataset.day;
      setDraft({ start: Math.max(0, Math.min(1440 - drag!.baseDur, start)), dur: drag!.baseDur, date });
    }
    function onUp() {
      if (drag!.moved && draft) {
        dispatch({
          type: "UPDATE_TASK",
          id: drag!.id,
          patch: {
            time: minutesToTime(draft.start, 0, 1440),
            durationMin: draft.dur,
            date: draft.date,
          },
        });
      }
      setDrag(null);
      setDraft(null);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, draft, dispatch]);

  const showNow = dates.includes(today) && nowMin != null;
  const nowTop = nowMin != null ? ((nowMin - DAY_START) / SPAN) * HEIGHT : 0;

  // Ouvre le planning autour de 7h (la nuit reste accessible en scrollant).
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = ((7 * 60) / SPAN) * HEIGHT;
  }, [anchor]);

  return (
    <div className="rounded-md border border-border bg-deep overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
      {/* headers */}
      <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-border">
        <div className="border-r border-border" />
        {dates.map((date, i) => {
          const isToday = date === today;
          const dayNum = Number(date.split("-")[2]);
          return (
            <button
              key={date}
              onClick={() => onOpenDay(date)}
              className="flex flex-col items-center py-2 border-r border-border last:border-r-0 hover:bg-[#0a0a14] transition-colors"
            >
              <span className="text-[11px] text-text-muted">{WEEKDAYS[i]}</span>
              <span
                className={`mt-0.5 flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                  isToday ? "bg-act-cyan text-[#0a0a14] font-medium" : "text-text"
                }`}
              >
                {dayNum}
              </span>
            </button>
          );
        })}
      </div>

      {/* body */}
      <div ref={bodyRef} className="grid grid-cols-[48px_repeat(7,1fr)] overflow-y-auto" style={{ maxHeight: 560 }}>
        <div className="relative border-r border-border" style={{ height: HEIGHT }}>
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute right-2 -translate-y-1/2 text-[10px] text-text-muted"
              style={{ top: `${((h * 60 - DAY_START) / SPAN) * 100}%` }}
            >
              {h}h
            </div>
          ))}
        </div>

        {dates.map((date) => {
          const dayTasks = state.tasks.filter(
            (t) => t.date === date || (drag?.id && draft?.date === date && t.id === drag.id)
          );
          const conflicts = conflictIdSet(state.tasks, date);
          const isToday = date === today;
          return (
            <div
              key={date}
              data-day={date}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const min = DAY_START + ((e.clientY - rect.top) / rect.height) * SPAN;
                openNew({ date, time: minutesToTime(min, DAY_START, DAY_END) });
              }}
              title="Cliquer pour ajouter une tâche"
              className="relative border-r border-border last:border-r-0 cursor-copy hover:bg-act-cyan/[0.03]"
              style={{ height: HEIGHT }}
            >
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute left-0 w-full border-t border-border/30 pointer-events-none"
                  style={{ top: `${((h * 60 - DAY_START) / SPAN) * 100}%` }}
                />
              ))}

              {dayTasks.map((t) => {
                const isDragged = drag?.id === t.id && draft;
                if (isDragged && draft!.date !== date) return null; // render on target column only
                const startM = isDragged ? draft!.start : toMinutes(t.time);
                const dur = isDragged ? draft!.dur : t.durationMin;
                const top = ((startM - DAY_START) / SPAN) * 100;
                if (top < -10 || top > 110) return null;
                const height = (dur / SPAN) * 100;
                const color = categoryMeta[t.category].color;
                return (
                  <div
                    key={t.id}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setDrag({
                        id: t.id,
                        mode: "move",
                        originY: e.clientY,
                        baseStart: toMinutes(t.time),
                        baseDur: t.durationMin,
                        baseDate: t.date,
                        moved: false,
                      });
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!drag?.moved) openEdit(t);
                    }}
                    className={`absolute left-0.5 right-0.5 rounded-[5px] px-1.5 py-1 overflow-hidden select-none ${
                      isDragged
                        ? "cursor-grabbing z-30 ring-1 ring-act-cyan pointer-events-none"
                        : conflicts.has(t.id)
                        ? "cursor-grab z-10 ring-1 ring-alert-red hover:brightness-125"
                        : "cursor-grab z-10 hover:brightness-125"
                    }`}
                    style={{
                      top: `${top}%`,
                      height: `${Math.max(height, 4)}%`,
                      background: `color-mix(in srgb, ${color} 20%, transparent)`,
                      borderLeft: `2px solid ${color}`,
                      opacity: t.done ? 0.5 : 1,
                    }}
                  >
                    <p className="text-[10px] leading-tight text-text truncate">{t.title}</p>
                    <p className="text-[9px] leading-tight text-text-muted">
                      {minutesToTime(startM, 0, 1440)}
                    </p>
                    <div
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDrag({
                          id: t.id,
                          mode: "resize",
                          originY: e.clientY,
                          baseStart: toMinutes(t.time),
                          baseDur: t.durationMin,
                          baseDate: t.date,
                          moved: false,
                        });
                      }}
                      className="absolute left-0 right-0 bottom-0 h-1.5 cursor-ns-resize"
                    />
                  </div>
                );
              })}

              {isToday && showNow && nowTop >= 0 && nowTop <= HEIGHT && (
                <div
                  className="absolute left-0 w-full h-px bg-act-cyan z-20 pointer-events-none"
                  style={{ top: nowTop, boxShadow: "0 0 6px rgba(6,182,212,0.7)" }}
                >
                  <span className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-act-cyan" />
                </div>
              )}
            </div>
          );
        })}
      </div>
        </div>
      </div>
    </div>
  );
}
