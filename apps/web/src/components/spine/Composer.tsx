"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { TrashIcon, CheckIcon } from "@/components/icons";
import { findOverlapping } from "@/lib/conflicts";
import { formatDuration } from "@/lib/calendar";
import {
  useStore,
  priorityMeta,
  categoryMeta,
  addDays,
  type Task,
  type Priority,
  type TaskCategory,
  type Recurrence,
  type ReminderPref,
} from "@/lib/store";

const reminderOptions: { id: ReminderPref; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "10m", label: "10 min" },
  { id: "30m", label: "30 min" },
  { id: "1h", label: "1 h" },
  { id: "3h", label: "3 h" },
  { id: "1d", label: "1 jour" },
  { id: "none", label: "Aucun" },
];

// "custom" is a UI-only mode: the user picks specific weekdays. Materialized
// tasks are stored with a DB-safe recurrence value (see toRecurrence).
type RecMode = Recurrence | "custom";

const recurrenceOptions: { id: RecMode; label: string }[] = [
  { id: "none", label: "Aucune" },
  { id: "daily", label: "Chaque jour" },
  { id: "weekdays", label: "En semaine" },
  { id: "weekly", label: "Chaque semaine" },
  { id: "custom", label: "Personnalisé" },
];

// Weekday chips (Mon-first, matching the app convention).
const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
const WEEKDAY_FULL = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// Weekday index with Monday = 0 … Sunday = 6.
function weekdayIndex(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}

// Only "none" | "daily" | "weekdays" | "weekly" are valid DB values.
function toRecurrence(mode: RecMode): Recurrence {
  return mode === "custom" ? "none" : mode;
}

