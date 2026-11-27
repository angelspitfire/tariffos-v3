// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  extractPdfPagesFromBuffer: vi.fn(),
  getActiveLlmRuntimeConfig: vi.fn(),
}));

vi.mock('@tariffos/agent', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tariffos/agent')>();
  return {
    ...actual,
    extractPdfPagesFromBuffer: mocks.extractPdfPagesFromBuffer,
  };
});

vi.mock('@/lib/admin/llm-settings', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/admin/llm-settings')>();
  return {
    ...actual,
    getActiveLlmRuntimeConfig: mocks.getActiveLlmRuntimeConfig,
  };
});

import {
  BatchFileExtractionError,
  extractBatchItemsFromFile,
} from './batch-file-extractor';

describe('batch-file-extractor (PDF LLM/VL + invoice images + spreadsheets)', () => {
  it('keeps clean delimited CSV strictly deterministic without calling LLM', async () => {
    const extractWithLlm = vi.fn();
    const csv = 'SKU,Descripcion,Origen,CIF\nMTR-5,Motor electrico 5HP,CN,500';
    const file = new File([csv], 'lote.csv', { type: 'text/csv' });

    const out = await extractBatchItemsFromFile(file, {
      canUseLlm: true,
      extractWithLlm,
    });

    expect(extractWithLlm).not.toHaveBeenCalled();
    expect(out.kind).toBe('text');
    expect(out.extractionMethod).toBe('deterministic');
    expect(out.items).toHaveLength(1);
    expect(out.items[0]).toMatchObject({ sku: 'MTR-5', cifValue: 500 });
  });

  it('uses extractWithLlm for unstructured commercial invoice PDF text and returns documentMeta', async () => {
    mocks.extractPdfPagesFromBuffer.mockResolvedValueOnce({
      pages: [
        'COMMERCIAL INVOICE #INV-99\nSeller: Shenzhen Co.\n1. Hybrid Inverter 5kW 48V MPPT Total $1,200.00 Origin: CN',
      ],
      totalPages: 1,
    });

    const extractWithLlm = vi.fn(async () => ({
      documentReference: 'INV-99',
      shipper: 'Shenzhen Co.',
      consignee: 'Andes Import C.A.',
      incoterm: 'FOB' as const,
      currencyCode: 'USD',
      modelUsed: 'nvidia/nemotron-3.5-super-vl',
      items: [
        {
          lineId: 'line-1',
          description: 'Inversor solar híbrido 5kW 48V MPPT',
          originCountry: 'CN',
          cifValue: 1200,
        },
      ],
    }));

    const pdfFile = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'factura.pdf', {
      type: 'application/pdf',
    });

    const out = await extractBatchItemsFromFile(pdfFile, {
      canUseLlm: true,
      extractWithLlm,
    });

    expect(extractWithLlm).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'factura.pdf',
        text: expect.stringContaining('COMMERCIAL INVOICE #INV-99'),
      }),
    );
    expect(out.kind).toBe('pdf');
    expect(out.extractionMethod).toBe('llm_vl');
    expect(out.documentMeta).toEqual({
      documentReference: 'INV-99',
      shipper: 'Shenzhen Co.',
      consignee: 'Andes Import C.A.',
      incoterm: 'FOB',
    });
    expect(out.items).toHaveLength(1);
  });

  it('sends inline PDF bytes to VL when a scanned PDF has no text layer', async () => {
    mocks.extractPdfPagesFromBuffer.mockResolvedValueOnce({ pages: [], totalPages: 1 });
    const extractWithLlm = vi.fn(async () => ({
      documentReference: 'SCAN-01',
      modelUsed: 'vision-model',
      items: [
        {
          lineId: 'line-1',
          description: 'Bomba centrífuga acero inoxidable 2HP',
          originCountry: 'IT',
          cifValue: 850,
        },
      ],
    }));

    const scannedPdf = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'escaneada.pdf', {
      type: 'application/pdf',
    });

    const out = await extractBatchItemsFromFile(scannedPdf, {
      canUseLlm: true,
      extractWithLlm,
    });

    expect(extractWithLlm).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'escaneada.pdf',
        attachments: [
          expect.objectContaining({
            type: 'inline',
            mimeType: 'application/pdf',
            dataUrl: expect.stringMatching(/^data:application\/pdf;base64,/),
          }),
        ],
      }),
    );
    expect(out.extractionMethod).toBe('llm_vl');
    expect(out.items[0]?.description).toContain('Bomba centrífuga');
  });

  it('extracts items from invoice images via VL and fails cleanly when VL is unconfigured', async () => {
    const imgFile = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'factura.jpg', {
      type: 'image/jpeg',
    });

    await expect(
      extractBatchItemsFromFile(imgFile, { canUseLlm: false }),
    ).rejects.toBeInstanceOf(BatchFileExtractionError);

    const extractWithLlm = vi.fn(async () => ({
      documentReference: 'IMG-77',
      modelUsed: 'vision-model',
      items: [
        {
          lineId: 'line-1',
          description: 'Cable cobre THHN 12 AWG rollo 100m',
          originCountry: 'US',
          cifValue: 320,
        },
      ],
    }));

    const out = await extractBatchItemsFromFile(imgFile, {
      canUseLlm: true,
      extractWithLlm,
    });

    expect(out.kind).toBe('image');
    expect(out.extractionMethod).toBe('llm_vl');
    expect(extractWithLlm).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          expect.objectContaining({
            type: 'inline',
            mimeType: 'image/jpeg',
            dataUrl: expect.stringMatching(/^data:image\/jpeg;base64,/),
          }),
        ],
      }),
    );
  });
});
