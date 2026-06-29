# Déployer DayAct en ligne (Vercel)

Le code est déjà prêt et committé. Suis ces 4 étapes.

> ℹ️ L'IA bascule automatiquement : **Ollama en local**, **Claude en ligne**
> (via la variable `AI_PROVIDER`). Rien à changer dans le code.

---

## 1. Mettre le code sur GitHub

1. Va sur **https://github.com/new** (connecte-toi / crée un compte gratuit).
2. **Repository name** : `dayact` · choisis **Private** · **ne coche rien** (pas de README) · **Create repository**.
3. GitHub affiche une URL. Reviens dans ton terminal (dossier DayAct) et lance :

```bash
git remote add origin https://github.com/TON-PSEUDO/dayact.git
git branch -M main
git push -u origin main
```

> La première fois, une fenêtre te demandera de te connecter à GitHub (navigateur). Accepte.

---

## 2. Créer une clé API Anthropic (pour l'IA en ligne)

1. Va sur **https://console.anthropic.com** → connecte-toi.
2. **Settings → Billing** : ajoute ~5 $ de crédit (et fixe une **limite de dépense**, ex. 5 $/mois).
3. **API Keys → Create Key** → copie la clé (commence par `sk-ant-...`).

> Avec le modèle Haiku, l'usage perso coûte des centimes. Garde cette clé secrète.

---

## 3. Déployer sur Vercel

1. Va sur **https://vercel.com** → **Sign up** → **Continue with GitHub** (gratuit).
2. **Add New → Project** → importe le dépôt **dayact**.
3. ⚠️ **IMPORTANT (monorepo)** : dans **Root Directory**, clique **Edit** et choisis **`apps/web`**.
4. Framework : **Next.js** (détecté automatiquement).
5. Déplie **Environment Variables** et ajoute ces 6 lignes
   (copie les 4 premières valeurs depuis ton fichier **`apps/web/.env.local`**) :

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | *(depuis .env.local)* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(depuis .env.local)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(depuis .env.local)* |
| `ANTHROPIC_API_KEY` | *(ta clé sk-ant-… de l'étape 2)* |
| `AI_PROVIDER` | `anthropic` |
| `ANTHROPIC_MODEL` | `claude-haiku-4-5` |

6. Clique **Deploy**. Attends ~2 min. Tu obtiens une URL du type
   **`https://dayact-xxx.vercel.app`** 🎉

---

## 4. Dire à Supabase quelle est ton URL en ligne

Pour que la connexion fonctionne sur le site déployé :

1. Supabase → **Authentication → URL Configuration**.
2. **Site URL** : mets ton URL Vercel (`https://dayact-xxx.vercel.app`).
3. **Redirect URLs** : ajoute `https://dayact-xxx.vercel.app/**`.
4. Save.

---

## C'est en ligne ✅

- Ouvre ton URL Vercel → crée ton compte → tes données sont les mêmes qu'en local
  (même base Supabase).
- L'assistant IA marche **partout** maintenant (propulsé par Claude).

### Mises à jour futures
À chaque fois que tu modifies le code :
```bash
git add -A
git commit -m "mon changement"
git push
```
Vercel redéploie **automatiquement**. ✨

### Dépannage
- **Build échoue** → vérifie que **Root Directory = apps/web**.
- **IA ne répond pas en ligne** → vérifie `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` dans Vercel (Settings → Environment Variables), puis redéploie.
- **Connexion impossible** → vérifie l'étape 4 (Site URL Supabase).
