/**
 * GoodsSheet: ficha merceológica con procedencia y estado por campo.
 * Cada campo lleva su valor, unidad, fuente y método de obtención.
 * Un campo `declared` exige fuente no nula (superRefine de Zod).
 */

import { z } from 'zod';

export type SheetFieldMethod = 'declared' | 'inferred' | 'absent';

export interface Source {
  kind:
    | 'text'
    | 'invoice'
    | 'packing'
    | 'bol'
    | 'datasheet'
    | 'catalog'
    | 'broker';
  ref: string;
  page?: number;
  cell?: string;
}

export interface SheetField {
  value: string;
  unit: string | null;
  source: Source | null;
  method: SheetFieldMethod;
}

export type SheetFieldName = 'what' | 'madeOf' | 'howMade' | 'purpose' | 'presentation';

export interface GoodsSheet {
  what: SheetField;
  madeOf: SheetField;
  howMade: SheetField;
  purpose: SheetField;
  presentation: SheetField;
}

export const SHEET_FIELD_NAMES: SheetFieldName[] = [
  'what',
  'madeOf',
  'howMade',
  'purpose',
  'presentation',
] as const;

export const SourceSchema = z.object({
  kind: z.enum([
    'text',
    'invoice',
    'packing',
    'bol',
    'datasheet',
    'catalog',
    'broker',
  ]),
  ref: z.string().min(1),
  page: z.number().int().positive().optional(),
  cell: z.string().min(1).optional(),
});

export const SheetFieldMethodSchema = z.enum(['declared', 'inferred', 'absent']);

export const SheetFieldSchema = z.object({
  value: z.string(),
  unit: z.nullable(z.string()),
  source: z.nullable(SourceSchema),
  method: SheetFieldMethodSchema,
}).superRefine((field, ctx) => {
  if (field.method === 'declared' && field.source === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'un campo declarado requiere fuente',
      path: ['source'],
    });
  }
});

export const GoodsSheetSchema = z.object({
  what: SheetFieldSchema,
  madeOf: SheetFieldSchema,
  howMade: SheetFieldSchema,
  purpose: SheetFieldSchema,
  presentation: SheetFieldSchema,
});

export function missingFields(sheet: GoodsSheet): SheetFieldName[] {
  return SHEET_FIELD_NAMES.filter((name) => sheet[name].method === 'absent');
}

export type RequireCompleteResult =
  | { sheet: GoodsSheet }
  | { missing: string[] };

export function requireComplete(sheet: GoodsSheet): RequireCompleteResult {
  const missing = missingFields(sheet);
  if (missing.length > 0) {
    return { missing };
  }
  return { sheet };
}
