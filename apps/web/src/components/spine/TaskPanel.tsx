"use client";

import { CheckIcon, EditIcon, TrashIcon, PlusIcon, TasksIcon } from "@/components/icons";
import {
  useStore,
  tasksForDate,
  categoryMeta,
  type Task,
} from "@/lib/store";
import { isOverdue } from "@/lib/taskTime";

export function TaskPanel({
  onAdd,
  onEdit,
}: {
  onAdd: () => void;
  onEdit: (task: Task) => void;
}) {
  const { state, dispatch } = useStore();
  const tasks = tasksForDate(state, state.selectedDate);
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <section className="rounded-md border border-border bg-deep p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <TasksIcon size={15} className="text-act-cyan" />
          <h2 className="text-sm font-medium text-text">Tâches</h2>
        </div>
        <span className="text-xs text-text-muted">
          {done}/{tasks.length}
        </span>
      </div>

      {/* progress */}
      <div className="h-1 rounded-full bg-[#0a0a14] overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-act-cyan to-focus-violet transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="space-y-0.5 max-h-[300px] overflow-y-auto -mr-1 pr-1">
        {tasks.length === 0 && (
          <li className="text-xs text-text-muted py-4 text-center">Aucune tâche ce jour.</li>
        )}
        {tasks.map((task) => {
          const cat = categoryMeta[task.category];
          return (
            <li
              key={task.id}
              className="group flex items-center gap-2.5 rounded-sm px-2 py-2 hover:bg-[#0a0a14] transition-colors"
            >
              <button
                onClick={() => dispatch({ type: "TOGGLE_TASK", id: task.id })}
                className={`flex items-center justify-center w-[17px] h-[17px] shrink-0 rounded-[5px] border transition-colors ${
                  task.done
                    ? "bg-act-cyan border-act-cyan text-[#0a0a14]"
                    : "border-[#374151] hover:border-act-cyan"
                }`}
                aria-label={task.done ? "Marquer non faite" : "Marquer faite"}
              >
                {task.done && <CheckIcon size={11} />}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-[13px] truncate ${
                    task.done ? "text-text-muted line-through" : "text-text"
                  }`}
                >
                  {task.title}
                </p>
                <span className="text-[10px] font-mono text-text-muted">
                  {task.time}
                </span>
                <span className="text-[10px] ml-1.5" style={{ color: cat.color }}>
                  {cat.label}
                </span>
                {isOverdue(task) && (
                  <span className="text-[10px] ml-1.5 text-alert-red font-medium">
                    en retard
                  </span>
                )}
              </div>

              {/* hover actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(task)}
                  className="p-1 text-text-muted hover:text-act-cyan transition-colors"
                  aria-label="Modifier"
                >
                  <EditIcon size={14} />
                </button>
                <button
                  onClick={() => dispatch({ type: "DELETE_TASK", id: task.id })}
                  className="p-1 text-text-muted hover:text-alert-red transition-colors"
                  aria-label="Supprimer"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        onClick={onAdd}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-border py-2.5 text-sm text-text-muted hover:text-text hover:border-act-cyan transition-colors"
      >
        <PlusIcon size={15} />
        Ajouter une tâche
      </button>
    </section>
  );
}
