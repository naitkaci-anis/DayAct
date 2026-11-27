// Turns a model's text answer into JSON, even when it is wrapped in prose or
// cut off mid-way (a long planning can hit the output limit). In that last
// case we keep every complete action we can find, so nothing finished is lost.

function salvageActions(text: string): unknown | null {
  const start = text.indexOf('"actions"');
  if (start === -1) return null;
  const arrStart = text.indexOf("[", start);
  if (arrStart === -1) return null;

  const actions: unknown[] = [];
  let depth = 0;
  let objStart = -1;
  let inString = false;
  let escaped = false;

  for (let i = arrStart + 1; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === "{") {
      if (depth === 0) objStart = i;
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0 && objStart !== -1) {
        try {
          actions.push(JSON.parse(text.slice(objStart, i + 1)));
        } catch {
          /* skip a malformed item */
        }
        objStart = -1;
      }
    } else if (c === "]" && depth === 0) break;
  }

  const replyMatch = text.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const reply = replyMatch ? JSON.parse(`"${replyMatch[1]}"`) : undefined;
  return actions.length || reply ? { actions, reply, partial: true } : null;
}

export function parseModelJSON(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    /* try harder below */
  }
  const m = trimmed.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {
      /* fall through to salvage */
    }
  }
  const salvaged = salvageActions(trimmed);
  if (salvaged) return salvaged;
  throw new Error("Réponse IA illisible");
}
