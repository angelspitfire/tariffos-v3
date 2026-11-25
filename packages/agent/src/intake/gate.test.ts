import { describe, expect, it } from 'vitest';

import { intakeGate } from './gate.js';
import type { GoodsSheet, SheetField } from '../domain/sheet.js';
import type { Conflict as NormalizedConflict } from './normalize/conflicts.js';
import type { Source } from '../domain/sheet.js';

const source: Source = { kind: 'invoice', ref: 'INV-001' };

function field(method: 'declared' | 'absent'): SheetField {
  return { value: method === 'absent' ? '' : 'x', unit: null, source: null, method };
}

function sheet(overrides: Partial<GoodsSheet> = {}): GoodsSheet {
  return {
    what: field('declared'),
    madeOf: field('declared'),
    howMade: field('declared'),
    purpose: field('declared'),
    presentation: field('declared'),
    ...overrides,
  };
}

function nconflict(field: 'madeOf' | 'what', type: 'material' | 'lexical', detail: string): NormalizedConflict {
  return { field, type, detail, sourceA: source, sourceB: source };
}

describe('intakeGate (F2-28)', () => {
  it('ficha completa: sin missing, sin conflicts, sin unlocks', () => {
    const result = intakeGate({ sheet: sheet(), conflicts: [] });
    expect(result.missing).toEqual([]);
    expect(result.conflicts).toEqual([]);
    expect(result.unlocks).toEqual([]);
  });

  it('identity ausente → missing identity y unlocks everything', () => {
    const result = intakeGate({ sheet: sheet({ what: field('absent') }), conflicts: [] });
    expect(result.missing).toContain('identity');
    expect(result.unlocks.find((u) => u.field === 'identity')?.scope).toBe('everything');
  });

  it('percentBase ausente → missing percentBase y unlocks rgi-3b', () => {
    const result = intakeGate({ sheet: sheet({ madeOf: field('absent') }), conflicts: [] });
    expect(result.missing).toContain('percentBase');
    expect(result.unlocks.find((u) => u.field === 'percentBase')?.scope).toBe('rgi-3b');
  });

  it('función ausente → missing function y unlocks capítulos 84-97', () => {
    const result = intakeGate({ sheet: sheet({ purpose: field('absent') }), conflicts: [] });
    expect(result.missing).toContain('function');
    expect(result.unlocks.find((u) => u.field === 'function')?.scope).toBe('chapters-84-97');
  });

  it('conflicto de normalización se mapea a conflicto de compuerta', () => {
    const result = intakeGate({ sheet: sheet(), conflicts: [nconflict('madeOf', 'material', 'algodón vs poliéster')] });
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].type).toBe('material');
    expect(result.conflicts[0].detail).toBe('algodón vs poliéster');
  });

  it('no hay copy de interfaz: solo datos', () => {
    const result = intakeGate({ sheet: sheet({ what: field('absent') }), conflicts: [] });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('pregunta');
    expect(serialized).not.toContain('¿');
    expect(result.missing).toEqual(['identity']);
    expect(result.unlocks).toHaveLength(1);
  });
});