// Generate the dates a recurring task should occupy, starting at `start`.
function occurrenceDates(
  start: string,
  mode: RecMode,
  customDays: number[],
  repeatAlways: boolean
): string[] {
  if (mode === "none") return [start];

  if (mode === "weekly") {
    const weeks = repeatAlways ? 26 : 12;
    return Array.from({ length: weeks }, (_, i) => addDays(start, i * 7));
  }

  if (mode === "custom") {
    if (customDays.length === 0) return [start];
    const horizon = repeatAlways ? 84 : 21;
    const out: string[] = [];
    for (let i = 0; i < horizon; i++) {
      const d = addDays(start, i);
      if (customDays.includes(weekdayIndex(d))) out.push(d);
    }
    return out.length ? out : [start];
  }

  // daily / weekdays
  const horizon = repeatAlways ? 84 : 30;
  const out: string[] = [];
  for (let i = 0; i < horizon; i++) {
    const d = addDays(start, i);
    if (mode === "weekdays" && weekdayIndex(d) >= 5) continue; // skip Sat/Sun
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
  const [recMode, setRecMode] = useState<RecMode>("none");
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [repeatAlways, setRepeatAlways] = useState(false);
  const [reminder, setReminder] = useState<ReminderPref>("auto");
  const [ringAtStart, setRingAtStart] = useState(false);

  function toggleCustomDay(idx: number) {
    setCustomDays((days) =>
      days.includes(idx) ? days.filter((d) => d !== idx) : [...days, idx].sort((a, b) => a - b)
    );
  }

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
      setRecMode(editing.recurrence ?? "none");
      setCustomDays([]);
      setRepeatAlways(false);
      setReminder(editing.reminder ?? "auto");
      setRingAtStart(editing.ringAtStart ?? false);
    } else {
      setTitle("");
      setDate(composer.presetDate ?? state.selectedDate);
      const start = composer.presetTime ?? "09:00";
      setStartTime(start);
      setEndTime(addMinutes(start, 30));
      setPriority("medium");
      setCategory("work");
      setRecMode("none");
      setCustomDays([]);
      setRepeatAlways(false);
      setReminder("auto");
      setRingAtStart(false);
      setNotes("");
    }
  }, [composer.open, composer.presetTime, composer.presetDate, editing, state.selectedDate]);

  const canSave = title.trim().length > 0 && estimatedMin > 0;

  function save() {
    if (!canSave) return;
    const durationMin = estimatedMin;
    const recurrence = toRecurrence(recMode);
    if (editing) {
      dispatch({
        type: "UPDATE_TASK",
        id: editing.id,
        patch: { title: title.trim(), date, time: startTime, durationMin, priority, category, notes, recurrence, reminder, ringAtStart },
      });
    } else {
      // Materialize one task per occurrence date.
      for (const occ of occurrenceDates(date, recMode, customDays, repeatAlways)) {
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
            reminder,
            ringAtStart,
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
                {estimatedMin > 0 ? formatDuration(estimatedMin) : "fin avant le début"}
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
                  {c.title} ({c.time} · {formatDuration(c.durationMin)})
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
            <div className="flex flex-wrap gap-2">
              {recurrenceOptions.map((opt) => {
                const active = recMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRecMode(opt.id)}
                    className={`px-3 py-2 rounded-sm border text-xs transition-colors ${
                      active
                        ? "border-transparent bg-act-cyan/15 text-act-cyan"
                        : "border-border text-text-muted hover:text-text"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Custom weekday picker */}
            {recMode === "custom" && (
              <div className="mt-3 rounded-sm border border-border bg-[#0a0a14] p-3">
                <p className="text-[11px] text-text-muted mb-2">
                  Choisis les jours de la semaine :
                </p>
                <div className="flex items-center gap-1.5">
                  {WEEKDAY_LABELS.map((lbl, idx) => {
                    const on = customDays.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleCustomDay(idx)}
                        title={WEEKDAY_FULL[idx]}
                        className={`flex-1 h-9 rounded-sm border text-xs font-medium transition-colors ${
                          on
                            ? "border-transparent bg-act-cyan text-[#0a0a14]"
                            : "border-border text-text-muted hover:text-text hover:border-act-cyan/50"
                        }`}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Repeat-always checkbox */}
            {recMode !== "none" && (
              <button
                type="button"
                onClick={() => setRepeatAlways((v) => !v)}
                className="mt-3 flex items-center gap-2.5 select-none"
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded-[5px] border transition-colors ${
                    repeatAlways
                      ? "bg-act-cyan border-act-cyan text-[#0a0a14]"
                      : "border-border text-transparent"
                  }`}
                >
                  <CheckIcon size={13} />
                </span>
                <span className="text-xs text-text">
                  Répéter toujours ces jours
                  <span className="text-text-muted"> (sur ~3 mois)</span>
                </span>
              </button>
            )}

            {/* Info line */}
            {recMode !== "none" && (
              <p className="text-[11px] text-text-muted mt-2">
                {recMode === "weekly"
                  ? `Chaque semaine, sur ${repeatAlways ? "26" : "12"} semaines.`
                  : recMode === "weekdays"
                  ? `Du lundi au vendredi, sur ${repeatAlways ? "~3 mois" : "30 jours"}.`
                  : recMode === "daily"
                  ? `Chaque jour, sur ${repeatAlways ? "~3 mois" : "30 jours"}.`
                  : customDays.length
                  ? `Répété : ${customDays.map((d) => WEEKDAY_FULL[d]).join(", ")}.`
                  : "Sélectionne au moins un jour."}
              </p>
            )}
          </div>
        )}

        {/* Reminder */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Rappel avant la tâche</label>
          <div className="flex flex-wrap gap-2">
            {reminderOptions.map((opt) => {
              const active = reminder === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setReminder(opt.id)}
                  className={`px-2.5 py-1.5 rounded-sm border text-xs transition-colors ${
                    active
                      ? "border-transparent bg-act-cyan/15 text-act-cyan"
                      : "border-border text-text-muted hover:text-text"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-text-muted mt-1.5">
            {reminder === "auto"
              ? "Auto : rappel 1 jour avant ET 3 h avant (avec sonnerie)."
              : reminder === "none"
              ? "Aucun rappel anticipé."
              : `Rappel ${reminderOptions.find((o) => o.id === reminder)?.label} avant (avec sonnerie).`}
          </p>
        </div>

        {/* Ring exactly at start time (independent of the "before" reminder) */}
        <div>
          <button
            type="button"
            onClick={() => setRingAtStart((v) => !v)}
            className="flex items-center gap-2.5 select-none"
          >
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-[5px] border transition-colors ${
                ringAtStart
                  ? "bg-act-cyan border-act-cyan text-[#0a0a14]"
                  : "border-border text-transparent"
              }`}
            >
              <CheckIcon size={13} />
            </span>
            <span className="text-xs text-text">🔔 Sonner à l'heure de la tâche</span>
          </button>
          <p className="text-[11px] text-text-muted mt-1.5">
            {ringAtStart
              ? "Une alerte (son + notification) se déclenchera PILE à l'heure de début."
              : "Coche pour recevoir une alerte sonore exactement à l'heure de début."}
          </p>
        </div>

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
