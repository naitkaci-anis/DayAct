"use client";

import { useEffect } from "react";
import { CloseIcon, BellIcon, AlertIcon, ClockIcon, TrashIcon } from "@/components/icons";
import { useNotifications, type AppNotification } from "@/lib/notifications";
import { useUI } from "./UIShell";

function timeAgo(ms: number) {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return "à l'instant";
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

function Icon({ type }: { type: AppNotification["type"] }) {
  if (type === "overdue") return <AlertIcon size={16} className="text-danger" />;
  if (type === "reminder") return <ClockIcon size={16} className="text-primary" />;
  return <BellIcon size={16} className="text-ink-muted" />;
}

export function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, unread, markRead, markAllRead, remove, clear } = useNotifications();
  const { openNotification } = useUI();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function openTask(n: AppNotification) {
    markRead(n.id);
    if (n.taskId) {
      onClose();
      openNotification(n.taskId, n.id);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={onClose} />

      <aside
        className="absolute right-0 top-0 h-full w-full max-w-sm bg-surface border-l border-line flex flex-col"
        style={{ animation: "slideInRight 0.22s ease" }}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-line shrink-0">
          <div className="flex items-center gap-2">
            <BellIcon size={17} className="text-ink" />
            <h2 className="text-sm font-medium text-ink">Notifications</h2>
            {unread > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-on-fill font-medium">
                {unread}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Fermer">
            <CloseIcon size={18} />
          </button>
        </div>

        {items.length > 0 && (
          <div className="flex items-center justify-between px-5 py-2 border-b border-line">
            <button
              onClick={markAllRead}
              className="text-[11px] text-ink-muted hover:text-ink transition-colors"
            >
              Tout marquer comme lu
            </button>
            <button
              onClick={clear}
              className="text-[11px] text-ink-muted hover:text-danger transition-colors"
            >
              Tout effacer
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <BellIcon size={28} className="text-ink-muted/40 mb-3" />
              <p className="text-sm text-ink-muted">Aucune notification.</p>
              <p className="text-xs text-ink-muted/70 mt-1">
                Tu seras prévenu ici quand une tâche arrive ou est dépassée.
              </p>
            </div>
          ) : (
            <ul>
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`group flex gap-3 px-4 py-3 border-b border-line last:border-b-0 transition-colors ${
                    n.read ? "" : "bg-primary/[0.04]"
                  } hover:bg-field`}
                >
                  <span className="mt-0.5 shrink-0">
                    <Icon type={n.type} />
                  </span>
                  <button
                    onClick={() => openTask(n)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[13px] text-ink font-medium truncate">{n.title}</span>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    </span>
                    <span className="block text-[12px] text-ink-muted leading-snug mt-0.5">
                      {n.body}
                    </span>
                    <span className="block text-[10px] text-ink-muted/70 mt-1">
                      {timeAgo(n.createdAt)}
                    </span>
                  </button>
                  <button
                    onClick={() => remove(n.id)}
                    className="p-1 text-ink-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity self-start"
                    aria-label="Supprimer"
                  >
                    <TrashIcon size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
