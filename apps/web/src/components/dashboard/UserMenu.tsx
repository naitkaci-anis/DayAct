"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { signOut } from "@/lib/auth/actions";

export function UserMenu() {
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
        className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-act-cyan to-focus-violet text-[#0a0a14] text-sm font-medium"
        aria-label="Menu utilisateur"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-deep shadow-2xl overflow-hidden z-40">
          <div className="px-4 py-3 border-b border-border">
            {signedIn ? (
              <>
                <p className="text-xs text-text-muted">Connecté en tant que</p>
                <p className="text-sm text-text truncate">{userEmail}</p>
              </>
            ) : (
              <>
                <p className="text-sm text-text">Mode démo</p>
                <p className="text-xs text-text-muted">Données locales à ce navigateur</p>
              </>
            )}
          </div>

          <div className="py-1">
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-text-muted hover:text-text hover:bg-[#0a0a14] transition-colors"
            >
              Réglages
            </Link>

            {signedIn ? (
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full text-left px-4 py-2 text-sm text-alert-red hover:bg-alert-red/10 transition-colors"
                >
                  Se déconnecter
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-act-cyan hover:bg-[#0a0a14] transition-colors"
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
