"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { THEMES, getTheme, setTheme, type ThemeId } from "@/lib/themes";

export function ThemePicker() {
  const [current, setCurrent] = useState<ThemeId | null>(null);
  useEffect(() => setCurrent(getTheme()), []);

  return (
    <div role="radiogroup" aria-label="Thème de couleurs" className="grid grid-cols-2 gap-3">
      {THEMES.map((t) => {
        const active = current === t.id;
        return (
          <motion.button
            key={t.id}
            role="radio"
            aria-checked={active}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setTheme(t.id);
              setCurrent(t.id);
            }}
            className={`relative text-left rounded-[18px] p-3 border transition-colors ${
              active ? "border-primary" : "border-line hover:border-line-strong"
            }`}
          >
            {/* mini preview */}
            <span
              className="block h-20 rounded-[12px] overflow-hidden relative"
              style={{ background: t.swatches[0] }}
            >
              <span
                className="absolute -right-4 -top-6 w-24 h-24 rounded-full blur-xl"
                style={{ background: t.swatches[1], opacity: t.id === "nuit" ? 0.7 : 0.9 }}
              />
              <span
                className="absolute left-3 top-3 font-display italic text-2xl leading-none"
                style={{ color: t.swatches[2] }}
              >
                Aa
              </span>
              <span
                className="absolute left-3 bottom-3 h-5 w-14 rounded-full"
                style={{ background: t.swatches[2] }}
              />
            </span>
            <span className="flex items-center justify-between mt-2.5">
              <span>
                <span className="block text-sm font-medium text-ink">{t.name}</span>
                <span className="block text-xs text-ink-muted">{t.description}</span>
              </span>
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  active ? "border-primary" : "border-line-strong"
                }`}
              >
                {active && <motion.span layoutId="theme-dot" className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
