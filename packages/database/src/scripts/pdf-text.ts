/**
 * Text extraction from the arancel PDF (PR 5).
 *
 * The extractors used to upload the PDF to the retired engine's file
 * service and reference it by URI. A local model has no such service, and
 * neither does an OpenAI-compatible server: the document has to travel
 * with the request.
 *
 * So the text is extracted here, once, with `pdfjs-dist` — already a
 * dependency of this package — and handed to the model as context. The
 * extraction is deterministic: the same PDF yields the same text, so a run
 * is reproducible and a change in the model's answer is the model's, not
 * the reader's.
 */
import * as fs from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

/** Characters of extracted text per page, for the progress log. */
const CHARS_PER_PAGE = 2000;

/**
 * Read a PDF and return its text, page by page.
 *
 * The pages are joined with a form-feed so the model can tell where a page
 * ends — the arancel's table geometry shifts between chapters, and a page
 * boundary is a useful anchor for it.
 */
export async function extractPdfText(pdfPath: string): Promise<string> {
  if (!fs.existsSync(pdfPath)) {
    throw new Error(
      `PDF not found: ${pdfPath}. The arancel PDF is not part of the repository ` +
        '(it is a large binary); put it at .data/Consolidado Arancel 2026.pdf.',
    );
  }

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await getDocument({ data }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push(text);
    if (pageNumber % 20 === 0) {
      console.log(`[pdf] ${pageNumber}/${doc.numPages} pages read…`);
    }
  }

  const total = pages.reduce((sum, page) => sum + page.length, 0);
  console.log(
    `[pdf] ${doc.numPages} pages, ${total} characters (~${Math.round(total / CHARS_PER_PAGE)} model tokens)`,
  );
  return pages.join('\n\f\n');
}

/**
 * The document text, truncated to a character budget.
 *
 * A context window is finite and the arancel is large. The truncation is
 * explicit and reported, so a truncated extraction never passes for a
 * complete one.
 */
export function withinBudget(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  console.warn(
    `[pdf] document truncated to ${maxChars} characters ` +
      `(${Math.round((maxChars / text.length) * 100)}% of ${text.length})`,
  );
  return text.slice(0, maxChars);
}
