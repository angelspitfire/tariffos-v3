import {
  A2UIEnvelopeSchema,
  type A2UICanvasComponent,
  type A2UIEnvelope,
  type A2UIInlineComponent,
  type ClassificationLinePayload,
} from '@tariffos/shared-types';
import {
  DEFAULT_CUSTOMS_FEE_PERCENT,
  buildCalculatorComponent,
  buildComparisonCandidates,
  buildDossierComponent,
  buildLegalNoticeComponent,
  extractPermitsFromFlags,
  type MapPayloadToA2UIOptions,
} from './a2ui-mapper-helpers.js';
import { applyApprovalPolicyToEnvelope } from './dossier-approval-policy.js';

export type { MapPayloadToA2UIOptions } from './a2ui-mapper-helpers.js';

/**
 * Pure mapper converting a `ClassificationLinePayload` into a schema-validated
 * `A2UIEnvelope` enforcing Section 3.1 mandatory vs. contextual A2UI rules.
 */
export function mapPayloadToA2UIEnvelope(
  payload: ClassificationLinePayload,
  options: MapPayloadToA2UIOptions = {},
): A2UIEnvelope {
  const isBlocked = payload.tierUsed === 'pre_gate_blocked';
  const permits = extractPermitsFromFlags(payload);
  const legalNotice = buildLegalNoticeComponent(payload, permits, options);

  const inlineComponents: A2UIInlineComponent[] = [];
  if (!isBlocked) {
    inlineComponents.push({
      type: 'verdict',
      id: `verdict-${payload.lineId}`,
      hsCode: payload.hsCode,
      description: payload.officialDescription,
      adValoremPercent: payload.duties.adValoremRate,
      vatPercent: payload.duties.ivaRate,
      customsFeePercent: options.customsFeePercent ?? DEFAULT_CUSTOMS_FEE_PERCENT,
      legalRegimeCode: options.legalRegimeCode ?? (permits[0]?.code ?? 'General'),
      legalRegimeSummary:
        options.legalRegimeSummary ??
        (permits.length > 0 ? permits.map((p) => p.code).join(', ') : 'Libre importación (NMF)'),
      confidenceLabel: `${payload.confidenceLevel} (${payload.confidencePct}%)`,
      rgiApplied: payload.rgiSteps.map((s) => s.rule),
      preferredCanvasTab: 'dossier',
    });
  }
  if (legalNotice) inlineComponents.push(legalNotice);

  const canvasComponents: A2UICanvasComponent[] = [
    buildDossierComponent(payload, permits, options, isBlocked),
  ];
  if (payload.alternatives.length > 0) {
    canvasComponents.push({
      type: 'comparison',
      id: `comp-${payload.lineId}`,
      title: `Comparador RGI · ${payload.hsCode}`,
      candidates: buildComparisonCandidates(payload),
    });
  }
  if (payload.duties.cif > 0 || options.includeCalculator) {
    canvasComponents.push(buildCalculatorComponent(payload, options));
  }

  const envelope: A2UIEnvelope = {
    assistantMessage: isBlocked
      ? `BORRADOR — Mercancía bloqueada en Pre-Gate Compliance para ${payload.product}. Requiere revisión legal.`
      : `BORRADOR — Clasificación sugerida ${payload.hsCode} (${payload.confidenceLevel} ${payload.confidencePct}%) para ${payload.product}.`,
    classificationStatus: isBlocked ? 'needs_details' : 'classified',
    workflowState: isBlocked ? 'proposed_review' : 'classified',
    inlineComponents,
    canvasComponents,
    ...(options.merceologicalSheet ? { merceologicalSheet: options.merceologicalSheet } : {}),
    ...(options.webSources?.length ? { webSources: options.webSources } : {}),
    ...(options.reasoningDepth ? { reasoningDepth: options.reasoningDepth } : {}),
  };

  return A2UIEnvelopeSchema.parse(
    applyApprovalPolicyToEnvelope(envelope, options.approvalWorkflowMode ?? 'agent_decides'),
  );
}
