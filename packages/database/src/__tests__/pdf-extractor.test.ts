import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getDocument: vi.fn<(arg: { data: Uint8Array }) => { promise: Promise<unknown> }>(),
}));

vi.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
  getDocument: mocks.getDocument,
}));

import {
  extractPdfTextFromBuffer,
  stripRepeatedPageHeadersFooters,
} from '../ingestion/pdf-extractor';

describe('pdf-extractor', () => {
  it('strips repeated headers and footers appearing across 3 or more pages', () => {
    const pages = [
      'GACETA OFICIAL DE LA REPÚBLICA\nArtículo 1. Disposiciones generales.\nPágina 1',
      'GACETA OFICIAL DE LA REPÚBLICA\nArtículo 2. Del territorio aduanero.\nPágina 2',
      'GACETA OFICIAL DE LA REPÚBLICA\nArtículo 3. De las potestades.\nPágina 3',
    ];
    const cleaned = stripRepeatedPageHeadersFooters(pages);
    expect(cleaned).toEqual([
      'Artículo 1. Disposiciones generales.\nPágina 1',
      'Artículo 2. Del territorio aduanero.\nPágina 2',
      'Artículo 3. De las potestades.\nPágina 3',
    ]);
  });

  it('extracts normalized page text from PDF buffer using pdfjs-dist', async () => {
    const fakePages = [
      [{ str: 'ENCABEZADO OFICIAL' }, { str: 'Artículo 1.' }, { str: 'Base imponible.' }],
      [{ str: 'ENCABEZADO OFICIAL' }, { str: 'Artículo 2.' }, { str: 'Hecho imponible.' }],
      [{ str: 'ENCABEZADO OFICIAL' }, { str: 'Artículo 3.' }, { str: 'Alícuota general.' }],
    ];
    mocks.getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: fakePages.length,
        getPage: async (pageNumber: number) => ({
          getTextContent: async () => ({ items: fakePages[pageNumber - 1] }),
        }),
      }),
    });

    const result = await extractPdfTextFromBuffer(new Uint8Array([1, 2, 3]));
    expect(result.pageCount).toBe(3);
    expect(result.text).toContain('Artículo 1.');
    expect(result.text).toContain('\n\f\n');
    expect(mocks.getDocument).toHaveBeenCalledTimes(1);
  });
});
