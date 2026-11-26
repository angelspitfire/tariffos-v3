import { PdfTextAdapter, type InvoiceItemInput } from '@tariffos/agent';
import { parseBatchTextToItems } from './batch-helpers';
import { formatRowsToDelimitedText, parseXlsxBufferToRows } from './xlsx-parser';

const MAX_BATCH_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_BATCH_PDF_PAGES = 15;
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export class BatchFileExtractionError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface ExtractedBatchFileResult {
  items: InvoiceItemInput[];
  fileName: string;
  kind: 'xlsx' | 'pdf' | 'text';
}

/** Extracts normalized batch items from an uploaded `.xlsx`, `.pdf`, `.csv`, or `.txt` invoice file. */
export async function extractBatchItemsFromFile(file: File): Promise<ExtractedBatchFileResult> {
  if (file.size > MAX_BATCH_UPLOAD_BYTES) {
    throw new BatchFileExtractionError('El archivo supera el límite de 10 MB.', 413);
  }

  const mime = file.type.toLowerCase();
  const nameLower = file.name.toLowerCase();

  if (mime === XLSX_MIME || nameLower.endsWith('.xlsx')) {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const rows = parseXlsxBufferToRows(buffer);
    const items = parseBatchTextToItems(formatRowsToDelimitedText(rows));
    return { items, fileName: file.name, kind: 'xlsx' };
  }

  if (mime === 'application/pdf' || nameLower.endsWith('.pdf')) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:application/pdf;base64,${buffer.toString('base64')}`;
    const adapter = new PdfTextAdapter();
    const pages: string[] = [];

    for (let page = 1; page <= MAX_BATCH_PDF_PAGES; page += 1) {
      const doc = await adapter.extract({ kind: 'text', ref: dataUrl, page });
      if (!doc?.text?.trim()) break;
      pages.push(doc.text.trim());
    }

    const items = parseBatchTextToItems(pages.join('\n'));
    return { items, fileName: file.name, kind: 'pdf' };
  }

  if (mime.startsWith('text/') || mime === 'application/csv' || /\.(csv|txt)$/i.test(nameLower)) {
    const items = parseBatchTextToItems(await file.text());
    return { items, fileName: file.name, kind: 'text' };
  }

  throw new BatchFileExtractionError(
    `Formato no soportado (${file.name}). Usa .xlsx, .csv, .txt o .pdf.`,
    415,
  );
}
