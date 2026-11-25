/**
 * Mecanismos tipados por efecto. Orden de precedencia:
 * veto > override > redirect > prune > split > cite
 *
 * Define los tipos, el ranking de precedencia y los constructores de
 * resultado. Las funciones que transforman conjuntos de candidatos viven
 * en mechanism-effects.ts.
 */

import { z } from 'zod';

export type Mechanism = 'veto' | 'override' | 'redirect' | 'prune' | 'split' | 'cite';

export const MECHANISM_PRECEDENCE: Record<Mechanism, number> = {
  veto: 1,
  override: 2,
  redirect: 3,
  prune: 4,
  split: 5,
  cite: 6,
} as const;

export interface MechanismResult {
  mechanism: Mechanism;
  applies: boolean;
  /** Si el mecanismo termina el caso con un terminal (veto, prune a cero). */
  terminal: boolean;
  /** La regla legal que produjo el mecanismo. */
  rule?: string;
  /** Código al que redirigir (solo para redirect). */
  redirectTo?: string;
}

export function noApplies(mechanism: Mechanism): MechanismResult {
  return { mechanism, applies: false, terminal: false };
}

export function applies(
  mechanism: Mechanism,
  rule: string,
  terminal = false,
  redirectTo?: string,
): MechanismResult {
  return { mechanism, applies: true, terminal, rule, redirectTo };
}

export function mechanismRank(mechanism: Mechanism): number {
  return MECHANISM_PRECEDENCE[mechanism];
}

export const MechanismResultSchema = z.object({
  mechanism: z.enum([
    'veto',
    'override',
    'redirect',
    'prune',
    'split',
    'cite',
  ]),
  applies: z.boolean(),
  terminal: z.boolean(),
  rule: z.string().optional(),
  redirectTo: z.string().optional(),
});
