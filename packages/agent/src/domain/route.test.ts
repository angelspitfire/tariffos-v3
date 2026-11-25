import { describe, expect, it } from 'vitest';

import { DescentStepSchema, RouteSchema } from './route.js';
import type { DescentStep, Instrument, Route } from './route.js';

function step(opts: Partial<DescentStep> = {}): DescentStep {
  return {
    code: '39',
    level: 2,
    scope: 'chapter 39',
    instrument: 'grl',
    legalBasis: 'RGI 1',
    ...opts,
  };
}

describe('DescentStep', () => {
  it('acepta todos los niveles de descenso: 2, 4, 6, 7, 8, 9, 10', () => {
    for (const level of [2, 4, 6, 7, 8, 9, 10]) {
      const parsed = DescentStepSchema.parse({ ...step(), level });
      expect(parsed.level).toBe(level);
    }
  });

  it('rechaza niveles fuera del conjunto: 1, 3, 5, 11, 12', () => {
    for (const level of [1, 3, 5, 11, 12]) {
      expect(() => DescentStepSchema.parse({ ...step(), level })).toThrow();
    }
  });

  it('valida el instrumento legal', () => {
    expect(() => DescentStepSchema.parse({ ...step(), instrument: 'ley-interna' as Instrument })).toThrow();
    expect(
      DescentStepSchema.parse({ ...step(), instrument: 'chapter-note' }).instrument,
    ).toBe('chapter-note');
  });
});

describe('Route', () => {
  const routeA: Route = {
    steps: [
      step({ code: '39', level: 2, scope: 'chapter 39', instrument: 'grl', legalBasis: 'RGI 1' }),
      step({ code: '3926', level: 4, scope: 'heading 3926', instrument: 'grl', legalBasis: 'RGI 1' }),
    ],
  };
  const routeB: Route = {
    steps: [
      step({ code: '40', level: 2, scope: 'chapter 40', instrument: 'grl', legalBasis: 'RGI 1' }),
      step({ code: '4010', level: 4, scope: 'heading 4010', instrument: 'grl', legalBasis: 'RGI 1' }),
    ],
  };

  it('dos rutas producen trazas distintas (arrays de pasos diferentes)', () => {
    expect(routeA.steps).not.toEqual(routeB.steps);
    expect(RouteSchema.parse(routeA).steps).toHaveLength(2);
    expect(RouteSchema.parse(routeB).steps).toHaveLength(2);
    expect(routeA.steps[0].code).toBe('39');
    expect(routeB.steps[0].code).toBe('40');
  });
});
