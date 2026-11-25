/**
 * Compuerta de impacto sobre la ficha.
 *
 * Cada campo faltante bloquea un alcance del descenso y devuelve qué se
 * desbloquearía al proveerlo. No contiene copy de interfaz: el texto de la
 * pregunta se produce en la capa de salida.
 *
 * Devuelve { missing, conflicts, unlocks }.
 */

import { z } from 'zod';
import type { GoodsSheet, SheetFieldName } from './sheet.js';

export type GateField = 'identity' | 'percentBase' | 'function' | 'presentation' | 'elaboration';

export type UnlockScope = 'everything' | 'rgi-3b' | 'chapters-84-97' | 'heading' | 'chapters-1-83';

export interface Conflict {
  field: GateField;
  type: 'material' | 'lexical';
  detail: string;
}

export interface Unlock {
  field: GateField;
  scope: UnlockScope;
}

export interface GateResult {
  missing: GateField[];
  conflicts: Conflict[];
  unlocks: Unlock[];
}

/**
 * Mapa de campo de ficha → campo de compuerta → alcance desbloqueado.
 */
const FIELD_TO_GATE: Record<SheetFieldName, { field: GateField; scope: UnlockScope }> = {
  what: { field: 'identity', scope: 'everything' },
  madeOf: { field: 'percentBase', scope: 'rgi-3b' },
  purpose: { field: 'function', scope: 'chapters-84-97' },
  presentation: { field: 'presentation', scope: 'heading' },
  howMade: { field: 'elaboration', scope: 'chapters-1-83' },
};

export const GateFieldSchema = z.enum([
  'identity',
  'percentBase',
  'function',
  'presentation',
  'elaboration',
]);

export const UnlockScopeSchema = z.enum([
  'everything',
  'rgi-3b',
  'chapters-84-97',
  'heading',
  'chapters-1-83',
]);

export const ConflictSchema = z.object({
  field: GateFieldSchema,
  type: z.enum(['material', 'lexical']),
  detail: z.string().min(1),
});

export const UnlockSchema = z.object({
  field: GateFieldSchema,
  scope: UnlockScopeSchema,
});

export const GateResultSchema = z.object({
  missing: z.array(GateFieldSchema),
  conflicts: z.array(ConflictSchema),
  unlocks: z.array(UnlockSchema),
});

/**
 * Evalúa la ficha contra la compuerta.
 *
 * - missing: campos de compuerta cuya ficha está ausente.
 * - conflicts: conflictos detectados (material o léxico).
 * - unlocks: alcance que se desbloquea por cada campo faltante.
 *
 * Un conflicto material bloquea igual que un campo ausente.
 */
export function gateByImpact(
  sheet: GoodsSheet,
  conflicts: Conflict[] = [],
): GateResult {
  const missing: GateField[] = [];
  const unlocks: Unlock[] = [];

  for (const fieldName of ['what', 'madeOf', 'purpose', 'presentation', 'howMade'] as const) {
    const field = sheet[fieldName];
    if (field.method === 'absent') {
      const mapping = FIELD_TO_GATE[fieldName];
      missing.push(mapping.field);
      unlocks.push({ field: mapping.field, scope: mapping.scope });
    }
  }

  return { missing, conflicts, unlocks };
}
