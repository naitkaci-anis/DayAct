import { NextResponse } from "next/server";
import { chatToCommands, type ChatContextTask } from "@/lib/ai/chat";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      today?: string;
      context?: ChatContextTask[];
    };
    const message = (body.message ?? "").trim();
    const today = body.today ?? new Date().toISOString().slice(0, 10);
    const context = Array.isArray(body.context) ? body.context.slice(0, 60) : [];

    if (!message) return NextResponse.json({ error: "Message vide" }, { status: 400 });

    const result = await chatToCommands(message, today, context);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      {
        error:
          message.includes("fetch") || message.includes("ECONNREFUSED")
            ? "Impossible de joindre Ollama. Vérifie qu'il est lancé."
            : message,
      },
      { status: 502 }
    );
  }
}
