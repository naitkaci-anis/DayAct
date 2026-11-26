// Central AI configuration. Swap provider here without touching feature code.
//   AI_PROVIDER=ollama    → local Ollama (free, private) — default for development
//   AI_PROVIDER=gemini    → Google Gemini API (free tier) — recommended online

export type AIProvider = "ollama" | "gemini";

export const AI_PROVIDER = (process.env.AI_PROVIDER ?? "ollama") as AIProvider;

// Max AI requests per signed-in user per day (protects the free quota).
export const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT ?? 30);

// Ollama (local)
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

// Google Gemini (free tier available — create a key at aistudio.google.com)
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
