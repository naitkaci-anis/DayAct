"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type NotifType = "overdue" | "reminder" | "info";

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  taskId?: string;
  createdAt: number; // epoch ms
  read: boolean;
}

interface NotificationsValue {
  items: AppNotification[];
  unread: number;
  add: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
  hasFor: (taskId: string, type: NotifType) => boolean;
}

const Ctx = createContext<NotificationsValue | null>(null);
const STORAGE_KEY = "dayact-notifications-v1";
const MAX = 100;

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `n${Date.now()}${Math.random()}`;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const hydrated = useRef(false);

  // load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as AppNotification[]);
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = useCallback<NotificationsValue["add"]>((n) => {
    setItems((prev) =>
      [{ ...n, id: uid(), createdAt: Date.now(), read: false }, ...prev].slice(0, MAX)
    );
  }, []);

  const markRead = useCallback((id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  // Use a ref so callers can dedupe without re-rendering on every items change.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const hasFor = useCallback(
    (taskId: string, type: NotifType) =>
      itemsRef.current.some((n) => n.taskId === taskId && n.type === type),
    []
  );

  const unread = items.filter((n) => !n.read).length;

  return (
    <Ctx.Provider value={{ items, unread, add, markRead, markAllRead, remove, clear, hasFor }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNotifications must be used within <NotificationsProvider>");
  return ctx;
}
