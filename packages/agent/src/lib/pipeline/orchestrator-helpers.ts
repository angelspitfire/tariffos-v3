import type { ClassificationLinePayload, ComplianceFlag, UnresolvedItem } from '@tariffos/shared-types';
import { calculateDeterministicDuties } from './duties.js';
import type { TariffAuditResult } from './tariff-validator.js';
import {
  SHORT_DESCRIPTION_WORD_THRESHOLD,
  type InvoiceItemInput,
  type SkuPrecedentRecord,
  type TariffCandidateRecord,
} from './types.js';

const TIER1_SCORE_GAP_THRESHOLD = 0.25;
const TIER1_MIN_TOP_SCORE = 0.85;

export function isShortDescription(description: string): boolean {
  return description.trim().split(/\s+/).filter(Boolean).length < SHORT_DESCRIPTION_WORD_THRESHOLD;
}

export function canUseTier1FastPath(candidates: TariffCandidateRecord[]): boolean {
  const top = candidates[0];
  if (!top || typeof top.score !== 'number' || top.score < TIER1_MIN_TOP_SCORE) return false;
  const second = candidates[1];
  if (!second || typeof second.score !== 'number') return true;
  return top.score - second.score >= TIER1_SCORE_GAP_THRESHOLD;
}

export function buildProhibitedPayload(
  item: InvoiceItemInput,
  flag: ComplianceFlag,
  confidence: number,
): ClassificationLinePayload {
  return {
    lineId: item.lineId,
    product: item.description,
    hsCode: '0000.00.00.00',
    officialDescription: 'Blocked by Pre-Gate Compliance — requires legal review',
    originCountry: item.originCountry,
    confidenceLevel: 'Bajo',
    confidencePct: Math.round(confidence * 100),
    confidenceReason: flag.text,
    rgiSteps: [],
    alternatives: [],
    rejected: [],
    flags: [flag],
    unresolved: [
      {
        item: 'National tariff prohibition / restricted status verification',
        source: 'Official Tariff & OGA Compliance',
        resolved: false,
      },
    ],
    duties: { cif: item.cifValue, adValoremRate: 0, arancelAmount: 0, ivaRate: 0, ivaAmount: 0, unit: item.unit ?? 'u' },
    tierUsed: 'pre_gate_blocked',
    verifiedAgainstDb: false,
    modelUsed: 'system-one-pregate',
  };
}

export function mergeTariffFlags(
  baseFlags: ComplianceFlag[],
  verified: TariffCandidateRecord,
  audit?: TariffAuditResult,
): ComplianceFlag[] {
  const flags = [...baseFlags];
  if (verified.prohibited) {
    flags.unshift({
      type: 'blocking',
      title: 'Prohibited Tariff Code',
      text: `Official tariff marks ${verified.hsCode} as prohibited/restricted.`,
    });
  }
  for (const permit of verified.permits ?? []) {
    flags.push({
      type: 'warn',
      title: `OGA Permit: ${permit}`,
      text: `Required regulatory clearance (${permit}) for ${verified.hsCode}.`,
    });
  }
  if (audit && !audit.matched) {
    flags.push({ type: 'warn', title: 'Auditoría Arancel Oficial', text: audit.summary });
  }
  return flags;
}

export function buildTier0Payload(
  item: InvoiceItemInput,
  precedent: SkuPrecedentRecord,
  verified: TariffCandidateRecord,
  audit: TariffAuditResult,
): ClassificationLinePayload {
  return {
    lineId: item.lineId,
    product: item.description,
    hsCode: verified.hsCode,
    officialDescription: verified.description,
    originCountry: item.originCountry,
    confidenceLevel: 'Alto',
    confidencePct: precedent.confidencePct,
    confidenceReason: 'Approved SKU precedent verified against current national tariff.',
    rgiSteps: [],
    alternatives: [],
    rejected: [],
    flags: mergeTariffFlags([], verified, audit),
    unresolved: [],
    duties: calculateDeterministicDuties(item.cifValue, verified),
    tierUsed: 'tier0_sku',
    verifiedAgainstDb: true,
    modelUsed: 'product-master-cache',
  };
}

export function buildTier1Payload(
  item: InvoiceItemInput,
  topCandidate: TariffCandidateRecord,
  verified: TariffCandidateRecord,
  audit: TariffAuditResult,
): ClassificationLinePayload {
  return {
    lineId: item.lineId,
    product: item.description,
    hsCode: verified.hsCode,
    officialDescription: verified.description,
    originCountry: item.originCountry,
    confidenceLevel: 'Alto',
    confidencePct: Math.round((topCandidate.score ?? 0.9) * 100),
    confidenceReason: 'Clear retrieval match verified against national tariff.',
    rgiSteps: [
      { rule: 'RGI 1', note: 'Direct tariff text match', items: [verified.description], conclusion: verified.hsCode },
    ],
    alternatives: [],
    rejected: [],
    flags: mergeTariffFlags([], verified, audit),
    unresolved: [],
    duties: calculateDeterministicDuties(item.cifValue, verified),
    tierUsed: 'tier1_fast',
    verifiedAgainstDb: true,
    modelUsed: 'tier1-fast-path',
  };
}

export function appendAuditUnresolved(
  baseUnresolved: UnresolvedItem[],
  hsCode: string,
  audit: TariffAuditResult,
): UnresolvedItem[] {
  const unresolved = [...baseUnresolved];
  if (!audit.codeDigitsMatch) {
    unresolved.push({ item: `Verify ${hsCode} in official national tariff`, source: 'NationalTariff DB', resolved: false });
  }
  return unresolved;
}

export function projectToLine(
  template: ClassificationLinePayload,
  member: InvoiceItemInput,
  verifiedTariff: Pick<TariffCandidateRecord, 'adValoremRate' | 'ivaRate' | 'unit'>,
): ClassificationLinePayload {
  if (member.lineId === template.lineId) return template;
  return { ...template, lineId: member.lineId, duties: calculateDeterministicDuties(member.cifValue, verifiedTariff) };
}
