'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * Subtle viewport reveal for landing sections and cards.
 * Respects `prefers-reduced-motion` automatically.
 */
export function ScrollReveal({ children, delay = 0, className }: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.48, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}
