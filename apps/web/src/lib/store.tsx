"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
  type Dispatch,
} from "react";
import { priorityMeta, categoryMeta, user, type Priority, type TaskCategory } from "./mock-data";
import { migrateHabitColors } from "./theme";
import { createClient } from "./supabase/client";
import {
  loadFromSupabase,
  saveToSupabase,
  deleteTaskRemote,
  deleteHabitRemote,
  deleteHabitLogRemote,
} from "./supabase/sync";

export { priorityMeta, categoryMeta, user };
export type { Priority, TaskCategory };

// ── Types ────────────────────────────────────────────────────────────────

export type Recurrence = "none" | "daily" | "weekdays" | "weekly";

// Reminder preference: "auto" = 1 day + 3h before; "none" = off; else a single lead.
export type ReminderPref = "auto" | "none" | "10m" | "30m" | "1h" | "3h" | "1d";

// Lead times (minutes before the task) for each preference.
export const reminderLeads: Record<ReminderPref, number[]> = {
  none: [],
  auto: [1440, 180], // 1 jour + 3h
  "10m": [10],
  "30m": [30],
  "1h": [60],
  "3h": [180],
  "1d": [1440],
};

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMin: number;
  priority: Priority;
  category: TaskCategory;
  done: boolean;
  notes?: string;
  timeSpentMin: number; // actual time tracked (Pomodoro / chrono)
  recurrence: Recurrence;
  reminder: ReminderPref;
  ringAtStart: boolean; // sonnerie + notif PILE à l'heure de début
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  score: number; // 0-100
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface Suggestion {
  id: string;
  headline: string;
  body: string;
  // optional task this suggestion can create on "apply"
  task?: Omit<
    Task,
    "id" | "done" | "date" | "timeSpentMin" | "recurrence" | "reminder" | "ringAtStart"
  >;
}

export interface Settings {
  notifications: boolean;
  aiSuggestions: boolean;
  energy: number; // 0-100
  displayName: string; // prénom choisi par l'utilisateur ("" = non renseigné)
}

export interface State {
  selectedDate: string; // YYYY-MM-DD
  tasks: Task[];
  moods: MoodEntry[];
  habits: Habit[];
  habitLogs: HabitLog[];
  settings: Settings;
  suggestions: Suggestion[];
  dismissed: string[]; // suggestion ids
}

// ── Date helpers ─────────────────────────────────────────────────────────

export function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function todayISO() {
  return toISO(new Date());
}

export function addDays(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d + delta);
  return toISO(date);
}

export function formatLongDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const s = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Seed ─────────────────────────────────────────────────────────────────

function seed(): State {
  const t = todayISO();
  const y = addDays(t, -1);
  return {
    selectedDate: t,
    tasks: [
      mk("Revue du sprint backend", t, "09:00", 45, "high", "work", true),
      mk("Séance de sport — cardio", t, "10:30", 60, "medium", "health", true),
      mk("Rédiger la doc API DayAct", t, "13:30", 90, "high", "work", true),
      mk("Cours — Systèmes distribués", t, "15:00", 60, "medium", "learning", true),
      mk("Appeler le consulat (RDV)", t, "16:30", 20, "high", "personal", false),
      mk("Méditation guidée", t, "18:00", 15, "low", "health", false),
      mk("Préparer le repas de demain", t, "20:00", 30, "low", "personal", false),
      mk("Lecture — 20 pages", y, "21:00", 30, "low", "learning", true),
    ],
    moods: [
      { date: addDays(t, -6), score: 58 },
      { date: addDays(t, -5), score: 64 },
      { date: addDays(t, -4), score: 49 },
      { date: addDays(t, -3), score: 71 },
      { date: addDays(t, -2), score: 80 },
      { date: addDays(t, -1), score: 76 },
      { date: t, score: 72 },
    ],
    habits: [
      { id: newId(), name: "Boire 2 L d'eau", emoji: "💧", color: "#7A1612" },
      { id: newId(), name: "Sport / mouvement", emoji: "🏃", color: "#4E6B35" },
      { id: newId(), name: "Méditation", emoji: "🧘", color: "#6E4E6B" },
      { id: newId(), name: "Lecture", emoji: "📚", color: "#A66A1C" },
    ],
    habitLogs: [],
    settings: { notifications: true, aiSuggestions: true, energy: 72, displayName: "" },
    suggestions: [
      {
        id: "s1",
        headline: "Bloque 16 h 30 pour l'appel au consulat",
        body: "C'est ta tâche prioritaire la plus urgente non terminée, avant ta baisse d'énergie de fin de journée.",
      },
      {
        id: "s2",
        headline: "Ajoute une pause de récupération à 16 h",
        body: "Tu enchaînes 2h30 de focus. Une pause de 15 min préserverait ton énergie.",
        task: {
          title: "Pause récupération",
          time: "16:00",
          durationMin: 15,
          priority: "low",
          category: "health",
        },
      },
    ],
    dismissed: [],
  };
}

