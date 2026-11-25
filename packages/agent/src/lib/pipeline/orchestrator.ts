import type { ClassificationLinePayload, ComplianceFlag } from '@tariffos/shared-types';
import { calculateDeterministicDuties } from './duties.js';
import { deduplicateInvoiceItems } from './dedup.js';
import { runCompliancePreGate } from './pre-gate.js';
import {
  DEFAULT_MAX_WEB_GROUNDING_STANDARD,
  HIGH_CONFIDENCE_THRESHOLD,
  SHORT_DESCRIPTION_WORD_THRESHOLD,
  type BatchPipelineResult,
  type InvoiceItemInput,
  type PipelinePorts,
  type PipelineRunOptions,
  type TariffCandidateRecord,
} from './types.js';

const DEFAULT_BATCH_CONCURRENCY = 5;
const TIER1_SCORE_GAP_THRESHOLD = 0.25;
const TIER1_MIN_TOP_SCORE = 0.85;
const MAX_CANDIDATES_FOR_NOTES = 3;

export interface GroundingBudget {
  remaining: number;
  used: number;
}

function isShortDescription(description: string): boolean {
  const words = description.trim().split(/\s+/).filter(Boolean);
  return words.length < SHORT_DESCRIPTION_WORD_THRESHOLD;
}

function buildProhibitedPayload(
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
    duties: {
      cif: item.cifValue,
      adValoremRate: 0,
      arancelAmount: 0,
      ivaRate: 0,
      ivaAmount: 0,
      unit: item.unit ?? 'u',
    },
    tierUsed: 'pre_gate_blocked',
    verifiedAgainstDb: false,
    modelUsed: 'system-one-pregate',
  };
}

function canUseTier1FastPath(candidates: TariffCandidateRecord[]): boolean {
  const top = candidates[0];
  if (!top || typeof top.score !== 'number') return false;
  if (top.score < TIER1_MIN_TOP_SCORE) return false;
  const second = candidates[1];
  if (!second || typeof second.score !== 'number') return true;
  return top.score - second.score >= TIER1_SCORE_GAP_THRESHOLD;
}

function mergeTariffFlags(
  baseFlags: ComplianceFlag[],
  verified: TariffCandidateRecord,
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
  return flags;
}

async function classifyUniqueItem(
  item: InvoiceItemInput,
  ports: PipelinePorts,
  options: PipelineRunOptions,
  budget: GroundingBudget,
): Promise<ClassificationLinePayload> {
  // 1. Pre-Gate Compliance (System One)
  const preGate = await runCompliancePreGate(item, options.countryCode, ports.decisionProvider);
  if (preGate.blocked && preGate.flag) {
    return buildProhibitedPayload(item, preGate.flag, preGate.confidence);
  }

  // 2. Tier 0: Exact SKU / approved precedent lookup
  const precedentKey = item.sku?.trim() || item.description;
  const precedent = await ports.findSkuPrecedent(options.tenantId, precedentKey);
  if (precedent?.approvedByBroker) {
    const verified = await ports.verifyHsCode(options.countryCode, precedent.hsCode);
    if (verified) {
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
        flags: mergeTariffFlags([], verified),
        unresolved: [],
        duties: calculateDeterministicDuties(item.cifValue, verified),
        tierUsed: 'tier0_sku',
        verifiedAgainstDb: true,
        modelUsed: 'product-master-cache',
      };
    }
  }

  // 3. Retrieval + Tier 1 Fast-Path check
  const candidates = await ports.searchTariffCandidates(options.countryCode, item.description);
  const topCandidate = candidates[0];
  if (topCandidate && canUseTier1FastPath(candidates)) {
    const verified = await ports.verifyHsCode(options.countryCode, topCandidate.hsCode);
    if (verified) {
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
          {
            rule: 'RGI 1',
            note: 'Direct tariff text match',
            items: [verified.description],
            conclusion: verified.hsCode,
          },
        ],
        alternatives: [],
        rejected: [],
        flags: mergeTariffFlags([], verified),
        unresolved: [],
        duties: calculateDeterministicDuties(item.cifValue, verified),
        tierUsed: 'tier1_fast',
        verifiedAgainstDb: true,
        modelUsed: 'tier1-fast-path',
      };
    }
  }

  // 4. Optional Web Grounding (bounded in Standard mode, expanded in Deep mode)
  let webContext: string | undefined;
  const needsGrounding = Boolean(options.deepMode) || isShortDescription(item.description);
  if (needsGrounding && ports.fetchWebSpecs && budget.remaining > 0) {
    budget.remaining -= 1;
    budget.used += 1;
    webContext = (await ports.fetchWebSpecs(item.description)) ?? undefined;
  }

  // 5. Tier 2: RGI 1 -> 6 Reasoning + DB Legal Notes + Official Verification
  const prefixes = [...new Set(candidates.slice(0, MAX_CANDIDATES_FOR_NOTES).map((c) => c.hsCode.slice(0, 4)))];
  const noteBatches = await Promise.all(prefixes.map((p) => ports.getLegalNotes(options.countryCode, p)));
  const notes = noteBatches.flat();

  const rgi = await ports.runRgiReasoning({
    item,
    candidates,
    notes,
    webContext,
    deepMode: Boolean(options.deepMode),
  });

  const verified = await ports.verifyHsCode(options.countryCode, rgi.hsCode);
  const fallbackRecord = verified ?? topCandidate ?? {
    hsCode: rgi.hsCode,
    description: 'Unverified HS code — manual tariff check required',
    adValoremRate: 0,
    ivaRate: 0,
    unit: item.unit ?? 'u',
  };

  const flags = mergeTariffFlags(rgi.flags, fallbackRecord);
  const unresolved = [...rgi.unresolved];
  if (!verified) {
    unresolved.push({
      item: `Verify ${rgi.hsCode} in official national tariff`,
      source: 'NationalTariff DB',
      resolved: false,
    });
  }

  const confidencePct = verified
    ? rgi.confidencePct
    : Math.min(rgi.confidencePct, HIGH_CONFIDENCE_THRESHOLD - 1);

  return {
    lineId: item.lineId,
    product: item.description,
    hsCode: fallbackRecord.hsCode,
    officialDescription: fallbackRecord.description,
    originCountry: item.originCountry,
    confidenceLevel: verified ? rgi.confidenceLevel : 'Medio',
    confidencePct,
    confidenceReason: rgi.confidenceReason,
    rgiSteps: rgi.rgiSteps,
    alternatives: rgi.alternatives,
    rejected: rgi.rejected,
    flags,
    unresolved,
    duties: calculateDeterministicDuties(item.cifValue, fallbackRecord),
    tierUsed: 'tier2_rgi',
    verifiedAgainstDb: Boolean(verified),
    modelUsed: rgi.modelUsed,
  };
}

