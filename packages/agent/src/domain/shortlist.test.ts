import { describe, expect, it } from 'vitest';

import { CandidateSchema, ShortlistSchema } from './shortlist.js';
import { RouteSchema, type Route } from './route.js';
import type { Candidate } from './shortlist.js';

function routeWith(code: string): Route {
  return RouteSchema.parse({
    steps: [{ code, level: 6, scope: 'subheading ' + code, instrument: 'grl', legalBasis: 'RGI 1' }],
  });
}

function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    code: '3926.90.00.00',
    route: routeWith('3926.90.00.00'),
    verdict: 'clear',
    confidence: 'firm',
    recommended: true,
    ...overrides,
  };
}

describe('Candidate', () => {
  it('admite dualPartner recursivo y sin recomendación en ninguno de los socios', () => {
    const a = candidate({ code: '3926.90.00.00', recommended: false });
    const b = candidate({ code: '3923.90.00.00', recommended: false, dualPartner: a });
    const parsed = CandidateSchema.parse({ ...b, dualPartner: a });
    expect(parsed.dualPartner?.code).toBe('3926.90.00.00');
    expect(parsed.recommended).toBe(false);
    expect(parsed.dualPartner?.recommended).toBe(false);
  });
});

describe('Shortlist', () => {
  const three = [
    candidate({ code: '3926.90.00.00', recommended: true }),
    candidate({ code: '3923.90.00.00', recommended: false }),
    candidate({ code: '6307.90.00.00', recommended: false }),
  ];

  it('acepta tres o más candidatos', () => {
    const parsed = ShortlistSchema.parse({ candidates: three, dual: false });
    expect(parsed.candidates).toHaveLength(3);
  });

  it('rechaza menos de tres candidatos sin question', () => {
    expect(() => ShortlistSchema.parse({ candidates: three.slice(0, 2), dual: false })).toThrow();
  });

  it('acepta menos de tres candidatos cuando question explica por qué', () => {
    const parsed = ShortlistSchema.parse({
      candidates: three.slice(0, 1),
      dual: false,
      question: '¿Es de algodón o poliéster?',
    });
    expect(parsed.question).toBe('¿Es de algodón o poliéster?');
  });

  it('rechaza dual con algún candidato recomendado', () => {
    expect(() => ShortlistSchema.parse({ candidates: three, dual: true })).toThrow();
  });

  it('acepta dual sin recomendados en ninguno de los socios', () => {
    const partners = three.map((c) => candidate({ ...c, recommended: false }));
    const parsed = ShortlistSchema.parse({ candidates: partners, dual: true });
    expect(parsed.dual).toBe(true);
    expect(parsed.candidates.every((c) => !c.recommended)).toBe(true);
  });
});
