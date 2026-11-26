// Pure, deterministic health computations — an instant "coach" that never
// depends on the network. The AI route can add a personalized narrative on top.

export type Sex = "male" | "female" | "";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "";
export type Goal = "lose" | "maintain" | "gain" | "";

export interface HealthProfile {
  sex: Sex;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  activity: Activity;
  goal: Goal;
}

export const EMPTY_PROFILE: HealthProfile = {
  sex: "",
  age: null,
  heightCm: null,
  weightKg: null,
  activity: "",
  goal: "",
};

export const activityLabels: Record<Exclude<Activity, "">, string> = {
  sedentary: "Sédentaire",
  light: "Léger (1-2×/sem)",
  moderate: "Modéré (3-4×/sem)",
  active: "Actif (5×+/sem)",
};

export const goalLabels: Record<Exclude<Goal, "">, string> = {
  lose: "Perdre du poids",
  maintain: "Maintenir",
  gain: "Prendre du muscle",
};

const ACTIVITY_FACTOR: Record<Exclude<Activity, "">, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export interface HealthResult {
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  bmr: number;
  tdee: number;
  targetKcal: number;
  proteinG: number;
  waterL: number;
  tips: string[];
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Insuffisance pondérale", color: "#590907" };
  if (bmi < 25) return { label: "Corpulence normale", color: "#4E6B35" };
  if (bmi < 30) return { label: "Surpoids", color: "#A0661A" };
  return { label: "Obésité", color: "#B3261E" };
}

export function isComplete(p: HealthProfile): boolean {
  return Boolean(
    p.sex && p.age && p.heightCm && p.weightKg && p.activity && p.goal
  );
}

export function computeHealth(p: HealthProfile): HealthResult | null {
  if (!isComplete(p)) return null;
  const w = p.weightKg as number;
  const h = p.heightCm as number;
  const age = p.age as number;
  const activity = p.activity as Exclude<Activity, "">;
  const goal = p.goal as Exclude<Goal, "">;

  const bmi = Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
  const cat = bmiCategory(bmi);

  const bmrRaw =
    p.sex === "female"
      ? 10 * w + 6.25 * h - 5 * age - 161
      : 10 * w + 6.25 * h - 5 * age + 5;
  const bmr = Math.round(bmrRaw);
  const tdee = Math.round(bmr * ACTIVITY_FACTOR[activity]);

  const targetKcal =
    goal === "lose" ? tdee - 400 : goal === "gain" ? tdee + 300 : tdee;

  const proteinPerKg = goal === "maintain" ? 1.5 : 1.8;
  const proteinG = Math.round(w * proteinPerKg);
  const waterL = Math.round(w * 0.035 * 10) / 10;

  // Personalized, rule-based tips.
  const tips: string[] = [];

  if (goal === "lose") {
    tips.push(
      `Vise ~${targetKcal} kcal/jour (léger déficit) : privilégie légumes, protéines maigres et féculents complets.`,
      "Cardio 20-30 min 3-4×/sem + 2 séances de renforcement pour garder ton muscle.",
      "Limite sucres rapides et boissons sucrées ; bois de l'eau avant les repas pour la satiété."
    );
  } else if (goal === "gain") {
    tips.push(
      `Vise ~${targetKcal} kcal/jour (léger surplus) réparti sur 4-5 repas.`,
      `Musculation 4×/sem en progression + ${proteinG} g de protéines/jour (œufs, poulet, légumineuses, laitages).`,
      "Dors 7-9 h : la récupération construit le muscle autant que l'entraînement."
    );
  } else {
    tips.push(
      `Maintien : ~${tdee} kcal/jour avec des repas équilibrés (½ légumes, ¼ protéines, ¼ féculents).`,
      "Mélange cardio et renforcement 3×/sem pour rester en forme.",
      "Garde une routine de sommeil régulière pour stabiliser énergie et appétit."
    );
  }

  if (bmi >= 25 && goal !== "lose") {
    tips.push("Ton IMC est au-dessus de la normale : de la marche quotidienne t'aiderait déjà beaucoup.");
  }
  if (bmi < 18.5 && goal !== "gain") {
    tips.push("Ton IMC est bas : augmente légèrement les portions et les collations riches (fruits secs, oléagineux).");
  }
  if (activity === "sedentary") {
    tips.push("Commence par 7 000-8 000 pas/jour : le plus dur est de bouger un peu tous les jours.");
  }
  tips.push(`Hydratation : environ ${waterL} L d'eau par jour.`);

  return {
    bmi,
    bmiCategory: cat.label,
    bmiColor: cat.color,
    bmr,
    tdee,
    targetKcal,
    proteinG,
    waterL,
    tips,
  };
}
