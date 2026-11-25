import { describe, expect, it } from 'vitest';

import { gateByImpact, type GateResult } from './gate.js';
import type { GoodsSheet, SheetField, Source } from './sheet.js';
import type { Conflict } from './gate.js';

function field(opts: {
  method: 'declared' | 'inferred' | 'absent';
  source?: Source | null;
  value?: string;
}): SheetField {
  return {
    value: opts.value ?? 'camisa',
    unit: null,
    source: opts.source ?? null,
    method: opts.method,
  };
}

const source = { kind: 'invoice', ref: 'INV-001' } as const;

function sheet(overrides: Partial<GoodsSheet> = {}): GoodsSheet {
  return {
    what: field({ method: 'declared', source }),
    madeOf: field({ method: 'declared', source }),
    howMade: field({ method: 'declared', source }),
    purpose: field({ method: 'declared', source }),
    presentation: field({ method: 'declared', source }),
    ...overrides,
  };
}

describe('gateByImpact', () => {
  it('ficha completa: sin missing, sin conflicts, sin unlocks', () => {
    const result: GateResult = gateByImpact(sheet());
    expect(result.missing).toEqual([]);
    expect(result.conflicts).toEqual([]);
    expect(result.unlocks).toEqual([]);
  });

  it('identity ausente → missing identity, desbloquea everything', () => {
    const result = gateByImpact(sheet({ what: field({ method: 'absent' }) }));
    expect(result.missing).toContain('identity');
    expect(result.unlocks.find((u) => u.field === 'identity')?.scope).toBe('everything');
  });

  it('% base ausente → missing percentBase, desbloquea RGI 3(b)', () => {
    const result = gateByImpact(sheet({ madeOf: field({ method: 'absent' }) }));
    expect(result.missing).toContain('percentBase');
    expect(result.unlocks.find((u) => u.field === 'percentBase')?.scope).toBe('rgi-3b');
  });

  it('función ausente → missing function, desbloquea capítulos 84-97', () => {
    const result = gateByImpact(sheet({ purpose: field({ method: 'absent' }) }));
    expect(result.missing).toContain('function');
    expect(result.unlocks.find((u) => u.field === 'function')?.scope).toBe('chapters-84-97');
  });

  it('presentación ausente → missing presentation, desbloquea heading', () => {
    const result = gateByImpact(sheet({ presentation: field({ method: 'absent' }) }));
    expect(result.missing).toContain('presentation');
    expect(result.unlocks.find((u) => u.field === 'presentation')?.scope).toBe('heading');
  });

  it('elaboración ausente → missing elaboration, desbloquea capítulos 1-83', () => {
    const result = gateByImpact(sheet({ howMade: field({ method: 'absent' }) }));
    expect(result.missing).toContain('elaboration');
    expect(result.unlocks.find((u) => u.field === 'elaboration')?.scope).toBe('chapters-1-83');
  });

  it('varios campos faltantes se acumulan en missing y unlocks', () => {
    const result = gateByImpact(
      sheet({
        what: field({ method: 'absent' }),
        purpose: field({ method: 'absent' }),
      }),
    );
    expect(result.missing).toEqual(expect.arrayContaining(['identity', 'function']));
    expect(result.unlocks).toHaveLength(2);
  });

  it('conflicto material bloquea igual que campo ausente', () => {
    const conflicts: Conflict[] = [
      { field: 'identity', type: 'material', detail: 'factura vs ficha técnica discrepan' },
    ];
    const result = gateByImpact(sheet(), conflicts);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].type).toBe('material');
  });

  it('conflicto léxico se distingue del material', () => {
    const conflicts: Conflict[] = [
      { field: 'percentBase', type: 'lexical', detail: 'sinónimos normalizados al mismo término' },
    ];
    const result = gateByImpact(sheet(), conflicts);
    expect(result.conflicts[0].type).toBe('lexical');
  });
});
