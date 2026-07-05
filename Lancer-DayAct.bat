@echo off
title DayAct - serveur local
echo ============================================
echo   Demarrage de DayAct (version rapide)...
echo   Garde cette fenetre OUVERTE pour utiliser le site.
echo   Quand tu vois "Ready", ouvre http://localhost:3000
echo   Pour arreter : ferme cette fenetre.
echo ============================================
echo.

cd /d "%~dp0apps\web"

rem S'assurer que pnpm est disponible
where pnpm >nul 2>&1
if not %errorlevel%==0 (
  echo Activation de pnpm...
  call corepack enable >nul 2>&1
)

rem Si l'app n'a jamais ete compilee, on la compile (une seule fois)
if not exist ".next\BUILD_ID" (
  echo Premiere compilation optimisee ^(2 a 4 min^)...
  call pnpm build
)

echo.
echo Lancement du serveur...
call pnpm start

echo.
echo Le serveur s'est arrete. Appuie sur une touche pour fermer.
pause >nul
