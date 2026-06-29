# Configurer Supabase pour DayAct

Suis ces étapes une seule fois. Tant que ce n'est pas fait, l'app tourne en
**mode démo** (données locales au navigateur) — rien n'est cassé.

---

## 1. Créer un projet Supabase (gratuit)

1. Va sur **https://supabase.com** → **Start your project** → connecte-toi (GitHub ou email).
2. **New project** :
   - **Name** : `dayact`
   - **Database Password** : choisis-en un et **garde-le** quelque part.
   - **Region** : choisis l'Europe (ex. *West EU (Paris)* ou *Frankfurt*).
3. Attends ~2 min que le projet se crée.

## 2. Créer les tables (schéma)

1. Dans le projet → menu de gauche → **SQL Editor** → **New query**.
2. Ouvre le fichier **`supabase/schema.sql`** de ce repo, copie **tout** son contenu.
3. Colle-le dans l'éditeur → clique **Run** (ou Ctrl+Entrée).
4. Tu dois voir « Success. No rows returned ». ✅

## 3. (Recommandé) Accès immédiat sans confirmation d'email

Pour tester sans avoir à cliquer un lien de confirmation à chaque compte :

1. Menu de gauche → **Authentication** → **Sign In / Providers** (ou **Providers → Email**).
2. Désactive **« Confirm email »** → **Save**.

> Tu pourras le réactiver plus tard pour la production.

## 4. Récupérer tes clés

1. Menu de gauche → **Project Settings** (roue dentée) → **API**.
2. Note :
   - **Project URL** (ex. `https://abcd1234.supabase.co`)
   - **anon public** key (longue chaîne)
   - **service_role** key (longue chaîne — secrète)

## 5. Renseigner `.env.local`

Ouvre **`apps/web/.env.local`** et remplis :

```
NEXT_PUBLIC_SUPABASE_URL=https://TON-PROJET.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ta_clef_anon
SUPABASE_SERVICE_ROLE_KEY=ta_clef_service_role
ANTHROPIC_API_KEY=
```

## 6. Redémarrer le serveur

Dans le terminal où tourne `pnpm dev`, fais **Ctrl+C** puis relance :

```
pnpm --filter @dayact/web dev
```

---

## C'est prêt ✅

- Va sur `localhost:3000/dashboard` → tu seras **redirigé vers `/login`**.
- Clique **« Inscris-toi »**, crée ton compte → tu arrives sur ton tableau de bord **vide** (c'est normal, c'est ton vrai compte).
- Ajoute des tâches : elles sont maintenant **sauvegardées dans la base** et te suivront sur n'importe quel appareil/navigateur.

### Vérifier que ça marche
Dans Supabase → **Table Editor** → table **tasks** : tu verras tes tâches apparaître en temps réel quand tu en ajoutes dans l'app.

### En cas de souci
- Erreur de connexion → vérifie que les 2 clés `NEXT_PUBLIC_*` sont correctes et que tu as **redémarré** le serveur.
- « Email non confirmé » → fais l'étape 3, ou clique le lien reçu par email.
- Rien ne se sauvegarde → vérifie que le schéma (étape 2) s'est bien exécuté (table `tasks` présente).
