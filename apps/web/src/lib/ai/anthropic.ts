// Claude (Anthropic) provider — used in production where Ollama isn't reachable.
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_MODEL } from "./config";

export async function anthropicJSON(
  system: string,
  user: string
): Promise<unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY manquante");

  const client = new Anthropic({ apiKey });
  const msg = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 1024,
    system: system + " Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour.",
    messages: [{ role: "user", content: user }],
  });

  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Réponse IA illisible");
  }
}
