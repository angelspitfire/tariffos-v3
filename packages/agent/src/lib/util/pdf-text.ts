import { extractText, getDocumentProxy } from 'unpdf';

export interface PdfPagesExtractionResult {
  pages: string[];
  totalPages: number;
}

/**
 * Extracts non-empty text pages from a PDF buffer in a single parse pass.
 * Never truncates on blank/scanned cover pages and never throws on corrupt PDFs.
 */
export async function extractPdfPagesFromBuffer(
  bytes: Uint8Array,
  options?: { maxPages?: number },
): Promise<PdfPagesExtractionResult> {
  if (bytes.byteLength === 0) {
    return { pages: [], totalPages: 0 };
  }

  let pdf: Awaited<ReturnType<typeof getDocumentProxy>>;
  try {
    pdf = await getDocumentProxy(bytes);
  } catch {
    return { pages: [], totalPages: 0 };
  }

  let extracted: { totalPages: number; text: string | string[] };
  try {
    extracted = await extractText(pdf, { mergePages: false });
  } catch {
    return { pages: [], totalPages: 0 };
  }

  const rawPages = Array.isArray(extracted.text) ? extracted.text : [extracted.text];
  const limit =
    typeof options?.maxPages === 'number' && options.maxPages > 0
      ? Math.min(rawPages.length, Math.floor(options.maxPages))
      : rawPages.length;

  const pages: string[] = [];
  for (let i = 0; i < limit; i += 1) {
    const trimmed = rawPages[i]?.trim();
    if (trimmed) {
      pages.push(trimmed);
    }
  }

  return {
    pages,
    totalPages: extracted.totalPages ?? rawPages.length,
  };
}
