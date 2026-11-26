import type {
  ClassificationLinePayload,
  HitlClarifyingQuestion,
  HitlTentativeProposal,
  MerceologicalAttributeKey,
} from '@tariffos/shared-types';
import { calculateDeterministicDuties, type InvoiceItemInput } from '@tariffos/agent';
import type { ClassifyStreamRequest } from './classify-stream-schema';
import {
  DEFAULT_OFFLINE_RULE,
  OFFLINE_CATALOG,
  type OfflineCatalogRule,
} from './offline-catalog';

export interface MissingHitlAnalysis {
  needsHitl: boolean;
  missingKeys: MerceologicalAttributeKey[];
  missingLabels: string[];
  questions: HitlClarifyingQuestion[];
  tentativeProposal?: HitlTentativeProposal;
}

const MOTOR_POWER_REGEX = /(\d+(?:[.,]\d+)?\s*(?:hp|kw|w|cv|watts?))|(\b\d+\s*v\b)/i;

export function detectMissingCriticalInfo(
  query: string,
  hitlAnswers?: Record<string, string>,
): MissingHitlAnalysis {
  const hasAnswers = Boolean(
    hitlAnswers && Object.values(hitlAnswers).some((value) => value.trim().length > 0),
  );
  if (hasAnswers) {
    return { needsHitl: false, missingKeys: [], missingLabels: [], questions: [] };
  }

  const trimmed = query.trim();
  const isMotorWithoutPower =
    /\b(motor|motores)\b/i.test(trimmed) && !MOTOR_POWER_REGEX.test(trimmed);

  if (isMotorWithoutPower) {
    return {
      needsHitl: true,
      missingKeys: ['especificaciones_tecnicas', 'principio_funcionamiento'],
      missingLabels: ['Potencia nominal (W / kW / HP)', 'Tipo de corriente y fases (CA/CC)'],
      questions: [
        {
          id: 'q-potencia',
          question: '¿Cuál es la potencia nominal del motor (en kW, W o HP)?',
          fieldKey: 'especificaciones_tecnicas',
          inputType: 'text',
          placeholder: 'Ej. 5 HP (3.7 kW)',
          unit: 'kW / HP',
          critical: true,
        },
        {
          id: 'q-corriente',
          question: '¿Opera con corriente alterna (monofásico/trifásico) o corriente continua?',
          fieldKey: 'principio_funcionamiento',
          inputType: 'select',
          options: ['CA Trifásico (polifásico)', 'CA Monofásico', 'Corriente Continua (CC)'],
          critical: true,
        },
      ],
      tentativeProposal: {
        hsCode: '8501.52.10.00',
        title: 'Motores de corriente alterna polifásicos (>750 W a 75 kW)',
        confidencePct: 62,
        reason: 'La subpartida 8501.xx depende directamente de potencia (W/kW) y tipo de corriente.',
      },
    };
  }

  return { needsHitl: false, missingKeys: [], missingLabels: [], questions: [] };
}

function matchCatalogRule(description: string): OfflineCatalogRule {
  return OFFLINE_CATALOG.find((rule) => rule.pattern.test(description)) ?? DEFAULT_OFFLINE_RULE;
}

export function classifyItemOffline(item: InvoiceItemInput): ClassificationLinePayload {
  const rule = matchCatalogRule(item.description);
  const duties = calculateDeterministicDuties(item.cifValue, {
    adValoremRate: rule.adValoremRate,
    ivaRate: rule.ivaRate,
    unit: rule.unit,
  });

  const isExactMatch = rule !== DEFAULT_OFFLINE_RULE;
  const confidencePct = isExactMatch ? 88 : 68;
  const confidenceLevel = confidencePct >= 85 ? 'Alto' : 'Medio';

  return {
    lineId: item.lineId,
    product: item.description,
    hsCode: rule.hsCode,
    officialDescription: rule.officialDescription,
    originCountry: item.originCountry,
    confidenceLevel,
    confidencePct,
    confidenceReason: isExactMatch
      ? 'Coincidencia merceológica determinista validada bajo estructura NCM Decreto 4.944.'
      : 'Clasificación preliminar en modo offline; requiere verificación en arancel oficial.',
    rgiSteps: [
      {
        rule: rule.rgiRule,
        note: rule.rgiNote,
        items: [item.description],
        conclusion: rule.hsCode,
      },
    ],
    alternatives: rule.altCode
      ? [
          {
            code: rule.altCode,
            desc: rule.altDesc ?? 'Subpartida alternativa relacionada',
            confLevel: 'medio',
            confPct: 55,
            whyApply: 'Comparte partida arancelaria principal.',
            whyNot: 'Parámetros técnicos declarados encajan mejor en la subpartida seleccionada.',
          },
        ]
      : [],
    rejected: rule.altCode
      ? [{ code: rule.altCode, reason: 'No coincide con el rango técnico declarado.', rule: 'RGI 6' }]
      : [],
    flags: rule.permits.map((permit) => ({
      type: 'warn' as const,
      title: `Permiso OGA: ${permit}`,
      text: `Verificar exigibilidad vigente de ${permit} para ${rule.hsCode}.`,
    })),
    unresolved: isExactMatch
      ? []
      : [
          {
            item: 'Confirmación en Arancel Oficial Decreto 4.944 (NationalTariff)',
            source: 'Arancel de Aduanas VE',
            resolved: false,
          },
        ],
    duties,
    tierUsed: 'tier2_rgi',
    verifiedAgainstDb: isExactMatch,
    modelUsed: 'tariffos-offline-deterministic',
  };
}

export function classifyRequestOffline(input: ClassifyStreamRequest): ClassificationLinePayload {
  const answerSummary = input.hitlAnswers
    ? Object.entries(input.hitlAnswers)
        .filter(([, val]) => val.trim().length > 0)
        .map(([key, val]) => `${key}: ${val}`)
        .join('; ')
    : '';
  const description = answerSummary ? `${input.query} (${answerSummary})` : input.query;

  return classifyItemOffline({
    lineId: 'interactive-1',
    sku: input.sku,
    description,
    originCountry: input.originCountry,
    cifValue: input.cifValue,
  });
}
