// AI health coach: turns a profile + computed metrics into personalized,
// friendly advice on nutrition, sport and lifestyle (French).
import { aiJSON } from "./provider";
import type { HealthProfile, HealthResult } from "@/lib/health";
import { activityLabels, goalLabels } from "@/lib/health";

export interface CoachAdvice {
  summary: string;
  nutrition: string[];
  sport: string[];
  lifestyle: string[];
}

const SYSTEM = `Tu es un coach santé bienveillant et pédagogue (nutrition + sport).
Tu réponds en français, de façon concrète, sûre et encourageante.
Tu N'ES PAS médecin : pas de diagnostic, pas de régime extrême.
Réponds STRICTEMENT en JSON avec cette forme :
{
  "summary": "1-2 phrases de synthèse motivante",
  "nutrition": ["conseil", "conseil", "conseil"],
  "sport": ["conseil", "conseil", "conseil"],
  "lifestyle": ["conseil", "conseil"]
}
Chaque conseil = une phrase courte et actionnable.`;

export async function generateCoachAdvice(
  profile: HealthProfile,
  metrics: HealthResult
): Promise<CoachAdvice> {
  const user = `Profil de l'utilisateur :
- Sexe : ${profile.sex === "female" ? "Femme" : "Homme"}
- Âge : ${profile.age} ans
- Taille : ${profile.heightCm} cm
- Poids : ${profile.weightKg} kg
- Activité : ${profile.activity ? activityLabels[profile.activity] : "?"}
- Objectif : ${profile.goal ? goalLabels[profile.goal] : "?"}

Métriques calculées :
- IMC : ${metrics.bmi} (${metrics.bmiCategory})
- Besoin énergétique estimé (TDEE) : ${metrics.tdee} kcal/jour
- Cible calorique : ${metrics.targetKcal} kcal/jour
- Protéines conseillées : ${metrics.proteinG} g/jour
- Eau : ${metrics.waterL} L/jour

Donne des conseils personnalisés adaptés à cet objectif.`;

  const raw = (await aiJSON(SYSTEM, user, 0.4)) as Partial<CoachAdvice> | null;

  const asList = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 5) : [];

  return {
    summary: typeof raw?.summary === "string" ? raw.summary : "Voici tes conseils personnalisés.",
    nutrition: asList(raw?.nutrition),
    sport: asList(raw?.sport),
    lifestyle: asList(raw?.lifestyle),
  };
}
