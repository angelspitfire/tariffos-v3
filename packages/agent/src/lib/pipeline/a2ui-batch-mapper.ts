import {
  A2UIBatchManifestComponentSchema,
  A2UIEnvelopeSchema,
  formatHsCode,
  type A2UIBatchItem,
  type A2UIBatchManifestComponent,
  type A2UIEnvelope,
  type BatchItemCandidate,
  type ClassificationLinePayload,
  type HitlClarifyingQuestion,
} from '@tariffos/shared-types';
import {
  HITL_CONFIDENCE_THRESHOLD,
  buildMerceologicalSheet,
  evaluateHitlGate,
} from './merceological-hitl.js';
import type { BatchPipelineResult } from './types.js';

export interface MapBatchToA2UIOptions {
  id?: string;
  title?: string;
  documentReference?: string;
  sourceDoc?: string;
  currencyCode?: string;
  confidenceThreshold?: number;
  shipper?: string;
  consignee?: string;
  routeOrIncoterm?: string;
}

function buildCandidates(line: ClassificationLinePayload): BatchItemCandidate[] {
  return [
    {
      hsCode: formatHsCode(line.hsCode),
      title: line.officialDescription,
      adValoremPercent: line.duties.adValoremRate,
      vatPercent: line.duties.ivaRate,
      legalRegime: 'Principal',
      confidenceLevel: line.confidenceLevel,
      confidencePct: line.confidencePct,
      whyApply: line.confidenceReason,
      whyNot: '— (Clasificación sugerida)',
      recommended: true,
    },
    ...line.alternatives.map((alt) => ({
      hsCode: formatHsCode(alt.code),
      title: alt.desc,
      adValoremPercent: line.duties.adValoremRate,
      vatPercent: line.duties.ivaRate,
      legalRegime: 'Alternativa',
      confidenceLevel: (alt.confLevel === 'alto' ? 'Alto' : alt.confLevel === 'medio' ? 'Medio' : 'Bajo') as 'Alto' | 'Medio' | 'Bajo',
      confidencePct: alt.confPct,
      whyApply: alt.whyApply,
      whyNot: alt.whyNot,
      recommended: false,
    })),
  ];
}

function buildItemQuestions(
  line: ClassificationLinePayload,
  gateQuestions: HitlClarifyingQuestion[],
): HitlClarifyingQuestion[] {
  const unresolvedQuestions: HitlClarifyingQuestion[] = line.unresolved
    .filter((u) => !u.resolved)
    .map((unres, idx) => ({
      id: `q-unres-${line.lineId}-${idx + 1}`,
      fieldKey: `unresolved_${idx + 1}`,
      question: `Confirmar: ${unres.item}`,
      inputType: 'text',
      placeholder: unres.source,
      critical: true,
    }));
  const combined = [...gateQuestions, ...unresolvedQuestions];
  if (combined.length > 0) return combined;
  return [{ id: `q-review-${line.lineId}`, fieldKey: 'technical_confirmation', question: `Confirmar especificaciones técnicas para validar ${formatHsCode(line.hsCode)}`, inputType: 'text', critical: true }];
}

function mapLineToBatchItem(
  line: ClassificationLinePayload,
  index: number,
  options: MapBatchToA2UIOptions,
): A2UIBatchItem {
  const threshold = options.confidenceThreshold ?? HITL_CONFIDENCE_THRESHOLD;
  const needsReview =
    line.tierUsed === 'pre_gate_blocked' ||
    line.confidencePct < threshold ||
    line.unresolved.some((u) => !u.resolved) ||
    line.flags.some((f) => f.type === 'warn' || f.type === 'blocking');

  const sheet = buildMerceologicalSheet({
    id: `sheet-${line.lineId}`,
    description: line.product,
    competingCandidatesCount: line.alternatives.length + 1,
  });
  const gate = evaluateHitlGate({ sheet, confidencePct: line.confidencePct, confidenceThreshold: threshold, mode: 'batch' });
  const permits = line.flags
    .map((f) => f.title.match(/OGA Permit:\s*(.+)/i)?.[1]?.trim())
    .filter((v): v is string => Boolean(v));

  return {
    lineNumber: index + 1,
    description: line.product,
    sourceDoc: options.sourceDoc ?? options.documentReference ?? 'Factura Comercial',
    quantityText: `1 ${line.duties.unit}`,
    fobValue: line.duties.cif,
    currencyCode: options.currencyCode ?? 'USD',
    hsCode: formatHsCode(line.hsCode),
    adValoremPercent: line.duties.adValoremRate,
    vatPercent: line.duties.ivaRate,
    legalRegime: permits.length > 0 ? permits.join(' / ') : 'Libre',
    status: needsReview ? 'needs_review' : 'classified',
    workflowItemState: needsReview ? 'proposed_review' : 'classified',
    confidenceLevel: line.confidenceLevel,
    confidencePct: line.confidencePct,
    confidenceReason: line.confidenceReason,
    merceologicalSheet: sheet,
    candidates: buildCandidates(line),
    ...(needsReview ? { clarifyingQuestions: buildItemQuestions(line, gate.clarifyingQuestions) } : {}),
    rgiPath: line.rgiSteps.map((s) => ({
      rule: s.rule,
      note: s.note,
      items: s.items,
      application: s.items.join('; ') || s.note,
      conclusion: s.conclusion,
    })),
    rejectedAlternatives: line.rejected.map((r) => ({ hsCode: formatHsCode(r.code), reason: r.reason, rule: r.rule })),
    flags: line.flags.map((f) => ({ type: f.type === 'info' ? 'info' : 'warn', title: f.title, text: f.text })),
  };
}

