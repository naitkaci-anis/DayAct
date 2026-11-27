import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Task,
  MoodEntry,
  Settings,
  Recurrence,
  ReminderPref,
  Habit,
  HabitLog,
} from "@/lib/store";

// Maps between the in-memory State shape and the Supabase table rows.

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  task_date: string;
  task_time: string;
  duration_min: number;
  priority: Task["priority"];
  category: Task["category"];
  done: boolean;
  notes: string | null;
  time_spent_min: number;
  recurrence: Recurrence;
  reminder: ReminderPref;
  ring_at_start: boolean;
  someday?: boolean;
  location?: string | null;
  postpone_count?: number;
}

function rowToTask(r: TaskRow): Task {
  return {
    id: r.id,
    title: r.title,
    date: r.task_date,
    time: r.task_time,
    durationMin: r.duration_min,
    priority: r.priority,
    category: r.category,
    done: r.done,
    notes: r.notes ?? undefined,
    timeSpentMin: r.time_spent_min ?? 0,
    recurrence: r.recurrence ?? "none",
    reminder: r.reminder ?? "auto",
    ringAtStart: r.ring_at_start ?? false,
    location: r.location ?? undefined,
    postponeCount: r.postpone_count ?? 0,
  };
}

function taskToRow(t: Task, userId: string, someday = false): TaskRow {
  return {
    id: t.id,
    user_id: userId,
    title: t.title,
    task_date: t.date,
    task_time: t.time,
    duration_min: t.durationMin,
    priority: t.priority,
    category: t.category,
    done: t.done,
    notes: t.notes ?? null,
    time_spent_min: t.timeSpentMin,
    recurrence: t.recurrence,
    reminder: t.reminder,
    ring_at_start: t.ringAtStart,
    someday,
    location: t.location?.trim() || null,
    postpone_count: t.postponeCount ?? 0,
  };
}

const DEFAULT_SETTINGS: Settings = {
  notifications: true,
  aiSuggestions: true,
  energy: 72,
  displayName: "",
};

export interface LoadedData {
  tasks: Task[];
  later: Task[];
  moods: MoodEntry[];
  habits: Habit[];
  habitLogs: HabitLog[];
  settings: Settings;
}

// Pull the user's data from Supabase into the State shape.
export async function loadFromSupabase(
  supabase: SupabaseClient,
  userId: string
): Promise<LoadedData> {
  const [profileRes, tasksRes, moodsRes, habitsRes, logsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("tasks").select("*").eq("user_id", userId),
    supabase.from("moods").select("*").eq("user_id", userId),
    supabase.from("habits").select("*").eq("user_id", userId),
    supabase.from("habit_logs").select("*").eq("user_id", userId),
  ]);

  const rows = (tasksRes.data as TaskRow[] | null) ?? [];
  const tasks = rows.filter((r) => !r.someday).map(rowToTask);
  const later = rows.filter((r) => r.someday).map(rowToTask);
  const moods = ((moodsRes.data as { mood_date: string; score: number }[] | null) ?? []).map(
    (r) => ({ date: r.mood_date, score: r.score })
  );
  const habits = ((habitsRes.data as { id: string; name: string; emoji: string; color: string }[] | null) ??
    []).map((h) => ({ id: h.id, name: h.name, emoji: h.emoji, color: h.color }));
  const habitLogs = ((logsRes.data as { habit_id: string; log_date: string }[] | null) ?? []).map(
    (l) => ({ habitId: l.habit_id, date: l.log_date })
  );

  const p = profileRes.data as
    | { notifications: boolean; ai_suggestions: boolean; energy: number; full_name: string | null }
    | null;
  const settings: Settings = p
    ? {
        notifications: p.notifications,
        aiSuggestions: p.ai_suggestions,
        energy: p.energy,
        displayName: p.full_name ?? "",
      }
    : DEFAULT_SETTINGS;

  return { tasks, later, moods, habits, habitLogs, settings };
}

// Push the current State to Supabase. Upsert-only (never bulk-deletes) so a
// sync can't accidentally wipe data; deletions are handled explicitly.
export async function saveToSupabase(
  supabase: SupabaseClient,
  userId: string,
  data: LoadedData
): Promise<void> {
  await supabase
    .from("profiles")
    .update({
      notifications: data.settings.notifications,
      ai_suggestions: data.settings.aiSuggestions,
      energy: data.settings.energy,
      // Only overwrite the name when the user actually typed one.
      ...(data.settings.displayName.trim()
        ? { full_name: data.settings.displayName.trim() }
        : {}),
    })
    .eq("id", userId);

  const taskRows = [
    ...data.tasks.map((t) => taskToRow(t, userId, false)),
    ...data.later.map((t) => taskToRow(t, userId, true)),
  ];
  if (taskRows.length) {
    await supabase.from("tasks").upsert(taskRows);
  }

  if (data.moods.length) {
    await supabase
      .from("moods")
      .upsert(
        data.moods.map((m) => ({ user_id: userId, mood_date: m.date, score: m.score }))
      );
  }

  if (data.habits.length) {
    await supabase
      .from("habits")
      .upsert(
        data.habits.map((h) => ({
          id: h.id,
          user_id: userId,
          name: h.name,
          emoji: h.emoji,
          color: h.color,
        }))
      );
  }

  if (data.habitLogs.length) {
    await supabase.from("habit_logs").upsert(
      data.habitLogs.map((l) => ({ user_id: userId, habit_id: l.habitId, log_date: l.date })),
      { onConflict: "habit_id,log_date" }
    );
  }
}

// Precise, explicit deletion of a single task.
export async function deleteTaskRemote(
  supabase: SupabaseClient,
  userId: string,
  taskId: string
): Promise<void> {
  await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId);
}

export async function deleteHabitRemote(
  supabase: SupabaseClient,
  userId: string,
  habitId: string
): Promise<void> {
  await supabase.from("habits").delete().eq("id", habitId).eq("user_id", userId);
}

export async function deleteHabitLogRemote(
  supabase: SupabaseClient,
  userId: string,
  habitId: string,
  date: string
): Promise<void> {
  await supabase
    .from("habit_logs")
    .delete()
    .eq("habit_id", habitId)
    .eq("log_date", date)
    .eq("user_id", userId);
}
