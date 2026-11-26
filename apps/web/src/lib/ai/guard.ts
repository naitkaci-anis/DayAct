// Protects the AI routes: when accounts are enabled (Supabase configured),
// only signed-in users may call the AI, within a daily quota per user.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_DAILY_LIMIT } from "./config";

export async function aiGuard(): Promise<NextResponse | null> {
  const supabase = await createClient();
  if (!supabase) return null; // local demo mode: no accounts, no quota

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Connecte-toi pour utiliser l'assistant." }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("consume_ai_quota", {
    daily_limit: AI_DAILY_LIMIT,
  });
  if (error) return null; // quota table missing → don't block the user
  if (typeof data === "number" && data < 0) {
    return NextResponse.json(
      {
        error: `Tu as utilisé tes ${AI_DAILY_LIMIT} demandes à l'assistant pour aujourd'hui. À demain !`,
      },
      { status: 429 }
    );
  }
  return null;
}
