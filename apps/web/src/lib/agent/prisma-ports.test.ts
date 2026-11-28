import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TariffCandidateRecord } from '@tariffos/agent';

const mocks = vi.hoisted(() => ({
  nationalTariffFindFirst: vi.fn(),
  hsPermitRequirementFindMany: vi.fn(),
  tariffExemptionRuleFindFirst: vi.fn(),
  legalKnowledgeChunkFindMany: vi.fn(),
  ftsSearch: vi.fn<() => Promise<TariffCandidateRecord[]>>(),
  vectorSearch: vi.fn<() => Promise<TariffCandidateRecord[]>>(),
  findTenantSkuPrecedent: vi.fn(),
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    nationalTariff: { findMany: vi.fn(), findFirst: mocks.nationalTariffFindFirst },
    legalKnowledgeChunk: { findMany: mocks.legalKnowledgeChunkFindMany },
    hsPermitRequirement: { findMany: mocks.hsPermitRequirementFindMany },
    tariffExemptionRule: { findFirst: mocks.tariffExemptionRuleFindFirst },
  },
}));

vi.mock('./tariff-fts', () => ({
  searchTariffCandidatesFts: mocks.ftsSearch,
}));

vi.mock('./tariff-vector', () => ({
  searchTariffCandidatesVector: mocks.vectorSearch,
}));

vi.mock('./tier0-lookup', () => ({
  findTenantSkuPrecedent: mocks.findTenantSkuPrecedent,
}));

import { createPrismaPipelinePorts } from './prisma-ports';

