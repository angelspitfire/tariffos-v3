import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { mapPayloadToA2UIEnvelope } from './a2ui-mapper.js';
import { classifyInvoiceBatch } from './orchestrator.js';
import type { PipelinePorts, TariffCandidateRecord } from './types.js';

interface RompeIaScenario {
  id: string;
  category: string;
  query: string;
  expectedHs4: string;
  expectedHs10?: string;
  expectedAdValoremPct?: number;
  expectedUnit?: string;
  expectedPermitCode?: string;
  mustNotClaimHighConfidence?: boolean;
  expectedStatus?: string;
  forbiddenHs4?: string;
}

describe('Rompe-IA 10-Scenario Pre-Launch Protocol', () => {
  const suitePath = path.resolve(process.cwd(), '../../scripts/eval/rompe-ia-suite.json');
  const scenarios = JSON.parse(fs.readFileSync(suitePath, 'utf8')) as RompeIaScenario[];

  it('defines all 10 canonical stress scenarios from the pre-launch audit', () => {
    expect(scenarios).toHaveLength(10);
    const ids = scenarios.map((s) => s.id);
    expect(ids).toContain('rompe-01-reforma-reciente');
    expect(ids).toContain('rompe-03-factura-insuficiente');
    expect(ids).toContain('rompe-04-notas-excluyentes-seccion-xvi');
    expect(ids).toContain('rompe-06-exoneracion-comex-rl9');
    expect(ids).toContain('rompe-09-unidad-fisica-sidunea');
  });

  it('enforces statistical unit 2u (pairs) on footwear (Scenario 9) and exclusionary Section XVI Note 1(a) on rubber gaskets (Scenario 4)', async () => {
    const footwearTariff: TariffCandidateRecord = {
      hsCode: '6404.11.00.10',
      description: 'Calzado de deporte con suela de caucho y parte superior textil',
      adValoremRate: 35,
      ivaRate: 16,
      unit: '2u',
      customsFeeRate: 1,
    };
    const gasketTariff: TariffCandidateRecord = {
      hsCode: '4016.93.00.00',
      description: 'Juntas o empaquetaduras de caucho vulcanizado sin endurecer',
      adValoremRate: 14,
      ivaRate: 16,
      unit: 'kg',
      customsFeeRate: 1,
    };

    const ports: PipelinePorts = {
      findSkuPrecedent: vi.fn().mockResolvedValue(null),
      searchTariffCandidates: vi
        .fn()
        .mockResolvedValueOnce([footwearTariff])
        .mockResolvedValueOnce([gasketTariff]),
      getLegalNotes: vi.fn().mockResolvedValue([
        { ref: 'Sección XVI (Nota 1a)', text: 'Este Capítulo no comprende las juntas de caucho vulcanizado sin endurecer (partida 40.16).' },
      ]),
      verifyHsCode: vi
        .fn()
        .mockResolvedValueOnce(footwearTariff)
        .mockResolvedValueOnce(gasketTariff),
      runRgiReasoning: vi
        .fn()
        .mockResolvedValueOnce({
          hsCode: '6404.11.00.10',
          confidenceLevel: 'Alto',
          confidencePct: 95,
          confidenceReason: 'RGI 1 y Nota 4 Cap. 64',
          rgiSteps: [{ rule: 'RGI 1', note: 'Cap. 64', items: ['Suela caucho + capellada textil'], conclusion: '6404.11.00.10' }],
          alternatives: [],
          rejected: [],
          flags: [],
          unresolved: [],
          modelUsed: 'test-rgi',
        })
        .mockResolvedValueOnce({
          hsCode: '4016.93.00.00',
          confidenceLevel: 'Alto',
          confidencePct: 97,
          confidenceReason: 'Excluido de 8413.91 por Nota 1(a) Sección XVI hacia 4016.93',
          rgiSteps: [{ rule: 'RGI 1', note: 'Sección XVI Nota 1(a)', items: ['Junta de caucho vulcanizado'], conclusion: '4016.93.00.00' }],
          alternatives: [],
          rejected: [{ code: '8413.91.90.00', reason: 'Excluida por ser artículo técnico de caucho vulcanizado', rule: 'Sección XVI Nota 1(a)' }],
          flags: [],
          unresolved: [],
          modelUsed: 'test-rgi',
        }),
    };

    const s9 = scenarios.find((s) => s.id === 'rompe-09-unidad-fisica-sidunea')!;
    const s4 = scenarios.find((s) => s.id === 'rompe-04-notas-excluyentes-seccion-xvi')!;

    const batch = await classifyInvoiceBatch(
      [
        { lineId: 'S9', description: s9.query, originCountry: 'VN', cifValue: 1200 },
        { lineId: 'S4', description: s4.query, originCountry: 'DE', cifValue: 350 },
      ],
      ports,
      { tenantId: 't1', countryCode: 'VE' },
    );

    const line9 = batch.lines[0]!;
    expect(line9.duties.unit).toBe('2u');
    const env9 = mapPayloadToA2UIEnvelope(line9);
    const dos9 = env9.canvasComponents.find((c) => c.type === 'dossier');
    expect(dos9 && dos9.type === 'dossier' ? dos9.statisticalUnit : undefined).toBe('2u');

    const line4 = batch.lines[1]!;
    expect(line4.hsCode).toBe('4016.93.00.00');
    expect(line4.hsCode.startsWith(s4.forbiddenHs4!)).toBe(false);
    expect(line4.rejected[0]?.rule).toContain('Sección XVI');
  });
});
