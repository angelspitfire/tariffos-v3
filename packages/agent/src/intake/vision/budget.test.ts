import { describe, expect, it } from 'vitest';

import { PageBudget, measure, resolveBudget, type VisionBudget } from './budget.js';

function stubEnv(vars: Record<string, string | undefined>): () => void {
  const saved: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) {
    saved[k] = process.env[k];
    if (vars[k] === undefined) delete process.env[k];
    else process.env[k] = vars[k];
  }
  return () => {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  };
}

describe('resolveBudget (F2-12)', () => {
  it('lee los límites desde el entorno', () => {
    const restore = stubEnv({
      VISION_MAX_SECONDS_PER_PAGE: '30',
      VISION_MAX_PAGES: '5',
    });
    try {
      const b: VisionBudget = resolveBudget();
      expect(b.maxSecondsPerPage).toBe(30);
      expect(b.maxPages).toBe(5);
    } finally {
      restore();
    }
  });

  it('sin entorno devuelve límites indefinidos (sin tope)', () => {
    const restore = stubEnv({
      VISION_MAX_SECONDS_PER_PAGE: undefined,
      VISION_MAX_PAGES: undefined,
    });
    try {
      const b: VisionBudget = resolveBudget();
      expect(b.maxSecondsPerPage).toBeUndefined();
      expect(b.maxPages).toBeUndefined();
    } finally {
      restore();
    }
  });
});

describe('PageBudget (F2-12)', () => {
  it('permite leer mientras no se alcance el tope de páginas', () => {
    const budget = new PageBudget({ maxSecondsPerPage: undefined, maxPages: 3 });
    expect(budget.canReadPage()).toBe(true);
    budget.recordPage(10);
    expect(budget.canReadPage()).toBe(true);
    budget.recordPage(10);
    expect(budget.canReadPage()).toBe(true);
    budget.recordPage(10);
    expect(budget.canReadPage()).toBe(false);
  });

  it('bloquea cuando la página anterior superó los segundos por página', () => {
    const budget = new PageBudget({ maxSecondsPerPage: 10, maxPages: undefined });
    budget.recordPage(15);
    expect(budget.canReadPage()).toBe(false);
  });

  it('no bloquea cuando la página anterior estuvo dentro del presupuesto', () => {
    const budget = new PageBudget({ maxSecondsPerPage: 10, maxPages: undefined });
    budget.recordPage(5);
    expect(budget.canReadPage()).toBe(true);
  });
});

describe('measure (F2-12)', () => {
  it('mide el tiempo en segundos y devuelve el resultado', async () => {
    const { result, seconds } = await measure(async () => {
      await new Promise((r) => setTimeout(r, 50));
      return 'hecho';
    });
    expect(result).toBe('hecho');
    expect(seconds).toBeGreaterThan(0);
  });
});
