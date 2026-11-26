import { describe, expect, it } from 'vitest';
import { auditTariffAgainstOfficialSchedule } from './tariff-validator.js';
import type { TariffCandidateRecord } from './types.js';

const OFFICIAL_LAPTOP: TariffCandidateRecord = {
  hsCode: '8471.30.90.90',
  description: 'Portable automatic data processing machines <=10kg, without TV tuner',
  adValoremRate: 16,
  ivaRate: 16,
  unit: 'u',
  legalRegime: 'RL 6',
  permits: ['CONATEL'],
  prohibited: false,
};

describe('auditTariffAgainstOfficialSchedule', () => {
  it('returns matched=true when HS digits, rates, and permits align with official schedule', () => {
    const audit = auditTariffAgainstOfficialSchedule(
      {
        proposedHsCode: '8471309090',
        proposedAdValoremRate: 16,
        proposedIvaRate: 16,
        proposedUnit: 'u',
        proposedPermits: ['CONATEL'],
      },
      OFFICIAL_LAPTOP,
    );

    expect(audit.matched).toBe(true);
    expect(audit.codeDigitsMatch).toBe(true);
    expect(audit.adValoremDiff).toBe(0);
    expect(audit.ivaDiff).toBe(0);
    expect(audit.discrepancies).toEqual([]);
  });

  it('reports not_found error when official record is null', () => {
    const audit = auditTariffAgainstOfficialSchedule(
      { proposedHsCode: '8471.30.90.99', proposedAdValoremRate: 16, proposedIvaRate: 16 },
      null,
    );

    expect(audit.matched).toBe(false);
    expect(audit.codeDigitsMatch).toBe(false);
    expect(audit.discrepancies.some((d) => d.code === 'not_found' && d.severity === 'error')).toBe(
      true,
    );
  });

  it('detects digit-by-digit code mismatch, rate diffs, and prohibited status', () => {
    const audit = auditTariffAgainstOfficialSchedule(
      {
        proposedHsCode: '8471.30.19.90',
        proposedAdValoremRate: 20,
        proposedIvaRate: 8,
        proposedPermits: [],
      },
      { ...OFFICIAL_LAPTOP, prohibited: true },
    );

    expect(audit.matched).toBe(false);
    expect(audit.codeDigitsMatch).toBe(false);
    expect(audit.adValoremDiff).toBe(4);
    expect(audit.ivaDiff).toBe(-8);
    expect(audit.discrepancies.map((d) => d.code)).toEqual(
      expect.arrayContaining([
        'code_mismatch',
        'ad_valorem_mismatch',
        'iva_mismatch',
        'prohibited_code',
        'regime_missing',
      ]),
    );
  });
});
