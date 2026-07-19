"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@/components/icons";
import { useStore, categoryMeta, priorityMeta, todayISO, type Task } from "@/lib/store";
import { useUI } from "@/components/dashboard/UIShell";
import { frDayLong, toMinutes, minutesToTime, formatDuration } from "@/lib/calendar";
import { conflictIdSet } from "@/lib/conflicts";

const DAY_START = 0;
const DAY_END = 24 * 60;
const SPAN = DAY_END - DAY_START; // journée complète 0h → 24h
const HEIGHT = 1440; // 1px = 1 min
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0h → 23h

type Drag = {
  id: string;
  mode: "move" | "resize";
  originY: number;
  baseStart: number; // minutes
  baseDur: number;
  moved: boolean;
};

export function DayView({ date }: { date: string }) {
  const { state, dispatch } = useStore();
  const { openNew, openEdit } = useUI();
  const isToday = date === todayISO();

  const dayTasks = state.tasks
    .filter((t) => t.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
  const done = dayTasks.filter((t) => t.done).length;
  const conflicts = conflictIdSet(state.tasks, date);

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

  // ── Drag & drop ──────────────────────────────────────────────────────────
  const [drag, setDrag] = useState<Drag | null>(null);
  const [draft, setDraft] = useState<{ start: number; dur: number } | null>(null);

  useEffect(() => {
    if (!drag) return;
    function onMove(e: PointerEvent) {
      const deltaMin = e.clientY - drag!.originY; // 1px = 1min
      if (Math.abs(deltaMin) > 3) drag!.moved = true;
      if (drag!.mode === "move") {
        const start = Math.round((drag!.baseStart + deltaMin) / 5) * 5;
        setDraft({ start: Math.max(0, Math.min(1440 - drag!.baseDur, start)), dur: drag!.baseDur });
      } else {
        const dur = Math.round((drag!.baseDur + deltaMin) / 5) * 5;
        setDraft({ start: drag!.baseStart, dur: Math.max(5, dur) });
      }
    }
    function onUp() {
      if (drag!.moved && draft) {
        dispatch({
          type: "UPDATE_TASK",
          id: drag!.id,
          patch: {
            time: minutesToTime(draft.start, 0, 1440),
            durationMin: draft.dur,
          },
        });
      }
      setDrag(null);
      setDraft(null);
    }
    // Browser-cancelled gesture (e.g. scroll takeover) → drop the draft cleanly.
    function onCancel() {
      setDrag(null);
      setDraft(null);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [drag, draft, dispatch]);

  const nowTop = nowMin != null ? ((nowMin - DAY_START) / SPAN) * HEIGHT : 0;

  // Ouvre la journée autour de 7h (la nuit reste accessible en scrollant).
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = ((7 * 60) / SPAN) * HEIGHT;
  }, [date]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div className="rounded-md border border-border bg-deep overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-text capitalize">{frDayLong(date)}</h3>
          <span className="text-xs text-text-muted">
            {done}/{dayTasks.length} terminées
          </span>
        </div>

        <div ref={bodyRef} className="overflow-y-auto" style={{ maxHeight: 600 }}>
          <div className="grid grid-cols-[56px_1fr]">
            <div className="relative border-r border-border" style={{ height: HEIGHT }}>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute right-2 -translate-y-1/2 text-[11px] text-text-muted font-mono"
                  style={{ top: `${((h * 60 - DAY_START) / SPAN) * 100}%` }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const min = DAY_START + ((e.clientY - rect.top) / rect.height) * SPAN;
                openNew({ date, time: minutesToTime(min, DAY_START, DAY_END) });
              }}
              title="Cliquer pour ajouter une tâche"
              className="relative cursor-copy hover:bg-act-cyan/[0.02]"
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
                        moved: false,
                      });
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!drag?.moved) openEdit(t);
                    }}
                    className={`absolute left-2 right-3 rounded-[6px] px-2.5 py-1.5 overflow-hidden select-none ${
                      isDragged
                        ? "cursor-grabbing z-30 ring-1 ring-act-cyan"
                        : conflicts.has(t.id)
                        ? "cursor-grab z-10 ring-1 ring-alert-red hover:brightness-125"
                        : "cursor-grab z-10 hover:brightness-125"
                    } transition-[filter]`}
                    style={{
                      top: `${top}%`,
                      height: `${Math.max(height, 3)}%`,
                      background: `color-mix(in srgb, ${color} 18%, transparent)`,
                      borderLeft: `3px solid ${color}`,
                      opacity: t.done ? 0.55 : 1,
                      // Without this, mobile browsers hijack the drag to scroll.
                      touchAction: "none",
                    }}
                  >
                    <p
                      className={`text-xs leading-tight truncate ${
                        t.done ? "line-through text-text-muted" : "text-text"
                      }`}
                    >
                      {t.title}
                    </p>
                    <p className="text-[10px] leading-tight text-text-muted">
                      {minutesToTime(startM, 0, 1440)} · {formatDuration(dur)}
                    </p>

                    {/* resize handle */}
                    <div
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDrag({
                          id: t.id,
                          mode: "resize",
                          originY: e.clientY,
                          baseStart: toMinutes(t.time),
                          baseDur: t.durationMin,
                          moved: false,
                        });
                      }}
                      className="absolute left-0 right-0 bottom-0 h-2 cursor-ns-resize"
                      title="Redimensionner"
                    />
                  </div>
                );
              })}

              {isToday && nowMin != null && nowTop >= 0 && nowTop <= HEIGHT && (
                <div
                  className="absolute left-0 w-full h-px bg-act-cyan z-20 pointer-events-none"
                  style={{ top: nowTop, boxShadow: "0 0 6px rgba(6,182,212,0.7)" }}
                >
                  <span className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-act-cyan" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* agenda list */}
      <div className="rounded-md border border-border bg-deep p-4 lg:self-start">
        <h3 className="text-sm font-medium text-text mb-3">Agenda</h3>
        <ul className="space-y-1">
          {dayTasks.length === 0 && (
            <li className="text-xs text-text-muted py-6 text-center">
              Rien de prévu.
              <button
                onClick={() => openNew({ date, time: "09:00" })}
                className="block mx-auto mt-2 text-act-cyan hover:underline"
              >
                + Ajouter
              </button>
            </li>
          )}
          {dayTasks.map((t) => {
            const cat = categoryMeta[t.category];
            const prio = priorityMeta[t.priority];
            return (
              <li key={t.id} className="flex items-center gap-2.5 rounded-sm px-1.5 py-1.5 hover:bg-[#0a0a14]">
                <button
                  onClick={() => dispatch({ type: "TOGGLE_TASK", id: t.id })}
                  className={`flex items-center justify-center w-[16px] h-[16px] shrink-0 rounded-[4px] border transition-colors ${
                    t.done ? "bg-act-cyan border-act-cyan text-[#0a0a14]" : "border-[#374151] hover:border-act-cyan"
                  }`}
                >
                  {t.done && <CheckIcon size={10} />}
                </button>
                <button onClick={() => openEdit(t)} className="flex-1 min-w-0 text-left">
                  <span className={`block text-[13px] truncate ${t.done ? "line-through text-text-muted" : "text-text"}`}>
                    {t.title}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">{t.time}</span>
                  <span className="text-[10px] ml-1.5" style={{ color: cat.color }}>
                    {cat.label}
                  </span>
                </button>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: prio.color }} />
              </li>
            );
          })}
        </ul>
        <p className="text-[10px] text-text-muted mt-3 text-center">
          Glisse un bloc pour le déplacer · tire le bas pour la durée
        </p>
      </div>
    </div>
  );
}
