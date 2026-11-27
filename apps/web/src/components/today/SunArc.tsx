"use client";

import { useEffect } from "react";
import { motion, animate, useMotionValue, useTransform } from "motion/react";
import { categoryMeta, type Task } from "@/lib/store";

// "Course du soleil": the day drawn as the sun's path from waking to bedtime.
// Each task is a dot on the arc (filled = done), the sun marks the current time.

const W = 350;
const H = 150;
const CX = 175;
const CY = 118;
const RX = 148;
const RY = 92;

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

function point(min: number, startMin: number, endMin: number) {
  const t = Math.min(1, Math.max(0, (min - startMin) / (endMin - startMin)));
  return {
    x: CX - RX * Math.cos(Math.PI * t),
    y: CY - RY * Math.sin(Math.PI * t),
  };
}

function hourLabel(min: number) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

export function dayBounds(tasks: Task[]) {
  // Wake 7 h / bed 23 h by default, stretched to fit early or late tasks.
  let start = 7 * 60;
  let end = 23 * 60;
  for (const t of tasks) {
    const s = toMin(t.time);
    start = Math.min(start, Math.floor(s / 60) * 60);
    end = Math.max(end, Math.min(24 * 60, Math.ceil((s + t.durationMin) / 60) * 60));
  }
  return { start, end };
}

export function SunArc({
  tasks,
  nowMin,
  onPick,
}: {
  tasks: Task[];
  nowMin: number;
  onPick?: (task: Task) => void;
}) {
  const { start, end } = dayBounds(tasks);
  const done = tasks.filter((t) => t.done).length;
  const left = tasks.length - done;
  const isDay = nowMin >= start && nowMin <= end;

  // The sun travels along the arc (from sunrise on first load, then minute by minute).
  const sunMin = useMotionValue(start);
  const target = Math.min(Math.max(nowMin, start), end);
  useEffect(() => {
    const controls = animate(sunMin, target, { duration: 1.6, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [sunMin, target]);
  const sunX = useTransform(sunMin, (m) => point(m, start, end).x);
  const sunY = useTransform(sunMin, (m) => point(m, start, end).y);
  const now = new Date();
  const clock = `${now.getHours()} h ${String(now.getMinutes()).padStart(2, "0")}`;

  // Progress path from the start of the day to "now".
  const p0 = point(start, start, end);
  const p1 = point(Math.min(Math.max(nowMin, start), end), start, end);

  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Course du soleil : il est ${clock}, ${done} tâche${done > 1 ? "s" : ""} faite${done > 1 ? "s" : ""} sur ${tasks.length}`}
      >
        <path
          d={`M${CX - RX} ${CY} A${RX} ${RY} 0 0 1 ${CX + RX} ${CY}`}
          fill="none"
          stroke="rgb(var(--line-strong-rgb))"
          strokeWidth="3"
          strokeDasharray="2 7"
          strokeLinecap="round"
        />
        {nowMin > start && (
          <motion.path
            d={`M${p0.x} ${p0.y} A${RX} ${RY} 0 0 1 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
        <line x1="8" y1={CY} x2={W - 8} y2={CY} stroke="var(--line)" strokeWidth="1" />

        {tasks.map((t, i) => {
          const p = point(toMin(t.time), start, end);
          const color = categoryMeta[t.category].color;
          return (
            <motion.circle
              key={t.id}
              cx={p.x}
              cy={p.y}
              initial={{ r: 0 }}
              animate={{ r: 6 }}
              transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 500, damping: 18 }}
              fill={t.done ? color : "rgb(var(--canvas-rgb))"}
              stroke={color}
              strokeWidth={t.done ? 0 : 2.5}
              className={onPick ? "cursor-pointer" : undefined}
              onClick={onPick ? () => onPick(t) : undefined}
            >
              <title>{`${t.time} · ${t.title}`}</title>
            </motion.circle>
          );
        })}

        {isDay && (
          <g aria-hidden="true">
            <motion.circle
              cx={sunX}
              cy={sunY}
              r={16}
              fill="var(--cream)"
              animate={{ r: [15, 19, 15], opacity: [0.95, 0.6, 0.95] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle cx={sunX} cy={sunY} r={10} fill="var(--cat-learning)" />
          </g>
        )}

        <text x={4} y={CY + 22} textAnchor="start" fontSize="12" fill="var(--ink-muted)">
          Réveil {hourLabel(start)}
        </text>
        <text x={W - 4} y={CY + 22} textAnchor="end" fontSize="12" fill="var(--ink-muted)">
          Coucher {hourLabel(end)}
        </text>
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-[40%] text-center">
        <p className="font-display text-[clamp(26px,8vw,34px)] leading-none text-ink tracking-tight">{clock}</p>
        <p className="mt-1.5 text-[13px] text-ink-muted">
          {tasks.length === 0
            ? "Journée libre"
            : left === 0
            ? "Tout est fait"
            : `${done} faite${done > 1 ? "s" : ""} · ${left} à venir`}
        </p>
      </div>
    </div>
  );
}
