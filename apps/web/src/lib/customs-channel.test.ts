import { describe, it, expect } from 'vitest';
import { evaluateCustomsChannel } from './customs-channel';

describe('customs-channel', () => {
  it('assigns Canal Verde (Levante Automático) when no risks or blocking permits exist', () => {
    const assessment = evaluateCustomsChannel({
      discrepancyCount: 0,
      blockingPermitsCount: 0,
      hasTariffConflict: false,
      averageConfidence: 0.95,
    });

    expect(assessment.channel).toBe('green');
    expect(assessment.label).toBe('Canal Verde');
    expect(assessment.description).toContain('Levante Automático');
    expect(assessment.reasons.length).toBe(0);
  });

  it('assigns Canal Rojo (Aforo Físico y Documental) when blocking permits exist', () => {
    const assessment = evaluateCustomsChannel({
      discrepancyCount: 0,
      blockingPermitsCount: 1,
      hasTariffConflict: false,
      averageConfidence: 0.9,
    });

    expect(assessment.channel).toBe('red');
    expect(assessment.label).toBe('Canal Rojo');
    expect(assessment.description).toContain('Reconocimiento Físico');
    expect(assessment.reasons).toContain('1 requisito(s) regulatorio(s) bloqueante(s) pendiente(s)');
  });

  it('assigns Canal Rojo when document discrepancies exist between invoice and BoL', () => {
    const assessment = evaluateCustomsChannel({
      discrepancyCount: 2,
      blockingPermitsCount: 0,
      hasTariffConflict: false,
      averageConfidence: 0.9,
    });

    expect(assessment.channel).toBe('red');
    expect(assessment.label).toBe('Canal Rojo');
    expect(assessment.reasons).toContain('2 discrepancia(s) entre factura comercial y conocimiento de embarque');
  });

  it('assigns Canal Amarillo (Revisión Documental) when tariff doubt or conflict exists without blocking permits', () => {
    const assessment = evaluateCustomsChannel({
      discrepancyCount: 0,
      blockingPermitsCount: 0,
      hasTariffConflict: true,
      averageConfidence: 0.82,
    });

    expect(assessment.channel).toBe('yellow');
    expect(assessment.label).toBe('Canal Amarillo');
    expect(assessment.description).toContain('Revisión Documental');
    expect(assessment.reasons).toContain('Duda razonable o conflicto arancelario en evaluación');
  });
});
