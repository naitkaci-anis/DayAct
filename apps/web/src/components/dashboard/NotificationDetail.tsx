"use client";

import { useEffect } from "react";
import { useStore, todayISO, addDays, formatLongDate, categoryMeta } from "@/lib/store";
import { useNotifications } from "@/lib/notifications";
import { CloseIcon, ClockIcon, CheckIcon } from "@/components/icons";
import { CategoryGlyph } from "@/components/today/TaskRow";

// Small window shown when a notification is tapped: what, where, when —
// then "J'ai compris" (clears the notification) or another action
// (Reporter / Annuler la tâche). No more jumping to the task editor.

function dayLabel(iso: string) {
  if (iso === todayISO()) return "Aujourd'hui";
  if (iso === addDays(todayISO(), 1)) return "Demain";
  return formatLongDate(iso);
}

function PinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function NotificationDetail({
  taskId,
  notificationId,
  onClose,
  onPostpone,
  onCancelTask,
}: {
  taskId: string | null;
  notificationId?: string;
  onClose: () => void;
  onPostpone: (taskId: string) => void;
  onCancelTask: (taskId: string) => void;
}) {
  const { state } = useStore();
  const { items, remove, markRead } = useNotifications();

  useEffect(() => {
    if (!taskId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [taskId, onClose]);

  if (!taskId) return null;

  const task = state.tasks.find((t) => t.id === taskId) ?? state.later.find((t) => t.id === taskId) ?? null;
  // Every notification about this task (reminder, "dépassée"…).
  const related = items.filter((n) => n.taskId === taskId || n.id === notificationId);
  const headline = related[0]?.body;

  const clearRelated = () => related.forEach((n) => remove(n.id));

  const understood = () => {
    clearRelated();
    onClose();
  };

  const cat = task ? categoryMeta[task.category] : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Rappel">
      <div className="absolute inset-0 bg-ink/40 animate-[fadeIn_0.15s_ease]" onClick={() => { related.forEach((n) => markRead(n.id)); onClose(); }} />

      <div className="relative z-10 w-full sm:max-w-md bg-panel border border-line rounded-t-[28px] sm:rounded-[28px] p-5 pb-[max(env(safe-area-inset-bottom),20px)] animate-[popIn_0.2s_ease] shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Rappel</p>
          <button onClick={onClose} aria-label="Fermer" className="w-11 h-11 -mr-2 -mt-3 flex items-center justify-center text-ink-muted hover:text-ink">
            <CloseIcon size={20} />
          </button>
        </div>

        {task && cat ? (
          <>
            <div className="flex items-center gap-3 -mt-1">
              <span
                className="flex items-center justify-center w-12 h-12 shrink-0 rounded-[14px]"
                style={{ color: cat.color, background: `color-mix(in srgb, ${cat.color} 13%, transparent)` }}
              >
                <CategoryGlyph category={task.category} size={24} />
              </span>
              <p className="font-display text-2xl leading-tight text-ink">{task.title}</p>
            </div>

            <dl className="mt-4 flex flex-col gap-2 text-[15px]">
              <div className="flex items-center gap-3">
                <dt className="text-ink-muted"><ClockIcon size={18} /><span className="sr-only">Quand</span></dt>
                <dd className="text-ink">
                  {dayLabel(task.date)} à {task.time} · {task.durationMin} min
                </dd>
              </div>
              <div className="flex items-center gap-3">
                <dt className="text-ink-muted"><PinIcon /><span className="sr-only">Lieu</span></dt>
                <dd className={task.location ? "text-ink" : "text-ink-muted"}>{task.location || "Lieu non précisé"}</dd>
              </div>
              {task.notes && <p className="text-sm text-ink-muted mt-1 whitespace-pre-line">{task.notes}</p>}
            </dl>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={understood}
                className="flex items-center justify-center gap-2 min-h-[54px] rounded-full bg-primary text-on-fill text-base font-semibold hover:bg-primary-hover"
              >
                <CheckIcon size={18} />
                J&apos;ai compris
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    clearRelated();
                    onClose();
                    onPostpone(task.id);
                  }}
                  className="min-h-[48px] rounded-full border border-line-strong bg-field text-[15px] font-medium text-ink hover:border-primary"
                >
                  Reporter
                </button>
                <button
                  onClick={() => {
                    clearRelated();
                    onClose();
                    onCancelTask(task.id);
                  }}
                  className="min-h-[48px] rounded-full border border-line-strong bg-field text-[15px] font-medium text-danger hover:border-danger/50"
                >
                  Annuler la tâche
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="font-display text-xl text-ink">{headline ?? "Cette tâche n'existe plus."}</p>
            <button
              onClick={understood}
              className="mt-5 w-full min-h-[54px] rounded-full bg-primary text-on-fill text-base font-semibold"
            >
              J&apos;ai compris
            </button>
          </>
        )}
      </div>
    </div>
  );
}
