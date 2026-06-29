"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchIcon, CheckIcon } from "@/components/icons";
import { useStore, categoryMeta, formatLongDate, type Task } from "@/lib/store";
import { isOverdue } from "@/lib/taskTime";

export function SearchOverlay({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (task: Task) => void;
}) {
  const { state, dispatch } = useStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return state.tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 40);
  }, [query, state.tasks]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-md border border-border bg-deep shadow-2xl animate-[popIn_0.16s_ease] overflow-hidden">
        {/* input */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
          <SearchIcon size={18} className="text-text-muted shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une tâche…"
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted/60 outline-none"
          />
          <kbd className="text-[10px] text-text-muted border border-border rounded px-1.5 py-0.5">
            Échap
          </kbd>
        </div>

        {/* results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {query.trim() === "" && (
            <p className="text-xs text-text-muted text-center py-8">
              Tape pour chercher dans toutes tes tâches.
            </p>
          )}
          {query.trim() !== "" && results.length === 0 && (
            <p className="text-xs text-text-muted text-center py-8">Aucun résultat.</p>
          )}
          {results.map((t) => {
            const cat = categoryMeta[t.category];
            const overdue = isOverdue(t);
            return (
              <div
                key={t.id}
                className="group flex items-center gap-3 px-4 py-2.5 hover:bg-[#0a0a14] border-b border-border last:border-b-0"
              >
                <button
                  onClick={() => dispatch({ type: "TOGGLE_TASK", id: t.id })}
                  className={`flex items-center justify-center w-[17px] h-[17px] shrink-0 rounded-[5px] border ${
                    t.done ? "bg-act-cyan border-act-cyan text-[#0a0a14]" : "border-[#374151]"
                  }`}
                >
                  {t.done && <CheckIcon size={11} />}
                </button>
                <button onClick={() => onPick(t)} className="flex-1 min-w-0 text-left">
                  <span
                    className={`block text-sm truncate ${
                      t.done ? "line-through text-text-muted" : "text-text"
                    }`}
                  >
                    {t.title}
                  </span>
                  <span className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-text-muted">
                      {formatLongDate(t.date)} · {t.time}
                    </span>
                    {overdue && (
                      <span className="text-[10px] text-alert-red">en retard</span>
                    )}
                  </span>
                </button>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] shrink-0"
                  style={{
                    color: cat.color,
                    background: `color-mix(in srgb, ${cat.color} 14%, transparent)`,
                  }}
                >
                  {cat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
