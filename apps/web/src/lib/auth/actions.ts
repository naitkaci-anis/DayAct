"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  message?: string;
}

// Translate the most common Supabase auth errors to French.
function frError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email ou mot de passe incorrect.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Un compte existe déjà avec cet email.";
  if (m.includes("password should be at least"))
    return "Le mot de passe doit faire au moins 6 caractères.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Adresse email invalide.";
  if (m.includes("email not confirmed"))
    return "Email non confirmé. Vérifie ta boîte mail.";
  return msg;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Renseigne ton email et ton mot de passe." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: frError(error.message) };

  redirect("/dashboard");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!email || !password) return { error: "Renseigne ton email et ton mot de passe." };
  if (password.length < 6)
    return { error: "Le mot de passe doit faire au moins 6 caractères." };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || email.split("@")[0] } },
  });
  if (error) return { error: frError(error.message) };

  // If email confirmation is disabled, a session is returned → go straight in.
  if (data.session) redirect("/dashboard");

  return {
    message:
      "Compte créé ! Vérifie ta boîte mail pour confirmer, puis connecte-toi. (Tu peux désactiver la confirmation dans Supabase pour un accès immédiat.)",
  };
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}
