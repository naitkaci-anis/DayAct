"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

// Fades and lifts its content into place the first time it scrolls into view.
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/** A grid/list whose children appear one after the other. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  /** Lifts slightly on hover (cards). */
  hover?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={item}
      whileHover={hover ? { y: -6, transition: { type: "spring", stiffness: 400, damping: 22 } } : undefined}
    >
      {children}
    </motion.div>
  );
}

/** Gentle up-and-down float, for the hero phone. */
export function Float({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40, rotate: -2 }}
      animate={{ opacity: 1, y: [0, -10, 0], rotate: 0 }}
      transition={{
        opacity: { duration: 0.8 },
        rotate: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
      }}
    >
      {children}
    </motion.div>
  );
}
