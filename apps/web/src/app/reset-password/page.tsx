"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

type Phase = "checking" | "ready" | "invalid" | "done" | "unconfigured";

export default function ResetPasswordPage() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setPhase("unconfigured");
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setPhase("ready");
    });

    (async () => {
      try {
        const code = new URL(window.location.href).searchParams.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession(code).catch(() => {});
        }
        const { data } = await supabase.auth.getSession();
        setPhase((p) => (p === "ready" ? p : data.session ? "ready" : "invalid"));
      } catch {
        setPhase("invalid");
      }
    })();

    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit() {
    setError("");
    if (password.length < 6) {
      setError("6 caractères minimum.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) setError(error.message);
    else setPhase("done");
  }

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(89,9,7,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-md border border-line bg-surface glow-primary mb-3">
            <LogoMark size={28} />
          </div>
          <h1 className="font-display text-3xl font-medium text-primary tracking-tight">DayAct</h1>
          <p className="text-sm text-ink-muted mt-1">Nouveau mot de passe</p>
        </div>

        <div className="rounded-md border border-line bg-surface p-6">
          {phase === "checking" && (
            <p className="text-sm text-ink-muted text-center py-4 animate-pulse">
              Vérification du lien…
            </p>
          )}

          {phase === "unconfigured" && (
            <p className="text-xs text-warning bg-warning/10 border border-warning/30 rounded-sm px-3 py-2">
              Supabase n'est pas configuré.
            </p>
          )}

          {phase === "invalid" && (
            <div className="text-center">
              <p className="text-sm text-danger mb-2">Lien invalide ou expiré.</p>
              <p className="text-xs text-ink-muted mb-4">
                Les liens de réinitialisation expirent vite. Redemande-en un.
              </p>
              <Link href="/login" className="text-sm text-primary hover:underline">
                ← Retour à la connexion
              </Link>
            </div>
          )}

          {phase === "done" && (
            <div className="text-center">
              <p className="text-sm text-success mb-3">
                ✓ Mot de passe modifié avec succès !
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-4 py-2 rounded-sm bg-primary text-on-fill text-sm font-medium hover:opacity-90"
              >
                Accéder à mon espace
              </Link>
            </div>
          )}

          {phase === "ready" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-ink-muted mb-1.5">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-sm bg-field border border-line text-sm text-ink placeholder:text-ink-muted/60 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1.5">Confirme le mot de passe</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-sm bg-field border border-line text-sm text-ink placeholder:text-ink-muted/60 focus:border-primary outline-none"
                />
              </div>
              {error && (
                <p className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-sm px-3 py-2">
                  {error}
                </p>
              )}
              <button
                onClick={submit}
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-sm bg-primary text-on-fill text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Enregistrement…" : "Changer le mot de passe"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
