import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  nationalTariffFindMany: vi.fn(),
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    nationalTariff: { findMany: mocks.nationalTariffFindMany },
  },
  ancestryOf: (code: string, byCode: Map<string, string>) => {
    const out: string[] = [];
    for (let len = 1; len < code.length; len += 1) {
      const text = byCode.get(code.slice(0, len));
      if (text !== undefined) out.push(text);
    }
    return out;
  },
  composeDocument: (ancestry: string[], self: string) => [...ancestry, self].join(' › '),
}));

import { fetchSiblingSubheadings } from './tariff-siblings';

describe('fetchSiblingSubheadings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns [] without querying DB when prefixes are empty or too short', async () => {
    await expect(fetchSiblingSubheadings('VE', ['', '84'])).resolves.toEqual([]);
    expect(mocks.nationalTariffFindMany).not.toHaveBeenCalled();
  });

  it('expands 10-digit sibling leaves under unique 6-digit prefixes with hierarchical descriptions and BK/BIT/customsFee', async () => {
    mocks.nationalTariffFindMany
      .mockResolvedValueOnce([
        {
          hsCode: '8471301990',
          description: 'Las demás',
          adValorem: 16,
          iva: 16,
          legalNotes: null,
          customsFee: 1,
          isBK: false,
          isBIT: true,
        },
        {
          hsCode: '8471309090',
          description: 'Las demás',
          adValorem: 16,
          iva: 16,
          legalNotes: null,
          customsFee: 1,
          isBK: false,
          isBIT: true,
        },
      ])
      .mockResolvedValueOnce([
        { hsCode: '8471', description: 'Máquinas automáticas para tratamiento de datos' },
        { hsCode: '847130', description: 'Portátiles, de peso inferior o igual a 10 kg' },
        { hsCode: '84713019', description: 'Las demás' },
        { hsCode: '84713090', description: 'Las demás' },
      ]);

    const siblings = await fetchSiblingSubheadings('VE', ['8471.30.90.90', '8471301990']);

    expect(siblings).toEqual([
      {
        hsCode: '8471.30.19.90',
        description:
          'Máquinas automáticas para tratamiento de datos › Portátiles, de peso inferior o igual a 10 kg › Las demás › Las demás',
        adValoremRate: 16,
        ivaRate: 16,
        unit: 'u',
        legalRegime: undefined,
        prohibited: false,
        permits: [],
        customsFeeRate: 1,
        isBK: false,
        isBIT: true,
      },
      {
        hsCode: '8471.30.90.90',
        description:
          'Máquinas automáticas para tratamiento de datos › Portátiles, de peso inferior o igual a 10 kg › Las demás › Las demás',
        adValoremRate: 16,
        ivaRate: 16,
        unit: 'u',
        legalRegime: undefined,
        prohibited: false,
        permits: [],
        customsFeeRate: 1,
        isBK: false,
        isBIT: true,
      },
    ]);
  });
});