let counter = 0;
function newId() {
  // Prefer a real UUID so ids are valid for the Supabase `uuid` columns.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  counter += 1;
  return `t${Date.now().toString(36)}${counter}`;
}

function mk(
  title: string,
  date: string,
  time: string,
  durationMin: number,
  priority: Priority,
  category: TaskCategory,
  done: boolean
): Task {
  return {
    id: newId(),
    title,
    date,
    time,
    durationMin,
    priority,
    category,
    done,
    timeSpentMin: 0,
    recurrence: "none",
    reminder: "auto",
    ringAtStart: false,
  };
}

// ── Actions / reducer ────────────────────────────────────────────────────

export type Action =
  | { type: "SET_DATE"; date: string }
  | {
      type: "ADD_TASK";
      task: Omit<
        Task,
        "id" | "done" | "timeSpentMin" | "recurrence" | "reminder" | "ringAtStart"
      > & {
        done?: boolean;
        timeSpentMin?: number;
        recurrence?: Recurrence;
        reminder?: ReminderPref;
        ringAtStart?: boolean;
      };
    }
  | { type: "UPDATE_TASK"; id: string; patch: Partial<Task> }
  | { type: "DELETE_TASK"; id: string }
  | { type: "RESTORE_TASK"; task: Task }
  | { type: "TOGGLE_TASK"; id: string }
  | { type: "ADD_TIME"; id: string; minutes: number }
  | { type: "LOG_MOOD"; date: string; score: number }
  | { type: "ADD_HABIT"; habit: Omit<Habit, "id"> }
  | { type: "DELETE_HABIT"; id: string }
  | { type: "TOGGLE_HABIT"; habitId: string; date: string }
  | { type: "SET_SETTING"; key: keyof Settings; value: boolean | number | string }
  | { type: "DISMISS_SUGGESTION"; id: string }
  | { type: "APPLY_SUGGESTION"; id: string }
  | { type: "HYDRATE"; state: State };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "SET_DATE":
      return { ...state, selectedDate: action.date };

    case "ADD_TASK":
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            id: newId(),
            done: false,
            timeSpentMin: 0,
            recurrence: "none",
            reminder: "auto",
            ringAtStart: false,
            ...action.task,
          },
        ],
      };

    case "ADD_TIME":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, timeSpentMin: t.timeSpentMin + action.minutes } : t
        ),
      };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      };

    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };

    case "RESTORE_TASK":
      // Undo of a deletion: put the exact same task back (same id).
      if (state.tasks.some((t) => t.id === action.task.id)) return state;
      return { ...state, tasks: [...state.tasks, action.task] };

    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, done: !t.done } : t
        ),
      };

    case "LOG_MOOD": {
      const exists = state.moods.some((m) => m.date === action.date);
      const moods = exists
        ? state.moods.map((m) =>
            m.date === action.date ? { ...m, score: action.score } : m
          )
        : [...state.moods, { date: action.date, score: action.score }];
      return { ...state, moods };
    }

    case "ADD_HABIT":
      return { ...state, habits: [...state.habits, { id: newId(), ...action.habit }] };

    case "DELETE_HABIT":
      return {
        ...state,
        habits: state.habits.filter((h) => h.id !== action.id),
        habitLogs: state.habitLogs.filter((l) => l.habitId !== action.id),
      };

    case "TOGGLE_HABIT": {
      const exists = state.habitLogs.some(
        (l) => l.habitId === action.habitId && l.date === action.date
      );
      return {
        ...state,
        habitLogs: exists
          ? state.habitLogs.filter(
              (l) => !(l.habitId === action.habitId && l.date === action.date)
            )
          : [...state.habitLogs, { habitId: action.habitId, date: action.date }],
      };
    }

    case "SET_SETTING":
      return { ...state, settings: { ...state.settings, [action.key]: action.value } };

    case "DISMISS_SUGGESTION":
      return { ...state, dismissed: [...state.dismissed, action.id] };

    case "APPLY_SUGGESTION": {
      const sug = state.suggestions.find((s) => s.id === action.id);
      const dismissed = [...state.dismissed, action.id];
      if (!sug?.task) return { ...state, dismissed };
      const task: Task = {
        id: newId(),
        done: false,
        date: state.selectedDate,
        timeSpentMin: 0,
        recurrence: "none",
        reminder: "auto",
        ringAtStart: false,
        ...sug.task,
      };
      return { ...state, dismissed, tasks: [...state.tasks, task] };
    }

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "dayact-state-v2";

