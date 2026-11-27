"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { LaterList } from "@/components/today/LaterList";
import { useUI } from "@/components/dashboard/UIShell";
import { CheckIcon, PlusIcon, EditIcon, TrashIcon } from "@/components/icons";
import {
  useStore,
  tasksForDate,
  priorityMeta,
  categoryMeta,
  type Priority,
} from "@/lib/store";
import { isOverdue } from "@/lib/taskTime";
import { formatDuration } from "@/lib/calendar";

type Filter = "all" | "todo" | "done";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "todo", label: "À faire" },
  { id: "done", label: "Terminées" },
];

const priorityOrder: Priority[] = ["high", "medium", "low"];

export default function TasksPage() {
  const { state, dispatch } = useStore();
  const { openNew, openEdit, openActions, toast } = useUI();
  const [filter, setFilter] = useState<Filter>("all");

  const tasks = tasksForDate(state, state.selectedDate);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      todo: tasks.filter((t) => !t.done).length,
      done: tasks.filter((t) => t.done).length,
    }),
    [tasks]
  );

  const visible = tasks.filter((t) =>
    filter === "all" ? true : filter === "todo" ? !t.done : t.done
  );

  const grouped = priorityOrder
    .map((p) => ({
      priority: p,
      items: visible.filter((t) => t.priority === p),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <PageHeader
        title="Tâches"
        subtitle={`${counts.todo} à faire · ${counts.done} terminées`}
        action={
          <button
            onClick={() => openNew()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-sm bg-primary text-on-fill text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <PlusIcon size={16} />
            Nouvelle tâche
          </button>
        }
      />

      <div className="mb-8">
        <LaterList showEmpty={false} />
      </div>

      <div className="flex items-center gap-1 mb-5 p-1 rounded-sm border border-line bg-surface w-fit">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-[6px] text-sm transition-colors ${
              filter === f.id ? "bg-field text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs text-ink-muted">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6 max-w-3xl">
        {grouped.length === 0 && (
          <div className="py-12 text-center border border-dashed border-line rounded-md">
            <p className="text-sm text-ink-muted">Aucune tâche dans cette vue.</p>
            <button
              onClick={() => openNew()}
              className="mt-3 text-sm text-primary hover:underline"
            >
              + Ajouter une tâche
            </button>
          </div>
        )}

        {grouped.map((group) => {
          const meta = priorityMeta[group.priority];
          return (
            <div key={group.priority}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                <span className="text-xs uppercase tracking-wider text-ink-muted">
                  Priorité {meta.label.toLowerCase()}
                </span>
                <span className="text-xs text-ink-muted">· {group.items.length}</span>
              </div>

              <ul className="rounded-md border border-line bg-surface divide-y divide-line overflow-hidden">
                {group.items.map((task) => {
                  const cat = categoryMeta[task.category];
                  return (
                    <li
                      key={task.id}
                      className="group flex items-center gap-3 px-4 py-3 hover:bg-field transition-colors"
                    >
                      <button
                        onClick={() => dispatch({ type: "TOGGLE_TASK", id: task.id })}
                        className={`flex items-center justify-center w-6 h-6 shrink-0 rounded-[7px] border-2 transition-colors before:absolute before:-inset-2.5 relative ${
                          task.done
                            ? "bg-primary border-primary text-on-fill"
                            : "border-line-strong hover:border-primary"
                        }`}
                        aria-label={task.done ? "Marquer non faite" : "Marquer faite"}
                      >
                        {task.done && <CheckIcon size={14} />}
                      </button>

                      <button
                        onClick={() => openActions(task)}
                        className="flex-1 min-w-0 text-left min-h-[44px]"
                      >
                        <span
                          className={`block text-sm truncate ${
                            task.done ? "text-ink-muted line-through" : "text-ink"
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-ink-muted font-mono">
                            {task.time}
                          </span>
                          <span className="text-[11px] text-ink-muted">
                            · {formatDuration(task.durationMin)}
                          </span>
                          {isOverdue(task) && (
                            <span className="text-[11px] text-danger font-medium">
                              · en retard
                            </span>
                          )}
                        </span>
                      </button>

                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] shrink-0"
                        style={{
                          color: cat.color,
                          background: `color-mix(in srgb, ${cat.color} 14%, transparent)`,
                        }}
                      >
                        {cat.label}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(task)}
                          className="p-1 text-ink-muted hover:text-primary transition-colors"
                          aria-label="Modifier"
                        >
                          <EditIcon size={15} />
                        </button>
                        <button
                          onClick={() => {
                            const snapshot = { ...task };
                            dispatch({ type: "DELETE_TASK", id: task.id });
                            toast("Tâche annulée", () => dispatch({ type: "RESTORE_TASK", task: snapshot }));
                          }}
                          className="p-1 text-ink-muted hover:text-danger transition-colors"
                          aria-label="Supprimer"
                        >
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
