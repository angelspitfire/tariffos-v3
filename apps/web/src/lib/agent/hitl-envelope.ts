import {
  A2UIEnvelopeSchema,
  type A2UIEnvelope,
  type A2UIMerceologicalSheet,
} from '@tariffos/shared-types';
import type { ClassifyStreamRequest } from './classify-stream-schema';
import type { MissingHitlAnalysis } from './offline-classifier';

export function buildHitlEnvelope(
  input: ClassifyStreamRequest,
  analysis: MissingHitlAnalysis,
): A2UIEnvelope {
  const sheet: A2UIMerceologicalSheet = {
    id: `sheet-${Date.now()}`,
    productName: input.query,
    summary: `Faltan datos técnicos críticos para determinar la subpartida NCM de "${input.query}".`,
    attributes: [
      {
        key: 'naturaleza_materia',
        label: 'Descripción declarada',
        category: 'morphological',
        value: input.query,
        provenance: 'user_input',
        weight: 20,
        critical: true,
      },
      ...analysis.missingKeys.map((key, idx) => ({
        key,
        label: analysis.missingLabels[idx] ?? key,
        category: 'technical' as const,
        value: '',
        provenance: 'missing' as const,
        weight: 30,
        critical: true,
        placeholder: analysis.questions[idx]?.placeholder,
      })),
    ],
    missingCriticalKeys: analysis.missingKeys,
    missingCriticalLabels: analysis.missingLabels,
    webSearchTriggered: false,
    webSearchReason: 'Se requiere confirmación técnica del operador antes de cerrar la subpartida.',
    confidenceBreakdown: {
      baseScore: 90,
      penaltyPoints: 30,
      finalScore: 60,
      level: 'Medio',
      penalties: analysis.missingLabels.map((label, idx) => ({
        key: analysis.missingKeys[idx] ?? `missing-${idx}`,
        label,
        points: 15,
        reason: 'Atributo crítico faltante para aplicar RGI 6.',
      })),
    },
    confirmedByUser: false,
    updatedAt: new Date().toISOString(),
  };

  return A2UIEnvelopeSchema.parse({
    assistantMessage:
      'BORRADOR — Antes de emitir el dictamen definitivo de 10 dígitos, confirma los datos técnicos faltantes en la ficha merceológica.',
    classificationStatus: 'needs_details',
    workflowState: 'needs_input',
    decision: {
      mode: 'individual',
      outcome: 'needs_input',
      confidencePct: analysis.tentativeProposal?.confidencePct ?? 60,
      reason: 'Faltan especificaciones técnicas determinantes para RGI 6.',
      missingCriticalFields: analysis.missingLabels,
      clarifyingQuestions: analysis.questions,
      tentativeProposal: analysis.tentativeProposal,
    },
    inlineComponents: [
      {
        type: 'merceological_sheet',
        id: `ms-${Date.now()}`,
        mode: 'hitl_validation',
        title: 'Ficha Merceológica — Validación HITL',
        subtitle: 'Completa los parámetros críticos para calcular la subpartida NCM exacta.',
        sheet,
        allowWebEnrich: true,
      },
      {
        type: 'questionnaire',
        id: `q-${Date.now()}`,
        title: 'Datos técnicos requeridos',
        fields: analysis.questions.map((q) => ({
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
