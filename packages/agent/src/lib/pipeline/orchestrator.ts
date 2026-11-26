import { formatHsCode, type ClassificationLinePayload } from '@tariffos/shared-types';
import { calculateDeterministicDuties } from './duties.js';
import { deduplicateInvoiceItems } from './dedup.js';
import { expandSiblingsForRgi, filterLegalNotesByChapter, retrieveHybridCandidates } from './hybrid-retrieval.js';
import {
  appendAuditUnresolved, buildProhibitedPayload, buildTier0Payload, buildTier1Payload,
  canUseTier1FastPath, isShortDescription, mergeTariffFlags, projectToLine,
} from './orchestrator-helpers.js';
import { runCompliancePreGate } from './pre-gate.js';
import { auditTariffAgainstOfficialSchedule } from './tariff-validator.js';
import {
  DEFAULT_MAX_WEB_GROUNDING_STANDARD, HIGH_CONFIDENCE_THRESHOLD,
  type BatchPipelineResult, type InvoiceItemInput, type PipelinePorts, type PipelineRunOptions,
} from './types.js';

const DEFAULT_BATCH_CONCURRENCY = 5;
const MAX_CANDIDATES_FOR_NOTES = 3;

export interface GroundingBudget {
  remaining: number;
  used: number;
}

async function classifyUniqueItem(
  item: InvoiceItemInput,
  ports: PipelinePorts,
  options: PipelineRunOptions,
  budget: GroundingBudget,
): Promise<ClassificationLinePayload> {
  // 1. Pre-Gate Compliance (System One)
  options.onProgress?.({ stage: 'pre_gate', label: 'Validación Compliance Pre-Gate', progressPct: 15 });
  const preGate = await runCompliancePreGate(item, options.countryCode, ports.decisionProvider);
  if (preGate.blocked && preGate.flag) {
    return buildProhibitedPayload(item, preGate.flag, preGate.confidence);
  }

  // 2. Tier 0: Exact SKU / approved precedent lookup
  options.onProgress?.({ stage: 'sku_lookup', label: 'Consultando precedentes SKU', progressPct: 30 });
  const precedentKey = item.sku?.trim() || item.description;
  const precedent = await ports.findSkuPrecedent(options.tenantId, precedentKey);
  if (precedent?.approvedByBroker) {
    const verified = await ports.verifyHsCode(options.countryCode, precedent.hsCode);
    const audit = auditTariffAgainstOfficialSchedule({ proposedHsCode: precedent.hsCode }, verified);
    if (verified && audit.codeDigitsMatch) {
      return buildTier0Payload(item, precedent, verified, audit);
    }
  }

  // 3. Hybrid Retrieval (pgvector + FTS lexical) + Tier 1 Fast-Path check
  options.onProgress?.({ stage: 'hybrid_retrieval', label: 'Recuperando candidatas NCM oficiales', progressPct: 50 });
  const candidates = await retrieveHybridCandidates(ports, options.countryCode, item.description);
  const topCandidate = candidates[0];
  if (topCandidate && canUseTier1FastPath(candidates)) {
    const verified = await ports.verifyHsCode(options.countryCode, topCandidate.hsCode);
    const audit = auditTariffAgainstOfficialSchedule({ proposedHsCode: topCandidate.hsCode }, verified);
    if (verified && audit.codeDigitsMatch) {
      return buildTier1Payload(item, topCandidate, verified, audit);
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

  // 5. Tier 2: Expand sibling 6-digit subheadings, RGI 1 -> 6 Reasoning, Legal Notes & Audit
  options.onProgress?.({ stage: 'rgi_reasoning', label: 'Aplicando recorrido RGI 1 → 6', progressPct: 72 });
  const rgiCandidates = await expandSiblingsForRgi(ports, options.countryCode, candidates);

  const topCandidates = rgiCandidates.slice(0, MAX_CANDIDATES_FOR_NOTES);
  const prefixes = [...new Set(topCandidates.map((c) => c.hsCode.slice(0, 4)))];
  const noteBatches = await Promise.all(prefixes.map((p) => ports.getLegalNotes(options.countryCode, p)));
  const notes = filterLegalNotesByChapter(
    noteBatches.flat(),
    topCandidates.map((c) => c.hsCode),
  );

  const rgi = await ports.runRgiReasoning({
    item,
    candidates: rgiCandidates,
    notes,
    webContext,
    deepMode: Boolean(options.deepMode),
  });

  options.onProgress?.({ stage: 'verifying_tariff', label: 'Verificando código en Arancel Oficial y tributos', progressPct: 90 });
  const verified = await ports.verifyHsCode(options.countryCode, rgi.hsCode);
  const audit = auditTariffAgainstOfficialSchedule({ proposedHsCode: rgi.hsCode }, verified);
  const fallbackRecord = verified ?? topCandidate ?? {
    hsCode: rgi.hsCode,
    description: 'Unverified HS code — manual tariff check required',
    adValoremRate: 0,
    ivaRate: 0,
    unit: item.unit ?? 'u',
  };

  const formattedHsCode = formatHsCode(fallbackRecord.hsCode);
  const flags = mergeTariffFlags(rgi.flags, fallbackRecord, audit, {
    countryCode: options.countryCode,
    originCountry: item.originCountry,
  });
  const unresolved = appendAuditUnresolved(rgi.unresolved, formattedHsCode, audit);
  const isVerified = Boolean(verified && audit.codeDigitsMatch);
  const confidencePct = isVerified
    ? rgi.confidencePct
    : Math.min(rgi.confidencePct, HIGH_CONFIDENCE_THRESHOLD - 1);

  return {
    lineId: item.lineId,
    product: item.description,
    hsCode: formattedHsCode,
    officialDescription: fallbackRecord.description,
    originCountry: item.originCountry,
    confidenceLevel: isVerified ? rgi.confidenceLevel : 'Medio',
    confidencePct,
    confidenceReason: rgi.confidenceReason,
    rgiSteps: rgi.rgiSteps,
    alternatives: rgi.alternatives.map((alt) => ({ ...alt, code: formatHsCode(alt.code) })),
    rejected: rgi.rejected.map((rej) => ({ ...rej, code: formatHsCode(rej.code) })),
    flags,
    unresolved,
    duties: calculateDeterministicDuties(item.cifValue, fallbackRecord),
    tierUsed: 'tier2_rgi',
    verifiedAgainstDb: isVerified,
    modelUsed: rgi.modelUsed,
    ...(rgi.tokenUsage ? { tokenUsage: rgi.tokenUsage } : {}),
  };
}

/**
 * Run the unified pipeline over an invoice batch with deduplication,
 * hybrid retrieval, bounded web grounding, and deterministic duty calculation per line.
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
      chunk.map(async (group) => ({
        group,
        classified: await classifyUniqueItem(group.representative, ports, options, budget),
      })),
    );

    for (const { group, classified } of chunkResults) {
      if (classified.tierUsed === 'pre_gate_blocked') blockedByPreGate += group.members.length;
      if (classified.tierUsed === 'tier0_sku') tier0Hits += group.members.length;
      if (classified.tierUsed === 'tier1_fast') tier1Hits += group.members.length;
      if (classified.tierUsed === 'tier2_rgi') tier2Hits += group.members.length;

      for (const member of group.members) {
        resultsByLine.set(member.lineId, projectToLine(classified, member, classified.duties));
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
