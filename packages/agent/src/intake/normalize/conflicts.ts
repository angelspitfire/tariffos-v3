/**
 * Conflicto material vs léxico (F2-27).
 *
 * Para un mismo campo con varias afirmaciones:
 * - Mismo término normalizado → se fusionan (se queda la de mayor precedencia).
 * - Términos distintos → Conflicto con ambas fuentes.
 *
 * El tipo es 'material' cuando el campo es de material (madeOf) y los
 * términos normalizados difieren; 'lexical' para el resto.
 */

import type { Claim } from '../../domain/intake.js';
import type { SheetFieldName, Source } from '../../domain/sheet.js';
import { normalizeMaterial } from './vocab.js';
import { rank } from './precedence.js';

export interface Conflict {
  field: SheetFieldName;
  type: 'material' | 'lexical';
  detail: string;
  sourceA: Source;
  sourceB: Source;
}

/**
 * Detecta conflictos entre afirmaciones de un mismo campo.
 * Devuelve un Conflict por cada par de términos normalizados distintos.
 * Emite un conflicto por cada perdedor contra el ganador (mayor precedencia).
 */
export function detectConflicts(
  claimsByField: Map<SheetFieldName, Claim[]>,
): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const [field, bucket] of claimsByField) {
    if (bucket.length < 2) continue;

    // Agrupa por término normalizado
    const groups = new Map<string, Claim[]>();
    for (const claim of bucket) {
      const term = field === 'madeOf'
        ? normalizeMaterial(claim.value).normalized
        : claim.value.toLowerCase().trim();
      const group = groups.get(term);
      if (group) group.push(claim);
      else groups.set(term, [claim]);
    }

    if (groups.size <= 1) continue; // mismo término normalizado → se fusionan, sin conflicto

    // Ordena grupos por mejor claim (precedencia + confianza)
    const sortedGroups = [...groups.entries()].sort(([, claimsA], [, claimsB]) => {
      const bestA = claimsA.reduce((acc, c) => betterClaim(acc, c, field));
      const bestB = claimsB.reduce((acc, c) => betterClaim(acc, c, field));
      return rank(bestA.source.kind, field) - rank(bestB.source.kind, field);
    });

    const [, winnerClaims] = sortedGroups[0];
    const winner = winnerClaims.reduce((acc, c) => betterClaim(acc, c, field));

    // Emite un conflicto por cada término perdedor contra el ganador
    for (const [, loserClaims] of sortedGroups.slice(1)) {
      const loser = loserClaims.reduce((acc, c) => betterClaim(acc, c, field));
      const type: Conflict['type'] = field === 'madeOf' ? 'material' : 'lexical';
      conflicts.push({
        field,
        type,
        detail: `${winner.value} vs ${loser.value}`,
        sourceA: winner.source,
        sourceB: loser.source,
      });
    }
  }

  return conflicts;
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

const CONFIDENCE_ORDER: Record<Claim['confidence'], number> = { high: 0, medium: 1, low: 2 };

