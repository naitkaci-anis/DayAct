import { NextResponse } from "next/server";
import { generateCoachAdvice } from "@/lib/ai/coach";
import { computeHealth, type HealthProfile } from "@/lib/health";
import { aiErrorMessage } from "@/lib/ai/provider";
import { aiGuard } from "@/lib/ai/guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = await aiGuard();
  if (blocked) return blocked;

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
    return NextResponse.json({ error: aiErrorMessage(err) }, { status: 502 });
  }
}
