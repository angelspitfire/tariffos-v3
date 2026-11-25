/**
 * Official customs selectivity channel evaluation (Semáforo Aduanero de Riesgo).
 * Evaluates compliance to assign Green, Yellow, or Red selectivity channel.
 */

export type CustomsChannel = 'green' | 'yellow' | 'red';

export interface ChannelEvaluationInput {
  discrepancyCount: number;
  blockingPermitsCount: number;
  hasTariffConflict: boolean;
  averageConfidence: number;
}

export interface ChannelAssessment {
  channel: CustomsChannel;
  label: string;
  badgeClass: string;
  description: string;
  reasons: string[];
}

export const CONFIDENCE_SELECTIVITY_THRESHOLD = 0.85;

export function evaluateCustomsChannel(input: ChannelEvaluationInput): ChannelAssessment {
  const reasons: string[] = [];

  if (input.blockingPermitsCount > 0) {
    reasons.push(`${input.blockingPermitsCount} requisito(s) regulatorio(s) bloqueante(s) pendiente(s)`);
  }

  if (input.discrepancyCount > 0) {
    reasons.push(`${input.discrepancyCount} discrepancia(s) entre factura comercial y conocimiento de embarque`);
  }

  if (reasons.length > 0) {
    return {
      channel: 'red',
      label: 'Canal Rojo',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      description: 'Reconocimiento Físico y Documental Obligatorio',
      reasons,
    };
  }

  if (input.hasTariffConflict || input.averageConfidence < CONFIDENCE_SELECTIVITY_THRESHOLD) {
    if (input.hasTariffConflict) {
      reasons.push('Duda razonable o conflicto arancelario en evaluación');
    }
    if (input.averageConfidence < CONFIDENCE_SELECTIVITY_THRESHOLD) {
      reasons.push('Certeza arancelaria promedio por debajo del umbral de despacho automático');
    }

    return {
      channel: 'yellow',
      label: 'Canal Amarillo',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      description: 'Revisión Documental Exhaustiva',
      reasons,
    };
  }

  return {
    channel: 'green',
    label: 'Canal Verde',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Levante Automático y Despacho Inmediato',
    reasons: [],
  };
}
