/**
 * Perfil de país: niveles de descenso reales y configuración por capítulo.
 * VE: [2, 4, 6, 7, 8, 9, 10] y terminal 10; MX: [2, 4, 6, 7, 8] y terminal 8;
 * SA: [2, 4, 6] y terminal 6.
 */

import { z } from 'zod';
import { DescentLevelSchema, type DescentLevel } from './route.js';

export interface ChapterConfig {
  noSaSubheading?: boolean;
  notApplicable?: boolean;
  weight?: number;
}

export interface CountryProfile {
  code: 'VE' | 'MX' | 'SA';
  levels: DescentLevel[];
  terminal: number;
  chapters: Map<string, ChapterConfig>;
}

export const ChapterConfigSchema = z.object({
  noSaSubheading: z.boolean().optional(),
  notApplicable: z.boolean().optional(),
  weight: z.number().optional(),
});

export const CountryCodeSchema = z.enum(['VE', 'MX', 'SA']);

export const CountryProfileSchema = z.object({
  code: CountryCodeSchema,
  levels: z.array(DescentLevelSchema).nonempty(),
  terminal: z.number().int().positive(),
  chapters: z.map(z.string(), ChapterConfigSchema),
});

type ProfileData = {
  levels: DescentLevel[];
  terminal: number;
  chapters: Record<string, ChapterConfig>;
};

const PROFILES: Record<'VE' | 'MX' | 'SA', ProfileData> = {
  VE: {
    levels: [2, 4, 6, 7, 8, 9, 10] as DescentLevel[],
    terminal: 10,
    chapters: { '98': { noSaSubheading: true } },
  },
  MX: {
    levels: [2, 4, 6, 7, 8] as DescentLevel[],
    terminal: 8,
    chapters: { '98': { notApplicable: true } },
  },
  SA: { levels: [2, 4, 6] as DescentLevel[], terminal: 6, chapters: {} },
};

export function createCountryProfile(code: string): CountryProfile {
  const parsed = CountryCodeSchema.safeParse(code);
  if (!parsed.success) {
    throw new Error(`País no soportado: ${code}`);
  }
  const data = PROFILES[parsed.data];
  return {
    code: parsed.data,
    levels: [...data.levels],
    terminal: data.terminal,
    chapters: new Map(Object.entries(data.chapters)),
  };
}
