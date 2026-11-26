import { describe, expect, it } from 'vitest';
import {
  A2UIBatchManifestComponentSchema,
  A2UIEnvelopeSchema,
} from '@tariffos/shared-types';
import type { BatchPipelineResult } from './types.js';
import {
  mapBatchToA2UIEnvelope,
  mapBatchToA2UIManifest,
} from './a2ui-batch-mapper.js';

function makeBatchResult(): BatchPipelineResult {
  return {
    lines: [
      {
        lineId: 'L1',
        product: 'MacBook Pro 14 M5 Max portátil aluminio 100% electrónico 1.84kg',
        hsCode: '8471.30.90.90',
        officialDescription: 'Portátiles CPU+teclado+pantalla <=10kg sin sintonizador TV',
        originCountry: 'CN',
        confidenceLevel: 'Alto',
        confidencePct: 95,
        confidenceReason: 'Cap. 84 Nota 5(B) verificada.',
        rgiSteps: [
          {
            rule: 'RGI 1',
            note: 'Cap. 84 Nota 5(B)',
            items: ['CPU+teclado+pantalla <=10kg'],
            conclusion: '84.71',
          },
        ],
        alternatives: [],
        rejected: [],
        flags: [],
        unresolved: [],
        duties: {
          cif: 2000,
          adValoremRate: 16,
          arancelAmount: 320,
          ivaRate: 16,
          ivaAmount: 371.2,
          unit: 'u',
        },
        tierUsed: 'tier0_sku',
        verifiedAgainstDb: true,
        modelUsed: 'product-master-cache',
      },
      {
        lineId: 'L2',
        product: 'Válvula industrial',
        hsCode: '8481.80.99.00',
        officialDescription: 'Los demás artículos de grifería y órganos similares',
        originCountry: 'US',
        confidenceLevel: 'Medio',
        confidencePct: 64,
        confidenceReason: 'Falta confirmar material y accionamiento.',
        rgiSteps: [],
        alternatives: [
          {
            code: '8481.10.00.00',
            desc: 'Válvulas reductoras de presión',
            confLevel: 'medio',
            confPct: 30,
            whyApply: 'Posible control de presión',
            whyNot: 'No especificado en factura',
          },
        ],
        rejected: [],
        flags: [
          {
            type: 'warn',
            title: 'Especificación incompleta',
            text: 'Confirmar si es solenoide o manual.',
          },
        ],
        unresolved: [
          {
            item: 'Tipo de accionamiento y presión nominal',
            source: 'Ficha técnica del fabricante',
            resolved: false,
          },
        ],
        duties: {
          cif: 500,
          adValoremRate: 12,
          arancelAmount: 60,
          ivaRate: 16,
          ivaAmount: 89.6,
          unit: 'u',
        },
        tierUsed: 'tier2_rgi',
        verifiedAgainstDb: false,
        modelUsed: 'reasoning-model',
      },
    ],
    stats: {
      totalLines: 2,
      uniqueItems: 2,
      blockedByPreGate: 0,
      tier0Hits: 1,
      tier1Hits: 0,
      tier2Hits: 1,
      webGroundingUsed: 1,
    },
  };
}

describe('a2ui-batch-mapper', () => {
  it('maps BatchPipelineResult into a validated A2UIBatchManifestComponent marking low-confidence/flagged items as needs_review', () => {
    const manifest = mapBatchToA2UIManifest(makeBatchResult(), {
      documentReference: 'INV-2026-001',
      currencyCode: 'USD',
    });

    expect(() => A2UIBatchManifestComponentSchema.parse(manifest)).not.toThrow();
    expect(manifest.type).toBe('batch_manifest');
    expect(manifest.items).toHaveLength(2);

    const first = manifest.items[0];
    expect(first?.status).toBe('classified');
    expect(first?.workflowItemState).toBe('classified');
    expect(first?.lineNumber).toBe(1);

    const second = manifest.items[1];
    expect(second?.status).toBe('needs_review');
    expect(second?.workflowItemState).toBe('proposed_review');
    expect(second?.clarifyingQuestions?.length).toBeGreaterThan(0);
    expect(second?.candidates?.length).toBe(2);
    expect(second?.candidates?.[0]?.recommended).toBe(true);
    expect(second?.merceologicalSheet).toBeDefined();
  });

  it('builds a full validated A2UIEnvelope with batch_manifest canvas, document_summary, and preferredCanvasTab=batch_manifest', () => {
    const envelope = mapBatchToA2UIEnvelope(makeBatchResult(), {
      documentReference: 'INV-2026-001',
      currencyCode: 'USD',
    });

    expect(() => A2UIEnvelopeSchema.parse(envelope)).not.toThrow();
    expect(envelope.canvasComponents.map((c) => c.type)).toEqual(['batch_manifest']);
    expect(envelope.inlineComponents.some((c) => c.type === 'document_summary')).toBe(true);
    expect(envelope.decision?.mode).toBe('batch');
    expect(envelope.decision?.autoClassifiedCount).toBe(1);
    expect(envelope.decision?.proposedReviewCount).toBe(1);

    const verdict = envelope.inlineComponents.find((c) => c.type === 'verdict');
    if (verdict?.type === 'verdict') {
      expect(verdict.preferredCanvasTab).toBe('batch_manifest');
    }
  });
});
