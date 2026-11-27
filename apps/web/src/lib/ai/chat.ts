// Conversational task management: create / update / delete from free text.
import { aiJSON } from "./provider";

export interface ParsedTask {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMin: number;
  priority: "high" | "medium" | "low";
  category: "work" | "health" | "personal" | "learning";
  /** false when the user gave no hour: the app then finds the next free slot. */
  timeGiven?: boolean;
  /** Place, when the user names one ("chez le dentiste rue X"). */
  location?: string;
}

/** Duration used when the user doesn't give one. */
export const DEFAULT_DURATION_MIN = 20;

export type TaskChanges = Partial<ParsedTask>;

export type ChatAction =
  | { type: "create"; task: ParsedTask }
  | { type: "update"; taskIndex: number; changes: TaskChanges }
  | { type: "delete"; taskIndex: number };

export interface ChatContextTask {
  title: string;
  date: string;
  time: string;
  durationMin?: number;
  done?: boolean;
}

export interface ChatResult {
  actions: ChatAction[];
  reply: string;
}

const PRIORITIES = ["high", "medium", "low"];
const CATEGORIES = ["work", "health", "personal", "learning"];

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function dateReference(todayISO: string) {
  const [y, m, d] = todayISO.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  const lines: string[] = [];
  for (let i = 0; i < 8; i++) {
    const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const name = day.toLocaleDateString("fr-FR", { weekday: "long" });
    let label = name;
    if (i === 0) label += " (aujourd'hui)";
    else if (i === 1) label += " (demain)";
    else if (i === 2) label += " (après-demain)";
    lines.push(`${label} = ${iso(day)}`);
  }
  return lines.join("\n");
}

function buildPrompt(message: string, todayISO: string, context: ChatContextTask[]) {
  const ref = dateReference(todayISO);
  const list =
    context.length > 0
      ? context
          .map(
            (t, i) =>
              `${i + 1}. [${t.date} ${t.time}${t.durationMin ? `, ${t.durationMin} min` : ""}] ${t.title}${t.done ? " (fait)" : ""}`
          )
          .join("\n")
      : "(aucune tâche pour l'instant)";

  const system =
    "Tu es l'assistant personnel de DayAct. Tu gères l'agenda de l'utilisateur : créer, modifier ou supprimer des tâches, " +
    "et répondre à ses questions sur son agenda. Tu connais son agenda numéroté. " +
    "Tu réponds UNIQUEMENT avec un objet JSON valide et compact (sans retour à la ligne inutile), en français, sans aucun texte autour.";

  const user = `Date du jour : ${todayISO}.
Référence des dates (pour "demain", "lundi", "ce soir"…) :
${ref}

Mes tâches actuelles (numérotées) :
${list}

Exemples (le format des actions est OBLIGATOIRE) :
Demande : "ajoute dentiste demain 14h" →
{"actions":[{"type":"create","task":{"title":"Dentiste","date":"2026-01-02","time":"14:00","durationMin":30,"priority":"medium","category":"personal"}}],"reply":"J'ai ajouté Dentiste demain à 14h."}
Demande : "décale ma réunion à 11h" (la réunion est la tâche n°1) →
{"actions":[{"type":"update","taskIndex":1,"changes":{"time":"11:00"}}],"reply":"Réunion décalée à 11h."}
Demande : "renomme le sport en natation" (le sport est la tâche n°2) →
{"actions":[{"type":"update","taskIndex":2,"changes":{"title":"Natation"}}],"reply":"C'est renommé."}
Demande : "annule la méditation" (la méditation est la tâche n°3) →
{"actions":[{"type":"delete","taskIndex":3}],"reply":"Méditation annulée."}
Demande : "Planning de vendredi : 15h30 – 16h30 réviser le module, appeler maman, 23h00 – 00h00 révisions, 00h00 – 01h00 lecture" (vendredi = 2026-01-02) →
{"actions":[{"type":"create","task":{"title":"Réviser le module","date":"2026-01-02","time":"15:30","durationMin":60,"priority":"medium","category":"learning","timeGiven":true}},{"type":"create","task":{"title":"Appeler maman","date":"2026-01-02","time":"16:30","durationMin":20,"priority":"medium","category":"personal","timeGiven":false}},{"type":"create","task":{"title":"Révisions","date":"2026-01-02","time":"23:00","durationMin":60,"priority":"medium","category":"learning","timeGiven":true}},{"type":"create","task":{"title":"Lecture","date":"2026-01-03","time":"00:00","durationMin":60,"priority":"low","category":"personal","timeGiven":true}}],"reply":"J'ai ajouté tes 4 tâches de vendredi."}
Demande : "j'ai quoi demain ?" →
{"actions":[],"reply":"Demain tu as : 9h Réunion d'équipe (1 h), 14h Dentiste (30 min). Le reste de la journée est libre."}

Demande de l'utilisateur : "${message}"

Réponds avec cet objet JSON exact :
{
  "actions": [
    { "type": "create", "task": { "title": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "durationMin": <min>, "priority": "high|medium|low", "category": "work|health|personal|learning", "timeGiven": true|false, "location": "lieu s'il est donné, sinon omis" } },
    { "type": "update", "taskIndex": <numéro de la tâche existante>, "changes": { <uniquement les champs à modifier> } },
    { "type": "delete", "taskIndex": <numéro de la tâche existante> }
  ],
  "reply": "phrase de confirmation courte et naturelle, en français"
}
Règles :
- Pour AJOUTER une tâche → action "create".
- Pour DÉCALER / RENOMMER / CHANGER une tâche existante → action "update" avec son numéro et seulement les champs modifiés.
- Pour ANNULER / SUPPRIMER une tâche existante → action "delete" avec son numéro.
- Identifie la bonne tâche par son titre. Si aucune action n'est possible, renvoie "actions": [] et explique dans "reply".
- Un planning avec plusieurs lignes ou plusieurs tâches → UNE action "create" PAR tâche, sans en oublier aucune.
- Durée : si une plage est donnée ("15h30 – 16h30"), durationMin = la différence (60). Si aucune durée n'est donnée, durationMin = ${DEFAULT_DURATION_MIN}.
- "timeGiven" = true seulement si l'utilisateur a donné l'heure de début ; sinon false (l'application trouvera un créneau libre).
- Minuit : une tâche qui commence à 00h00 ou après (00h30, 01h00…) dans un planning du soir va sur le JOUR SUIVANT.
- Titres courts (5 mots max), sans l'horaire ni le lieu dedans ; le lieu va dans "location".
- QUESTION sur l'agenda ("j'ai quoi demain ?", "quels rendez-vous lundi ?", "suis-je libre à 15h ?") → "actions": [] et réponds dans "reply" à partir de la liste des tâches, avec les heures.
- "reply" reste court : 1 à 3 phrases.`;

  return { system, user };
}