/**
 * Maps a `BatchPipelineResult` into a validated `A2UIBatchManifestComponent`
 * with triage metadata (`needs_review`, clarifying questions, and candidates).
 */
export function mapBatchToA2UIManifest(
  batchResult: BatchPipelineResult,
  options: MapBatchToA2UIOptions = {},
): A2UIBatchManifestComponent {
  return A2UIBatchManifestComponentSchema.parse({
    type: 'batch_manifest',
    id: options.id ?? `batch-${Date.now()}`,
    title: options.title ?? 'Manifiesto de Clasificación en Lote',
    ...(options.documentReference ? { documentReference: options.documentReference } : {}),
    currencyCode: options.currencyCode ?? 'USD',
    items: batchResult.lines.map((line, index) => mapLineToBatchItem(line, index, options)),
  });
}

/**
 * Wraps a `BatchPipelineResult` into a validated `A2UIEnvelope` targeting the
 * `batch_manifest` canvas tab with summary metrics and triage counts.
 */
export function mapBatchToA2UIEnvelope(
  batchResult: BatchPipelineResult,
  options: MapBatchToA2UIOptions = {},
): A2UIEnvelope {
  const manifest = mapBatchToA2UIManifest(batchResult, options);
  const autoClassifiedCount = manifest.items.filter((i) => i.status === 'classified').length;
  const proposedReviewCount = manifest.items.filter((i) => i.status === 'needs_review').length;
  const totalValue = manifest.items.reduce((acc, item) => acc + item.fobValue, 0);
  const avgConfidence = manifest.items.length > 0
    ? Math.round(manifest.items.reduce((acc, item) => acc + (item.confidencePct ?? 0), 0) / manifest.items.length)
    : 0;

  return A2UIEnvelopeSchema.parse({
    assistantMessage: `Lote procesado: ${manifest.items.length} ítems (${autoClassifiedCount} clasificados, ${proposedReviewCount} requieren triage).`,
    classificationStatus: proposedReviewCount > 0 ? 'needs_details' : 'classified',
    workflowState: proposedReviewCount > 0 ? 'proposed_review' : 'classified',
    decision: {
      mode: 'batch',
      outcome: proposedReviewCount > 0 ? 'proposed_review' : 'classified',
      confidencePct: avgConfidence,
      reason: proposedReviewCount > 0
        ? `${proposedReviewCount} ítem(s) requieren confirmación técnica antes del sellado.`
        : 'Todos los ítems del lote superaron el umbral de confianza.',
      missingCriticalFields: [],
      clarifyingQuestions: [],
      autoClassifiedCount,
      proposedReviewCount,
    },
    inlineComponents: [{
      type: 'document_summary',
      id: `doc-summary-${manifest.id}`,
      docTypesDetected: ['commercial_invoice'],
      documentReference: options.documentReference ?? manifest.title,
      ...(options.shipper ? { shipper: options.shipper } : {}),
      ...(options.consignee ? { consignee: options.consignee } : {}),
      ...(options.routeOrIncoterm ? { routeOrIncoterm: options.routeOrIncoterm } : {}),
      totalDeclaredValue: `${manifest.currencyCode} ${totalValue.toFixed(2)}`,
      itemsCount: manifest.items.length,
      isBatch: true,
    }],
    canvasComponents: [manifest],
  });
}
