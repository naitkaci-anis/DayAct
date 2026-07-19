"use client";

import { useEffect } from "react";

// Registers the service worker (PWA install + mobile notifications).
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* SW unavailable (old browser / private mode) — app works without it */
    });
  }, []);
  return null;
}
