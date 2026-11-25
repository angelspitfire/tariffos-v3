import { describe, expect, it } from 'vitest';

import { detectConflicts } from './conflicts.js';
import type { Claim } from '../../domain/intake.js';
import type { SheetFieldName, Source } from '../../domain/sheet.js';

const sourceA: Source = { kind: 'invoice', ref: 'INV-001' };
const sourceB: Source = { kind: 'packing', ref: 'PL-001' };

function claim(value: string, field: SheetFieldName, source: Source): Claim {
  return { value, unit: null, target: field, source, method: 'rule', confidence: 'medium' };
}

function byField(claims: Claim[]): Map<SheetFieldName, Claim[]> {
  const m = new Map<SheetFieldName, Claim[]>();
  for (const c of claims) {
    const b = m.get(c.target!);
    if (b) b.push(c);
    else m.set(c.target!, [c]);
  }
  return m;
}

describe('detectConflicts (F2-27)', () => {
  it('mismo término normalizado → sin conflicto (se fusionan)', () => {
    const claims = [claim('algodón', 'madeOf', sourceA), claim('cotton', 'madeOf', sourceB)];
    const conflicts = detectConflicts(byField(claims));
    expect(conflicts).toEqual([]);
  });

  it('términos distintos en madeOf → conflicto material con ambas fuentes', () => {
    const claims = [claim('algodón', 'madeOf', sourceA), claim('poliéster', 'madeOf', sourceB)];
    const conflicts = detectConflicts(byField(claims));
    expect(conflicts).toHaveLength(1);
    const c = conflicts[0];
    expect(c.type).toBe('material');
    expect(c.field).toBe('madeOf');
    expect([c.sourceA, c.sourceB]).toEqual(expect.arrayContaining([sourceA, sourceB]));
    expect(c.detail).toContain('algodón');
    expect(c.detail).toContain('poliéster');
  });

  it('términos distintos en campo no material → conflicto léxico', () => {
    const claims = [claim('camisa', 'what', sourceA), claim('blusa', 'what', sourceB)];
    const conflicts = detectConflicts(byField(claims));
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe('lexical');
  });

  it('una sola afirmación no produce conflicto', () => {
    const claims = [claim('algodón', 'madeOf', sourceA)];
    expect(detectConflicts(byField(claims))).toEqual([]);
  });

  it('sin afirmaciones no produce conflicto', () => {
    expect(detectConflicts(new Map())).toEqual([]);
  });
});
