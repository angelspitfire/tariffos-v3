import type { InvoiceItemInput } from '@tariffos/agent';
import { z } from 'zod';
import {
  BatchFileExtractionError,
  extractBatchItemsFromFile,
  type BatchDocumentMetadata,
} from './batch-file-extractor';
import { parseBatchTextToItems } from './batch-helpers';
import {
  MAX_BATCH_STORAGE_BYTES,
  downloadBatchFileFromStorage,
} from './batch-storage';

const BatchItemInputSchema = z.object({
  lineId: z.string().trim().min(1),
  sku: z.string().trim().optional(),
  description: z.string().trim().min(2),
  originCountry: z.string().trim().min(2).max(3).default('CN'),
  cifValue: z.number().nonnegative().default(0),
  quantity: z.number().positive().optional(),
  unit: z.string().trim().optional(),
  brokerNote: z.string().trim().optional(),
});

const BatchRequestSchema = z
  .object({
    filingId: z.string().trim().min(1).optional(),
    countryCode: z.string().trim().length(2).default('VE'),
    deepMode: z.boolean().default(false),
    items: z.array(BatchItemInputSchema).optional(),
    sourceText: z.string().trim().optional(),
    storageKey: z.string().trim().min(3).optional(),
    fileName: z.string().trim().max(180).optional(),
  })
  .refine(
    (v) =>
      (v.items !== undefined && v.items.length > 0) ||
      (v.sourceText !== undefined && v.sourceText.length > 0) ||
      Boolean(v.storageKey),
    { message: 'Provide items, sourceText, or storageKey.' },
  );

export interface ParsedBatchPayload {
  filingId?: string;
  countryCode: string;
  deepMode: boolean;
  items: InvoiceItemInput[];
  fileName?: string;
  extractionMethod?: 'deterministic' | 'llm_vl';
  documentMeta?: BatchDocumentMetadata;
}

export async function parseMultipartBatch(request: Request): Promise<ParsedBatchPayload | Response> {
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return Response.json(
      { error: 'Adjunta un archivo de factura (.xlsx, .csv, .txt o .pdf).' },
      { status: 400 },
    );
  }
  const countryRaw = String(formData.get('countryCode') ?? 'VE').trim().toUpperCase();
  const countryCode = countryRaw.length === 2 ? countryRaw : 'VE';
  const deepMode = String(formData.get('deepMode') ?? 'false') === 'true';
  const filingRaw = formData.get('filingId');
  const filingId = typeof filingRaw === 'string' && filingRaw.trim() ? filingRaw.trim() : undefined;

  try {
    const extracted = await extractBatchItemsFromFile(file);
    return {
      filingId,
      countryCode,
      deepMode,
      items: extracted.items,
      fileName: extracted.fileName,
      extractionMethod: extracted.extractionMethod,
      documentMeta: extracted.documentMeta,
    };
  } catch (err) {
    if (err instanceof BatchFileExtractionError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    return Response.json({ error: 'No se pudo leer el archivo adjunto.' }, { status: 400 });
  }
}

export async function parseJsonBatch(
  request: Request,
  options: { cloudMode: boolean; tenantId: string },
): Promise<ParsedBatchPayload | Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
  const parsed = BatchRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  if (input.storageKey) {
    if (!options.cloudMode) {
      return Response.json(
        { error: 'storageKey solo está disponible en modo Cloud.' },
        { status: 400 },
      );
    }
    try {
      const file = await downloadBatchFileFromStorage(
        input.storageKey,
        options.tenantId,
        input.fileName,
      );
      const extracted = await extractBatchItemsFromFile(file, {
        maxUploadBytes: MAX_BATCH_STORAGE_BYTES,
      });
      return {
        filingId: input.filingId,
        countryCode: input.countryCode,
        deepMode: input.deepMode,
        items: extracted.items,
        fileName: extracted.fileName,
        extractionMethod: extracted.extractionMethod,
        documentMeta: extracted.documentMeta,
      };
    } catch (err) {
      if (err instanceof BatchFileExtractionError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      return Response.json({ error: 'No se pudo leer el archivo desde Storage.' }, { status: 400 });
    }
  }

  return {
    filingId: input.filingId,
    countryCode: input.countryCode,
    deepMode: input.deepMode,
    items: input.items && input.items.length > 0 ? input.items : parseBatchTextToItems(input.sourceText ?? ''),
  };
}
