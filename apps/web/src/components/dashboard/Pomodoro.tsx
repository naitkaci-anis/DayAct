"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, ClockIcon } from "@/components/icons";
import { useStore, tasksForDate, todayISO } from "@/lib/store";

const FOCUS_MIN = 25;
const BREAK_MIN = 5;

type Mode = "focus" | "break";

export function Pomodoro({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const todayTasks = tasksForDate(state, todayISO());

  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MIN * 60);
  const [running, setRunning] = useState(false);
  const [taskId, setTaskId] = useState<string>("");
  const [completed, setCompleted] = useState(0);

  const total = (mode === "focus" ? FOCUS_MIN : BREAK_MIN) * 60;
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown
  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [running]);

  // Handle reaching zero
  useEffect(() => {
    if (secondsLeft > 0) return;
    setRunning(false);
    if (mode === "focus") {
      // Log the focused time onto the linked task.
      if (taskId) dispatch({ type: "ADD_TIME", id: taskId, minutes: FOCUS_MIN });
      setCompleted((c) => c + 1);
      setMode("break");
      setSecondsLeft(BREAK_MIN * 60);
      notify("Session de focus terminée 🎉", "Fais une pause de 5 minutes.");
    } else {
      setMode("focus");
      setSecondsLeft(FOCUS_MIN * 60);
      notify("Pause terminée", "Prêt pour une nouvelle session de focus ?");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  function reset() {
    setRunning(false);
    setSecondsLeft((mode === "focus" ? FOCUS_MIN : BREAK_MIN) * 60);
  }

  function skip() {
    setSecondsLeft(0);
  }

  function notify(title: string, body: string) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") new Notification(title, { body });
  }

  if (!open) return null;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const pct = ((total - secondsLeft) / total) * 100;
  const accent = mode === "focus" ? "var(--primary)" : "var(--success)";
  const linked = todayTasks.find((t) => t.id === taskId);

  // SVG ring
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[300px] rounded-md border border-line bg-surface shadow-2xl animate-[popIn_0.18s_ease]">
      <div className="flex items-center justify-between px-4 h-12 border-b border-line">
        <div className="flex items-center gap-2">
          <ClockIcon size={15} className="text-primary" />
          <span className="text-sm font-medium text-ink">Pomodoro</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ color: accent, background: `color-mix(in srgb, ${accent} 16%, transparent)` }}
          >
            {mode === "focus" ? "Focus" : "Pause"}
          </span>
        </div>
        <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Fermer">
          <CloseIcon size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col items-center">
        {/* timer ring */}
        <div className="relative w-[170px] h-[170px]">
          <svg width="170" height="170" viewBox="0 0 170 170" className="-rotate-90">
            <circle cx="85" cy="85" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
            <circle
              cx="85"
              cy="85"
              r={r}
              fill="none"
              stroke={accent}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-light text-ink tabular-nums">
              {mm}:{ss}
            </span>
            <span className="text-[11px] text-ink-muted mt-0.5">
              {completed} session{completed > 1 ? "s" : ""} ·{" "}
              {mode === "focus" ? `${FOCUS_MIN}min` : `${BREAK_MIN}min`}
            </span>
          </div>
        </div>

        {/* task link */}
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="mt-4 w-full px-2.5 py-1.5 rounded-sm bg-field border border-line text-xs text-ink focus:border-primary outline-none"
        >
          <option value="">— Lier à une tâche (optionnel) —</option>
          {todayTasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        {linked && (
          <p className="text-[10px] text-ink-muted mt-1.5">
            Temps suivi : {Math.floor(linked.timeSpentMin / 60)}h
            {String(linked.timeSpentMin % 60).padStart(2, "0")}
          </p>
        )}

        {/* controls */}
        <div className="flex items-center gap-2 mt-4 w-full">
          <button
            onClick={() => {
              if (!running && "Notification" in window && Notification.permission === "default") {
                Notification.requestPermission();
              }
              setRunning((r) => !r);
            }}
            className="flex-1 px-4 py-2 rounded-sm text-sm font-medium text-on-fill hover:opacity-90 transition-opacity"
            style={{ background: accent }}
          >
            {running ? "Pause" : "Démarrer"}
          </button>
          <button
            onClick={reset}
            className="px-3 py-2 rounded-sm border border-line text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Reset
          </button>
          <button
            onClick={skip}
            className="px-3 py-2 rounded-sm border border-line text-sm text-ink-muted hover:text-ink transition-colors"
            title="Passer à l'étape suivante"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
