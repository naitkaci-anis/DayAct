"use client";

import { useEffect, useRef } from "react";
import { useStore, todayISO, addDays, reminderLeads } from "@/lib/store";
import { useNotifications } from "@/lib/notifications";
import { playReminderSound } from "@/lib/sound";
import { formatDuration } from "@/lib/calendar";

const SENT_KEY = "dayact-reminded-v2";

function taskStartMs(date: string, time: string) {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return new Date(y, mo - 1, d, h, mi, 0, 0).getTime();
}

// Human label for a "before" reminder.
function leadLabel(leadMin: number) {
  if (leadMin >= 1440) return "Demain";
  if (leadMin >= 60) return `Dans ${Math.round(leadMin / 60)} h`;
  return `Dans ${leadMin} min`;
}

/**
 * Watches tasks and feeds the in-app notification center (+ browser popups & a
 * sound when allowed). Per-task `reminder` preference drives the "before"
 * reminders; "auto" = 1 day + 3 h before.
 */
export function ReminderScheduler() {
  const { state } = useStore();
  const notify = useNotifications();
  const sent = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SENT_KEY);
      if (raw) sent.current = new Set(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const persist = () => {
      try {
        // keep it bounded
        localStorage.setItem(SENT_KEY, JSON.stringify([...sent.current].slice(-400)));
      } catch {
        /* ignore */
      }
    };

    const browserAllowed = () =>
      state.settings.notifications &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted";

    const fire = (
      key: string,
      title: string,
      body: string,
      type: "reminder" | "overdue",
      taskId: string,
      ring: boolean
    ) => {
      if (sent.current.has(key)) return;
      notify.add({ type, title, body, taskId });
      if (ring) playReminderSound();
      if (browserAllowed()) new Notification(title, { body });
      sent.current.add(key);
      persist();
    };

    const check = () => {
      const today = todayISO();
      const now = Date.now();
      // window: yesterday → +2 days (covers overdue today + 1-day-before of upcoming)
      const lo = addDays(today, -1);
      const hi = addDays(today, 2);

      for (const t of state.tasks) {
        if (t.done) continue;
        if (t.date < lo || t.date > hi) continue;

        const start = taskStartMs(t.date, t.time);
        const end = start + t.durationMin * 60_000;

        // "before" reminders, per task preference
        for (const lead of reminderLeads[t.reminder] ?? []) {
          const target = start - lead * 60_000;
          if (now >= target && now < target + 60_000) {
            fire(
              `${t.id}|lead${lead}`,
              `🔔 ${leadLabel(lead)} : ${t.title}`,
              `Prévue le ${t.date.slice(5)} à ${t.time} · ${formatDuration(t.durationMin)}.`,
              "reminder",
              t.id,
              true
            );
          }
        }

        // at start time
        if (now >= start && now < start + 60_000) {
          fire(
            `${t.id}|now`,
            `⏰ ${t.title}`,
            `C'est l'heure (${t.time}) · ${formatDuration(t.durationMin)}.`,
            "reminder",
            t.id,
            true
          );
        }

        // slot passed without being done → "tâche dépassée" (today only, inbox + popup)
        if (t.date === today && now >= end) {
          fire(
            `${t.id}|overdue`,
            `⚠ Tâche dépassée : ${t.title}`,
            `Prévue à ${t.time}, elle n'a pas été marquée comme faite.`,
            "overdue",
            t.id,
            false
          );
        }
      }
    };

    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [state, notify]);

  return null;
}