function clampTime(t: unknown): string | null {
  if (typeof t === "string" && /^\d{1,2}:\d{2}$/.test(t)) {
    const [h, m] = t.split(":").map(Number);
    if (h >= 0 && h < 24 && m >= 0 && m < 60)
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  return null;
}

function validDate(d: unknown): string | null {
  return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

function parseChanges(raw: Record<string, unknown>): TaskChanges {
  const c: TaskChanges = {};
  if (typeof raw.title === "string" && raw.title.trim()) c.title = raw.title.trim();
  const d = validDate(raw.date);
  if (d) c.date = d;
  const t = clampTime(raw.time);
  if (t) c.time = t;
  if (typeof raw.durationMin === "number" && raw.durationMin > 0)
    c.durationMin = Math.round(raw.durationMin);
  if (PRIORITIES.includes(raw.priority as string)) c.priority = raw.priority as ParsedTask["priority"];
  if (CATEGORIES.includes(raw.category as string)) c.category = raw.category as ParsedTask["category"];
  return c;
}

export async function chatToCommands(
  message: string,
  todayISO: string,
  context: ChatContextTask[]
): Promise<ChatResult> {
  const { system, user } = buildPrompt(message, todayISO, context);
  const raw = (await aiJSON(system, user, 0.2)) as {
    actions?: unknown[];
    reply?: unknown;
    partial?: boolean;
  };

  const actions: ChatAction[] = [];
  if (Array.isArray(raw.actions)) {
    for (const a of raw.actions) {
      const obj = a as Record<string, unknown>;
      if (obj.type === "create" && obj.task && typeof obj.task === "object") {
        const t = obj.task as Record<string, unknown>;
        if (typeof t.title === "string" && t.title.trim()) {
          actions.push({
            type: "create",
            task: {
              title: t.title.trim(),
              date: validDate(t.date) ?? todayISO,
              time: clampTime(t.time) ?? "09:00",
              durationMin:
                typeof t.durationMin === "number" && t.durationMin > 0
                  ? Math.round(t.durationMin)
                  : DEFAULT_DURATION_MIN,
              priority: PRIORITIES.includes(t.priority as string)
                ? (t.priority as ParsedTask["priority"])
                : "medium",
              category: CATEGORIES.includes(t.category as string)
                ? (t.category as ParsedTask["category"])
                : "personal",
              timeGiven: t.timeGiven !== false && clampTime(t.time) !== null,
              ...(typeof t.location === "string" && t.location.trim() ? { location: t.location.trim().slice(0, 120) } : {}),
            },
          });
        }
      } else if (obj.type === "update" && typeof obj.taskIndex === "number") {
        const changes = parseChanges((obj.changes as Record<string, unknown>) ?? {});
        if (Object.keys(changes).length > 0)
          actions.push({ type: "update", taskIndex: obj.taskIndex, changes });
      } else if (obj.type === "delete" && typeof obj.taskIndex === "number") {
        actions.push({ type: "delete", taskIndex: obj.taskIndex });
      }
    }
  }

  let reply =
    typeof raw.reply === "string" && raw.reply.trim()
      ? raw.reply.trim()
      : actions.length
      ? `C'est fait : ${actions.length} action${actions.length > 1 ? "s" : ""}.`
      : "Je n'ai pas compris la demande. Peux-tu reformuler ?";
  if (raw.partial)
    reply +=
      " La fin de ma réponse a été coupée : vérifie ton agenda et renvoie-moi les tâches manquantes si besoin.";

  return { actions, reply };
}
