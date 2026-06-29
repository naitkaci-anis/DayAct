"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { TrashIcon } from "@/components/icons";
import { findOverlapping } from "@/lib/conflicts";
import {
  useStore,
  priorityMeta,
  categoryMeta,
  addDays,
  type Task,
  type Priority,
  type TaskCategory,
  type Recurrence,
} from "@/lib/store";

const recurrenceOptions: { id: Recurrence; label: string }[] = [
  { id: "none", label: "Aucune" },
  { id: "daily", label: "Chaque jour" },
  { id: "weekdays", label: "En semaine" },
  { id: "weekly", label: "Chaque semaine" },
];

// Generate the dates a recurring task should occupy, starting at `start`.
function occurrenceDates(start: string, rec: Recurrence): string[] {
  if (rec === "none") return [start];
  const out: string[] = [];
  if (rec === "weekly") {
    for (let i = 0; i < 12; i++) out.push(addDays(start, i * 7));
    return out;
  }
  // daily / weekdays over the next 30 days
  for (let i = 0; i < 30; i++) {
    const d = addDays(start, i);
    if (rec === "weekdays") {
      const [y, m, day] = d.split("-").map(Number);
      const wd = new Date(y, m - 1, day).getDay(); // 0 Sun … 6 Sat
      if (wd === 0 || wd === 6) continue;
    }
    out.push(d);
  }
  return out;
}

export interface ComposerState {
  open: boolean;
  task?: Task; // present = edit mode
  presetTime?: string; // for "click on spine/calendar to add"
  presetDate?: string; // YYYY-MM-DD, for click-to-add on another day
}

