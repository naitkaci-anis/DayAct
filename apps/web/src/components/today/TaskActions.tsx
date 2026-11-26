"use client";

import { useEffect, useState } from "react";
import { useStore, addDays, todayISO, formatLongDate, categoryMeta, type Task } from "@/lib/store";
import { CheckIcon, CloseIcon, EditIcon, TrashIcon, ChevronRightIcon } from "@/components/icons";

// Bottom sheet (phone) / dialog (computer) with the three things you do to a
// task during the day: mark it done, postpone it (tomorrow by default, or a
// chosen day — optional), or cancel it. "Modifier" opens the full editor.

export type TaskActionsMode = "menu" | "postpone";

function shortDate(iso: string) {
  const today = todayISO();
  if (iso === today) return "aujourd'hui";
  if (iso === addDays(today, 1)) return "demain";
  if (iso === addDays(today, 2)) return "après-demain";
  return formatLongDate(iso).toLowerCase();
}

export function TaskActionsSheet({
  task,
  mode: initialMode,
  onClose,
  onEdit,
  onToast,
}: {
  task: Task | null;
  mode: TaskActionsMode;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onToast: (message: string, undo?: () => void) => void;
}) {
  const { dispatch } = useStore();
  const [mode, setMode] = useState<TaskActionsMode>(initialMode);
  const [customDate, setCustomDate] = useState("");

  useEffect(() => {
    setMode(initialMode);
    setCustomDate("");
  }, [task, initialMode]);

  useEffect(() => {
    if (!task) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [task, onClose]);

  if (!task) return null;

  const base = task.date < todayISO() ? todayISO() : task.date;
  const tomorrow = addDays(base, 1);
  const cat = categoryMeta[task.category];

  const postpone = (date: string) => {
    const previous = task.date;
    dispatch({ type: "UPDATE_TASK", id: task.id, patch: { date, done: false } });
    onToast(`Reportée à ${shortDate(date)}`, () =>
      dispatch({ type: "UPDATE_TASK", id: task.id, patch: { date: previous } })
    );
    onClose();
  };

  const cancel = () => {
    const snapshot = { ...task };
    dispatch({ type: "DELETE_TASK", id: task.id });
    onToast("Tâche annulée", () => dispatch({ type: "RESTORE_TASK", task: snapshot }));
    onClose();
  };

  const toggleDone = () => {
    dispatch({ type: "TOGGLE_TASK", id: task.id });
    if (!task.done) onToast("Bravo, c'est fait");
    onClose();
  };

  const big =
    "w-full flex items-center gap-3 min-h-[52px] px-4 rounded-[16px] text-[15px] font-medium transition-colors text-left";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={`Actions pour ${task.title}`}>
      <div className="absolute inset-0 bg-ink/35 animate-[fadeIn_0.15s_ease]" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md bg-panel border border-line rounded-t-[28px] sm:rounded-[28px] p-5 pb-[max(env(safe-area-inset-bottom),20px)] animate-[popIn_0.2s_ease] shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
          <div className="flex-1 min-w-0">
            <p className="font-display text-xl text-ink leading-tight">{task.title}</p>
            <p className="text-sm text-ink-muted mt-1">
              {shortDate(task.date)} · {task.time} · {task.durationMin} min · {cat.label}
            </p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="w-11 h-11 -mr-2 -mt-2 flex items-center justify-center text-ink-muted hover:text-ink">
            <CloseIcon size={20} />
          </button>
        </div>

        {mode === "menu" ? (
          <div className="mt-5 flex flex-col gap-2">
            <button onClick={toggleDone} className={`${big} bg-primary text-on-fill hover:bg-primary-hover`}>
              <CheckIcon size={20} />
              {task.done ? "Marquer comme pas faite" : "C'est fait"}
            </button>
            <button onClick={() => setMode("postpone")} className={`${big} bg-field border border-line text-ink hover:border-line-strong`}>
              <ChevronRightIcon size={20} className="text-secondary" />
              <span className="flex-1">Reporter</span>
              <span className="text-sm font-normal text-ink-muted">demain par défaut</span>
            </button>
            <button onClick={cancel} className={`${big} bg-field border border-line text-danger hover:border-danger/40`}>
              <TrashIcon size={20} />
              Annuler la tâche
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="mt-1 flex items-center justify-center gap-2 min-h-[44px] text-sm text-ink-muted hover:text-ink"
            >
              <EditIcon size={16} />
              Modifier les détails
            </button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            <button onClick={() => postpone(tomorrow)} className={`${big} bg-primary text-on-fill hover:bg-primary-hover justify-center`}>
              Reporter à {shortDate(tomorrow)}
            </button>
            <button onClick={() => postpone(addDays(tomorrow, 1))} className={`${big} bg-field border border-line text-ink hover:border-line-strong justify-center`}>
              Reporter à {shortDate(addDays(tomorrow, 1))}
            </button>

            <div className="mt-2 rounded-[16px] border border-line bg-field p-3">
              <label htmlFor="postpone-date" className="block text-sm text-ink-muted mb-2">
                Choisir un autre jour <span className="text-ink-muted/70">(facultatif)</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="postpone-date"
                  type="date"
                  min={addDays(todayISO(), 1)}
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="flex-1 min-w-0 h-11 px-3 rounded-[12px] border border-line bg-panel text-ink text-[15px] focus:border-primary outline-none"
                />
                <button
                  onClick={() => customDate && postpone(customDate)}
                  disabled={!customDate}
                  className="h-11 px-4 rounded-[12px] bg-ink text-on-fill text-sm font-medium disabled:opacity-40"
                >
                  OK
                </button>
              </div>
            </div>

            <button onClick={() => setMode("menu")} className="mt-1 min-h-[44px] text-sm text-ink-muted hover:text-ink">
              Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Small toast at the bottom with an optional "undo".
export function UndoToast({
  toast,
  onDone,
}: {
  toast: { id: number; message: string; undo?: () => void } | null;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  if (!toast) return null;
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-[calc(96px+env(safe-area-inset-bottom))] md:bottom-8 z-50 animate-[popIn_0.2s_ease]" role="status">
      <div className="flex items-center gap-4 pl-5 pr-2 py-2 rounded-full bg-ink text-on-fill shadow-2xl text-sm">
        <span>{toast.message}</span>
        {toast.undo && (
          <button
            onClick={() => {
              toast.undo?.();
              onDone();
            }}
            className="min-h-[40px] px-4 rounded-full bg-on-fill/15 font-medium hover:bg-on-fill/25"
          >
            Rétablir
          </button>
        )}
      </div>
    </div>
  );
}
