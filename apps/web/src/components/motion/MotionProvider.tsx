"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// One place for animation defaults. `reducedMotion="user"` follows the phone's
// "réduire les animations" setting automatically.
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 380, damping: 32 }}>
      {children}
    </MotionConfig>
  );
}
