import { NextResponse } from "next/server";
import { chatToCommands, type ChatContextTask } from "@/lib/ai/chat";
import { aiErrorMessage } from "@/lib/ai/provider";
import { aiGuard } from "@/lib/ai/guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = await aiGuard();
  if (blocked) return blocked;

  try {
    const body = (await request.json()) as {
      message?: string;
      today?: string;
      context?: ChatContextTask[];
    };
    const message = (body.message ?? "").trim().slice(0, 2000);
    const today = body.today ?? new Date().toISOString().slice(0, 10);
    const context = Array.isArray(body.context) ? body.context.slice(0, 60) : [];

    if (!message) return NextResponse.json({ error: "Message vide" }, { status: 400 });

    const result = await chatToCommands(message, today, context);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: aiErrorMessage(err) }, { status: 502 });
  }
}
