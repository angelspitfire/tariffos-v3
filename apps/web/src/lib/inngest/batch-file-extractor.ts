import {
  canRunLiveLlmForProvider,
  extractInvoiceItemsWithLlm,
  extractPdfPagesFromBuffer,
  shouldUseLlmInvoiceExtraction,
  type ExtractedInvoiceBatch,
  type ExtractInvoiceLlmInput,
  type InvoiceItemInput,
  type RgiLlmRuntimeOverride,
} from '@tariffos/agent';
import { getActiveLlmRuntimeConfig, toRgiLlmRuntimeOverride } from '@/lib/admin/llm-settings';
import { parseBatchTextToItems } from './batch-helpers';
import { formatRowsToDelimitedText, parseXlsxBufferToRows } from './xlsx-parser';

const MAX_BATCH_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_UPLOAD_BYTES = 6 * 1024 * 1024;
const MAX_BATCH_PDF_PAGES = 15;
const MIN_PDF_TEXT_LAYER_CHARS = 40;
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const IMAGE_MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

export class BatchFileExtractionError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface BatchDocumentMetadata {
  documentReference?: string;
  shipper?: string;
  consignee?: string;
  incoterm?: string;
}

export interface ExtractedBatchFileResult {
  items: InvoiceItemInput[];
  fileName: string;
  kind: 'xlsx' | 'pdf' | 'image' | 'text';
  extractionMethod: 'deterministic' | 'llm_vl';
  documentMeta?: BatchDocumentMetadata;
}

export interface ExtractBatchFileOptions {
  extractWithLlm?: (input: ExtractInvoiceLlmInput) => Promise<ExtractedInvoiceBatch>;
  canUseLlm?: boolean;
}

function toDocumentMeta(batch: ExtractedInvoiceBatch): BatchDocumentMetadata | undefined {
  const meta: BatchDocumentMetadata = {
    ...(batch.documentReference ? { documentReference: batch.documentReference } : {}),
    ...(batch.shipper ? { shipper: batch.shipper } : {}),
    ...(batch.consignee ? { consignee: batch.consignee } : {}),
    ...(batch.incoterm ? { incoterm: batch.incoterm } : {}),
  };
  return Object.keys(meta).length > 0 ? meta : undefined;
}

async function resolveExtractorContext(options: ExtractBatchFileOptions): Promise<{
  canUseLlm: boolean;
  runtimeLlm?: RgiLlmRuntimeOverride;
}> {
  if (options.canUseLlm !== undefined) {
    return { canUseLlm: options.canUseLlm };
  }
  const active = await getActiveLlmRuntimeConfig();
  const canUseLlm = canRunLiveLlmForProvider(active.provider);
  return { canUseLlm, runtimeLlm: toRgiLlmRuntimeOverride(active) };
}

function resolveImageMime(file: File): string | null {
  const mime = file.type.toLowerCase();
  if (mime === 'image/png' || mime === 'image/jpeg' || mime === 'image/webp') return mime;
  if (mime === 'image/jpg') return 'image/jpeg';
  const ext = Object.keys(IMAGE_MIME_BY_EXT).find((k) => file.name.toLowerCase().endsWith(k));
  return ext ? IMAGE_MIME_BY_EXT[ext]! : null;
}

/**
 * Extracts normalized batch items from `.xlsx`, `.csv`, `.txt`, `.pdf` (hybrid deterministic +
 * LLM/VL for irregular/scanned invoices), and invoice images (`.png`/`.jpg`/`.webp`).
 */
export async function extractBatchItemsFromFile(
  file: File,
  options: ExtractBatchFileOptions = {},
): Promise<ExtractedBatchFileResult> {
  if (file.size > MAX_BATCH_UPLOAD_BYTES) {
    throw new BatchFileExtractionError('El archivo supera el límite de 10 MB.', 413);
  }

  const mime = file.type.toLowerCase();
  const nameLower = file.name.toLowerCase();

  if (mime === XLSX_MIME || nameLower.endsWith('.xlsx')) {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const rows = parseXlsxBufferToRows(buffer);
    return {
      items: parseBatchTextToItems(formatRowsToDelimitedText(rows)),
      fileName: file.name,
      kind: 'xlsx',
      extractionMethod: 'deterministic',
    };
  }

  if (mime.startsWith('text/') || mime === 'application/csv' || /\.(csv|txt)$/i.test(nameLower)) {
    return {
      items: parseBatchTextToItems(await file.text()),
      fileName: file.name,
      kind: 'text',
      extractionMethod: 'deterministic',
    };
  }

  const extractLlm = options.extractWithLlm ?? extractInvoiceItemsWithLlm;
  const ctx = await resolveExtractorContext(options);

  if (mime === 'application/pdf' || nameLower.endsWith('.pdf')) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { pages } = await extractPdfPagesFromBuffer(new Uint8Array(buffer), {
      maxPages: MAX_BATCH_PDF_PAGES,
    });

    const joinedText = pages.join('\n');
    const needsLlm = shouldUseLlmInvoiceExtraction(joinedText);

    if (needsLlm && ctx.canUseLlm) {
      try {
        const llmInput: ExtractInvoiceLlmInput =
          joinedText.trim().length >= MIN_PDF_TEXT_LAYER_CHARS
            ? { text: joinedText, fileName: file.name, runtimeLlm: ctx.runtimeLlm }
            : {
                attachments: [
                  {
                    type: 'inline',
                    dataUrl: `data:application/pdf;base64,${buffer.toString('base64')}`,
                    mimeType: 'application/pdf',
                  },
                ],
                fileName: file.name,
                runtimeLlm: ctx.runtimeLlm,
              };
        const extracted = await extractLlm(llmInput);
        if (extracted.items.length > 0) {
          return {
            items: extracted.items,
            fileName: file.name,
            kind: 'pdf',
            extractionMethod: 'llm_vl',
            documentMeta: toDocumentMeta(extracted),
          };
        }
      } catch {
        if (joinedText.trim().length < MIN_PDF_TEXT_LAYER_CHARS) {
          throw new BatchFileExtractionError(
            'No se pudo extraer texto del PDF escaneado mediante el modelo VL.',
            422,
          );
        }
      }
    }

    if (joinedText.trim().length < MIN_PDF_TEXT_LAYER_CHARS && !ctx.canUseLlm) {
      throw new BatchFileExtractionError(
        'Este PDF parece escaneado sin texto seleccionable; configura un modelo VL para procesarlo.',
        422,
      );
    }

    return {
      items: parseBatchTextToItems(joinedText),
      fileName: file.name,
      kind: 'pdf',
      extractionMethod: 'deterministic',
    };
  }

  const imageMime = resolveImageMime(file);
  if (imageMime) {
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      throw new BatchFileExtractionError('La imagen de factura supera el límite de 6 MB.', 413);
    }
    if (!ctx.canUseLlm) {
      throw new BatchFileExtractionError(
        'Se requiere un modelo VL configurado para extraer facturas desde imagen.',
        422,
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await extractLlm({
      attachments: [
        {
          type: 'inline',
          dataUrl: `data:${imageMime};base64,${buffer.toString('base64')}`,
          mimeType: imageMime,
        },
      ],
      fileName: file.name,
      runtimeLlm: ctx.runtimeLlm,
    });
    return {
      items: extracted.items,
      fileName: file.name,
      kind: 'image',
      extractionMethod: 'llm_vl',
      documentMeta: toDocumentMeta(extracted),
    };
  }

  throw new BatchFileExtractionError(
    `Formato no soportado (${file.name}). Usa .xlsx, .csv, .txt, .pdf o imagen (.png/.jpg/.webp).`,
    415,
  );
}
