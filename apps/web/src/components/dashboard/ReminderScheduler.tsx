"use client";

import { useEffect, useRef } from "react";
import { useStore, tasksForDate, todayISO } from "@/lib/store";

const STORAGE_KEY = "dayact-reminded";

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Headless component: fires a browser notification at each (not-done) task's
 * start time. Runs only when notifications are enabled and permission granted.
 */
export function ReminderScheduler() {
  const { state } = useStore();
  const notified = useRef<Set<string>>(new Set());

  // restore today's already-sent reminders
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { date: string; ids: string[] };
        if (parsed.date === todayISO()) notified.current = new Set(parsed.ids);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!state.settings.notifications) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const LEAD = 10; // minutes before start for the anticipated reminder

    const fire = (key: string, title: string, body: string) => {
      if (notified.current.has(key)) return;
      new Notification(title, { body });
      notified.current.add(key);
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ date: todayISO(), ids: [...notified.current] })
        );
      } catch {
        /* ignore */
      }
    };

    const check = () => {
      if (Notification.permission !== "granted") return;
      const today = todayISO();
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const dayTasks = tasksForDate(state, today).filter((t) => !t.done);

      for (let i = 0; i < dayTasks.length; i++) {
        const t = dayTasks[i];
        const start = toMin(t.time);
        const next = dayTasks[i + 1];

        // 1) anticipated reminder ~10 min before
        const lead = start - LEAD;
        if (nowMin >= lead && nowMin < start && lead >= 0) {
          fire(
            `${today}|${t.id}|lead`,
            `🔔 Dans ${start - nowMin} min : ${t.title}`,
            `À ${t.time} · ${t.durationMin} min. Prépare-toi.`
          );
        }

        // 2) it's happening now
        if (start <= nowMin && nowMin - start <= 1) {
          const after = next ? ` · ensuite : ${next.title} à ${next.time}` : "";
          fire(
            `${today}|${t.id}|now`,
            `⏰ ${t.title}`,
            `C'est l'heure (${t.time}) · ${t.durationMin} min${after}`
          );
        }
      }
    };

    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [state]);

  return null;
}
