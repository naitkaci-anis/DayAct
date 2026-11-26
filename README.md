# DayAct — Agis sur ta journée

Application de productivité et de bien-être : tâches, calendrier, habitudes,
analyses, suivi de l'humeur, minuteur Pomodoro et assistant IA.
Elle s'installe sur téléphone comme une vraie appli (PWA), gratuitement.

## Technologies

| Rôle | Outil |
|---|---|
| Site et API | Next.js 15 (App Router), React 19, TypeScript |
| Style | Tailwind CSS — thème « Sauge » dans `apps/web/src/app/globals.css` |
| Comptes et base de données | Supabase (PostgreSQL + Auth, sécurité RLS) |
| Assistant IA | Gemini (en ligne, offre gratuite) · Ollama (local) |
| Hébergement | Vercel |

## Organisation du dépôt

```
apps/web/                 Application Next.js
  src/app/                Pages et routes API (/api/ai/*)
  src/components/         Composants (dashboard, calendrier, auth…)
  src/lib/                Logique : store, Supabase, IA, calendrier
  public/                 Service worker, icônes de l'appli
supabase/
  schema.sql              Schéma de départ
  migrations/             Évolutions de la base (à appliquer dans l'ordre)
docs/                     Guides : déploiement, emails, Supabase
```

## Lancer en local

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # puis remplis les valeurs
pnpm dev                                        # http://localhost:3000
```

Sans Supabase configuré, l'appli fonctionne en mode démo (données dans le navigateur).
Sous Windows, tu peux aussi double-cliquer sur `Lancer-DayAct.bat`.

## Changer les couleurs

Toutes les couleurs sont des variables dans `apps/web/src/app/globals.css`
(bloc `:root`). Les composants n'utilisent que des noms de rôle :
`primary`, `secondary`, `ink`, `ink-muted`, `line`, `surface`, `success`, `warning`, `danger`.

## Guides

- [Mettre en ligne sur Vercel](docs/DEPLOY.md)
- [Configurer Supabase](docs/SUPABASE-SETUP.md)
- [Activer les vrais emails](docs/EMAIL-SETUP.md)
