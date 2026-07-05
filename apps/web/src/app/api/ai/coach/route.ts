import { NextResponse } from "next/server";
import { generateCoachAdvice } from "@/lib/ai/coach";
import { computeHealth, type HealthProfile } from "@/lib/health";

export const runtime = "nodejs"; // needs server fetch to localhost Ollama

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { profile?: HealthProfile };
    const profile = body.profile;
    const metrics = profile ? computeHealth(profile) : null;

    if (!profile || !metrics) {
      return NextResponse.json({ error: "Profil incomplet." }, { status: 400 });
    }

    const advice = await generateCoachAdvice(profile, metrics);
    return NextResponse.json({ advice });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      {
        error:
          message.includes("fetch") || message.includes("ECONNREFUSED")
            ? "Impossible de joindre l'IA. Vérifie qu'Ollama est lancé."
            : message,
      },
      { status: 502 }
    );
  }
}
