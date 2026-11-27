import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getDocumentProxy: vi.fn(),
  extractText: vi.fn(),
}));

vi.mock('unpdf', () => ({
  getDocumentProxy: mocks.getDocumentProxy,
  extractText: mocks.extractText,
}));

import { extractPdfPagesFromBuffer } from './pdf-text.js';

describe('extractPdfPagesFromBuffer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses the PDF in a single pass and keeps non-empty pages even when page 1 is blank', async () => {
    const fakePdf = { numPages: 3 };
    mocks.getDocumentProxy.mockResolvedValueOnce(fakePdf);
    mocks.extractText.mockResolvedValueOnce({
      totalPages: 3,
      text: ['   ', '  Factura #101\nInversor 5kW  ', 'Total USD 1,200.00'],
    });

    const result = await extractPdfPagesFromBuffer(new Uint8Array([0x25, 0x50, 0x44, 0x46]));

    expect(mocks.getDocumentProxy).toHaveBeenCalledTimes(1);
    expect(mocks.extractText).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      pages: ['Factura #101\nInversor 5kW', 'Total USD 1,200.00'],
      totalPages: 3,
    });
  });

  it('caps inspected pages to maxPages without re-parsing', async () => {
    mocks.getDocumentProxy.mockResolvedValueOnce({ numPages: 5 });
    mocks.extractText.mockResolvedValueOnce({
      totalPages: 5,
      text: ['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5'],
    });

    const result = await extractPdfPagesFromBuffer(new Uint8Array([1, 2, 3]), { maxPages: 2 });

    expect(result).toEqual({
      pages: ['Page 1', 'Page 2'],
      totalPages: 5,
    });
  });

  it('returns empty pages safely on empty or invalid PDF bytes', async () => {
    expect(await extractPdfPagesFromBuffer(new Uint8Array([]))).toEqual({ pages: [], totalPages: 0 });
    mocks.getDocumentProxy.mockRejectedValueOnce(new Error('Invalid PDF'));
    expect(await extractPdfPagesFromBuffer(new Uint8Array([9, 9]))).toEqual({
      pages: [],
      totalPages: 0,
    });
  });
});
