import { describe, expect, it, vi } from 'vitest';
import { budgetLegalNotes } from '../../adapters/rgi-llm-adapter.js';
import { mapPayloadToA2UIEnvelope } from './a2ui-mapper.js';
import { classifyInvoiceBatch } from './orchestrator.js';
import type { PipelinePorts, TariffCandidateRecord } from './types.js';

describe('Phase 2: Multi-jurisdiction exemptions, statistical unit, section notes, and anti-hallucination gate', () => {
  it('propagates statisticalUnit, Ex.AEC metadata, conditional permit warning, and expiry alert to payload & A2UI', async () => {
    const sugarTariff: TariffCandidateRecord = {
      hsCode: '1701.99.00.91',
      description: 'Azúcar de caña refinada acondicionada para la venta al por menor',
      adValoremRate: 98,
      baseAdValoremRate: 16,
      tariffExceptionCode: '98E',
      ivaRate: 16,
      unit: 'kg',
      customsFeeRate: 1,
      permits: ['RL-9 (COMEX): Permiso Comité de Comercio Exterior'],
      activeExemption: {
        programCode: 'DEC-5197-COMEX',
        title: 'Exoneración condicionada a Certificado COMEX (Apéndice I)',
        decreeRef: 'Decreto N° 5.197',
        gazetteRef: 'GOE N° 6.952',
        exemptAdValoremPct: 90,
        exemptVatPct: 90,
        requiredPermitCode: 'RL-9',
        validToDate: '2026-12-31',
        expiringSoon: true,
      },
    };

    const ports: PipelinePorts = {
      findSkuPrecedent: vi.fn().mockResolvedValue(null),
      searchTariffCandidates: vi.fn().mockResolvedValue([sugarTariff]),
      getLegalNotes: vi.fn().mockResolvedValue([]),
      verifyHsCode: vi.fn().mockResolvedValue(sugarTariff),
      runRgiReasoning: vi.fn().mockResolvedValue({
        hsCode: '1701.99.00.91',
        confidenceLevel: 'Alto',
        confidencePct: 96,
        confidenceReason: 'Subpartida nacional 1701.99.00.91 bajo RGI 1 y RGI 6',
        rgiSteps: [{ rule: 'RGI 1', note: 'Partida 17.01', items: ['Sacarosa refinada'], conclusion: '1701.99.00.91' }],
        alternatives: [],
        rejected: [],
        flags: [],
        unresolved: [],
        modelUsed: 'reasoning-model',
      }),
    };

    const res = await classifyInvoiceBatch(
      [{ lineId: 'L1', description: 'Azúcar refinada de caña en bolsas de 1 kg', originCountry: 'BR', cifValue: 1000 }],
      ports,
      { tenantId: 't1', countryCode: 'VE' },
    );

    const line = res.lines[0]!;
    expect(line.duties.unit).toBe('kg');
    expect(line.duties.adValoremRate).toBe(98);
    expect(line.duties.baseAdValoremRate).toBe(16);
    expect(line.duties.tariffExceptionCode).toBe('98E');
    expect(line.duties.activeExemption?.decreeRef).toBe('Decreto N° 5.197');
    expect(line.flags.some((f) => f.text.includes('RL-9') && f.text.includes('Decreto N° 5.197'))).toBe(true);
    expect(line.flags.some((f) => f.text.includes('2026-12-31') && /declaración|DUA/i.test(f.text))).toBe(true);

    const envelope = mapPayloadToA2UIEnvelope(line, { includeCalculator: true, datasetVersion: 'arancel-2026' });
    const verdict = envelope.inlineComponents.find((c) => c.type === 'verdict');
    const dossier = envelope.canvasComponents.find((c) => c.type === 'dossier');
    const calc = envelope.canvasComponents.find((c) => c.type === 'calculator');

    expect(verdict && 'statisticalUnit' in verdict ? verdict.statisticalUnit : undefined).toBe('kg');
    expect(dossier && dossier.type === 'dossier' ? dossier.statisticalUnit : undefined).toBe('kg');
    expect(dossier && dossier.type === 'dossier' ? dossier.commercialDescription : undefined).toBe(
      'Azúcar refinada de caña en bolsas de 1 kg',
    );
    expect(calc && calc.type === 'calculator' ? calc.exemptionAvailable : false).toBe(true);
    expect(calc && calc.type === 'calculator' ? calc.exemptionNote : '').toContain('Decreto N° 5.197');
  });

  it('prevents fake 99% certainty on insufficient commercial invoice descriptions with competing sibling subheadings (Test 3)', async () => {
    const valve10: TariffCandidateRecord = {
      hsCode: '8481.10.00.00',
      description: 'Válvulas reductoras de presión',
      adValoremRate: 14,
      ivaRate: 16,
      unit: 'u',
      score: 0.68,
    };
    const valve80: TariffCandidateRecord = {
      hsCode: '8481.80.99.00',
      description: 'Los demás artículos de grifería y órganos similares',
      adValoremRate: 14,
      ivaRate: 16,
      unit: 'u',
      score: 0.66,
    };

    const ports: PipelinePorts = {
      findSkuPrecedent: vi.fn().mockResolvedValue(null),
      searchTariffCandidates: vi.fn().mockResolvedValue([valve10, valve80]),
      getLegalNotes: vi.fn().mockResolvedValue([]),
      verifyHsCode: vi.fn().mockResolvedValue(valve80),
      fetchWebSpecs: vi.fn().mockResolvedValue(null),
      runRgiReasoning: vi.fn().mockResolvedValue({
        hsCode: '8481.80.99.00',
        confidenceLevel: 'Alto',
        confidencePct: 99,
        confidenceReason: 'Guessed valve subheading',
        rgiSteps: [{ rule: 'RGI 1', note: 'Partida 84.81', items: ['Industrial Control Valve'], conclusion: '84.81' }],
        alternatives: [],
        rejected: [],
        flags: [],
        unresolved: [],
        modelUsed: 'reasoning-model',
      }),
    };

    const res = await classifyInvoiceBatch(
      [{ lineId: 'L-VALVE', description: 'Industrial Control Valve Mod. VX-90', originCountry: 'US', cifValue: 4500 }],
      ports,
      { tenantId: 't1', countryCode: 'VE' },
    );

    const line = res.lines[0]!;
    expect(line.confidenceLevel).not.toBe('Alto');
    expect(line.confidencePct).toBeLessThan(85);
    expect(line.alternatives.length).toBeGreaterThanOrEqual(1);
    expect(line.unresolved.length).toBeGreaterThanOrEqual(1);

    const envelope = mapPayloadToA2UIEnvelope(line);
    expect(envelope.classificationStatus).toBe('needs_details');
    expect(envelope.workflowState).toBe('proposed_review');
  });

  it('prioritizes Section exclusionary notes before Chapter notes when budgeting legal notes (Test 4)', () => {
    const notes = [
      { ref: 'Capítulo 84 (Nota 1)', text: 'A'.repeat(7950), chapter: '84' },
      { ref: 'Sección XVI (Nota 2)', text: 'Las partes de uso general se excluyen hacia su propio régimen (Cap. 73 / 4016).' },
    ];

    const budgeted = budgetLegalNotes(notes, 8000);
    expect(budgeted.some((n) => n.ref.includes('Sección XVI'))).toBe(true);
  });
});
