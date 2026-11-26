import { NextResponse } from "next/server";
import { generateDayPlan, type PlanTask } from "@/lib/ai/plan";
import { aiErrorMessage } from "@/lib/ai/provider";
import { aiGuard } from "@/lib/ai/guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = await aiGuard();
  if (blocked) return blocked;

  try {
    const body = (await request.json()) as { tasks?: PlanTask[]; energy?: number };
    const tasks = Array.isArray(body.tasks) ? body.tasks.slice(0, 60) : [];
    const energy = typeof body.energy === "number" ? body.energy : 70;

    const plan = await generateDayPlan(tasks, energy);
    return NextResponse.json({ plan });
  } catch (err) {
    return NextResponse.json({ error: aiErrorMessage(err) }, { status: 502 });
  }
}