describe('createPrismaPipelinePorts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches both dotted and 10-digit compact HS codes and maps customsFee/BK/BIT and RL-1 prohibited flag', async () => {
    mocks.nationalTariffFindFirst.mockResolvedValue({
      hsCode: '8471309090',
      description: 'Las demás sin sintonizador de TV',
      adValorem: 16,
      iva: 16,
      customsFee: 1,
      isBK: false,
      isBIT: true,
      legalNotes: 'Régimen Legal Importación: 1,20',
    });
    mocks.hsPermitRequirementFindMany.mockResolvedValue([
      { permitType: { code: 'RL-1', agency: 'Ministerio de Comercio Exterior', name: 'Importación o Exportación Prohibida' } },
      { permitType: { code: 'RL-20', agency: 'SENCAMER', name: 'Constancia de Registro COVENIN' } },
    ]);

    const ports = createPrismaPipelinePorts();
    const verified = await ports.verifyHsCode('VE', '8471.30.90.90');

    expect(verified).toMatchObject({
      hsCode: '8471309090',
      customsFeeRate: 1,
      isBK: false,
      isBIT: true,
      prohibited: true,
      permits: [
        'RL-1 (Ministerio de Comercio Exterior): Importación o Exportación Prohibida',
        'RL-20 (SENCAMER): Constancia de Registro COVENIN',
      ],
    });
    expect(ports.fetchWebSpecs).toBeTypeOf('function');
  });

  it('queries LegalKnowledgeChunk for both chapter and section hierarchyPath values', async () => {
    mocks.legalKnowledgeChunkFindMany.mockResolvedValue([
      {
        heading: 'CAPÍTULO 85 — MÁQUINAS Y APARATOS ELÉCTRICOS',
        ruleNumber: '1',
        content: 'Este Capítulo no comprende las mantas calentadas eléctricamente.',
        parent: { hierarchyPath: '85' },
      },
      {
        heading: 'SECCIÓN XVI — MÁQUINAS Y APARATOS',
        ruleNumber: '4',
        content: 'Unidad funcional constituida por elementos individualizados.',
        parent: { hierarchyPath: 'SEC-XVI' },
      },
    ]);

    const ports = createPrismaPipelinePorts();
    const notes = await ports.getLegalNotes('VE', '8504.40.90.00');

    expect(mocks.legalKnowledgeChunkFindMany).toHaveBeenCalledWith({
      where: {
        parent: {
          countryCode: 'VE',
          status: 'PUBLISHED',
          isDerogated: false,
          validFromDate: { lte: expect.any(Date) },
          OR: [{ validToDate: null }, { validToDate: { gte: expect.any(Date) } }],
        },
        OR: [
          { parent: { hierarchyPath: { in: ['85', 'SEC-XVI'] } } },
          {
            scope: {
              hasSome: expect.arrayContaining(['8504', '85.04', '8504.40', '8504.40.90.00']),
            },
          },
        ],
      },
      include: {
        parent: { select: { hierarchyPath: true } },
      },
      orderBy: [{ chunkIndex: 'asc' }, { id: 'asc' }],
      take: 12,
    });
    expect(notes).toEqual([
      {
        ref: 'CAPÍTULO 85 — MÁQUINAS Y APARATOS ELÉCTRICOS (Nota 1)',
        text: 'Este Capítulo no comprende las mantas calentadas eléctricamente.',
        chapter: '85',
      },
      {
        ref: 'SECCIÓN XVI — MÁQUINAS Y APARATOS (Nota 4)',
        text: 'Unidad funcional constituida por elementos individualizados.',
      },
    ]);
  });

  it('delegates findSkuPrecedent to findTenantSkuPrecedent and fuses vector + FTS candidates', async () => {
    mocks.findTenantSkuPrecedent.mockResolvedValue({
      hsCode: '8471.30.90.90',
      officialDescription: 'MacBook Pro 14',
      confidencePct: 99,
      approvedByBroker: true,
    });
    mocks.vectorSearch.mockResolvedValue([
      { hsCode: '8504.40.90.00', description: 'Inversores', adValoremRate: 14, ivaRate: 16, unit: 'u', prohibited: false, score: 0.91 },
    ]);
    mocks.ftsSearch.mockResolvedValue([
      { hsCode: '8504.40.90.00', description: 'Convertidores estáticos › Los demás', adValoremRate: 14, ivaRate: 16, unit: 'u', prohibited: false, score: 0.72 },
      { hsCode: '8504.40.10.00', description: 'Cargadores de acumuladores', adValoremRate: 14, ivaRate: 16, unit: 'u', prohibited: false, score: 0.65 },
    ]);

    const ports = createPrismaPipelinePorts();
    await expect(ports.findSkuPrecedent('t-1', 'MBP-14')).resolves.toMatchObject({
      hsCode: '8471.30.90.90',
    });
    expect(mocks.findTenantSkuPrecedent).toHaveBeenCalledWith('t-1', 'MBP-14', expect.any(Function));

    const results = await ports.searchTariffCandidates('VE', 'inversor solar híbrido 5kw');
    expect(results[0]?.hsCode).toBe('8504.40.90.00');
    expect(results[0]?.score).toBe(1);
    expect(results).toHaveLength(2);
  });

  it('memoizes repeated searchTariffCandidates calls on the same ports instance', async () => {
    mocks.vectorSearch.mockResolvedValue([
      { hsCode: '8504.40.90.00', description: 'Inversores', adValoremRate: 14, ivaRate: 16, unit: 'u', prohibited: false, score: 0.91 },
    ]);
    mocks.ftsSearch.mockResolvedValue([
      { hsCode: '8504.40.90.00', description: 'Inversores', adValoremRate: 14, ivaRate: 16, unit: 'u', prohibited: false, score: 0.72 },
    ]);

    const ports = createPrismaPipelinePorts();
    const first = await ports.searchTariffCandidates('VE', 'inversor solar');
    const second = await ports.searchTariffCandidates('VE', '  inversor solar  ');

    expect(first).toEqual(second);
    expect(mocks.vectorSearch).toHaveBeenCalledTimes(1);
    expect(mocks.ftsSearch).toHaveBeenCalledTimes(1);
  });

  it('queries NationalTariff and HsPermitRequirement concurrently in verifyHsCode', async () => {
    let tariffPending = true;
    let ranConcurrently = false;
    mocks.nationalTariffFindFirst.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 15));
      tariffPending = false;
      return {
        hsCode: '8414801200',
        description: 'De tornillo',
        adValorem: 14,
        iva: 16,
        customsFee: 1,
        isBK: true,
        isBIT: false,
        legalNotes: null,
      };
    });
    mocks.hsPermitRequirementFindMany.mockImplementation(async () => {
      if (tariffPending) ranConcurrently = true;
      return [];
    });

    const ports = createPrismaPipelinePorts();
    const verified = await ports.verifyHsCode('VE', '8414.80.12.00');
    expect(verified?.hsCode).toBe('8414801200');
    expect(ranConcurrently).toBe(true);
  });

  it('maps statisticalUnit, Ex.AEC metadata, and activeExemption with expiringSoon in verifyHsCode', async () => {
    mocks.nationalTariffFindFirst.mockResolvedValue({
      hsCode: '1701990091',
      description: 'Azúcar refinada',
      adValorem: 98,
      baseAdValorem: 16,
      tariffExceptionCode: '98E',
      statisticalUnit: 'kg',
      iva: 16,
      customsFee: 1,
      isBK: false,
      isBIT: false,
      legalNotes: null,
    });
    mocks.hsPermitRequirementFindMany.mockResolvedValue([]);
    mocks.tariffExemptionRuleFindFirst.mockResolvedValue({
      programCode: 'DEC-5197-COMEX',
      title: 'Exoneración Apéndice I',
      decreeRef: 'Decreto N° 5.197',
      gazetteRef: 'GOE N° 6.952',
      exemptAdValoremPct: 90,
      exemptVatPct: 90,
      requiredPermitCode: 'RL-9',
      conditionsSummary: 'Sujeto a permiso COMEX.',
      validToDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    });

    const ports = createPrismaPipelinePorts();
    const verified = await ports.verifyHsCode('VE', '1701.99.00.91');

    expect(verified).toMatchObject({
      hsCode: '1701990091',
      adValoremRate: 98,
      baseAdValoremRate: 16,
      tariffExceptionCode: '98E',
      unit: 'kg',
      activeExemption: {
        programCode: 'DEC-5197-COMEX',
        decreeRef: 'Decreto N° 5.197',
        requiredPermitCode: 'RL-9',
        expiringSoon: true,
      },
    });
  });
});
