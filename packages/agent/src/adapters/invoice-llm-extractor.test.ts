import { describe, expect, it, vi } from 'vitest';
import type { LlmProviderPort } from '@tariffos/ai-client';
import {
  extractInvoiceItemsWithLlm,
  shouldUseLlmInvoiceExtraction,
} from './invoice-llm-extractor.js';

describe('invoice-llm-extractor', () => {
  it('detects when LLM extraction is needed vs clean tabular text', () => {
    const cleanPipe = [
      'SKU | Descripcion | Origen | CIF',
      'INV-5KW | Inversor solar 5kW | CN | 1200',
      'PNL-550 | Panel solar 550W | CN | 300',
    ].join('\n');
    expect(shouldUseLlmInvoiceExtraction(cleanPipe)).toBe(false);

    const cleanCsv = [
      'sku,description,origin,cif',
      'A1,Tornillo M8 acero inoxidable,US,150',
      'A2,Tuerca hexagonal M8,US,80',
    ].join('\n');
    expect(shouldUseLlmInvoiceExtraction(cleanCsv)).toBe(false);

    // Scanned/empty PDF text layer
    expect(shouldUseLlmInvoiceExtraction('')).toBe(true);
    expect(shouldUseLlmInvoiceExtraction('Page 1')).toBe(true);

    // Irregular unstructured commercial invoice prose
    const irregularInvoice = [
      'COMMERCIAL INVOICE #INV-2026-881',
      'Exporter: Shenzhen SunPower Tech Co., Ltd.',
      'Consignee: Inversiones Andinas C.A., RIF J-12345678-9',
      'Terms: FOB Shenzhen',
      '1. Hybrid Solar Inverter 5kW 48V Pure Sine Wave MPPT (Model SUN-5K-SG04) Qty: 4 pcs Unit Price $620.00 Total $2,480.00 Origin: China',
      '2. Monocrystalline Solar Panel 550W 144 Half-Cell Grade A Qty: 20 pcs Total $1,900.00',
      'Subtotal: $4,380.00 USD',
      'Ocean Freight: $420.00 USD',
    ].join('\n');
    expect(shouldUseLlmInvoiceExtraction(irregularInvoice)).toBe(true);
  });

  it('extracts structured items and invoice metadata from unstructured text or inline VL attachments', async () => {
    const generateJson = vi.fn(async () => ({
      documentReference: 'INV-2026-881',
      shipper: 'Shenzhen SunPower Tech Co., Ltd.',
      consignee: 'Inversiones Andinas C.A.',
      incoterm: 'FOB',
      currencyCode: 'USD',
      items: [
        {
          sku: 'SUN-5K-SG04',
          description: 'Inversor solar híbrido 5kW 48V MPPT onda sinusoidal pura',
          originCountry: 'cn',
          cifValue: 2480,
          quantity: 4,
          unit: 'pcs',
          brokerNote: null,
        },
        {
          sku: null,
          description: 'Panel solar monocristalino 550W 144 celdas',
          originCountry: null,
          cifValue: null,
          quantity: 20,
          unit: null,
          brokerNote: 'Grado A',
        },
      ],
    }));

    const fakeProvider = { generateJson } as unknown as LlmProviderPort;

    const textResult = await extractInvoiceItemsWithLlm({
      text: 'COMMERCIAL INVOICE #INV-2026-881\n1. SUN-5K-SG04 Hybrid Solar Inverter 5kW',
      fileName: 'invoice-881.pdf',
      defaultOrigin: 'US',
      provider: fakeProvider,
    });

    expect(generateJson).toHaveBeenCalledTimes(1);
    expect(textResult.documentReference).toBe('INV-2026-881');
    expect(textResult.shipper).toBe('Shenzhen SunPower Tech Co., Ltd.');
    expect(textResult.consignee).toBe('Inversiones Andinas C.A.');
    expect(textResult.incoterm).toBe('FOB');
    expect(textResult.items).toEqual([
      {
        lineId: 'line-1',
        sku: 'SUN-5K-SG04',
        description: 'Inversor solar híbrido 5kW 48V MPPT onda sinusoidal pura',
        originCountry: 'CN',
        cifValue: 2480,
        quantity: 4,
        unit: 'pcs',
      },
      {
        lineId: 'line-2',
        sku: undefined,
        description: 'Panel solar monocristalino 550W 144 celdas',
        originCountry: 'US',
        cifValue: 0,
        quantity: 20,
        unit: undefined,
        brokerNote: 'Grado A',
      },
    ]);

    await extractInvoiceItemsWithLlm({
      attachments: [
        { type: 'inline', dataUrl: 'data:image/jpeg;base64,/9j/4AAQ', mimeType: 'image/jpeg' },
      ],
      fileName: 'foto-factura.jpg',
      provider: fakeProvider,
    });

    expect(generateJson).toHaveBeenCalledTimes(2);
    const secondCallOpts = (generateJson.mock.calls[1] as unknown[])[2] as {
      attachments?: Array<{ type: string; mimeType: string }>;
    };
    expect(secondCallOpts.attachments).toEqual([
      { type: 'inline', dataUrl: 'data:image/jpeg;base64,/9j/4AAQ', mimeType: 'image/jpeg' },
    ]);
  });
});
