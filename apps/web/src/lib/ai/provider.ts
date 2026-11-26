// Single entry point for AI JSON generation. Picks the configured provider.
import { AI_PROVIDER } from "./config";
import { ollamaJSON } from "./ollama";
import { geminiJSON } from "./gemini";

export async function aiJSON(
  system: string,
  user: string,
  temperature = 0.3
): Promise<unknown> {
  if (AI_PROVIDER === "gemini") return geminiJSON(system, user, temperature);
  return ollamaJSON(system, user, temperature);
}

// Turns a provider error into a short French message for the user.
export function aiErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : "Erreur inconnue";
  if (message === "QUOTA_GEMINI")
    return "L'assistant est très demandé en ce moment. Réessaie dans une minute.";
  if (message.includes("fetch") || message.includes("ECONNREFUSED"))
    return AI_PROVIDER === "ollama"
      ? "Impossible de joindre Ollama. Vérifie qu'il est lancé."
      : "Impossible de joindre l'assistant IA. Réessaie plus tard.";
  if (message.includes("API_KEY manquante"))
    return "L'assistant IA n'est pas encore configuré sur ce serveur.";
  return message;
}
