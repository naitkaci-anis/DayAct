"use client";

import { categoryMeta, useStore, type Task, type TaskCategory } from "@/lib/store";
import { useUI } from "@/components/dashboard/UIShell";
import { CheckIcon } from "@/components/icons";

// One task in a day list. Tapping the row opens Fait / Reporter / Annuler;
// the round button on the right marks it done in one tap.

export function CategoryGlyph({ category, size = 20 }: { category: TaskCategory; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (category) {
    case "work":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
        </svg>
      );
    case "health":
      return (
        <svg {...common}>
          <path d="M12 4c2 2 3 4 3 7s-1.5 5-3 7c-1.5-2-3-4-3-7s1-5 3-7zM4 12c3 0 5 1.5 6 4M20 12c-3 0-5 1.5-6 4" />
        </svg>
      );
    case "learning":
      return (
        <svg {...common}>
          <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h13" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9z" />
        </svg>
      );
  }
}

function durationLabel(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

export function TaskRow({ task, hint }: { task: Task; hint?: string }) {
  const { dispatch } = useStore();
  const { openActions, toast } = useUI();
  const cat = categoryMeta[task.category];

  return (
    <div
      className={`group flex items-center gap-3 rounded-[18px] border px-3 py-2.5 transition-colors ${
        task.done ? "border-transparent bg-cream/60" : "border-line bg-surface hover:border-line-strong"
      }`}
    >
      <button
        onClick={() => openActions(task)}
        className="flex flex-1 min-w-0 items-center gap-3 text-left min-h-[44px]"
        aria-label={`${task.title}, ${task.time}. Ouvrir les actions`}
      >
        <span className="w-11 shrink-0 text-[13px] tabular-nums text-ink-muted">{task.time}</span>
        <span
          className="flex items-center justify-center w-10 h-10 shrink-0 rounded-[12px]"
          style={{ color: cat.color, background: `color-mix(in srgb, ${cat.color} 13%, transparent)` }}
        >
          <CategoryGlyph category={task.category} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-[15px] leading-snug ${task.done ? "line-through text-ink-muted" : "text-ink"}`}>
            {task.title}
          </span>
          <span className="block text-xs text-ink-muted mt-0.5">
            {durationLabel(task.durationMin)} · {cat.label}
            {hint && <span className="text-danger"> · {hint}</span>}
          </span>
        </span>
      </button>

      <button
        onClick={() => {
          dispatch({ type: "TOGGLE_TASK", id: task.id });
          if (!task.done) toast("Bravo, c'est fait");
        }}
        aria-label={task.done ? `Marquer « ${task.title} » comme pas faite` : `Marquer « ${task.title} » comme faite`}
        aria-pressed={task.done}
        className={`flex items-center justify-center w-11 h-11 shrink-0 rounded-full border-2 transition-colors ${
          task.done ? "bg-primary border-primary text-on-fill" : "border-line-strong text-transparent hover:border-primary hover:text-primary/40"
        }`}
      >
        <CheckIcon size={18} />
      </button>
    </div>
  );
}