function projectToLine(
  template: ClassificationLinePayload,
  member: InvoiceItemInput,
  verifiedTariff: Pick<TariffCandidateRecord, 'adValoremRate' | 'ivaRate' | 'unit'>,
): ClassificationLinePayload {
  if (member.lineId === template.lineId) return template;
  return {
    ...template,
    lineId: member.lineId,
    duties: calculateDeterministicDuties(member.cifValue, verifiedTariff),
  };
}

/**
 * Run the unified pipeline over an invoice batch with deduplication,
 * bounded web grounding, and deterministic duty calculation per line.
 */
export async function classifyInvoiceBatch(
  items: InvoiceItemInput[],
  ports: PipelinePorts,
  options: PipelineRunOptions,
): Promise<BatchPipelineResult> {
  const groups = deduplicateInvoiceItems(items);
  const maxGrounding =
    options.maxWebGrounding ??
    (options.deepMode ? Number.MAX_SAFE_INTEGER : DEFAULT_MAX_WEB_GROUNDING_STANDARD);

  const budget: GroundingBudget = { remaining: maxGrounding, used: 0 };
  const resultsByLine = new Map<string, ClassificationLinePayload>();

  let blockedByPreGate = 0;
  let tier0Hits = 0;
  let tier1Hits = 0;
  let tier2Hits = 0;

  for (let i = 0; i < groups.length; i += DEFAULT_BATCH_CONCURRENCY) {
    const chunk = groups.slice(i, i + DEFAULT_BATCH_CONCURRENCY);
    const chunkResults = await Promise.all(
      chunk.map(async (group) => {
        const classified = await classifyUniqueItem(group.representative, ports, options, budget);
        return { group, classified };
      }),
    );

    for (const { group, classified } of chunkResults) {
      if (classified.tierUsed === 'pre_gate_blocked') blockedByPreGate += group.members.length;
      if (classified.tierUsed === 'tier0_sku') tier0Hits += group.members.length;
      if (classified.tierUsed === 'tier1_fast') tier1Hits += group.members.length;
      if (classified.tierUsed === 'tier2_rgi') tier2Hits += group.members.length;

      for (const member of group.members) {
        resultsByLine.set(
          member.lineId,
          projectToLine(classified, member, classified.duties),
        );
      }
    }
  }

  return {
    lines: items.map((item) => resultsByLine.get(item.lineId)!),
    stats: {
      totalLines: items.length,
      uniqueItems: groups.length,
      blockedByPreGate,
      tier0Hits,
      tier1Hits,
      tier2Hits,
      webGroundingUsed: budget.used,
    },
  };
}
