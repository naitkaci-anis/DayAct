"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { BoltIcon, BellIcon } from "@/components/icons";
import { useStore, user } from "@/lib/store";
import { InstallApp } from "@/components/InstallApp";
import { playReminderSound } from "@/lib/sound";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={`flex items-center w-10 h-6 rounded-full px-0.5 transition-colors ${
        on ? "bg-primary justify-end" : "bg-line justify-start"
      }`}
    >
      <span className="w-5 h-5 rounded-full bg-field" />
    </button>
  );
}

function Row({
  label,
  hint,
  control,
}: {
  label: string;
  hint?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5 border-b border-line last:border-b-0">
      <div>
        <p className="text-sm text-ink">{label}</p>
        {hint && <p className="text-xs text-ink-muted mt-0.5">{hint}</p>}
      </div>
      {control}
    </div>
  );
}

export default function SettingsPage() {
  const { state, dispatch, backend, userEmail } = useStore();
  const { settings } = state;
  const [testMsg, setTestMsg] = useState<string | null>(null);

  async function testReminder() {
    playReminderSound();
    setTestMsg("🔊 Sonnerie jouée…");
    try {
      if (!("Notification" in window)) {
        setTestMsg("🔊 Sonnerie OK. Ce navigateur ne gère pas les notifications.");
        return;
      }
      let perm = Notification.permission;
      if (perm === "default") perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setTestMsg(
          "🔊 Sonnerie OK, mais notifications BLOQUÉES. Autorise-les : icône 🔒 à côté de l'adresse → Notifications → Autoriser."
        );
        return;
      }
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg?.showNotification) {
        await reg.showNotification("🔔 Test DayAct", {
          body: "Parfait ! Les rappels fonctionnent sur cet appareil.",
          icon: "/icon.svg",
          badge: "/icon.svg",
        });
      } else {
        new Notification("🔔 Test DayAct", {
          body: "Parfait ! Les rappels fonctionnent sur cet appareil.",
          icon: "/icon.svg",
        });
      }
      setTestMsg("✅ Sonnerie + notification envoyées — tu devrais les voir/entendre !");
    } catch {
      setTestMsg("🔊 Sonnerie OK, mais la notification a échoué sur cet appareil.");
    }
  }

  function resetData() {
    if (typeof window === "undefined") return;
    if (window.confirm("Réinitialiser toutes les données (tâches, humeurs, réglages) ?")) {
      localStorage.removeItem("dayact-state-v2");
      window.location.reload();
    }
  }

  return (
    <>
      <PageHeader title="Paramètres" subtitle="Gère ton compte et tes préférences" />

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <section className="rounded-md border border-line bg-surface p-5">
          <h2 className="text-sm font-medium text-ink mb-4">Profil</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-on-fill text-xl font-medium">
              {settings.displayName.trim()
                ? settings.displayName.trim().charAt(0).toUpperCase()
                : user.initials}
            </div>
            <div>
              <p className="text-ink">
                {settings.displayName.trim() ||
                  (userEmail ? userEmail.split("@")[0] : user.name)}
              </p>
              <p className="text-sm text-ink-muted">
                {backend === "supabase" ? userEmail : "Mode démo · données locales"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs text-ink-muted mb-1.5">
              Prénom (affiché dans l&apos;app)
            </label>
            <input
              type="text"
              value={settings.displayName}
              maxLength={30}
              onChange={(e) =>
                dispatch({ type: "SET_SETTING", key: "displayName", value: e.target.value })
              }
              placeholder="Ex. Anis"
              className="w-full max-w-xs px-3 py-2 rounded-sm bg-field border border-line text-sm text-ink placeholder:text-ink-muted/60 focus:border-primary outline-none transition-colors"
            />
            <p className="text-[11px] text-ink-muted mt-1.5">
              Utilisé pour te saluer sur la page Aujourd&apos;hui. Enregistré automatiquement.
            </p>
          </div>
        </section>

        {/* Energy */}
        <section className="rounded-md border border-line bg-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm text-ink">
              <BoltIcon size={15} className="text-warning" />
              Niveau d'énergie
            </span>
            <span className="text-sm text-ink font-medium">{settings.energy}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.energy}
            onChange={(e) =>
              dispatch({ type: "SET_SETTING", key: "energy", value: Number(e.target.value) })
            }
            className="w-full accent-primary"
          />
        </section>

        {/* Preferences */}
        <section className="rounded-md border border-line bg-surface">
          <Row
            label="Notifications de rappel"
            hint="Alertes du navigateur à l'heure de chaque tâche"
            control={
              <Toggle
                on={settings.notifications}
                onClick={() => {
                  const next = !settings.notifications;
                  if (
                    next &&
                    typeof window !== "undefined" &&
                    "Notification" in window &&
                    Notification.permission === "default"
                  ) {
                    Notification.requestPermission();
                  }
                  dispatch({ type: "SET_SETTING", key: "notifications", value: next });
                }}
              />
            }
          />
          <Row
            label="Suggestions de l'assistant"
            hint="Recommandations contextuelles sur le tableau de bord"
            control={
              <Toggle
                on={settings.aiSuggestions}
                onClick={() =>
                  dispatch({
                    type: "SET_SETTING",
                    key: "aiSuggestions",
                    value: !settings.aiSuggestions,
                  })
                }
              />
            }
          />
        </section>

        {/* Reminder test */}
        <section className="rounded-md border border-line bg-surface p-5">
          <h2 className="flex items-center gap-2 text-sm font-medium text-ink mb-2">
            <BellIcon size={15} className="text-primary" />
            Tester les rappels sur cet appareil
          </h2>
          <p className="text-xs text-ink-muted mb-4">
            Vérifie en 2 secondes que la sonnerie et la notification fonctionnent ici
            (téléphone ou PC).
          </p>
          <button
            onClick={testReminder}
            className="px-4 py-2.5 rounded-sm bg-primary text-on-fill text-sm font-medium hover:opacity-90 transition-opacity"
          >
            🔔 Tester sonnerie + notification
          </button>
          {testMsg && <p className="text-xs text-ink-muted mt-3">{testMsg}</p>}
          <p className="text-[11px] text-ink-muted/70 mt-3">
            ℹ️ Les rappels sonnent quand DayAct est ouvert (onglet ou app installée). Sur
            iPhone, installe d&apos;abord l&apos;app sur l&apos;écran d&apos;accueil pour recevoir
            des notifications.
          </p>
        </section>

        {/* Install as app */}
        <section className="rounded-md border border-line bg-surface p-5">
          <h2 className="text-sm font-medium text-ink mb-2">📲 Application</h2>
          <p className="text-xs text-ink-muted mb-4">
            Installe DayAct sur ton téléphone ou ton PC : icône sur l&apos;écran d&apos;accueil,
            plein écran, lancement instantané. Gratuit, sans app store.
          </p>
          <InstallApp />
        </section>

        {/* Data */}
        <section className="rounded-md border border-line bg-surface p-5">
          <h2 className="text-sm font-medium text-ink mb-3">Données</h2>
          <p className="text-xs text-ink-muted mb-3">
            Tes données sont stockées localement dans ce navigateur (aucun serveur).
          </p>
          <button
            onClick={resetData}
            className="px-4 py-2.5 rounded-sm border border-danger/40 text-danger text-sm hover:bg-danger/10 transition-colors"
          >
            Réinitialiser les données
          </button>
        </section>

        <p className="text-center text-[11px] text-ink-muted">DayAct v0.0.1 · Phase 2</p>
      </div>
    </>
  );
}
