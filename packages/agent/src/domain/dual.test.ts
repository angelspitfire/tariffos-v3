import { describe, expect, it } from 'vitest';

import { combineDual, isDual, type Dual } from './dual.js';
import type { Route } from './route.js';

function step(code: string, legalBasis: string): Route['steps'][number] {
  return { code, level: code.length as 2 | 4 | 6 | 7 | 8 | 9 | 10, scope: `scope ${code}`, instrument: 'grl', legalBasis };
}

function route(steps: Array<{ code: string; legalBasis: string }>): Route {
  return { steps: steps.map((s) => step(s.code, s.legalBasis)) };
}

describe('isDual', () => {
  it('dos rutas con base legal distinta son dual', () => {
    const a = route([{ code: '39', legalBasis: 'RGI 1' }, { code: '3901', legalBasis: 'RGI 6' }]);
    const b = route([{ code: '39', legalBasis: 'RGI 1' }, { code: '3901', legalBasis: 'chapter-note' }]);
    expect(isDual(a, b)).toBe(true);
  });

  it('dos rutas con la misma base legal no son dual', () => {
    const a = route([{ code: '39', legalBasis: 'RGI 1' }]);
    const b = route([{ code: '39', legalBasis: 'RGI 1' }]);
    expect(isDual(a, b)).toBe(false);
  });
});

describe('combineDual', () => {
  it('produce un par dual sin ranking (ninguno recomendado)', () => {
    const a = route([{ code: '390110', legalBasis: 'RGI 6' }]);
    const b = route([{ code: '390120', legalBasis: 'chapter-note' }]);

    const dual: Dual = combineDual(a, b);

    expect(dual.dual).toBe(true);
    expect(dual.routes).toHaveLength(2);
    expect(dual.routes[0].steps[0].code).toBe('390110');
    expect(dual.routes[1].steps[0].code).toBe('390120');
  });
});
