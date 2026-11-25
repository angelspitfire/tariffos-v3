import { describe, expect, it, beforeEach, vi } from 'vitest';

import { PdfTextAdapter } from './pdf-text.js';
import type { Source } from '../../domain/intake.js';
import { extractText, getDocumentProxy } from 'unpdf';

vi.mock('unpdf', () => ({
  getDocumentProxy: vi.fn(),
  extractText: vi.fn(),
}));

function fuente(): Source {
  return { kind: 'text', ref: '', page: 1 };
}

describe('PdfTextAdapter (F2-03)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('extrae la capa de texto de un PDF digital y devuelve reader "text-layer"', async () => {
    (getDocumentProxy as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (extractText as ReturnType<typeof vi.fn>).mockResolvedValue({
      totalPages: 1,
      text: ['Factura número 123'],
    });

    const adapter = new PdfTextAdapter();
    const source: Source = { ...fuente(), ref: 'datos-pdf' };
    const doc = await adapter.extract(source);

    expect(doc).not.toBeNull();
    expect(doc!.reader).toBe('text-layer');
    expect(doc!.text).toContain('Factura número 123');
    expect(doc!.claims).toEqual([]);
    expect(getDocumentProxy).toHaveBeenCalledTimes(1);
  });

  it('respeta source.page para elegir la página', async () => {
    (getDocumentProxy as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (extractText as ReturnType<typeof vi.fn>).mockResolvedValue({
      totalPages: 2,
      text: ['Página uno', 'Página dos'],
    });

    const adapter = new PdfTextAdapter();
    const source: Source = { ...fuente(), ref: 'datos-pdf', page: 2 };
    const doc = await adapter.extract(source);

    expect(doc!.text).toContain('Página dos');
  });

  it('devuelve null cuando el PDF no es válido', async () => {
    (getDocumentProxy as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('no es un PDF'),
    );

    const adapter = new PdfTextAdapter();
    const doc = await adapter.extract({
      ...fuente(),
      ref: 'no-es-un-pdf',
    });
    expect(doc).toBeNull();
  });

  it('devuelve null para ref vacío', async () => {
    const adapter = new PdfTextAdapter();
    const doc = await adapter.extract({ ...fuente(), ref: '' });
    expect(doc).toBeNull();
    expect(getDocumentProxy).not.toHaveBeenCalled();
  });

  it('devuelve null sin inventar texto cuando no hay capa de texto', async () => {
    (getDocumentProxy as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (extractText as ReturnType<typeof vi.fn>).mockResolvedValue({
      totalPages: 1,
      text: [''],
    });

    const adapter = new PdfTextAdapter();
    const doc = await adapter.extract({ ...fuente(), ref: 'datos-pdf' });
    expect(doc).toBeNull();
  });
});
