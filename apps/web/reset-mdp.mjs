// Réinitialise un mot de passe DIRECTEMENT (sans email) via la clé service_role.
// Usage :
//   node reset-mdp.mjs                         -> liste les comptes existants
//   node reset-mdp.mjs mon@email.com NouveauMdp -> change le mot de passe
//
// À lancer depuis le dossier apps/web.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- Lire .env.local ---
function readEnv() {
  const txt = readFileSync(new URL("./.env.local", import.meta.url), "utf8");
  const env = {};
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = readEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌ URL ou clé service_role manquante dans .env.local");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const [, , email, password] = process.argv;

const { data, error } = await admin.auth.admin.listUsers();
if (error) {
  console.error("❌ Erreur Supabase :", error.message);
  process.exit(1);
}

if (!email) {
  console.log(`\n👥 Comptes enregistrés (${data.users.length}) :\n`);
  for (const u of data.users) {
    console.log(`  • ${u.email}   (créé le ${u.created_at?.slice(0, 10)})`);
  }
  console.log(
    "\n➡️  Pour changer un mot de passe :\n   node reset-mdp.mjs ton@email.com TonNouveauMotDePasse\n"
  );
  process.exit(0);
}

const user = data.users.find(
  (u) => (u.email ?? "").toLowerCase() === email.toLowerCase()
);
if (!user) {
  console.error(`❌ Aucun compte trouvé pour « ${email} ». Vérifie l'orthographe.`);
  process.exit(1);
}

if (!password || password.length < 6) {
  console.error("❌ Donne un mot de passe d'au moins 6 caractères en 2e argument.");
  process.exit(1);
}

const { error: upErr } = await admin.auth.admin.updateUserById(user.id, {
  password,
  email_confirm: true,
});
if (upErr) {
  console.error("❌ Échec :", upErr.message);
  process.exit(1);
}

console.log(`\n✅ Mot de passe changé pour ${user.email}.`);
console.log("   Tu peux te connecter avec ce nouveau mot de passe.\n");
