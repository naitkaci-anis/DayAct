import { todayISO } from "@/lib/store";
import type { Task } from "@/lib/store";

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// A task is "overdue" if it's not done and its start time is already in the past.
export function isOverdue(task: Task, now: Date = new Date()): boolean {
  if (task.done) return false;
  const today = todayISO();
  if (task.date < today) return true;
  if (task.date > today) return false;
  return toMin(task.time) < now.getHours() * 60 + now.getMinutes();
}