const priorities = Object.keys(priorityMeta) as Priority[];
const categories = Object.keys(categoryMeta) as TaskCategory[];

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function addMinutes(t: string, mins: number) {
  let total = ((toMin(t) + mins) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// Estimated duration between start and end (handles end past midnight = next day-ish).
function durationBetween(start: string, end: string) {
  let d = toMin(end) - toMin(start);
  if (d < 0) d += 1440;
  return d;
}

function fmtDuration(mins: number) {
  if (mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

export function Composer({
  composer,
  onClose,
}: {
  composer: ComposerState;
  onClose: () => void;
}) {
  const { state, dispatch } = useStore();
  const editing = composer.task;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(state.selectedDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<TaskCategory>("work");
  const [notes, setNotes] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("none");

  const estimatedMin = durationBetween(startTime, endTime);

  // Live overlap detection against existing tasks on the same date.
  const conflicts =
    estimatedMin > 0
      ? findOverlapping(state.tasks, {
          id: editing?.id,
          date,
          time: startTime,
          durationMin: estimatedMin,
        })
      : [];

  // When the user changes the start, shift the end to keep the same span.
  function changeStart(next: string) {
    const span = durationBetween(startTime, endTime);
    setStartTime(next);
    setEndTime(addMinutes(next, span > 0 ? span : 30));
  }

  // Reset form whenever the composer (re)opens.
  useEffect(() => {
    if (!composer.open) return;
    if (editing) {
      setTitle(editing.title);
      setDate(editing.date);
      setStartTime(editing.time);
      setEndTime(addMinutes(editing.time, editing.durationMin));
      setPriority(editing.priority);
      setCategory(editing.category);
      setNotes(editing.notes ?? "");
      setRecurrence(editing.recurrence ?? "none");
    } else {
      setTitle("");
      setDate(composer.presetDate ?? state.selectedDate);
      const start = composer.presetTime ?? "09:00";
      setStartTime(start);
      setEndTime(addMinutes(start, 30));
      setPriority("medium");
      setCategory("work");
      setRecurrence("none");
      setNotes("");
    }
  }, [composer.open, composer.presetTime, composer.presetDate, editing, state.selectedDate]);

  const canSave = title.trim().length > 0 && estimatedMin > 0;

  function save() {
    if (!canSave) return;
    const durationMin = estimatedMin;
    if (editing) {
      dispatch({
        type: "UPDATE_TASK",
        id: editing.id,
        patch: { title: title.trim(), date, time: startTime, durationMin, priority, category, notes, recurrence },
      });
    } else {
      // Materialize one task per occurrence date.
      for (const occ of occurrenceDates(date, recurrence)) {
        dispatch({
          type: "ADD_TASK",
          task: {
            title: title.trim(),
            date: occ,
            time: startTime,
            durationMin,
            priority,
            category,
            notes,
            recurrence,
          },
        });
      }
    }
    onClose();
  }

  function remove() {
    if (editing) dispatch({ type: "DELETE_TASK", id: editing.id });
    onClose();
  }

  return (
    <Modal
      open={composer.open}
      onClose={onClose}
      title={editing ? "Modifier la tâche" : "Nouvelle tâche"}
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Titre</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="Ex. Appeler le consulat"
            className="w-full px-3 py-2 rounded-sm bg-[#0a0a14] border border-border text-sm text-text placeholder:text-text-muted/60 focus:border-act-cyan outline-none transition-colors"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-sm bg-[#0a0a14] border border-border text-sm text-text focus:border-act-cyan outline-none transition-colors"
          />
        </div>

        {/* Interval: start → end */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Créneau horaire</label>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => changeStart(e.target.value)}
              className="flex-1 px-3 py-2 rounded-sm bg-[#0a0a14] border border-border text-sm text-text focus:border-act-cyan outline-none transition-colors"
            />
            <span className="text-text-muted text-sm">→</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 px-3 py-2 rounded-sm bg-[#0a0a14] border border-border text-sm text-text focus:border-act-cyan outline-none transition-colors"
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[11px] text-text-muted">
              Durée estimée :{" "}
              <span className={estimatedMin > 0 ? "text-act-cyan" : "text-alert-red"}>
                {estimatedMin > 0 ? fmtDuration(estimatedMin) : "fin avant le début"}
              </span>
            </p>
            {/* quick presets */}
            <div className="flex items-center gap-1">
              {[15, 30, 60, 90].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setEndTime(addMinutes(startTime, m))}
                  className="px-1.5 py-0.5 rounded-[4px] border border-border text-[10px] text-text-muted hover:text-text hover:border-act-cyan transition-colors"
                >
                  {m < 60 ? `${m}min` : `${m / 60}h`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conflict warning */}
        {conflicts.length > 0 && (
          <div className="rounded-sm border border-alert-red/40 bg-alert-red/10 px-3 py-2.5">
            <p className="text-xs text-alert-red font-medium">
              ⚠ Chevauchement avec {conflicts.length} tâche{conflicts.length > 1 ? "s" : ""}
            </p>
            <ul className="mt-1 space-y-0.5">
              {conflicts.slice(0, 3).map((c) => (
                <li key={c.id} className="text-[11px] text-text-muted">
                  {c.title} ({c.time} · {c.durationMin} min)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Priority */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Priorité</label>
          <div className="flex gap-2">
            {priorities.map((p) => {
              const meta = priorityMeta[p];
              const active = priority === p;
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-sm border text-sm transition-colors ${
                    active ? "border-transparent text-text" : "border-border text-text-muted"
                  }`}
                  style={active ? { background: `color-mix(in srgb, ${meta.color} 18%, transparent)` } : undefined}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Catégorie</label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((c) => {
              const meta = categoryMeta[c];
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-2 py-2 rounded-sm border text-xs transition-colors ${
                    active ? "border-transparent text-text" : "border-border text-text-muted"
                  }`}
                  style={active ? { background: `color-mix(in srgb, ${meta.color} 18%, transparent)`, color: meta.color } : undefined}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recurrence (only meaningful for new tasks) */}
        {!editing && (
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Répétition</label>
            <div className="grid grid-cols-4 gap-2">
              {recurrenceOptions.map((opt) => {
                const active = recurrence === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setRecurrence(opt.id)}
                    className={`px-2 py-2 rounded-sm border text-xs transition-colors ${
                      active
                        ? "border-transparent bg-act-cyan/15 text-act-cyan"
                        : "border-border text-text-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {recurrence !== "none" && (
              <p className="text-[11px] text-text-muted mt-1.5">
                {recurrence === "weekly"
                  ? "Crée la tâche pour les 12 prochaines semaines."
                  : recurrence === "weekdays"
                  ? "Crée la tâche du lundi au vendredi, sur 30 jours."
                  : "Crée la tâche chaque jour, sur 30 jours."}
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Notes (optionnel)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Détails…"
            className="w-full px-3 py-2 rounded-sm bg-[#0a0a14] border border-border text-sm text-text placeholder:text-text-muted/60 focus:border-act-cyan outline-none transition-colors resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={save}
            disabled={!canSave}
            className="flex-1 px-4 py-2.5 rounded-sm bg-act-cyan text-[#0a0a14] text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {editing ? "Enregistrer" : "Ajouter"}
          </button>
          {editing && (
            <button
              onClick={remove}
              className="px-3 py-2.5 rounded-sm border border-border text-alert-red hover:bg-alert-red/10 transition-colors"
              aria-label="Supprimer"
            >
              <TrashIcon size={16} />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
