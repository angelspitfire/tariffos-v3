import { digits } from '../util/code.js';
import type { TariffCandidateRecord } from './types.js';

const RATE_TOLERANCE = 0.01;
const DIFF_DECIMALS = 4;

export interface TariffAuditDiscrepancy {
  code:
    | 'not_found'
    | 'code_mismatch'
    | 'ad_valorem_mismatch'
    | 'iva_mismatch'
    | 'unit_mismatch'
    | 'prohibited_code'
    | 'regime_missing';
  severity: 'error' | 'warn';
  title: string;
  detail: string;
}

export interface TariffAuditInput {
  proposedHsCode: string;
  proposedAdValoremRate?: number;
  proposedIvaRate?: number;
  proposedUnit?: string;
  proposedLegalRegime?: string;
  proposedPermits?: string[];
}

export interface TariffAuditResult {
  matched: boolean;
  codeDigitsMatch: boolean;
  proposedDigits: string;
  officialDigits: string | null;
  adValoremDiff: number;
  ivaDiff: number;
  discrepancies: TariffAuditDiscrepancy[];
  summary: string;
}

function roundDiff(value: number): number {
  const factor = 10 ** DIFF_DECIMALS;
  return Math.round(value * factor) / factor;
}

function normalizeToken(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function hasPermitCoverage(expectedPermit: string, haystack: string): boolean {
  const normalizedTarget = normalizeToken(expectedPermit);
  if (!normalizedTarget) return true;
  if (normalizeToken(haystack).includes(normalizedTarget)) return true;

  if (expectedPermit === 'RL 3' && /\b(RL\s*0?3|SACS|MPPS|SANITARI)\b/i.test(haystack)) return true;
  if (expectedPermit === 'RL 5' && /\b(RL\s*0?5|INSAI|FITOSAN|ZOOSAN)\b/i.test(haystack)) return true;
  if (expectedPermit === 'RL 6' && /\b(RL\s*0?6|SENCAMER|COVENIN|FONDONORMA)\b/i.test(haystack)) return true;
  if (expectedPermit === 'RL 9' && /\b(RL\s*0?9|AMBIENT|ECOSOCIAL|MONTREAL)\b/i.test(haystack)) return true;
  if (expectedPermit === 'CONATEL' && /\b(CONATEL|HOMOLOG|ESPECTRO)\b/i.test(haystack)) return true;
  return false;
}

/**
 * Audits a proposed HS code and fiscal rates digit-by-digit against an official
 * `TariffCandidateRecord` from `NationalTariff`.
 */
export function auditTariffAgainstOfficialSchedule(
  proposed: TariffAuditInput,
  official: TariffCandidateRecord | null,
): TariffAuditResult {
  const proposedDigits = digits(proposed.proposedHsCode);

  if (!official) {
    const detail = `El código ${proposed.proposedHsCode} no fue encontrado en el arancel oficial vigente.`;
    return {
      matched: false,
      codeDigitsMatch: false,
      proposedDigits,
      officialDigits: null,
      adValoremDiff: 0,
      ivaDiff: 0,
      discrepancies: [
        {
          code: 'not_found',
          severity: 'error',
          title: 'Código no verificado en arancel oficial',
          detail,
        },
      ],
      summary: detail,
    };
  }

  const officialDigits = digits(official.hsCode);
  const codeDigitsMatch = proposedDigits.length > 0 && proposedDigits === officialDigits;
  const discrepancies: TariffAuditDiscrepancy[] = [];

  if (!codeDigitsMatch) {
    discrepancies.push({
      code: 'code_mismatch',
      severity: 'error',
      title: 'Diferencia dígito a dígito en código HS',
      detail: `Propuesto ${proposed.proposedHsCode} (${proposedDigits}) difiere del registro oficial ${official.hsCode} (${officialDigits}).`,
    });
  }

  const adValoremDiff =
    typeof proposed.proposedAdValoremRate === 'number' && Number.isFinite(proposed.proposedAdValoremRate)
      ? roundDiff(proposed.proposedAdValoremRate - official.adValoremRate)
      : 0;
  if (Math.abs(adValoremDiff) > RATE_TOLERANCE) {
    discrepancies.push({
      code: 'ad_valorem_mismatch',
      severity: 'warn',
      title: 'Diferencia en alícuota Ad Valorem',
      detail: `Propuesto ${proposed.proposedAdValoremRate}% vs oficial ${official.adValoremRate}% para ${official.hsCode}.`,
    });
  }

  const ivaDiff =
    typeof proposed.proposedIvaRate === 'number' && Number.isFinite(proposed.proposedIvaRate)
      ? roundDiff(proposed.proposedIvaRate - official.ivaRate)
      : 0;
  if (Math.abs(ivaDiff) > RATE_TOLERANCE) {
    discrepancies.push({
      code: 'iva_mismatch',
      severity: 'warn',
      title: 'Diferencia en alícuota IVA',
      detail: `Propuesto ${proposed.proposedIvaRate}% vs oficial ${official.ivaRate}% para ${official.hsCode}.`,
    });
  }

  if (
    proposed.proposedUnit &&
    official.unit &&
    proposed.proposedUnit.trim().toLowerCase() !== official.unit.trim().toLowerCase()
  ) {
    discrepancies.push({
      code: 'unit_mismatch',
      severity: 'warn',
      title: 'Diferencia en unidad física',
      detail: `Propuesto "${proposed.proposedUnit}" vs oficial "${official.unit}".`,
    });
  }

  if (official.prohibited) {
    discrepancies.push({
      code: 'prohibited_code',
      severity: 'error',
      title: 'Partida prohibida / restringida',
      detail: `El arancel oficial marca ${official.hsCode} como mercancía prohibida o de importación restringida.`,
    });
  }

  const expectedPermits = official.permits ?? [];
  if (
    expectedPermits.length > 0 &&
    (proposed.proposedPermits !== undefined || proposed.proposedLegalRegime !== undefined)
  ) {
    const haystack = `${proposed.proposedLegalRegime ?? ''} ${(proposed.proposedPermits ?? []).join(' ')}`;
    const missingPermits = expectedPermits.filter((req) => !hasPermitCoverage(req, haystack));
    if (missingPermits.length > 0) {
      discrepancies.push({
        code: 'regime_missing',
        severity: 'warn',
        title: `Permiso / régimen oficial no reflejado (${missingPermits.join(', ')})`,
        detail: `El registro oficial para ${official.hsCode} exige: ${missingPermits.join(', ')}.`,
      });
    }
  }

  const matched = codeDigitsMatch && discrepancies.length === 0;
  const summary = matched
    ? `Verificado en arancel oficial: ${official.hsCode} (Ad Valorem ${official.adValoremRate}%, IVA ${official.ivaRate}%, unidad ${official.unit}).`
    : (discrepancies[0]?.detail ?? 'Se detectaron discrepancias contra el arancel oficial.');

  return {
    matched,
    codeDigitsMatch,
    proposedDigits,
    officialDigits,
    adValoremDiff,
    ivaDiff,
    discrepancies,
    summary,
  };
}
