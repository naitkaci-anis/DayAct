"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { signOut } from "@/lib/auth/actions";

export function UserMenu({ placement = "down" }: { placement?: "down" | "up" }) {
  const { backend, userEmail } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const signedIn = backend === "supabase";
  const initial = (userEmail?.[0] ?? "A").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-cream text-primary text-sm font-semibold border border-line"
        aria-label="Menu utilisateur"
      >
        {initial}
      </button>

      {open && (
        <div className={`absolute w-56 rounded-md border border-line bg-panel shadow-2xl overflow-hidden z-40 ${placement === "up" ? "left-0 bottom-full mb-2" : "right-0 mt-2"}`}>
          <div className="px-4 py-3 border-b border-line">
            {signedIn ? (
              <>
                <p className="text-xs text-ink-muted">Connecté en tant que</p>
                <p className="text-sm text-ink truncate">{userEmail}</p>
              </>
            ) : (
              <>
                <p className="text-sm text-ink">Mode démo</p>
                <p className="text-xs text-ink-muted">Données locales à ce navigateur</p>
              </>
            )}
          </div>

          <div className="py-1">
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-ink-muted hover:text-ink hover:bg-field transition-colors"
            >
              Réglages
            </Link>

            {signedIn ? (
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
                >
                  Se déconnecter
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-primary hover:bg-field transition-colors"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
