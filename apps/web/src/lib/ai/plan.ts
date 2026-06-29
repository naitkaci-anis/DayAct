// Server-side day-planning logic. Talks to the configured AI provider.
import { aiJSON } from "./provider";

export interface PlanTask {
  title: string;
  time: string;
  durationMin: number;
  priority: "high" | "medium" | "low";
  category: string;
  done: boolean;
}

export interface DayPlan {
  focus: string | null; // most important task title
  order: string[]; // recommended order of task titles
  advice: string[]; // short tips
}

const priorityFr: Record<string, string> = {
  high: "haute",
  medium: "moyenne",
  low: "basse",
};

function buildPrompt(tasks: PlanTask[], energy: number) {
  const todo = tasks.filter((t) => !t.done);
  const list = todo
    .map(
      (t, i) =>
        `${i + 1}. "${t.title}" — priorité ${priorityFr[t.priority] ?? t.priority}, à ${t.time}, ${t.durationMin} min, catégorie ${t.category}`
    )
    .join("\n");

  const system =
    "Tu es l'assistant de planification de DayAct. Tu aides l'utilisateur à organiser sa journée de façon réaliste. " +
    "Tu réponds UNIQUEMENT avec un objet JSON valide, en français, sans texte autour.";

  const user = `Voici mes tâches non terminées aujourd'hui (mon énergie est à ${energy}%):
${list}

Donne-moi un plan. Réponds avec cet objet JSON exact :
{
  "focusIndex": <numéro de LA tâche la plus importante à faire en priorité>,
  "order": [<numéros des tâches dans l'ordre conseillé>],
  "advice": [<2 à 3 conseils courts et concrets, en français>]
}
Tiens compte de l'énergie (tâches dures quand l'énergie est haute) et des priorités.`;

  return { system, user, todo };
}

interface RawPlan {
  focusIndex?: number;
  order?: number[];
  advice?: string[];
}

function mapPlan(raw: RawPlan, todo: PlanTask[]): DayPlan {
  const byIndex = (n: unknown) =>
    typeof n === "number" && n >= 1 && n <= todo.length ? todo[n - 1].title : null;

  const focus = byIndex(raw.focusIndex);
  const order = Array.isArray(raw.order)
    ? raw.order.map(byIndex).filter((t): t is string => !!t)
    : [];
  // de-dupe order and append any task the model forgot
  const seen = new Set(order);
  for (const t of todo) if (!seen.has(t.title)) order.push(t.title);

  const advice = Array.isArray(raw.advice)
    ? raw.advice.filter((a) => typeof a === "string").slice(0, 3)
    : [];

  return { focus: focus ?? order[0] ?? null, order, advice };
}

export async function generateDayPlan(
  tasks: PlanTask[],
  energy: number
): Promise<DayPlan> {
  const { system, user, todo } = buildPrompt(tasks, energy);
  if (todo.length === 0) {
    return { focus: null, order: [], advice: ["Tout est fait — profite de ta journée 🎉"] };
  }

  const raw = (await aiJSON(system, user, 0.4)) as RawPlan;
  return mapPlan(raw, todo);
}
