"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { TopNav } from "./TopNav";
import { Pomodoro } from "./Pomodoro";
import { ReminderScheduler } from "./ReminderScheduler";
import { AssistantChat } from "./AssistantChat";
import { SearchOverlay } from "./SearchOverlay";
import { NotificationsPanel } from "./NotificationsPanel";
import { Onboarding } from "./Onboarding";
import { Composer, type ComposerState } from "@/components/spine/Composer";
import { useStore, type Task } from "@/lib/store";

interface UIContextValue {
  openNew: (preset?: { time?: string; date?: string }) => void;
  openEdit: (task: Task) => void;
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

  const value: UIContextValue = {
    openNew: (preset) =>
      setComposer({ open: true, presetTime: preset?.time, presetDate: preset?.date }),
    openEdit: (task) => setComposer({ open: true, task }),
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
      <div className="flex flex-col h-[100dvh] text-text overflow-hidden">
        <TopNav
          onNewTask={() => value.openNew()}
          onFocus={() => setPomodoroOpen(true)}
          onChat={() => setChatOpen(true)}
          onSearch={() => setSearchOpen(true)}
          onNotifications={() => setNotifOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-5 lg:px-8 py-6">
            {hydrated ? (
              children
            ) : (
              <div className="flex items-center justify-center py-32">
                <span className="text-sm text-text-muted animate-pulse">Chargement…</span>
              </div>
            )}
          </div>
        </main>
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
      <ReminderScheduler />
      {hydrated && <Onboarding />}
    </UIContext.Provider>
  );
}
