import { describe, expect, it } from 'vitest';

import { extractBolClaims } from './bol.js';
import type { Source } from '../../domain/sheet.js';

const source: Source = { kind: 'bol', ref: 'BL-001' };

describe('extractBolClaims (F2-18)', () => {
  it('extrae origen', () => {
    const claims = extractBolClaims('origen: Shanghai', source);
    const o = claims.find((c) => c.value === 'Shanghai');
    expect(o).toBeDefined();
    expect(o?.method).toBe('rule');
    expect(o?.source).toBe(source);
  });

  it('extrae destino', () => {
    const claims = extractBolClaims('destino: Santos', source);
    const d = claims.find((c) => c.value === 'Santos');
    expect(d).toBeDefined();
  });

  it('extrae modo', () => {
    const claims = extractBolClaims('modo: marítimo', source);
    const m = claims.find((c) => c.value === 'marítimo');
    expect(m).toBeDefined();
  });

  it('extrae bultos', () => {
    const claims = extractBolClaims('bultos: 20 u', source);
    const p = claims.find((c) => c.value === '20');
    expect(p?.unit).toBe('u');
  });

  it('texto vacío devuelve vacío', () => {
    expect(extractBolClaims('', source)).toEqual([]);
  });
});
