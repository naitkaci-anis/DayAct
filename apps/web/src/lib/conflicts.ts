// Detect time overlaps between tasks on the same day.

export interface TimedTask {
  id?: string;
  date: string;
  time: string; // HH:MM
  durationMin: number;
}

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

// Existing tasks that overlap the candidate (same date, different id).
export function findOverlapping<T extends TimedTask>(
  tasks: T[],
  candidate: TimedTask
): T[] {
  const cs = toMin(candidate.time);
  const ce = cs + candidate.durationMin;
  return tasks.filter((t) => {
    if (t.date !== candidate.date) return false;
    if (candidate.id && t.id === candidate.id) return false;
    const ts = toMin(t.time);
    return rangesOverlap(cs, ce, ts, ts + t.durationMin);
  });
}

// Set of task ids that conflict with at least one other task on `date`.
export function conflictIdSet(tasks: TimedTask[], date: string): Set<string> {
  const day = tasks.filter((t) => t.date === date && t.id);
  const ids = new Set<string>();
  for (let i = 0; i < day.length; i++) {
    for (let j = i + 1; j < day.length; j++) {
      const a = day[i];
      const b = day[j];
      const as = toMin(a.time);
      const bs = toMin(b.time);
      if (rangesOverlap(as, as + a.durationMin, bs, bs + b.durationMin)) {
        ids.add(a.id!);
        ids.add(b.id!);
      }
    }
  }
  return ids;
}
