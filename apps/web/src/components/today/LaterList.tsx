"use client";

import { useState } from "react";
import { useStore, todayISO, addDays, categoryMeta, type Task } from "@/lib/store";
import { useUI } from "@/components/dashboard/UIShell";
import { CategoryGlyph } from "./TaskRow";
import { TrashIcon } from "@/components/icons";

// « À reprogrammer » : the tasks postponed "plus tard", without a date.
// Each one can go back into the agenda (today, tomorrow, or a chosen day and
// hour) or be deleted for good. Tasks postponed again and again stand out.

function LaterItem({ task }: { task: Task }) {
  const { dispatch } = useStore();
  const { toast } = useUI();
  const [picking, setPicking] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(task.time);
  const cat = categoryMeta[task.category];
  const count = task.postponeCount ?? 0;

  const reschedule = (d: string, t?: string) => {
    dispatch({ type: "RESCHEDULE_LATER", id: task.id, date: d, time: t });
    toast(d === todayISO() ? "Remise à aujourd'hui" : "Reprogrammée");
  };

  return (
    <li className="rounded-[18px] border border-line bg-surface p-3">
      <div className="flex items-center gap-3">
        <span
          className="flex items-center justify-center w-10 h-10 shrink-0 rounded-[12px]"
          style={{ color: cat.color, background: `color-mix(in srgb, ${cat.color} 13%, transparent)` }}
        >
          <CategoryGlyph category={task.category} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] text-ink leading-snug">{task.title}</p>
          <p className={`text-xs mt-0.5 ${count >= 3 ? "text-danger font-medium" : "text-ink-muted"}`}>
            {count >= 3 ? `Reportée ${count} fois · à décider` : count === 2 ? "Reportée 2 fois" : `${task.durationMin} min · ${cat.label}`}
          </p>
        </div>
        <button
          onClick={() => {
            const snapshot = { ...task };
            dispatch({ type: "DELETE_LATER", id: task.id });
            toast("Tâche supprimée", () => dispatch({ type: "RESTORE_LATER", task: snapshot }));
          }}
          aria-label={`Supprimer « ${task.title} »`}
          className="flex items-center justify-center w-11 h-11 shrink-0 rounded-full text-ink-muted hover:text-danger hover:bg-danger/10"
        >
          <TrashIcon size={18} />
        </button>
      </div>

      {!picking ? (
        <div className="grid grid-cols-3 gap-2 mt-3">
          <button
            onClick={() => reschedule(todayISO())}
            className="min-h-[44px] rounded-full bg-primary text-on-fill text-sm font-medium hover:bg-primary-hover"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => reschedule(addDays(todayISO(), 1))}
            className="min-h-[44px] rounded-full border border-line-strong text-sm font-medium text-ink hover:border-primary"
          >
            Demain
          </button>
          <button
            onClick={() => setPicking(true)}
            className="min-h-[44px] rounded-full border border-line-strong text-sm font-medium text-ink hover:border-primary"
          >
            Choisir
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mt-3">
          <label className="sr-only" htmlFor={`later-date-${task.id}`}>Jour</label>
          <input
            id={`later-date-${task.id}`}
            type="date"
            min={todayISO()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-[2_1_140px] min-w-0 h-11 px-3 rounded-[12px] border border-line bg-field text-ink text-[15px] focus:border-primary outline-none"
          />
          <label className="sr-only" htmlFor={`later-time-${task.id}`}>Heure</label>
          <input
            id={`later-time-${task.id}`}
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="flex-[1_1_96px] min-w-0 h-11 px-3 rounded-[12px] border border-line bg-field text-ink text-[15px] focus:border-primary outline-none"
          />
          <button
            onClick={() => date && reschedule(date, time || undefined)}
            className="h-11 px-5 rounded-[12px] bg-ink text-on-fill text-sm font-medium"
          >
            OK
          </button>
        </div>
      )}
    </li>
  );
}

export function LaterList({ title = "À reprogrammer", showEmpty = true }: { title?: string; showEmpty?: boolean }) {
  const { state } = useStore();
  const later = [...state.later].sort((a, b) => (b.postponeCount ?? 0) - (a.postponeCount ?? 0));

  if (later.length === 0 && !showEmpty) return null;

  return (
    <section id="a-reprogrammer" className="scroll-mt-24">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        {later.length > 0 && <span className="text-sm text-ink-muted">{later.length}</span>}
      </div>
      {later.length === 0 ? (
        <p className="text-[15px] text-ink-muted rounded-[18px] border-2 border-dashed border-line px-4 py-4">
          Rien à reprogrammer. Quand tu reportes une tâche « plus tard », elle arrive ici.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {later.map((t) => (
            <LaterItem key={t.id} task={t} />
          ))}
        </ul>
      )}
    </section>
  );
}

/** Small dashed link shown on the day view when tasks are waiting. */
export function LaterBadge({ onOpen }: { onOpen: () => void }) {
  const { state } = useStore();
  const n = state.later.length;
  if (n === 0) return null;
  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center justify-between min-h-[52px] px-4 rounded-[18px] border-2 border-dashed border-line-strong text-[15px] text-ink/85 hover:border-primary hover:text-primary transition-colors"
    >
      <span>
        {n} tâche{n > 1 ? "s" : ""} à reprogrammer
      </span>
      <span className="font-semibold text-primary">Voir</span>
    </button>
  );
}
