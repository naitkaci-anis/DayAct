"use client";

import { useEffect, useState } from "react";
import {
  LogoMark,
  CalendarIcon,
  SparkIcon,
  BellIcon,
  FlameIcon,
  CheckIcon,
} from "@/components/icons";

const FLAG = "dayact-onboarded-v1";

const steps = [
  {
    icon: null, // logo
    title: "Bienvenue sur DayAct 👋",
    body: "Ton copilote productivité & bien-être. En 30 secondes, voici comment en tirer le meilleur.",
    accent: "#5be7ff",
  },
  {
    icon: CalendarIcon,
    title: "Planifie ta journée",
    body: "Crée des tâches avec un créneau horaire, fais-les glisser sur le calendrier (Mois · Semaine · Jour), et répète-les les jours que TU choisis.",
    accent: "#5be7ff",
  },
  {
    icon: SparkIcon,
    title: "L'IA travaille pour toi",
    body: "Clique sur l'étincelle violette : parle ou écris « réunion lundi 9h » et l'assistant crée, déplace ou supprime tes tâches. Il peut aussi planifier ta journée entière.",
    accent: "#8b5cf6",
  },
  {
    icon: FlameIcon,
    title: "Construis tes habitudes",
    body: "Valide tes habitudes chaque jour : gagne de l'XP, monte de niveau et débloque des trophées. Ta série 🔥 t'attend.",
    accent: "#f59e0b",
  },
  {
    icon: BellIcon,
    title: "Ne rate plus rien",
    body: "DayAct te prévient avant chaque tâche (sonnerie + notification). Active les notifications pour en profiter — même quand l'onglet est en arrière-plan.",
    accent: "#22c55e",
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(FLAG)) setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  function finish() {
    try {
      localStorage.setItem(FLAG, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function enableNotifications() {
    try {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    } catch {
      /* ignore */
    }
    finish();
  }

  if (!open) return null;

  const s = steps[step];
  const Icon = s.icon;
  const last = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-[fadeIn_0.2s_ease]" />

      {/* card */}
      <div className="relative z-10 w-full max-w-md glass rounded-[24px] p-8 text-center animate-[popIn_0.25s_ease] overflow-hidden">
        {/* accent glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, ${s.accent} 14%, transparent), transparent 70%)`,
          }}
        />

        <div className="relative">
          {/* icon */}
          <div
            className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-2xl border border-border bg-deep"
            style={{ boxShadow: `0 0 32px color-mix(in srgb, ${s.accent} 25%, transparent)` }}
          >
            {Icon ? (
              <Icon size={28} style={{ color: s.accent }} />
            ) : (
              <LogoMark size={34} />
            )}
          </div>

          <h2 className="text-xl font-light text-text tracking-tight">{s.title}</h2>
          <p className="mt-3 text-sm text-text-muted leading-relaxed min-h-[80px]">{s.body}</p>

          {/* progress dots */}
          <div className="flex items-center justify-center gap-1.5 mt-5 mb-6">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Étape ${i + 1}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 22 : 6,
                  background: i === step ? s.accent : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>

          {/* actions */}
          {last ? (
            <div className="space-y-2">
              <button
                onClick={enableNotifications}
                className="w-full px-4 py-3 rounded-[14px] bg-gradient-to-r from-act-cyan via-focus-violet to-accent text-[#050816] text-sm font-semibold hover:opacity-95 transition-opacity"
              >
                🔔 Activer les notifications et commencer
              </button>
              <button
                onClick={finish}
                className="w-full px-4 py-2 text-xs text-text-muted hover:text-text transition-colors"
              >
                Plus tard
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={finish}
                className="px-4 py-2.5 rounded-[12px] text-sm text-text-muted hover:text-text transition-colors"
              >
                Passer
              </button>
              <button
                onClick={() => setStep((v) => v + 1)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[12px] bg-act-cyan text-[#050816] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Suivant
                <CheckIcon size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
