"use client";

import { useEffect, useState } from "react";
import { SparkIcon, EditIcon, CheckIcon } from "@/components/icons";
import {
  EMPTY_PROFILE,
  computeHealth,
  isComplete,
  activityLabels,
  goalLabels,
  type HealthProfile,
  type Sex,
  type Activity,
  type Goal,
} from "@/lib/health";
import type { CoachAdvice } from "@/lib/ai/coach";

const STORAGE_KEY = "dayact-health-v1";

function numOrNull(v: string): number | null {
  const n = Number(v);
  return v.trim() === "" || Number.isNaN(n) ? null : n;
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-[12px] bg-surface border border-line p-3 text-center">
      <p className="text-lg font-light" style={{ color: color ?? "var(--ink)" }}>
        {value}
      </p>
      <p className="text-[10px] text-ink-muted">{label}</p>
      {sub && <p className="text-[9px] text-ink-muted/70">{sub}</p>}
    </div>
  );
}

export function HealthCoach() {
  const [profile, setProfile] = useState<HealthProfile>(EMPTY_PROFILE);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(true);
  const [advice, setAdvice] = useState<CoachAdvice | null>(null);
  const [aiState, setAiState] = useState<"idle" | "loading" | "error">("idle");
  const [aiError, setAiError] = useState("");

  // Load / persist locally (no DB migration needed).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const merged = { ...EMPTY_PROFILE, ...JSON.parse(raw) };
        setProfile(merged);
        setEditing(!isComplete(merged)); // start collapsed if already filled
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, [profile, loaded]);

  const result = computeHealth(profile);
  const complete = isComplete(profile);

  function set<K extends keyof HealthProfile>(key: K, value: HealthProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setAdvice(null);
  }

  async function askAI() {
    setAiState("loading");
    setAiError("");
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setAdvice(data.advice as CoachAdvice);
      setAiState("idle");
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Erreur");
      setAiState("error");
    }
  }

  const inputCls =
    "w-full px-3 py-2 rounded-sm bg-field border border-line text-sm text-ink placeholder:text-ink-muted/60 focus:border-primary outline-none";

  const summaryChips = complete
    ? [
        profile.sex === "female" ? "Femme" : "Homme",
        `${profile.age} ans`,
        `${profile.heightCm} cm`,
        `${profile.weightKg} kg`,
        profile.activity ? activityLabels[profile.activity] : "",
        profile.goal ? goalLabels[profile.goal] : "",
      ].filter(Boolean)
    : [];

  return (
    <section className="rounded-md border border-line bg-surface p-5 mb-6">
      {/* header + edit toggle */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-ink">Ton profil santé & coach</h2>
          {(editing || !complete) && (
            <p className="text-[11px] text-ink-muted mt-1">
              Renseigne tes infos : DayAct calcule tes repères et te donne des conseils nutrition &
              sport. (Données stockées uniquement sur cet appareil.)
            </p>
          )}
        </div>
        {complete && (
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-line text-xs text-ink-muted hover:text-ink hover:border-primary/50 transition-colors shrink-0"
          >
            {editing ? (
              <>
                <CheckIcon size={13} /> Terminé
              </>
            ) : (
              <>
                <EditIcon size={13} /> Modifier
              </>
            )}
          </button>
        )}
      </div>

      {/* form (edit mode) OR compact summary (view mode) */}
      {editing || !complete ? (
        <div className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* sexe */}
            <div>
              <label className="block text-xs text-ink-muted mb-1.5">Sexe</label>
              <div className="flex gap-2">
                {([
                  ["male", "Homme"],
                  ["female", "Femme"],
                ] as [Sex, string][]).map(([val, lbl]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set("sex", val)}
                    className={`flex-1 py-2 rounded-sm border text-xs transition-colors ${
                      profile.sex === val
                        ? "border-transparent bg-primary/15 text-primary"
                        : "border-line text-ink-muted hover:text-ink"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* age */}
            <div>
              <label className="block text-xs text-ink-muted mb-1.5">Âge</label>
              <input
                type="number"
                min={10}
                max={100}
                value={profile.age ?? ""}
                onChange={(e) => set("age", numOrNull(e.target.value))}
                placeholder="ans"
                className={inputCls}
              />
            </div>

            {/* activity */}
            <div>
              <label className="block text-xs text-ink-muted mb-1.5">Niveau d'activité</label>
              <select
                value={profile.activity}
                onChange={(e) => set("activity", e.target.value as Activity)}
                className={inputCls}
              >
                <option value="">Choisir…</option>
                {(Object.keys(activityLabels) as Exclude<Activity, "">[]).map((a) => (
                  <option key={a} value={a}>
                    {activityLabels[a]}
                  </option>
                ))}
              </select>
            </div>

            {/* height */}
            <div>
              <label className="block text-xs text-ink-muted mb-1.5">Taille (cm)</label>
              <input
                type="number"
                min={120}
                max={230}
                value={profile.heightCm ?? ""}
                onChange={(e) => set("heightCm", numOrNull(e.target.value))}
                placeholder="cm"
                className={inputCls}
              />
            </div>

            {/* weight */}
            <div>
              <label className="block text-xs text-ink-muted mb-1.5">Poids (kg)</label>
              <input
                type="number"
                min={30}
                max={250}
                value={profile.weightKg ?? ""}
                onChange={(e) => set("weightKg", numOrNull(e.target.value))}
                placeholder="kg"
                className={inputCls}
              />
            </div>

            {/* goal */}
            <div>
              <label className="block text-xs text-ink-muted mb-1.5">Objectif</label>
              <select
                value={profile.goal}
                onChange={(e) => set("goal", e.target.value as Goal)}
                className={inputCls}
              >
                <option value="">Choisir…</option>
                {(Object.keys(goalLabels) as Exclude<Goal, "">[]).map((g) => (
                  <option key={g} value={g}>
                    {goalLabels[g]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!complete && (
            <p className="text-[11px] text-ink-muted mt-4">
              Remplis tous les champs pour voir tes repères et débloquer les conseils.
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="w-full text-left mt-3 group"
        >
          <div className="flex flex-wrap gap-2">
            {summaryChips.map((chip) => (
              <span
                key={chip}
                className="px-2.5 py-1 rounded-full border border-line bg-field text-xs text-ink"
              >
                {chip}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-ink-muted mt-1.5 inline-block group-hover:text-primary transition-colors">
            Clique pour modifier tes infos
          </span>
        </button>
      )}

      {/* results (always visible once complete) */}
      {result && (
        <>
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-2.5 mt-5">
            <Metric label="IMC" value={String(result.bmi)} sub={result.bmiCategory} color={result.bmiColor} />
            <Metric label="Besoin/jour" value={`${result.tdee}`} sub="kcal" />
            <Metric label="Cible" value={`${result.targetKcal}`} sub="kcal/jour" />
            <Metric label="Protéines" value={`${result.proteinG}`} sub="g/jour" />
            <Metric label="Eau" value={`${result.waterL}`} sub="L/jour" />
          </div>

          <div className="mt-5">
            <h3 className="text-xs font-medium text-ink mb-2">Conseils personnalisés</h3>
            <ul className="space-y-2">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-ink-muted">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* AI deep-dive */}
          <div className="mt-5 rounded-[12px] border border-secondary/30 bg-secondary/[0.06] p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <SparkIcon size={16} className="text-secondary" />
                <span className="text-xs text-ink font-medium">Coach IA — conseils sur-mesure</span>
              </div>
              <button
                onClick={askAI}
                disabled={aiState === "loading"}
                className="px-3 py-1.5 rounded-sm bg-secondary/20 text-secondary text-xs font-medium hover:bg-secondary/30 transition-colors disabled:opacity-50"
              >
                {aiState === "loading" ? "L'IA réfléchit…" : advice ? "Regénérer" : "Demander à l'IA"}
              </button>
            </div>

            {aiState === "error" && <p className="text-[11px] text-danger mt-3">{aiError}</p>}

            {advice && (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-ink">{advice.summary}</p>
                {[
                  ["🥗 Nutrition", advice.nutrition],
                  ["🏋️ Sport", advice.sport],
                  ["🌙 Hygiène de vie", advice.lifestyle],
                ].map(([title, items]) =>
                  (items as string[]).length ? (
                    <div key={title as string}>
                      <p className="text-[11px] text-ink-muted mb-1">{title as string}</p>
                      <ul className="space-y-1">
                        {(items as string[]).map((it, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-secondary shrink-0" />
                            {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
