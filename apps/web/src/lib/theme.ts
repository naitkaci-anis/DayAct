// Colour helpers for the "Sauge" theme.

// Colours offered when creating a habit (all readable on the cream background).
export const HABIT_COLORS = ["#7A1612", "#4E6B35", "#6E4E6B", "#A66A1C", "#5F6556", "#B3261E"];

// Habits created with the old neon theme keep their stored colour in the
// database; translate those to the closest Sauge colour when loading.
const LEGACY: Record<string, string> = {
  "#5be7ff": "#7A1612",
  "#06b6d4": "#7A1612",
  "#22d3ee": "#7A1612",
  "#22c55e": "#4E6B35",
  "#4ade80": "#4E6B35",
  "#8b5cf6": "#6E4E6B",
  "#a78bfa": "#6E4E6B",
  "#c026ff": "#6E4E6B",
  "#f59e0b": "#A66A1C",
  "#fbbf24": "#A66A1C",
  "#f87171": "#B3261E",
  "#ef4444": "#B3261E",
  "#f9fafb": "#5F6556",
};

export function themeColor(color: string): string {
  return LEGACY[color?.toLowerCase()] ?? color;
}

export function migrateHabitColors<T extends { color: string }>(habits: T[]): T[] {
  return habits.map((h) => ({ ...h, color: themeColor(h.color) }));
}
