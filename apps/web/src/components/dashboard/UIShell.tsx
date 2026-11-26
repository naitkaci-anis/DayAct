"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { Pomodoro } from "./Pomodoro";
import { ReminderScheduler } from "./ReminderScheduler";
import { AssistantChat } from "./AssistantChat";
import { SearchOverlay } from "./SearchOverlay";
import { NotificationsPanel } from "./NotificationsPanel";
import { Onboarding } from "./Onboarding";
import { Composer, type ComposerState } from "@/components/spine/Composer";
import { useStore, type Task } from "@/lib/store";
import { TaskActionsSheet, UndoToast, type TaskActionsMode } from "@/components/today/TaskActions";

interface UIContextValue {
  openNew: (preset?: { time?: string; date?: string }) => void;
  openEdit: (task: Task) => void;
  /** Fait / Reporter / Annuler sheet for one task. */
  openActions: (task: Task, mode?: TaskActionsMode) => void;
  openChat: () => void;
  openFocus: () => void;
  toast: (message: string, undo?: () => void) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within <UIShell>");
  return ctx;
}

export function UIShell({ children }: { children: ReactNode }) {
  const { hydrated } = useStore();
  const [composer, setComposer] = useState<ComposerState>({ open: false });
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [actions, setActions] = useState<{ task: Task; mode: TaskActionsMode } | null>(null);
  const [toastState, setToastState] = useState<{ id: number; message: string; undo?: () => void } | null>(null);

  const toast = useCallback(
    (message: string, undo?: () => void) => setToastState({ id: Date.now(), message, undo }),
    []
  );
  const closeActions = useCallback(() => setActions(null), []);
  const clearToast = useCallback(() => setToastState(null), []);

  const value: UIContextValue = {
    openNew: (preset) =>
      setComposer({ open: true, presetTime: preset?.time, presetDate: preset?.date }),
    openEdit: (task) => setComposer({ open: true, task }),
    openActions: (task, mode = "menu") => setActions({ task, mode }),
    openChat: () => setChatOpen(true),
    openFocus: () => setPomodoroOpen(true),
    toast,
  };

  // Ctrl/Cmd+K opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <UIContext.Provider value={value}>
      <div className="flex h-[100dvh] text-ink overflow-hidden">
        <Sidebar
          onNewTask={() => value.openNew()}
          onFocus={() => setPomodoroOpen(true)}
          onChat={() => setChatOpen(true)}
          onSearch={() => setSearchOpen(true)}
          onNotifications={() => setNotifOpen(true)}
        />

        <div className="flex flex-1 min-w-0 flex-col">
          <TopNav
            onChat={() => setChatOpen(true)}
            onSearch={() => setSearchOpen(true)}
            onNotifications={() => setNotifOpen(true)}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-4 md:py-8">
              {hydrated ? (
                children
              ) : (
                <div className="flex items-center justify-center py-32">
                  <span className="text-sm text-ink-muted animate-pulse">Chargement…</span>
                </div>
              )}
            </div>
          </main>

          <BottomNav onNewTask={() => value.openNew()} onFocus={() => setPomodoroOpen(true)} />
        </div>
      </div>

      <Composer composer={composer} onClose={() => setComposer({ open: false })} />
      <Pomodoro open={pomodoroOpen} onClose={() => setPomodoroOpen(false)} />
      <AssistantChat open={chatOpen} onClose={() => setChatOpen(false)} />
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onPick={(task) => {
          setSearchOpen(false);
          value.openEdit(task);
        }}
      />
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <TaskActionsSheet
        task={actions?.task ?? null}
        mode={actions?.mode ?? "menu"}
        onClose={closeActions}
        onEdit={value.openEdit}
        onToast={toast}
      />
      <UndoToast toast={toastState} onDone={clearToast} />
      <ReminderScheduler />
      {hydrated && <Onboarding />}
    </UIContext.Provider>
  );
}
