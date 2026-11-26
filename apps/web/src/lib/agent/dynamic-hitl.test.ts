import { describe, expect, it } from 'vitest';
import type { TariffCandidateRecord } from '@tariffos/agent';
import { evaluateDynamicHitl } from './dynamic-hitl';

function makeCandidate(hsCode: string, description: string, score: number): TariffCandidateRecord {
  return {
    hsCode,
    description,
    adValoremRate: 16,
    ivaRate: 16,
    unit: 'u',
    score,
  };
}

describe('evaluateDynamicHitl', () => {
  it('returns null when hitlAnswers already contain operator input', () => {
    const envelope = evaluateDynamicHitl({
      query: 'Motor eléctrico',
      hitlAnswers: { especificaciones_tecnicas: '5 HP 220V trifásico' },
      candidates: [makeCandidate('8501.52.10.00', 'Motores trifásicos', 0.65)],
    });
    expect(envelope).toBeNull();
  });

  it('returns null when candidates list is empty so live pipeline can run or fail explicitly', () => {
    const envelope = evaluateDynamicHitl({
      query: 'Artículo genérico',
      candidates: [],
    });
    expect(envelope).toBeNull();
  });

  it('triggers dynamic HITL envelope for short under-specified query when top candidate score < 0.88', () => {
    const envelope = evaluateDynamicHitl({
      query: 'Válvula industrial',
      candidates: [
        makeCandidate('8481.80.95.00', 'Válvulas esféricas', 0.72),
        makeCandidate('7307.99.00.00', 'Accesorios de tubería de acero', 0.7),
      ],
    });

    expect(envelope).not.toBeNull();
    expect(envelope?.classificationStatus).toBe('needs_details');
    expect(envelope?.workflowState).toBe('needs_input');
    expect(envelope?.decision?.tentativeProposal?.hsCode).toBe('8481.80.95.00');
    expect(envelope?.inlineComponents.some((c) => c.type === 'merceological_sheet')).toBe(true);
    expect(envelope?.inlineComponents.some((c) => c.type === 'questionnaire')).toBe(true);
  });

  it('does not block well-specified products even when competing headings exist', () => {
    const envelope = evaluateDynamicHitl({
      query: 'Motor eléctrico trifásico jaula de ardilla acero 5 HP 220V 60Hz uso industrial',
      candidates: [
        makeCandidate('8501.52.10.00', 'Motores trifásicos', 0.91),
        makeCandidate('8501.52.20.00', 'Motores rotor bobinado', 0.75),
      ],
    });
    expect(envelope).toBeNull();
  });
});
