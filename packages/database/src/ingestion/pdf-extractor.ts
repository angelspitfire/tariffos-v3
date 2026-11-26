const REPEATED_LINE_MIN_PAGES = 3;

export interface PdfTextExtractionResult {
  text: string;
  pageCount: number;
}

/**
 * Removes identical first or last lines that repeat across 3+ pages
 * (e.g., official gazette headers or pagination footers).
 */
export function stripRepeatedPageHeadersFooters(pages: string[]): string[] {
  if (pages.length < REPEATED_LINE_MIN_PAGES) return pages;

  const firstCounts = new Map<string, number>();
  const lastCounts = new Map<string, number>();

  const splitPages = pages.map((page) =>
    page
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  );

  for (const lines of splitPages) {
    if (lines.length === 0) continue;
    const first = lines[0];
    const last = lines[lines.length - 1];
    if (first) firstCounts.set(first, (firstCounts.get(first) ?? 0) + 1);
    if (last && lines.length > 1) lastCounts.set(last, (lastCounts.get(last) ?? 0) + 1);
  }

  return splitPages.map((lines) => {
    const kept = [...lines];
    const first = kept[0];
    if (first && (firstCounts.get(first) ?? 0) >= REPEATED_LINE_MIN_PAGES) {
      kept.shift();
    }
    const last = kept[kept.length - 1];
    if (last && (lastCounts.get(last) ?? 0) >= REPEATED_LINE_MIN_PAGES) {
      kept.pop();
    }
    return kept.join('\n');
  });
}

/**
 * Deterministic PDF text extraction from an in-memory buffer using pdfjs-dist.
 */
export async function extractPdfTextFromBuffer(
  bytes: Uint8Array,
): Promise<PdfTextExtractionResult> {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await getDocument({ data: bytes }).promise;
  const rawPages: string[] = [];

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines: string[] = [];
    let current = '';

    for (const item of content.items) {
      if (!('str' in item)) continue;
      const chunk = String(item.str ?? '');
      const hasEol = 'hasEOL' in item && Boolean(item.hasEOL);
      current = current ? `${current} ${chunk}` : chunk;
      if (hasEol) {
        const cleaned = current.replace(/\s+/g, ' ').trim();
        if (cleaned) lines.push(cleaned);
        current = '';
      }
    }
    const trailing = current.replace(/\s+/g, ' ').trim();
    if (trailing) lines.push(trailing);

    rawPages.push(lines.join('\n'));
  }

  const cleanedPages = stripRepeatedPageHeadersFooters(rawPages);
  return {
    text: cleanedPages.join('\n\f\n').trim(),
    pageCount: doc.numPages,
  };
}
