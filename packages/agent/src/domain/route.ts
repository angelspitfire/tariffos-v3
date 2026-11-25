/**
 * Descent route: trace of steps with code, level, scope, instrument and
 * legal basis. Each route carries its own trace; two routes never share it.
 */

import { z } from 'zod';

export type DescentLevel = 2 | 4 | 6 | 7 | 8 | 9 | 10;

/** Dígitos de código por nivel técnico del descenso (sin puntos en el dominio). */
export const DIGITS_CHAPTER = 2;
export const DIGITS_HEADING = 4;
export const DIGITS_SUBHEADING = 6;

export type Instrument =
  | 'grl'
  | 'grl-3b'
  | 'rgi-6'
  | 'section-note'
  | 'chapter-note'
  | 'part-accessory'
  | 'precedent';

export interface DescentStep {
  code: string;
  level: DescentLevel;
  scope: string;
  instrument: Instrument;
  legalBasis: string;
}

export interface Route {
  steps: DescentStep[];
}

export const DescentLevelSchema = z.union([
  z.literal(2),
  z.literal(4),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
  z.literal(10),
]);

export const InstrumentSchema = z.enum([
  'grl',
  'grl-3b',
  'rgi-6',
  'section-note',
  'chapter-note',
  'part-accessory',
  'precedent',
]);

export const DescentStepSchema = z.object({
  code: z.string().min(1),
  level: DescentLevelSchema,
  scope: z.string().min(1),
  instrument: InstrumentSchema,
  legalBasis: z.string().min(1),
});

export const RouteSchema = z.object({
  steps: z.array(DescentStepSchema),
});
