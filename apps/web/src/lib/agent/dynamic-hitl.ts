import {
  buildMerceologicalSheet,
  evaluateHitlGate,
  type TariffCandidateRecord,
} from '@tariffos/agent';
import {
  A2UIEnvelopeSchema,
  formatHsCode,
  type A2UIEnvelope,
} from '@tariffos/shared-types';
import type { ClassifyStreamRequest } from './classify-stream-schema';

const SHORT_QUERY_WORDS = 3;
const CLEAR_MATCH_SCORE = 0.88;
const COMPETING_MATCH_SCORE = 0.78;
const TOP_HEADINGS_SLICE = 5;

function hasUserHitlAnswers(hitlAnswers?: Record<string, string>): boolean {
  if (!hitlAnswers) return false;
  return Object.values(hitlAnswers).some((val) => val.trim().length > 0);
}

/**
 * Post-retrieval HITL gate for live cloud classifications. Replaces the static
 * `"motor"` regex by inspecting merceological attribute coverage alongside the
 * ambiguity of retrieved `NationalTariff` / `TariffNodeEmbedding` candidates.
 */
export function evaluateDynamicHitl(input: {
  query: string;
  attachmentsText?: string;
  hitlAnswers?: Record<string, string>;
  candidates: TariffCandidateRecord[];
  deepMode?: boolean;
}): A2UIEnvelope | null {
  if (hasUserHitlAnswers(input.hitlAnswers) || input.candidates.length === 0) {
    return null;
  }

  const combinedText = [input.query, input.attachmentsText].filter(Boolean).join('\n').trim();
  const wordCount = combinedText.split(/\s+/).filter(Boolean).length;

  const topFive = input.candidates.slice(0, TOP_HEADINGS_SLICE);
  const distinctHeadings4 = new Set(
    topFive
      .map((c) => c.hsCode.replace(/[^0-9]/g, '').slice(0, 4))
      .filter((h) => h.length === 4),
  ).size;
  const topScore = input.candidates[0]?.score ?? 0;

  const sheet = buildMerceologicalSheet({
    description: combinedText,
    competingCandidatesCount: distinctHeadings4,
    confirmedByUser: false,
  });

  if (sheet.missingCriticalKeys.length === 0) {
    return null;
  }

  const hasTechSpecs = sheet.attributes.some(
    (attr) => attr.key === 'especificaciones_tecnicas' && attr.provenance !== 'missing',
  );
  const isShortAmbiguous =
    wordCount <= SHORT_QUERY_WORDS && !hasTechSpecs && topScore < CLEAR_MATCH_SCORE;
  const isHeadingTie =
    distinctHeadings4 >= 2 &&
    topScore < COMPETING_MATCH_SCORE &&
    sheet.missingCriticalKeys.length >= 2;

  if (!isShortAmbiguous && !isHeadingTie) {
    return null;
  }

  const topCandidate = input.candidates[0];
  const gate = evaluateHitlGate({
    sheet,
    confidencePct: topCandidate?.score ? Math.round(topCandidate.score * 100) : undefined,
    topCandidate: topCandidate
      ? {
          hsCode: formatHsCode(topCandidate.hsCode),
          title: topCandidate.description,
          confidencePct: Math.round((topCandidate.score ?? 0.65) * 100),
        }
      : undefined,
  });

  if (!gate.needsInput) {
    return null;
  }

  const now = Date.now();
  return A2UIEnvelopeSchema.parse({
    assistantMessage:
      'BORRADOR — Antes de emitir el dictamen definitivo de 10 dígitos, confirma los datos técnicos faltantes en la ficha merceológica.',
    classificationStatus: 'needs_details',
    workflowState: 'needs_input',
    decision: gate.decision,
    inlineComponents: [
      {
        type: 'merceological_sheet',
        id: `ms-${now}`,
        mode: 'hitl_validation',
        title: 'Ficha Merceológica — Validación HITL',
        subtitle:
          'Completa los parámetros merceológicos críticos para resolver entre las subpartidas candidatas.',
        sheet,
        allowWebEnrich: true,
      },
      {
        type: 'questionnaire',
        id: `q-${now}`,
        title: 'Datos técnicos requeridos',
        fields: gate.clarifyingQuestions.map((q) => ({
          id: q.fieldKey,
          label: q.question,
          fieldType: q.inputType,
          options: q.options,
          placeholder: q.placeholder,
          unit: q.unit,
        })),
      },
    ],
    canvasComponents: [],
    merceologicalSheet: sheet,
    reasoningDepth: input.deepMode ? 'deep' : 'standard',
  });
}

export function buildFullClassificationDescription(input: ClassifyStreamRequest): string {
  const parts = [input.query];
  if (input.attachmentsText) {
    parts.push(`Contexto adjunto: ${input.attachmentsText}`);
  }
  if (input.hitlAnswers) {
    const answerSummary = Object.entries(input.hitlAnswers)
      .filter(([, val]) => val.trim().length > 0)
      .map(([key, val]) => `${key}: ${val.trim()}`)
      .join('; ');
    if (answerSummary) {
      parts.push(`Especificaciones confirmadas: ${answerSummary}`);
    }
  }
  return parts.join('\n');
}
