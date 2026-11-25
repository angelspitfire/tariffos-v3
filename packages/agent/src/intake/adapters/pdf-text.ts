/**
 * Adaptador de PDF con capa de texto (F2-03).
 *
 * Usa `unpdf` (JavaScript puro, sin dependencias nativas, corre en Deno) para
 * extraer la capa de texto de un PDF digital.
 *
 * Si la página no tiene capa de texto (PDF escaneado), devuelve `null`: nunca
 * inventa contenido. `reader: 'text-layer'`.
 */

import { extractText, getDocumentProxy } from 'unpdf';
import type { RawDocument, Source } from '../../domain/intake.js';
import { TextExtractor } from '../text-extractor.js';

/** Página por defecto cuando el source no especifica. */
const DEFAULT_PAGE = 1;

export class PdfTextAdapter implements TextExtractor {
  async extract(source: Source): Promise<RawDocument | null> {
    const data = source.ref;
    if (typeof data !== 'string' || data.length === 0) return null;

    let bytes: Uint8Array;
    try {
      bytes = this.toBytes(data);
    } catch {
      return null;
    }

    let pdf: Awaited<ReturnType<typeof getDocumentProxy>>;
    try {
      pdf = await getDocumentProxy(bytes);
    } catch {
      return null;
    }

    const pageNumber = source.page ?? DEFAULT_PAGE;
    const pageIndex = pageNumber - 1;

    let extracted: { totalPages: number; text: string | string[] };
    try {
      extracted = await extractText(pdf, { mergePages: false });
    } catch {
      return null;
    }

    const pages = Array.isArray(extracted.text) ? extracted.text : [extracted.text];
    const pageText = pages[pageIndex];

    if (!pageText || pageText.trim().length === 0) return null;

    return {
      source: { ...source },
      text: pageText,
      claims: [],
      reader: 'text-layer',
    };
  }

  private toBytes(data: string): Uint8Array {
    if (data.startsWith('data:application/pdf;base64,')) {
      const base64 = data.slice('data:application/pdf;base64,'.length);
      return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    }
    // Tratar el string como bytes UTF-8 directo.
    return new TextEncoder().encode(data);
  }
}
