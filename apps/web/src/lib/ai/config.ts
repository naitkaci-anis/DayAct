// Central AI configuration. Swap provider here without touching feature code.
// Default: local Ollama (free, private). Set AI_PROVIDER=anthropic later for Claude.

export const AI_PROVIDER = (process.env.AI_PROVIDER ?? "ollama") as "ollama" | "anthropic";

// Ollama (local)
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

// Anthropic (cloud, for later)
export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
