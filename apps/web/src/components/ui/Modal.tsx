"use client";

import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "@/components/icons";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-scrim backdrop-blur-sm animate-[fadeIn_0.15s_ease]"
        onClick={onClose}
      />

      {/* panel */}
      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col rounded-md border border-line bg-surface shadow-2xl animate-[popIn_0.18s_ease]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <h3 className="text-sm font-medium text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink transition-colors"
            aria-label="Fermer"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
