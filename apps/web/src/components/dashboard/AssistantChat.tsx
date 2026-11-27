"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, SparkIcon, SettingsIcon } from "@/components/icons";
import { useStore, todayISO, addDays, categoryMeta, type Task } from "@/lib/store";
import { findOverlapping } from "@/lib/conflicts";
import type { ParsedTask, ChatAction } from "@/lib/ai/chat";

// Minimal typing for the browser SpeechRecognition API.
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  tasks?: ParsedTask[];
}

export function AssistantChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text:
        "Salut 👋 Je gère ton agenda. Tu peux me dire :\n• « réunion équipe lundi 9h pendant 1h »\n• colle tout ton planning de la journée, ligne par ligne\n• « décale mon sport à 19h » ou « annule la méditation »\n• « j'ai quoi demain ? »\nÉcris ou parle 🎤.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // The message box grows with the text (up to ~40 % of the screen).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, Math.round(window.innerHeight * 0.4))}px`;
  }, [input]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function startVoice() {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      SpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      alert("La reconnaissance vocale n'est pas supportée par ce navigateur (essaie Chrome).");
      return;
    }
    const rec = new Ctor();
    rec.lang = "fr-FR";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " : "") + transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  function stopVoice() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  async function send() {
    const message = input.trim();
    if (!message || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: message }]);
    setLoading(true);

    // Stable, ordered snapshot — the AI references tasks by their number here.
    // Only a useful window (yesterday → 2 months ahead) to keep the prompt short.
    const from = addDays(todayISO(), -1);
    const to = addDays(todayISO(), 60);
    const ctx = state.tasks
      .filter((t) => t.date >= from && t.date <= to)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          today: todayISO(),
          context: ctx.map((t) => ({
            title: t.title,
            date: t.date,
            time: t.time,
            durationMin: t.durationMin,
            done: t.done,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur de l'IA");

      const actions = (data.actions ?? []) as ChatAction[];
      const created: ParsedTask[] = [];
      const conflictNotes: string[] = [];

      const pool: { id?: string; title: string; date: string; time: string; durationMin: number }[] =
        ctx.map((t) => ({
          id: t.id,
          title: t.title,
          date: t.date,
          time: t.time,
          durationMin: t.durationMin,
        }));

      for (const a of actions) {
        if (a.type === "create") {
          const t = { ...a.task };
          // No hour given → next free slot that day, right after what's planned.
          if (t.timeGiven === false) t.time = nextFreeSlot(pool, t.date, t.durationMin);
          const over = findOverlapping(pool, {
            date: t.date,
            time: t.time,
            durationMin: t.durationMin,
          });
          if (over.length > 0)
            conflictNotes.push(
              `« ${t.title} » (${t.time}) chevauche ${over.map((o) => `« ${o.title} »`).join(", ")}`
            );
          pool.push({ title: t.title, date: t.date, time: t.time, durationMin: t.durationMin });
          created.push(t);
          dispatch({
            type: "ADD_TASK",
            task: {
              title: t.title,
              date: t.date,
              time: t.time,
              durationMin: t.durationMin,
              priority: t.priority,
              category: t.category,
              notes: "",
              location: t.location,
            },
          });
        } else if (a.type === "update") {
          const target = ctx[a.taskIndex - 1];
          if (target) dispatch({ type: "UPDATE_TASK", id: target.id, patch: a.changes });
        } else if (a.type === "delete") {
          const target = ctx[a.taskIndex - 1];
          if (target) dispatch({ type: "DELETE_TASK", id: target.id });
        }
      }

      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply as string, tasks: created },
      ]);
      if (conflictNotes.length > 0) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: "⚠ Attention, chevauchement détecté :\n" + conflictNotes.join("\n"),
          },
        ]);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: e instanceof Error ? e.message : "Erreur." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={onClose} />

      <aside
        className="absolute right-0 top-0 h-full w-full max-w-md bg-surface border-l border-line flex flex-col"
        style={{ animation: "slideInRight 0.22s ease" }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-line shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-secondary/15 text-secondary-ink">
              <SparkIcon size={16} />
            </span>
            <div>
              <h2 className="text-sm font-medium text-ink">Assistant</h2>
              <p className="text-[10px] text-ink-muted">assistant IA</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Fermer">
            <CloseIcon size={18} />
          </button>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-md px-3.5 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-on-fill"
                    : "bg-field border border-line text-ink"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                {m.tasks && m.tasks.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {m.tasks.map((t, j) => {
                      const cat = categoryMeta[t.category as Task["category"]];
                      return (
                        <li
                          key={j}
                          className="flex items-center gap-2 rounded-sm bg-surface border border-line px-2 py-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.color }} />
                          <span className="text-[12px] text-ink truncate flex-1">{t.title}</span>
                          <span className="text-[10px] font-mono text-ink-muted">
                            {t.date.slice(5)} {t.time}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-md px-3.5 py-2.5 bg-field border border-line">
                <span className="flex items-center gap-1.5 text-sm text-ink-muted">
                  <SettingsIcon size={14} className="animate-spin" /> réflexion… (~30 s en local)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* input */}
        <div className="p-3 border-t border-line shrink-0">
          <div className="flex items-end gap-2">
            <button
              onClick={listening ? stopVoice : startVoice}
              className={`flex items-center justify-center w-10 h-10 rounded-sm border transition-colors shrink-0 ${
                listening
                  ? "border-danger text-danger bg-danger/10 animate-pulse"
                  : "border-line text-ink-muted hover:text-primary"
              }`}
              aria-label="Dicter à la voix"
              title="Parler"
            >
              🎤
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={listening ? "Parle…" : "Écris ta demande…"}
              className="flex-1 resize-none overflow-y-auto px-3 py-2.5 rounded-sm bg-field border border-line text-[15px] leading-snug text-ink placeholder:text-ink-muted/60 focus:border-primary outline-none"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="flex items-center justify-center w-10 h-10 rounded-sm bg-primary text-on-fill disabled:opacity-40 transition-opacity shrink-0"
              aria-label="Envoyer"
            >
              ↑
            </button>
          </div>
          <p className="text-[10px] text-ink-muted mt-1.5 text-center">
            Entrée pour envoyer · Maj + Entrée pour aller à la ligne
          </p>
        </div>
      </aside>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

function toHHMM(min: number) {
  const m = Math.max(0, Math.min(23 * 60 + 59, min));
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** First gap of `duration` minutes on `date`, starting now (today) or 9:00, never overlapping. */
function nextFreeSlot(
  pool: { date: string; time: string; durationMin: number }[],
  date: string,
  duration: number
) {
  const now = new Date();
  const nowMin = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 5) * 5;
  let start = date === todayISO() ? Math.max(9 * 60, nowMin) : 9 * 60;
  const busy = pool
    .filter((p) => p.date === date)
    .map((p) => [toMin(p.time), toMin(p.time) + p.durationMin] as const)
    .sort((a, b) => a[0] - b[0]);
  for (const [s, e] of busy) {
    if (start + duration <= s) break;
    if (e > start) start = e;
  }
  return toHHMM(start);
}
