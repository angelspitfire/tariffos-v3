/**
 * Compuerta conectada: missing + conflict + unlocks (F2-28).
 *
 * Conecta la ficha normalizada con los conflictos de normalización y devuelve
 * { missing, conflicts, unlocks }. No contiene copy de interfaz: el texto de
 * la pregunta se produce en la capa de salida, no aquí.
 */

import type { GoodsSheet, SheetFieldName } from '../domain/sheet.js';
import { SHEET_FIELD_NAMES } from '../domain/sheet.js';
import type { Conflict as DomainConflict, GateResult, UnlockScope } from '../domain/gate.js';
import type { Conflict as NormalizedConflict } from './normalize/conflicts.js';

const FIELD_TO_GATE: Record<SheetFieldName, DomainConflict['field']> = {
  what: 'identity',
  madeOf: 'percentBase',
  purpose: 'function',
  presentation: 'presentation',
  howMade: 'elaboration',
};

const UNLOCK_SCOPE: Record<DomainConflict['field'], UnlockScope> = {
  identity: 'everything',
  percentBase: 'rgi-3b',
  function: 'chapters-84-97',
  presentation: 'heading',
  elaboration: 'chapters-1-83',
};

export interface GateInput {
  sheet: GoodsSheet;
  conflicts: NormalizedConflict[];
}

/**
 * Evalúa la compuerta sobre una ficha.
 *
 * - missing: campos de compuerta cuya ficha está ausente.
 * - conflicts: conflictos de normalización mapeados a campos de compuerta.
 * - unlocks: alcance que se desbloquea por cada campo faltante.
 *
 * Un conflicto material bloquea igual que un campo ausente.
 */
export function intakeGate(input: GateInput): GateResult {
  const missing: DomainConflict['field'][] = [];
  const unlocks: { field: DomainConflict['field']; scope: UnlockScope }[] = [];

  for (const field of SHEET_FIELD_NAMES) {
    if (input.sheet[field].method === 'absent') {
      const gateField = FIELD_TO_GATE[field];
      missing.push(gateField);
      unlocks.push({ field: gateField, scope: UNLOCK_SCOPE[gateField] });
    }
  }

  const conflicts: DomainConflict[] = input.conflicts.map((c) => ({
    field: FIELD_TO_GATE[c.field],
    type: c.type,
    detail: c.detail,
  }));

  return { missing, conflicts, unlocks };
}
