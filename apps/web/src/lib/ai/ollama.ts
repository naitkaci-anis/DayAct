// Small reusable helper to call Ollama and get back parsed JSON.
import { OLLAMA_BASE_URL, OLLAMA_MODEL } from "./config";

export async function ollamaJSON(
  system: string,
  user: string,
  temperature = 0.3
): Promise<unknown> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      keep_alive: "30m", // keep the model in RAM so next calls are fast
      options: { temperature, num_predict: 500 }, // cap output → faster
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama a répondu ${res.status}`);

  const data = (await res.json()) as { message?: { content?: string } };
  const content = data.message?.content ?? "{}";
  try {
    return JSON.parse(content);
  } catch {
    const m = content.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Réponse IA illisible");
  }
}