interface StoreValue {
  state: State;
  dispatch: Dispatch<Action>;
  hydrated: boolean;
  /** "supabase" when signed in & syncing to the cloud, else "local". */
  backend: "supabase" | "local";
  userEmail: string | null;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, seed);
  const [hydrated, setHydrated] = useReducer(() => true, false);

  // Supabase session info (null in local/demo mode).
  const supabaseRef = useRef(createClient());
  const userRef = useRef<{ id: string; email: string | null } | null>(null);
  const [backend, setBackend] = useReducer(
    (_: "supabase" | "local", b: "supabase" | "local") => b,
    "local"
  );
  const [userEmail, setUserEmail] = useReducer(
    (_: string | null, e: string | null) => e,
    null
  );

  // Hydration: from Supabase if signed in, otherwise from localStorage.
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const supabase = supabaseRef.current;
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && !cancelled) {
          userRef.current = { id: user.id, email: user.email ?? null };
          setUserEmail(user.email ?? null);
          setBackend("supabase");
          try {
            const data = await loadFromSupabase(supabase, user.id);
            if (!cancelled) {
              rawDispatch({
                type: "HYDRATE",
                state: {
                  ...state,
                  tasks: data.tasks,
                  moods: data.moods,
                  habits: migrateHabitColors(data.habits),
                  habitLogs: data.habitLogs,
                  settings: data.settings,
                  selectedDate: todayISO(),
                },
              });
            }
          } catch {
            // network error → fall back to whatever seed/state we have
          }
          if (!cancelled) setHydrated();
          return;
        }
      }

      // Local/demo mode.
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const saved = JSON.parse(raw) as State;
          rawDispatch({
            type: "HYDRATE",
            state: {
              ...saved,
              habits: migrateHabitColors(saved.habits ?? []),
              selectedDate: todayISO(),
            },
          });
        }
      } catch {
        // ignore corrupt storage
      }
      if (!cancelled) setHydrated();
    }

    boot();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change (after hydration), to the active backend.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;

    if (backend === "supabase" && supabaseRef.current && userRef.current) {
      const supabase = supabaseRef.current;
      const userId = userRef.current.id;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveToSupabase(supabase, userId, {
          tasks: state.tasks,
          moods: state.moods,
          habits: state.habits,
          habitLogs: state.habitLogs,
          settings: state.settings,
        }).catch(() => {
          // best-effort; will retry on next change
        });
      }, 700);
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage may be full / unavailable
    }
  }, [state, hydrated, backend]);

  // Keep a ref to the latest state for side-effect decisions in dispatch.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Wrap dispatch so deletions are mirrored to Supabase precisely.
  const dispatch = useCallback<Dispatch<Action>>((action) => {
    const remote =
      backend === "supabase" && supabaseRef.current && userRef.current
        ? { supabase: supabaseRef.current, userId: userRef.current.id }
        : null;

    // For habit toggles, decide before reducing whether a log is being removed.
    const habitLogRemoved =
      action.type === "TOGGLE_HABIT" &&
      stateRef.current.habitLogs.some(
        (l) => l.habitId === action.habitId && l.date === action.date
      );

    rawDispatch(action);

    if (!remote) return;
    if (action.type === "DELETE_TASK") {
      deleteTaskRemote(remote.supabase, remote.userId, action.id).catch(() => {});
    } else if (action.type === "DELETE_HABIT") {
      deleteHabitRemote(remote.supabase, remote.userId, action.id).catch(() => {});
    } else if (action.type === "TOGGLE_HABIT" && habitLogRemoved) {
      deleteHabitLogRemote(remote.supabase, remote.userId, action.habitId, action.date).catch(
        () => {}
      );
    }
  }, [backend]);

  return (
    <StoreContext.Provider value={{ state, dispatch, hydrated, backend, userEmail }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}

// ── Selectors ────────────────────────────────────────────────────────────

export function tasksForDate(state: State, date: string) {
  return state.tasks
    .filter((t) => t.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function moodForDate(state: State, date: string) {
  return state.moods.find((m) => m.date === date)?.score ?? null;
}

export function activeSuggestions(state: State) {
  if (!state.settings.aiSuggestions) return [];
  return state.suggestions.filter((s) => !state.dismissed.includes(s.id));
}

export function isHabitDone(state: State, habitId: string, date: string) {
  return state.habitLogs.some((l) => l.habitId === habitId && l.date === date);
}

// Consecutive days (ending today or yesterday) the habit was completed.
export function habitStreak(state: State, habitId: string) {
  const today = todayISO();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = addDays(today, -i);
    if (isHabitDone(state, habitId, d)) {
      streak++;
    } else if (i === 0) {
      // today not done yet — keep counting from yesterday
      continue;
    } else {
      break;
    }
  }
  return streak;
}

// Longest run of consecutive completed days ever recorded for this habit.
export function habitBestStreak(state: State, habitId: string) {
  const dates = state.habitLogs
    .filter((l) => l.habitId === habitId)
    .map((l) => l.date)
    .sort();
  if (dates.length === 0) return 0;
  let best = 1;
  let cur = 1;
  for (let i = 1; i < dates.length; i++) {
    if (dates[i] === dates[i - 1]) continue;
    if (dates[i] === addDays(dates[i - 1], 1)) {
      cur++;
      best = Math.max(best, cur);
    } else {
      cur = 1;
    }
  }
  return best;
}

// Completion rate (%) over the last `days` days, ending today.
export function habitCompletionRate(state: State, habitId: string, days = 30) {
  let done = 0;
  const today = todayISO();
  for (let i = 0; i < days; i++) {
    if (isHabitDone(state, habitId, addDays(today, -i))) done++;
  }
  return Math.round((done / days) * 100);
}

// Habits completed on a given date (used to surface habits on the calendar).
export function habitsCompletedOn(state: State, date: string): Habit[] {
  return state.habits.filter((h) =>
    state.habitLogs.some((l) => l.habitId === h.id && l.date === date)
  );
}

// Best displayable first name, or null when we only have an ugly email prefix
// (digits/dots) — callers then greet without a name instead of "Naitkaci04anis".
export function prettyName(state: State, userEmail: string | null): string | null {
  const clean = (s: string) => s.trim();
  const looksHuman = (s: string) => s.length > 0 && s.length <= 30 && !/[\d._@]/.test(s);

  const chosen = clean(state.settings.displayName ?? "");
  if (chosen && looksHuman(chosen)) {
    return chosen.charAt(0).toUpperCase() + chosen.slice(1);
  }
  if (!userEmail) return user.name; // mode démo local
  const prefix = clean(userEmail.split("@")[0]);
  if (looksHuman(prefix)) return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  return null;
}
