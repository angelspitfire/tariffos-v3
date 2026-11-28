import {
  A2UIEnvelopeSchema,
  formatHsCode,
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
import { INSUFFICIENT_SPEC_SOURCE } from './insufficient-spec-guard.js';

export type { MapPayloadToA2UIOptions } from './a2ui-mapper-helpers.js';

function buildAssistantMessage(
  payload: ClassificationLinePayload,
  formattedHsCode: string,
  isBlocked: boolean,
): string {
  const header = 'BORRADOR — REVISIÓN DE AGENTE ADUANAL / COMPLIANCE REQUERIDA.';
  if (isBlocked) {
    return `${header} Mercancía bloqueada en Pre-Gate Compliance para ${payload.product}. Requiere revisión legal.`;
  }

  const parts = [
    header,
    `Clasificación sugerida ${formattedHsCode} (${payload.confidenceLevel} ${payload.confidencePct}%) para ${payload.product}: ${payload.confidenceReason}`,
  ];
  const pending = payload.unresolved
    .filter((u) => !u.resolved)
    .slice(0, 2)
    .map((u) => u.item);
  if (pending.length > 0) {
    parts.push(`Pendiente por confirmar: ${pending.join('; ')}.`);
  }
  parts.push(
    'Revisa el dictamen interactivo en el panel derecho o indícame si deseas calcular tributos CIF, evaluar alternativas o clasificar ítems complementarios.',
  );
  return parts.join(' ');
}

/**
 * Pure mapper converting a `ClassificationLinePayload` into a schema-validated
 * `A2UIEnvelope` enforcing Section 3.1 mandatory vs. contextual A2UI rules.
 */
export function mapPayloadToA2UIEnvelope(
  payload: ClassificationLinePayload,
  options: MapPayloadToA2UIOptions = {},
): A2UIEnvelope {
  const isBlocked = payload.tierUsed === 'pre_gate_blocked';
  const formattedHsCode = formatHsCode(payload.hsCode);
  const permits = extractPermitsFromFlags(payload);
  const legalNotice = buildLegalNoticeComponent(payload, permits, options);

  const inlineComponents: A2UIInlineComponent[] = [];
  if (!isBlocked) {
    inlineComponents.push({
      type: 'verdict',
      id: `verdict-${payload.lineId}`,
      hsCode: formattedHsCode,
      description: payload.officialDescription,
      adValoremPercent: payload.duties.adValoremRate,
      vatPercent: payload.duties.ivaRate,
      customsFeePercent:
        options.customsFeePercent ??
        payload.duties.customsFeeRate ??
        DEFAULT_CUSTOMS_FEE_PERCENT,
      statisticalUnit: payload.duties.unit,
      legalRegimeCode: options.legalRegimeCode ?? (permits[0]?.code ?? 'General'),
      legalRegimeSummary:
        options.legalRegimeSummary ??
        (permits.length > 0 ? permits.map((p) => p.code).join(', ') : 'Libre importación (NMF)'),
      confidenceLabel: `${payload.confidenceLevel} (${payload.confidencePct}%)`,
      rgiApplied: Array.from(new Set(payload.rgiSteps.map((s) => s.rule.trim()).filter(Boolean))),
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
      title: `Comparador RGI · ${formattedHsCode}`,
      candidates: buildComparisonCandidates(payload),
    });
  }
  if (payload.duties.cif > 0 || options.includeCalculator) {
    canvasComponents.push(buildCalculatorComponent(payload, options));
  }

  const needsDetails =
    isBlocked ||
    payload.unresolved.some((u) => !u.resolved && u.source === INSUFFICIENT_SPEC_SOURCE);

  const envelope: A2UIEnvelope = {
    assistantMessage: buildAssistantMessage(payload, formattedHsCode, isBlocked),
    classificationStatus: needsDetails ? 'needs_details' : 'classified',
    workflowState: needsDetails ? 'proposed_review' : 'classified',
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
