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
import { NotificationDetail } from "./NotificationDetail";

interface UIContextValue {
  openNew: (preset?: { time?: string; date?: string }) => void;
  openEdit: (task: Task) => void;
  /** Fait / Reporter / Annuler sheet for one task. */
  openActions: (task: Task, mode?: TaskActionsMode) => void;
  openChat: () => void;
  openFocus: () => void;
  toast: (message: string, undo?: () => void) => void;
  /** Shows the "Rappel" window for a task (from a notification). */
  openNotification: (taskId: string, notificationId?: string) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within <UIShell>");
  return ctx;
}

export function UIShell({ children }: { children: ReactNode }) {
  const { hydrated, state, dispatch } = useStore();
  const [composer, setComposer] = useState<ComposerState>({ open: false });
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [actions, setActions] = useState<{ task: Task; mode: TaskActionsMode } | null>(null);
  const [notifDetail, setNotifDetail] = useState<{ taskId: string; notificationId?: string } | null>(null);
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
    openNotification: (taskId, notificationId) => setNotifDetail({ taskId, notificationId }),
  };

  // A tapped phone notification opens the app on /dashboard?notif=<taskId>,
  // or (app already open) sends a message: both show the "Rappel" window.
  useEffect(() => {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("notif");
    if (fromUrl) {
      setNotifDetail({ taskId: fromUrl });
      url.searchParams.delete("notif");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
    const onSwMessage = (e: MessageEvent) => {
      if (e.data?.type === "open-notification" && e.data.taskId) setNotifDetail({ taskId: e.data.taskId });
    };
    const onWindowEvent = (e: Event) => {
      const id = (e as CustomEvent<{ taskId?: string }>).detail?.taskId;
      if (id) setNotifDetail({ taskId: id });
    };
    navigator.serviceWorker?.addEventListener("message", onSwMessage);
    window.addEventListener("dayact:open-notification", onWindowEvent);
    return () => {
      navigator.serviceWorker?.removeEventListener("message", onSwMessage);
      window.removeEventListener("dayact:open-notification", onWindowEvent);
    };
  }, []);

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
      <NotificationDetail
        taskId={notifDetail?.taskId ?? null}
        notificationId={notifDetail?.notificationId}
        onClose={() => setNotifDetail(null)}
        onPostpone={(id) => {
          const task = state.tasks.find((t) => t.id === id);
          if (task) setActions({ task, mode: "postpone" });
        }}
        onCancelTask={(id) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return;
          const snapshot = { ...task };
          dispatch({ type: "DELETE_TASK", id });
          toast("Tâche annulée", () => dispatch({ type: "RESTORE_TASK", task: snapshot }));
        }}
      />
      <ReminderScheduler />
      {hydrated && <Onboarding />}
    </UIContext.Provider>
  );
}
