// Colour helpers shared by both themes (Nuit and Sauge).

// Colours offered when creating a habit. They are CSS variables, so a habit
// follows the active theme (see --hab-1 … --hab-6 in globals.css).
export const HABIT_COLORS = [
  "var(--hab-1)",
  "var(--hab-2)",
  "var(--hab-3)",
  "var(--hab-4)",
  "var(--hab-5)",
  "var(--hab-6)",
];

// Habits saved with older themes keep a fixed hex colour in the database;
// translate those to the matching theme colour when loading.
const LEGACY: Record<string, string> = {
  // Sauge
  "#7a1612": "var(--hab-1)",
  "#4e6b35": "var(--hab-2)",
  "#6e4e6b": "var(--hab-3)",
  "#a66a1c": "var(--hab-4)",
  "#5f6556": "var(--hab-5)",
  "#b3261e": "var(--hab-6)",
  // Old neon theme
  "#5be7ff": "var(--hab-1)",
  "#06b6d4": "var(--hab-1)",
  "#22d3ee": "var(--hab-1)",
  "#22c55e": "var(--hab-2)",
  "#4ade80": "var(--hab-2)",
  "#8b5cf6": "var(--hab-3)",
  "#a78bfa": "var(--hab-3)",
  "#c026ff": "var(--hab-3)",
  "#f59e0b": "var(--hab-4)",
  "#fbbf24": "var(--hab-4)",
  "#f87171": "var(--hab-6)",
  "#ef4444": "var(--hab-6)",
  "#f9fafb": "var(--hab-5)",
};

export function themeColor(color: string): string {
  return LEGACY[color?.toLowerCase()] ?? color;
}

export function migrateHabitColors<T extends { color: string }>(habits: T[]): T[] {
  return habits.map((h) => ({ ...h, color: themeColor(h.color) }));
}
