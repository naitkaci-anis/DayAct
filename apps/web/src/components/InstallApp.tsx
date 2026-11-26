"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";

// beforeinstallprompt isn't in the TS DOM lib yet.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari legacy flag
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Smart "install the app" button.
 * - Chrome/Edge/Android: triggers the real install prompt (beforeinstallprompt).
 * - iOS / other browsers: opens a small per-device guide.
 * - Hidden when the app is already installed.
 */
export function InstallApp({ variant = "button" }: { variant?: "button" | "hero" }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mounted || installed) return null;

  async function install() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferred(null);
    } else {
      setGuideOpen(true);
    }
  }

  const cls =
    variant === "hero"
      ? "min-h-[52px] px-6 inline-flex items-center rounded-full border border-line-strong bg-surface text-base font-medium text-ink hover:border-primary transition-colors"
      : "flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-primary text-on-fill text-sm font-medium hover:opacity-90 transition-opacity";

  return (
    <>
      <button onClick={install} className={cls}>
        Installer sur mon téléphone
      </button>

      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Installer DayAct">
        <div className="space-y-5">
          <p className="text-sm text-ink-muted">
            DayAct s&apos;installe comme une vraie app — icône sur l&apos;écran d&apos;accueil,
            plein écran, gratuit.
          </p>

          {isIOS() ? (
            <ol className="space-y-3">
              {[
                "Ouvre ce site dans Safari (obligatoire sur iPhone/iPad).",
                "Touche le bouton Partager (le carré avec une flèche vers le haut).",
                "Fais défiler et touche « Sur l'écran d'accueil ».",
                "Touche « Ajouter » — c'est fait ! 🎉",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-ink">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-ink mb-2">📱 Sur Android (Chrome)</p>
                <p className="text-sm text-ink-muted">
                  Menu <span className="text-ink">⋮</span> (en haut à droite) →{" "}
                  <span className="text-ink">« Installer l&apos;application »</span> ou
                  « Ajouter à l&apos;écran d&apos;accueil ».
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-ink mb-2">💻 Sur ordinateur (Chrome/Edge)</p>
                <p className="text-sm text-ink-muted">
                  Clique la petite icône d&apos;installation{" "}
                  <span className="text-ink">⊕</span> à droite de la barre d&apos;adresse.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-ink mb-2">🍎 Sur iPhone/iPad</p>
                <p className="text-sm text-ink-muted">
                  Ouvre le site dans Safari → bouton Partager →
                  « Sur l&apos;écran d&apos;accueil ».
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setGuideOpen(false)}
            className="w-full px-4 py-2.5 rounded-[12px] bg-primary text-on-fill text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Compris !
          </button>
        </div>
      </Modal>
    </>
  );
}
