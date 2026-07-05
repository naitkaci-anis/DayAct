// Pure date helpers for the calendar views. All dates are ISO "YYYY-MM-DD".
import { toISO, addDays } from "@/lib/store";

export const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function asDate(iso: string) {
  const { y, m, d } = parts(iso);
  return new Date(y, m - 1, d);
}

// Mon=0 … Sun=6
export function weekdayIndex(iso: string) {
  return (asDate(iso).getDay() + 6) % 7;
}

export function addMonths(iso: string, delta: number) {
  const { y, m, d } = parts(iso);
  const date = new Date(y, m - 1 + delta, 1);
  // clamp day to the target month's length
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(d, lastDay));
  return toISO(date);
}

export function startOfMonth(iso: string) {
  const { y, m } = parts(iso);
  return toISO(new Date(y, m - 1, 1));
}

export function mondayOf(iso: string) {
  return addDays(iso, -weekdayIndex(iso));
}

export function sameMonth(a: string, b: string) {
  return a.slice(0, 7) === b.slice(0, 7);
}

// 6 weeks × 7 days grid covering the month containing `iso`.
export function monthMatrix(iso: string): string[][] {
  const first = startOfMonth(iso);
  const gridStart = mondayOf(first);
  const weeks: string[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: string[] = [];
    for (let d = 0; d < 7; d++) row.push(addDays(gridStart, w * 7 + d));
    weeks.push(row);
  }
  return weeks;
}

export function weekDates(iso: string): string[] {
  const monday = mondayOf(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

// ── Labels (français, capitalisés) ─────────────────────────────────────────

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function frMonthYear(iso: string) {
  return cap(asDate(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }));
}

export function frDayLong(iso: string) {
  return cap(
    asDate(iso).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  );
}

export function frWeekRange(iso: string) {
  const dates = weekDates(iso);
  const start = asDate(dates[0]);
  const end = asDate(dates[6]);
  const startStr = start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const endStr = end.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

// ── Time helpers for week/day grids ────────────────────────────────────────

export function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(min: number, dayStart: number, dayEnd: number) {
  const t = Math.round(Math.max(dayStart, Math.min(dayEnd, min)) / 5) * 5;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

// Human duration: 45 → "45min", 360 → "6h", 390 → "6h30", 407 → "6h47".
export function formatDuration(mins: number) {
  if (mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}
