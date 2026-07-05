"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { LogoMark } from "@/components/icons";
import { signIn, signUp, type AuthState } from "@/lib/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

function ForgotPassword() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function send() {
    const supabase = createClient();
    if (!supabase || !email.trim()) return;
    setStatus("sending");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 block w-full text-center text-xs text-text-muted hover:text-act-cyan transition-colors"
      >
        Mot de passe oublié ?
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-sm border border-border bg-deep p-4">
      <p className="text-xs text-text mb-2 font-medium">Réinitialiser le mot de passe</p>
      {status === "sent" ? (
        <p className="text-xs text-done-green bg-done-green/10 border border-done-green/30 rounded-sm px-3 py-2">
          📧 Si un compte existe pour <strong>{email}</strong>, un lien de réinitialisation vient
          d'être envoyé. Vérifie ta boîte mail (et les spams).
        </p>
      ) : (
        <>
          <p className="text-[11px] text-text-muted mb-2">
            Entre ton email : on t'envoie un lien pour choisir un nouveau mot de passe.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="anis@mail.com"
            className="w-full px-3 py-2 rounded-sm bg-[#0a0a14] border border-border text-sm text-text placeholder:text-text-muted/60 focus:border-act-cyan outline-none mb-2"
          />
          {status === "error" && (
            <p className="text-[11px] text-alert-red mb-2">{errorMsg}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={send}
              disabled={status === "sending" || !email.trim()}
              className="px-3 py-1.5 rounded-sm bg-act-cyan text-[#0a0a14] text-xs font-medium disabled:opacity-50"
            >
              {status === "sending" ? "Envoi…" : "Envoyer le lien"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-sm text-xs text-text-muted hover:text-text"
            >
              Annuler
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2.5 rounded-sm bg-act-cyan text-[#0a0a14] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      {pending ? "Patiente…" : label}
    </button>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});

  const isLogin = mode === "login";

  return (
    <main className="min-h-screen bg-void flex items-center justify-center px-4">
      {/* ambient glow */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(6,182,212,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-md border border-border bg-deep glow-cyan mb-3">
            <LogoMark size={28} />
          </div>
          <h1 className="text-2xl font-light text-gradient-cyan tracking-tight">DayAct</h1>
          <p className="text-sm text-text-muted mt-1">
            {isLogin ? "Connecte-toi pour agir sur ta journée" : "Crée ton compte"}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-sm border border-energy-amber/40 bg-energy-amber/10 px-3 py-2.5 text-xs text-energy-amber">
            Supabase n'est pas encore configuré. Renseigne tes clés dans{" "}
            <code className="font-mono">.env.local</code> puis redémarre le serveur.
          </div>
        )}

        <form action={formAction} className="space-y-4 rounded-md border border-border bg-deep p-6">
          {!isLogin && (
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Nom (optionnel)</label>
              <input
                name="fullName"
                type="text"
                placeholder="Anis"
                className="w-full px-3 py-2 rounded-sm bg-[#0a0a14] border border-border text-sm text-text placeholder:text-text-muted/60 focus:border-act-cyan outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-text-muted mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="anis@mail.com"
              className="w-full px-3 py-2 rounded-sm bg-[#0a0a14] border border-border text-sm text-text placeholder:text-text-muted/60 focus:border-act-cyan outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1.5">Mot de passe</label>
            <input
              name="password"
              type="password"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-sm bg-[#0a0a14] border border-border text-sm text-text placeholder:text-text-muted/60 focus:border-act-cyan outline-none transition-colors"
            />
          </div>

          {state.error && (
            <p className="text-xs text-alert-red bg-alert-red/10 border border-alert-red/30 rounded-sm px-3 py-2">
              {state.error}
            </p>
          )}
          {state.message && (
            <p className="text-xs text-done-green bg-done-green/10 border border-done-green/30 rounded-sm px-3 py-2">
              {state.message}
            </p>
          )}

          <SubmitButton label={isLogin ? "Se connecter" : "Créer mon compte"} />
          {isLogin && isSupabaseConfigured && <ForgotPassword />}
        </form>

        <p className="text-center text-sm text-text-muted mt-5">
          {isLogin ? (
            <>
              Pas encore de compte ?{" "}
              <Link href="/signup" className="text-act-cyan hover:underline">
                Inscris-toi
              </Link>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <Link href="/login" className="text-act-cyan hover:underline">
                Connecte-toi
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
