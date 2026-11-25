/**
 * Normalizador de campos: Claim[] → GoodsSheet (F2-25).
 *
 * Cada campo de la ficha sale con su valor, unidad, source y method.
 * Un campo sin afirmación sale `absent`. Entre varias afirmaciones de un
 * mismo campo gana la de mayor precedencia (precedence.ts); el empate se
 * resuelve por confianza y se deja a la compuerta/conflictos.
 */

import type { GoodsSheet, SheetField, SheetFieldName } from '../../domain/sheet.js';
import type { Claim } from '../../domain/intake.js';
import { SHEET_FIELD_NAMES } from '../../domain/sheet.js';
import { rank } from './precedence.js';

const CONFIDENCE_ORDER: Record<Claim['confidence'], number> = { high: 0, medium: 1, low: 2 };

function claimToMethod(method: Claim['method']): 'declared' | 'inferred' {
  return method === 'rule' ? 'declared' : 'inferred';
}

function betterClaim(a: Claim, b: Claim, field: SheetFieldName): Claim {
  const ra = rank(a.source.kind, field);
  const rb = rank(b.source.kind, field);
  if (ra !== rb) return ra < rb ? a : b;
  const ca = CONFIDENCE_ORDER[a.confidence];
  const cb = CONFIDENCE_ORDER[b.confidence];
  if (ca !== cb) return ca < cb ? a : b;
  return a;
}

function emptyField(): SheetField {
  return { value: '', unit: null, source: null, method: 'absent' };
}

export function normalizeFields(claims: Claim[]): GoodsSheet {
  const byField = new Map<SheetFieldName, Claim[]>();
  for (const field of SHEET_FIELD_NAMES) byField.set(field, []);

  for (const claim of claims) {
    if (claim.target === null) continue;
    const bucket = byField.get(claim.target);
    if (bucket) bucket.push(claim);
  }

  const sheet: GoodsSheet = {
    what: emptyField(),
    madeOf: emptyField(),
    howMade: emptyField(),
    purpose: emptyField(),
    presentation: emptyField(),
  };

  for (const field of SHEET_FIELD_NAMES) {
    const bucket = byField.get(field)!;
    if (bucket.length === 0) continue;
    const best = bucket.reduce((acc, c) => betterClaim(acc, c, field));
    sheet[field] = {
      value: best.value,
      unit: best.unit,
      source: best.source,
      method: claimToMethod(best.method),
    };
  }

  return sheet;
}
