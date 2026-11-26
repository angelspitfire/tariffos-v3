import { describe, expect, it } from 'vitest';
import { deduplicateInvoiceItems } from '@tariffos/agent';
import type { ClassificationLinePayload } from '@tariffos/shared-types';
import {
  buildBatchSummary,
  chunkItems,
  parseBatchTextToItems,
} from './batch-helpers';

describe('Inngest batch helpers', () => {
  it('chunks items into deterministic micro-batches', () => {
    const items = Array.from({ length: 23 }, (_, idx) => idx + 1);
    const chunks = chunkItems(items, 10);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(10);
    expect(chunks[1]).toHaveLength(10);
    expect(chunks[2]).toEqual([21, 22, 23]);
  });

  it('parses CSV with headers and deduplicates identical SKU lines', () => {
    const csv = [
      'sku,description,origin,cif,quantity',
      'INV-5KW,Inversor solar híbrido 5kW 48V,CN,850,2',
      'INV-5KW,Inversor solar híbrido 5kW 48V,CN,425,1',
      'MTR-5HP,"Motor eléctrico trifásico 5 HP, 220V",US,1200,1',
    ].join('\n');

    const items = parseBatchTextToItems(csv);
    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      lineId: 'line-1',
      sku: 'INV-5KW',
      originCountry: 'CN',
      cifValue: 850,
      quantity: 2,
    });
    expect(items[2].description).toBe('Motor eléctrico trifásico 5 HP, 220V');

    const groups = deduplicateInvoiceItems(items);
    expect(groups).toHaveLength(2);
    expect(groups[0].members).toHaveLength(2);
  });

  it('parses pipe-delimited and plain line text cleanly', () => {
    const pipeText = [
      'SKU-1 | MacBook Pro 14 M3 | US | 1999',
      'SKU-2 | Apple Watch Series 9 GPS | CN | 399',
    ].join('\n');

    const parsed = parseBatchTextToItems(pipeText);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toMatchObject({ sku: 'SKU-1', originCountry: 'US', cifValue: 1999 });
    expect(parsed[1]).toMatchObject({ sku: 'SKU-2', originCountry: 'CN', cifValue: 399 });

    const plain = parseBatchTextToItems('Bomba sumergible 3HP\nCompresor industrial 10HP');
    expect(plain).toHaveLength(2);
    expect(plain[0].description).toBe('Bomba sumergible 3HP');
    expect(plain[1].description).toBe('Compresor industrial 10HP');
  });

  it('maps reordered Spanish or English column headers accurately', () => {
    const reorderedPipe = [
      'Descripcion | Valor FOB | Origen | SKU | Cantidad',
      'Cable THHN 12 AWG 100m | $420.50 | US | CAB-12 | 5',
      'Panel solar monocristalino 550W | 180 | CN | PNL-550 | 10',
    ].join('\n');

    const items = parseBatchTextToItems(reorderedPipe);
    expect(items).toEqual([
      {
        lineId: 'line-1',
        sku: 'CAB-12',
        description: 'Cable THHN 12 AWG 100m',
        originCountry: 'US',
        cifValue: 420.5,
        quantity: 5,
      },
      {
        lineId: 'line-2',
        sku: 'PNL-550',
        description: 'Panel solar monocristalino 550W',
        originCountry: 'CN',
        cifValue: 180,
        quantity: 10,
      },
    ]);
  });

  it('aggregates batch classification summary metrics accurately', () => {
    const lines: ClassificationLinePayload[] = [
      {
        lineId: 'line-1',
        product: 'Inversor solar 5kW',
        hsCode: '8504.40.90.00',
        officialDescription: 'Convertidores estáticos',
        originCountry: 'CN',
        confidenceLevel: 'Alto',
        confidencePct: 90,
        confidenceReason: 'Exact match',
        rgiSteps: [],
        alternatives: [],
        rejected: [],
        flags: [],
        unresolved: [],
        duties: { cif: 1000, adValoremRate: 14, arancelAmount: 140, ivaRate: 16, ivaAmount: 182.4, unit: 'u' },
        tierUsed: 'tier1_fast',
        verifiedAgainstDb: true,
        modelUsed: 'test',
      },
      {
        lineId: 'line-2',
        product: 'Motor sin ficha',
        hsCode: '8501.52.10.00',
        officialDescription: 'Motores CA',
        originCountry: 'CN',
        confidenceLevel: 'Medio',
        confidencePct: 70,
        confidenceReason: 'Needs broker review',
        rgiSteps: [],
        alternatives: [],
        rejected: [],
        flags: [],
        unresolved: [],
        duties: { cif: 500, adValoremRate: 14, arancelAmount: 70, ivaRate: 16, ivaAmount: 91.2, unit: 'u' },
        tierUsed: 'tier2_rgi',
        verifiedAgainstDb: true,
        modelUsed: 'test',
      },
    ];

    const summary = buildBatchSummary(lines);
    expect(summary).toEqual({
      totalLines: 2,
      autoClassifiedCount: 1,
      proposedReviewCount: 1,
      blockedCount: 0,
      averageConfidencePct: 80,
      totalCifUsd: 1500,
      totalDutiesUsd: 210,
      totalIvaUsd: 273.6,
    });
  });
});
