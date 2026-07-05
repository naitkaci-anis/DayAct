# 📧 Activer les vrais emails (inscription + mot de passe oublié)

Objectif : que **n'importe quel utilisateur** reçoive les emails de DayAct
(confirmation d'inscription, réinitialisation du mot de passe).

On branche **Brevo** (gratuit, 300 emails/jour, pas besoin de nom de domaine)
au système d'authentification de **Supabase**.

---

## Étape 1 — Créer un compte Brevo (gratuit)

1. Va sur **https://www.brevo.com** → **S'inscrire gratuitement**.
2. Confirme ton email, renseigne les infos demandées (choisis l'offre **gratuite**).

## Étape 2 — Valider ton adresse d'expéditeur

1. Dans Brevo : menu **« Expéditeurs, domaines… »** → **Expéditeurs** → **Ajouter un expéditeur**.
2. Mets ton email (ex. **anisnaitkaci@gmail.com**) → Brevo t'envoie un email de validation → clique dessus.

## Étape 3 — Récupérer les identifiants SMTP

1. Dans Brevo : en haut à droite, ton nom → **SMTP & API** (ou menu **« SMTP & API »**).
2. Onglet **SMTP**. Note ces valeurs :
   - **Serveur (Host)** : `smtp-relay.brevo.com`
   - **Port** : `587`
   - **Login / Utilisateur** : (l'email affiché sur cette page, ex. `xxxxxx@smtp-brevo.com`)
   - **Mot de passe / Clé SMTP** : clique **« Générer une nouvelle clé SMTP »** → copie-la
     (⚠️ elle ne s'affiche qu'une fois — garde-la de côté).

## Étape 4 — Configurer Supabase

1. Ouvre ton projet **Supabase** → menu **Authentication** → **Emails**
   (ou **Project Settings → Authentication → SMTP Settings**).
2. Active **« Enable Custom SMTP »**.
3. Remplis :
   - **Sender email** : ton expéditeur validé (ex. `anisnaitkaci@gmail.com`)
   - **Sender name** : `DayAct`
   - **Host** : `smtp-relay.brevo.com`
   - **Port** : `587`
   - **Username** : le login SMTP de Brevo (ex. `xxxxxx@smtp-brevo.com`)
   - **Password** : la clé SMTP Brevo
4. **Save**.

## Étape 5 — Régler les URLs de redirection

Supabase → **Authentication** → **URL Configuration** :

- **Site URL** : `http://localhost:3000`
- **Redirect URLs** → ajoute :
  ```
  http://localhost:3000/reset-password
  http://localhost:3000/dashboard
  ```
- **Save**.

> 🔜 Plus tard, quand DayAct sera en ligne (Vercel), on remplacera `localhost:3000`
> par la vraie adresse (ex. `https://dayact.vercel.app`).

## Étape 6 — Tester

1. Relance l'app (`Lancer-DayAct.bat`) → page **Connexion** → **Mot de passe oublié ?**
2. Entre l'adresse **du compte** : `anisnaitkaci@gmail.com`
3. Tu dois recevoir l'email en quelques secondes (vérifie les spams la 1ʳᵉ fois).
4. Clique le lien → choisis un nouveau mot de passe.

---

### Alternative (si tu préfères) : Gmail directement
Possible aussi via ta Gmail (App Password + `smtp.gmail.com:465`), mais il faut activer
la **validation en 2 étapes** sur ton compte Google. Dis-le moi et je te donne cette méthode.
