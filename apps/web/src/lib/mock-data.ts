// Mock data for the DayAct dashboard.
// This stands in for the future Supabase-backed data layer (Phase: Data + Auth).

export type Priority = "high" | "medium" | "low";
export type TaskCategory = "work" | "health" | "personal" | "learning";

export interface Task {
  id: string;
  title: string;
  time: string; // "09:30"
  durationMin: number;
  priority: Priority;
  category: TaskCategory;
  done: boolean;
}

export type BlockType = "focus" | "meeting" | "break" | "personal";

export interface TimeBlock {
  id: string;
  start: string; // "09:00"
  end: string; // "10:30"
  title: string;
  type: BlockType;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  hint: string;
  accent: "cyan" | "violet" | "green" | "amber";
  trend?: number; // percentage, can be negative
}

export interface MoodEntry {
  day: string; // "Lun"
  score: number; // 0-100
}

export const user = {
  name: "Anis",
  initials: "A",
};

export const today = new Date("2026-06-29T08:00:00");

export const stats: Stat[] = [
  {
    id: "tasks",
    label: "Tâches du jour",
    value: "4 / 7",
    hint: "3 restantes",
    accent: "cyan",
    trend: 12,
  },
  {
    id: "focus",
    label: "Temps de focus",
    value: "2h 45",
    hint: "objectif 4h",
    accent: "violet",
    trend: 8,
  },
  {
    id: "energy",
    label: "Énergie",
    value: "72 %",
    hint: "stable",
    accent: "amber",
    trend: -4,
  },
  {
    id: "streak",
    label: "Série",
    value: "12 j",
    hint: "record : 18 j",
    accent: "green",
    trend: 0,
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Revue du sprint backend",
    time: "09:00",
    durationMin: 45,
    priority: "high",
    category: "work",
    done: true,
  },
  {
    id: "t2",
    title: "Séance de sport — cardio",
    time: "10:30",
    durationMin: 60,
    priority: "medium",
    category: "health",
    done: true,
  },
  {
    id: "t3",
    title: "Rédiger la doc API DayAct",
    time: "13:30",
    durationMin: 90,
    priority: "high",
    category: "work",
    done: true,
  },
  {
    id: "t4",
    title: "Cours — Systèmes distribués",
    time: "15:00",
    durationMin: 60,
    priority: "medium",
    category: "learning",
    done: true,
  },
  {
    id: "t5",
    title: "Appeler le consulat (RDV)",
    time: "16:30",
    durationMin: 20,
    priority: "high",
    category: "personal",
    done: false,
  },
  {
    id: "t6",
    title: "Méditation guidée",
    time: "18:00",
    durationMin: 15,
    priority: "low",
    category: "health",
    done: false,
  },
  {
    id: "t7",
    title: "Préparer le repas de demain",
    time: "20:00",
    durationMin: 30,
    priority: "low",
    category: "personal",
    done: false,
  },
];

export const timeline: TimeBlock[] = [
  { id: "b1", start: "09:00", end: "09:45", title: "Revue du sprint backend", type: "meeting" },
  { id: "b2", start: "10:30", end: "11:30", title: "Sport — cardio", type: "personal" },
  { id: "b3", start: "13:30", end: "15:00", title: "Focus — doc API", type: "focus" },
  { id: "b4", start: "15:00", end: "16:00", title: "Cours en ligne", type: "focus" },
  { id: "b5", start: "16:00", end: "16:30", title: "Pause", type: "break" },
  { id: "b6", start: "16:30", end: "16:50", title: "Appel consulat", type: "meeting" },
];

export const moodWeek: MoodEntry[] = [
  { day: "Lun", score: 58 },
  { day: "Mar", score: 64 },
  { day: "Mer", score: 49 },
  { day: "Jeu", score: 71 },
  { day: "Ven", score: 80 },
  { day: "Sam", score: 76 },
  { day: "Dim", score: 72 },
];

export interface FocusDay {
  day: string;
  focusMin: number;
  goalMin: number;
}

export const weeklyFocus: FocusDay[] = [
  { day: "Lun", focusMin: 180, goalMin: 240 },
  { day: "Mar", focusMin: 210, goalMin: 240 },
  { day: "Mer", focusMin: 135, goalMin: 240 },
  { day: "Jeu", focusMin: 255, goalMin: 240 },
  { day: "Ven", focusMin: 200, goalMin: 240 },
  { day: "Sam", focusMin: 90, goalMin: 120 },
  { day: "Dim", focusMin: 165, goalMin: 120 },
];

