import { NextResponse } from "next/server";
import { generateDayPlan, type PlanTask } from "@/lib/ai/plan";

export const runtime = "nodejs"; // needs server fetch to localhost Ollama

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { tasks?: PlanTask[]; energy?: number };
    const tasks = Array.isArray(body.tasks) ? body.tasks : [];
    const energy = typeof body.energy === "number" ? body.energy : 70;

    const plan = await generateDayPlan(tasks, energy);
    return NextResponse.json({ plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    // Most common cause: Ollama not running or model missing.
    return NextResponse.json(
      {
        error:
          message.includes("fetch") || message.includes("ECONNREFUSED")
            ? "Impossible de joindre Ollama. Vérifie qu'il est lancé (ollama serve / l'app Ollama)."
            : message,
      },
      { status: 502 }
    );
  }
}
