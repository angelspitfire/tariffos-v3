import { describe, expect, it } from 'vitest';
import type { A2UICanvasComponent } from '@tariffos/shared-types';
import { resolveEffectiveCanvasTab } from './canvas-tabs';

const DOSSIER: A2UICanvasComponent = {
  type: 'dossier',
  id: 'd-1',
  title: 'Dictamen',
  hsCode: '8504.40.90.00',
  officialDescription: 'Inversores estáticos',
  jurisdictionName: 'Venezuela (SENIAT)',
  rgiSteps: [],
  legalNotes: [],
  technicalSpecs: [],
  permits: [],
};

const CALCULATOR: A2UICalculator = {
  type: 'calculator',
  id: 'c-1',
  title: 'CIF',
  hsCode: '8504.40.90.00',
  adValoremPercent: 10,
  vatPercent: 16,
  customsServiceFeePercent: 1,
  currencyCode: 'USD',
  localCurrencyCode: 'VES',
  suggestedExchangeRate: 46.5,
  exemptionAvailable: false,
  originCountry: 'CN',
  incoterm: 'FOB',
};

type A2UICalculator = Extract<A2UICanvasComponent, { type: 'calculator' }>;

describe('resolveEffectiveCanvasTab', () => {
  it('keeps activeTab when matching components exist', () => {
    expect(resolveEffectiveCanvasTab([DOSSIER, CALCULATOR], 'calculator')).toBe('calculator');
    expect(resolveEffectiveCanvasTab([DOSSIER], 'rgi_comparator')).toBe('rgi_comparator');
    expect(resolveEffectiveCanvasTab([DOSSIER], 'regulatory_diff')).toBe('regulatory_diff');
  });

  it('falls back in canonical priority when activeTab component is absent', () => {
    expect(resolveEffectiveCanvasTab([CALCULATOR], 'batch_manifest')).toBe('calculator');
    expect(resolveEffectiveCanvasTab([DOSSIER, CALCULATOR], 'batch_manifest')).toBe('dossier');
  });
});
