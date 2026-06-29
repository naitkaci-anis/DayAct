// Single entry point for AI JSON generation. Picks the configured provider.
import { AI_PROVIDER } from "./config";
import { ollamaJSON } from "./ollama";
import { anthropicJSON } from "./anthropic";

export async function aiJSON(
  system: string,
  user: string,
  temperature = 0.3
): Promise<unknown> {
  if (AI_PROVIDER === "anthropic") {
    return anthropicJSON(system, user);
  }
  return ollamaJSON(system, user, temperature);
}
