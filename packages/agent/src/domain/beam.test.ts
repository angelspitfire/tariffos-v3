import { describe, expect, it } from 'vitest';

import { expand, type Expansion } from './beam.js';
import type { BeamContext } from './beam.js';
import type { GoodsSheet } from './sheet.js';
import type { CompareResult, DecisionEngine, LegalCorpus, TariffTree } from './ports.js';
import type { Route } from './route.js';

function step(code: string, level: 2 | 4 | 6 | 7 | 8 | 9 | 10): Route['steps'][number] {
  return { code, level, scope: `scope ${code}`, instrument: 'grl', legalBasis: 'RGI 1' };
}

function routeOf(code: string, level: 2 | 4 | 6 | 7 | 8 | 9 | 10): Route {
  return { steps: [step(code, level)] };
}

function sheet(): GoodsSheet {
  return {
    what: { value: 'camisa', unit: null, source: null, method: 'absent' },
    madeOf: { value: 'algodón', unit: null, source: null, method: 'absent' },
    howMade: { value: 'tejido', unit: null, source: null, method: 'absent' },
    purpose: { value: 'vestir', unit: null, source: null, method: 'absent' },
    presentation: { value: 'bolsa', unit: null, source: null, method: 'absent' },
  };
}

function tree(childrenByCode: Record<string, string[]>, leaves: Set<string>): TariffTree {
  return {
    children: async (code: string): Promise<string[]> => childrenByCode[code] ?? [],
    isLeaf: (code: string): boolean => leaves.has(code),
    description: async (code: string): Promise<string> => `desc ${code}`,
    level: (code: string): 2 | 4 | 6 | 7 | 8 | 9 | 10 => code.length as 2 | 4 | 6 | 7 | 8 | 9 | 10,
  };
}

function corpus(exclusionsByCode: Record<string, string[]>): LegalCorpus {
  return {
    exclusions: async (code: string): Promise<string[]> => exclusionsByCode[code] ?? [],
    redirects: async () => [],
    precedents: async () => [],
  };
}

function engine(result: CompareResult): DecisionEngine {
  return {
    split: async () => [],
    compare: async () => result,
  };
}

describe('BEAM_WIDTH', () => {
  it('limita las rutas devueltas cuando hay más hojas que BEAM_WIDTH (no-truncation for leaves)', async () => {
    const leaves = Array.from({ length: 5 }, (_, i) => `870829${String(i).padStart(2, '0')}`);
    const children = leaves;
    const leavesSet = new Set(leaves);

    const ctx: BeamContext = {
      sheet: sheet(),
      tree: tree({ '870829': children }, leavesSet),
      corpus: corpus({}),
      engine: engine({ winner: children[0], runnerUp: undefined, margin: 0.9 }),
    };

    const result: Expansion = await expand(routeOf('870829', 6), 6, ctx);

    expect(result.routes).toHaveLength(5);
    for (const leaf of leaves) {
      expect(result.routes.some((r) => r.steps[r.steps.length - 1].code === leaf)).toBe(true);
    }
  });
});

describe('expand', () => {
  it('protege una hoja: nunca se poda por ancho de haz (beam-protects-leaves)', async () => {
    const ctx: BeamContext = {
      sheet: sheet(),
      tree: tree({}, new Set(['3901100010'])),
      corpus: corpus({}),
      engine: engine({ winner: '3901100010', runnerUp: undefined, margin: 0.01 }),
    };

    const result: Expansion = await expand(routeOf('3901100010', 10), 10, ctx);

    expect(result.terminal).toBe(true);
    expect(result.routes).toHaveLength(1);
    expect(result.routes[0].steps[0].code).toBe('3901100010');
  });

  it('no trunca: 21 hojas hijas devuelven 21 rutas, no 3 (no-truncation)', async () => {
    const leaves = Array.from({ length: 21 }, (_, i) => `870829${String(i).padStart(2, '0')}`);
    const children = leaves;
    const leavesSet = new Set(leaves);

    const ctx: BeamContext = {
      sheet: sheet(),
      tree: tree({ '870829': children }, leavesSet),
      corpus: corpus({}),
      engine: engine({ winner: children[0], runnerUp: undefined, margin: 0.9 }),
    };

    const result: Expansion = await expand(routeOf('870829', 6), 6, ctx);

    expect(result.terminal).toBe(false);
    expect(result.routes).toHaveLength(21);
    for (const leaf of leaves) {
      expect(result.routes.some((r) => r.steps[r.steps.length - 1].code === leaf)).toBe(true);
    }
  });

  it('devuelve ganador y subcampeón por ruta, no global', async () => {
    const ctx: BeamContext = {
      sheet: sheet(),
      tree: tree(
        { '3901': ['390110', '390120', '390130'] },
        new Set(),
      ),
      corpus: corpus({}),
      engine: engine({ winner: '390110', runnerUp: '390120', margin: 0.5 }),
    };

    const result: Expansion = await expand(routeOf('3901', 6), 6, ctx);

    expect(result.routes).toHaveLength(2);
    const codes = result.routes.map((r) => r.steps[r.steps.length - 1].code);
    expect(codes).toContain('390110'); // ganador
    expect(codes).toContain('390120'); // subcampeón (cualquier otro viable)
  });

  it('aplica exclusiones antes de comparar (veto > prune)', async () => {
    const ctx: BeamContext = {
      sheet: sheet(),
      tree: tree({ '39': ['3901', '3902'] }, new Set()),
      corpus: corpus({ '39': ['3902'] }), // 3902 vetado
      engine: engine({ winner: '3901', runnerUp: undefined, margin: 1 }),
    };

    const result: Expansion = await expand(routeOf('39', 2), 2, ctx);

    expect(result.routes).toHaveLength(1);
    expect(result.routes[0].steps[1].code).toBe('3901');
  });

  it('ruta terminal al podar a cero devuelve la ruta sin más pasos', async () => {
    const ctx: BeamContext = {
      sheet: sheet(),
      tree: tree({ '39': ['3901', '3902'] }, new Set()),
      corpus: corpus({ '39': ['3901', '3902'] }), // todo vetado
      engine: engine({ winner: '3901', runnerUp: undefined, margin: 1 }),
    };

    const result: Expansion = await expand(routeOf('39', 2), 2, ctx);

    expect(result.terminal).toBe(true);
    expect(result.routes).toHaveLength(1);
    expect(result.routes[0].steps).toHaveLength(1);
  });
});