export interface CalendarEvent {
  id: string;
  day: number; // 0 = Monday ... 6 = Sunday
  start: string;
  end: string;
  title: string;
  type: BlockType;
}

export const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
export const weekDates = [27, 28, 29, 30, 1, 2, 3]; // semaine du 27 juin (mock)

export const calendarEvents: CalendarEvent[] = [
  { id: "e1", day: 0, start: "09:00", end: "10:00", title: "Stand-up équipe", type: "meeting" },
  { id: "e2", day: 0, start: "14:00", end: "16:00", title: "Focus — refacto", type: "focus" },
  { id: "e3", day: 1, start: "11:00", end: "12:00", title: "Sport", type: "personal" },
  { id: "e4", day: 1, start: "15:00", end: "17:00", title: "Focus — API", type: "focus" },
  { id: "e5", day: 2, start: "09:00", end: "09:45", title: "Revue sprint", type: "meeting" },
  { id: "e6", day: 2, start: "13:30", end: "15:00", title: "Focus — doc", type: "focus" },
  { id: "e7", day: 2, start: "16:30", end: "16:50", title: "Appel consulat", type: "meeting" },
  { id: "e8", day: 3, start: "10:00", end: "12:00", title: "Atelier UX", type: "meeting" },
  { id: "e9", day: 3, start: "14:00", end: "15:00", title: "Cours en ligne", type: "focus" },
  { id: "e10", day: 4, start: "09:30", end: "11:00", title: "Focus — tests", type: "focus" },
  { id: "e11", day: 4, start: "18:00", end: "18:30", title: "Méditation", type: "personal" },
  { id: "e12", day: 5, start: "11:00", end: "12:00", title: "Courses", type: "personal" },
  { id: "e13", day: 6, start: "10:00", end: "11:00", title: "Lecture", type: "personal" },
];

export interface Insight {
  label: string;
  value: string;
  detail: string;
  accent: "cyan" | "violet" | "green" | "amber";
}

export const insights: Insight[] = [
  { label: "Taux de complétion", value: "78 %", detail: "+6 % vs semaine passée", accent: "green" },
  { label: "Focus moyen / jour", value: "3h 12", detail: "objectif 4h", accent: "cyan" },
  { label: "Tâches terminées", value: "41", detail: "sur 7 jours", accent: "violet" },
  { label: "Meilleur créneau", value: "13h–15h", detail: "productivité max", accent: "amber" },
];

export interface WellbeingMetric {
  label: string;
  value: number; // 0-100
  unit: string;
  accent: "cyan" | "violet" | "green" | "amber";
}

export const wellbeingMetrics: WellbeingMetric[] = [
  { label: "Humeur", value: 72, unit: "/100", accent: "violet" },
  { label: "Énergie", value: 68, unit: "/100", accent: "amber" },
  { label: "Sommeil", value: 85, unit: "/100", accent: "cyan" },
  { label: "Stress", value: 34, unit: "/100", accent: "green" },
];

export const aiSuggestion = {
  headline: "Ta fenêtre de focus optimale est à 13 h 30",
  body:
    "Tu as 2 tâches prioritaires non terminées. Je te suggère de bloquer 16 h 30 pour l'appel au consulat avant ta baisse d'énergie de fin de journée.",
};

// Helpers shared by components --------------------------------------------

export const priorityMeta: Record<Priority, { label: string; color: string }> = {
  high: { label: "Haute", color: "var(--alert-red)" },
  medium: { label: "Moyenne", color: "var(--energy-amber)" },
  low: { label: "Basse", color: "var(--text-muted)" },
};

export const categoryMeta: Record<TaskCategory, { label: string; color: string }> = {
  work: { label: "Travail", color: "var(--act-cyan)" },
  health: { label: "Santé", color: "var(--done-green)" },
  personal: { label: "Perso", color: "var(--focus-violet)" },
  learning: { label: "Études", color: "var(--energy-amber)" },
};

export const blockMeta: Record<BlockType, { label: string; color: string }> = {
  focus: { label: "Focus", color: "var(--act-cyan)" },
  meeting: { label: "Réunion", color: "var(--focus-violet)" },
  break: { label: "Pause", color: "var(--done-green)" },
  personal: { label: "Perso", color: "var(--energy-amber)" },
};
