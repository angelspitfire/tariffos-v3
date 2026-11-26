import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn<(...args: unknown[]) => Promise<unknown[]>>(),
  findMany: vi.fn<(...args: unknown[]) => Promise<unknown[]>>(),
}));

vi.mock('@tariffos/database', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tariffos/database')>();
  return {
    ...actual,
    prisma: {
      $queryRaw: mocks.queryRaw,
      nationalTariff: { findMany: mocks.findMany },
    },
  };
});

import {
  buildSpanishOrTsQuery,
  extractHsPrefixHint,
  extractSearchTerms,
  searchTariffCandidatesFts,
} from './tariff-fts';

describe('extractSearchTerms and buildSpanishOrTsQuery', () => {
  it('strips accents, punctuation, stopwords, and measurement noise words', () => {
    const terms = extractSearchTerms(
      'Computadora portátil MacBook Pro 14" peso 1.6 kg, sin sintonizador de TV!',
    );
    expect(terms).toContain('computadora');
    expect(terms).toContain('portatil');
    expect(terms).toContain('sintonizador');
    expect(terms).not.toContain('peso');
    expect(terms).not.toContain('kg');
    expect(terms).not.toContain('sin');
    expect(terms).not.toContain('de');

    const tsQuery = buildSpanishOrTsQuery(
      'Computadora portátil MacBook Pro 14" (aluminio), sin sintonizador de TV!',
    );
    expect(tsQuery).not.toBeNull();
    expect(tsQuery).not.toMatch(/[("!'&:]/);
    expect(tsQuery?.split(' | ')).toContain('portatil');
  });

  it('returns null when no searchable words remain', () => {
    expect(buildSpanishOrTsQuery('de la el peso kg cm !@#')).toBeNull();
  });
});

describe('extractHsPrefixHint', () => {
  it('extracts dotted or compact HS prefixes of 4 to 10 digits', () => {
    expect(extractHsPrefixHint('Verificar partida 8471.30.90.90 laptop')).toBe('8471309090');
    expect(extractHsPrefixHint('Partida 9102 reloj')).toBe('9102');
    expect(extractHsPrefixHint('MacBook Pro 14 pulgadas')).toBeNull();
  });
});

describe('searchTariffCandidatesFts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('expands tree-aggregated grp6 hits into 10-digit leaves with full ancestry and diversity cap', async () => {
    mocks.queryRaw.mockResolvedValueOnce([
      { grp6: '847130', distinct_terms: 2, node_matches: 5 },
      { grp6: '851714', distinct_terms: 2, node_matches: 4 },
    ]);

    mocks.findMany
      .mockResolvedValueOnce([
        { hsCode: '8471309090', description: 'Las demás', adValorem: 16, iva: 16, legalNotes: null },
        { hsCode: '8471309010', description: 'Provistas de sintonizador de señal de televisión', adValorem: 16, iva: 16, legalNotes: null },
        { hsCode: '8517143110', description: 'Provistos de sintonizador de señal de televisión', adValorem: 16, iva: 16, legalNotes: null },
        { hsCode: '8517143190', description: 'Los demás', adValorem: 16, iva: 16, legalNotes: null },
        { hsCode: '8517143210', description: 'Provistos de sintonizador de señal de televisión', adValorem: 16, iva: 16, legalNotes: null },
        { hsCode: '8517143290', description: 'Los demás', adValorem: 16, iva: 16, legalNotes: null },
        { hsCode: '8517143910', description: 'Provistos de sintonizador de señal de televisión', adValorem: 16, iva: 16, legalNotes: null },
      ])
      .mockResolvedValueOnce([
        { hsCode: '8471', description: 'MÁQUINAS AUTOMÁTICAS PARA TRATAMIENTO DE DATOS' },
        { hsCode: '847130', description: 'Máquinas automáticas para tratamiento de datos, portátiles, peso <= 10 kg' },
        { hsCode: '84713090', description: 'Las demás:' },
        { hsCode: '8517', description: 'TELÉFONOS' },
        { hsCode: '851714', description: 'Los demás teléfonos celulares:' },
      ]);

    const results = await searchTariffCandidatesFts('VE', 'Computadora portátil sin sintonizador TV');

    const group8471 = results.filter((r) => r.hsCode.startsWith('847130'));
    const group8517 = results.filter((r) => r.hsCode.startsWith('851714'));
    expect(group8471).toHaveLength(2);
    expect(group8517).toHaveLength(4);
    expect(group8471[0]?.description).toContain('MÁQUINAS AUTOMÁTICAS PARA TRATAMIENTO DE DATOS');
    expect(group8471[0]?.description).toContain('portátiles');
    expect(group8471[0]?.score).toBeGreaterThan(0);
    expect(group8471[0]?.score).toBeLessThanOrEqual(0.84);
  });

  it('assigns 0.95 score when query carries an exact 10-digit HS hint', async () => {
    mocks.queryRaw.mockResolvedValueOnce([]);
    mocks.findMany
      .mockResolvedValueOnce([
        { hsCode: '8471309090', description: 'Las demás', adValorem: 16, iva: 16, legalNotes: null },
      ])
      .mockResolvedValueOnce([
        { hsCode: '8471', description: 'MÁQUINAS AUTOMÁTICAS PARA TRATAMIENTO DE DATOS' },
      ]);

    const results = await searchTariffCandidatesFts('VE', 'Confirmar partida 8471.30.90.90');
    expect(results).toHaveLength(1);
    expect(results[0]?.hsCode).toBe('8471309090');
    expect(results[0]?.score).toBe(0.95);
  });
});
