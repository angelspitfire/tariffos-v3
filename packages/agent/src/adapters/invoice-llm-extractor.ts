import {
  getLlmProvider,
  type Attachment,
  type LlmProviderPort,
} from '@tariffos/ai-client';
import { rgiModel } from '@tariffos/env';
import { z } from 'zod';
import type { InvoiceItemInput } from '../lib/pipeline/types.js';
import type { RgiLlmRuntimeOverride } from './rgi-llm-adapter.js';

const MAX_INVOICE_TEXT_CHARS = 24_000;
const EXTRACTION_TIMEOUT_MS = 60_000;
const MAX_EXTRACTION_OUTPUT_TOKENS = 3_000;
const MIN_STRUCTURED_TEXT_CHARS = 40;
const TABULAR_RATIO_THRESHOLD = 0.6;

export const ExtractedInvoiceLineSchema = z.object({
  sku: z.string().nullable().optional(),
  description: z.string().trim().min(2),
  originCountry: z.string().nullable().optional(),
  cifValue: z.number().nonnegative().nullable().optional(),
  quantity: z.number().positive().nullable().optional(),
  unit: z.string().nullable().optional(),
  brokerNote: z.string().nullable().optional(),
});

export const ExtractedInvoiceDocumentSchema = z.object({
  documentReference: z.string().nullable().optional(),
  shipper: z.string().nullable().optional(),
  consignee: z.string().nullable().optional(),
  incoterm: z.enum(['EXW', 'FOB', 'CFR', 'CIF', 'DDP']).nullable().optional(),
  currencyCode: z.string().nullable().optional(),
  items: z.array(ExtractedInvoiceLineSchema).max(200),
});

export interface ExtractedInvoiceBatch {
  items: InvoiceItemInput[];
  documentReference?: string;
  shipper?: string;
  consignee?: string;
  incoterm?: 'EXW' | 'FOB' | 'CFR' | 'CIF' | 'DDP';
  currencyCode?: string;
  modelUsed: string;
}

export interface ExtractInvoiceLlmInput {
  text?: string;
  attachments?: Attachment[];
  fileName?: string;
  defaultOrigin?: string;
  runtimeLlm?: RgiLlmRuntimeOverride;
  provider?: LlmProviderPort;
}

const INVOICE_EXTRACTION_PROMPT = `You are a customs brokerage commercial-invoice data extractor.
Extract all physical merchandise line items and document header metadata from the provided invoice text and/or attached document/image.
Rules:
1. Extract ONLY commercial merchandise lines; ignore company headers, bank instructions, subtotals, tax totals, freight/insurance summary rows, and signatures.
2. Preserve key merceological specs inside description (brand, model, voltage/wattage, capacity, material, dimensions).
3. Use ISO 3166-1 alpha-2 uppercase country codes for originCountry when visible (e.g. "CN", "US", "DE"), otherwise null.
4. cifValue must be the numeric line total value (>= 0) without currency symbols, or null if absent.
5. Keep output strictly concise JSON matching the schema — no markdown or prose.`;

function normalizeIso2Country(raw: string | null | undefined, fallback: string): string {
  const clean = raw?.trim().toUpperCase() ?? '';
  return /^[A-Z]{2}$/.test(clean) ? clean : fallback;
}

function hasConsistentTabularShape(lines: readonly string[], sep: '|' | '\t' | ','): boolean {
  const counts = lines.map((line) => {
    const normalized = sep === ',' ? line.replace(/\$\s*\d{1,3}(?:,\d{3})+/g, '0') : line;
    return normalized.split(sep).length;
  });
  const firstCols = counts[0] ?? 1;
  const minCols = sep === ',' ? 3 : 2;
  if (firstCols < minCols) return false;
  const matching = counts.filter((c) => c === firstCols).length;
  return matching / lines.length >= TABULAR_RATIO_THRESHOLD;
}

/**
 * Returns true when invoice text is too sparse (scanned PDF) or unstructured prose/multi-line
 * layout rather than clean delimited rows, warranting multimodal LLM/VL extraction.
 */
export function shouldUseLlmInvoiceExtraction(rawText: string): boolean {
  const trimmed = rawText.trim();
  if (trimmed.length < MIN_STRUCTURED_TEXT_CHARS) return true;

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return true;

  for (const sep of ['|', '\t', ','] as const) {
    if (hasConsistentTabularShape(lines, sep)) {
      return false;
    }
  }
  return true;
}

/**
 * Extracts normalized `InvoiceItemInput[]` lines and header metadata from complex PDFs
 * or scanned commercial-invoice images using `@tariffos/ai-client`.
 */
export async function extractInvoiceItemsWithLlm(
  input: ExtractInvoiceLlmInput,
): Promise<ExtractedInvoiceBatch> {
  const provider =
    input.provider ??
    getLlmProvider(
      input.runtimeLlm
        ? { provider: input.runtimeLlm.provider, baseUrl: input.runtimeLlm.baseUrl }
        : undefined,
    );
  const modelId = input.runtimeLlm?.model ?? rgiModel(false);
  const defaultOrigin = input.defaultOrigin?.trim().toUpperCase() || 'CN';
  const budgetedText = input.text?.trim().slice(0, MAX_INVOICE_TEXT_CHARS);

  const parsed = await provider.generateJson(
    `${INVOICE_EXTRACTION_PROMPT}\n\nContext:\n${JSON.stringify({
      fileName: input.fileName ?? 'invoice',
      defaultOrigin,
      hasAttachments: Boolean(input.attachments?.length),
      invoiceText: budgetedText || null,
    })}`,
    ExtractedInvoiceDocumentSchema,
    {
      model: modelId,
      temperature: 0,
      timeoutMs: EXTRACTION_TIMEOUT_MS,
      maxOutputTokens: MAX_EXTRACTION_OUTPUT_TOKENS,
      ...(input.attachments?.length ? { attachments: input.attachments } : {}),
    },
  );

  const items: InvoiceItemInput[] = [];
  for (const row of parsed.items) {
    const description = row.description.trim();
    if (description.length < 2) continue;
    const sku = row.sku?.trim() || undefined;
    const unit = row.unit?.trim() || undefined;
    const brokerNote = row.brokerNote?.trim() || undefined;
    items.push({
      lineId: `line-${items.length + 1}`,
      sku,
      description,
      originCountry: normalizeIso2Country(row.originCountry, defaultOrigin),
      cifValue: typeof row.cifValue === 'number' && Number.isFinite(row.cifValue) ? row.cifValue : 0,
      ...(typeof row.quantity === 'number' && row.quantity > 0 ? { quantity: row.quantity } : {}),
      ...(unit ? { unit } : {}),
      ...(brokerNote ? { brokerNote } : {}),
    });
  }

  return {
    items,
    ...(parsed.documentReference?.trim() ? { documentReference: parsed.documentReference.trim() } : {}),
    ...(parsed.shipper?.trim() ? { shipper: parsed.shipper.trim() } : {}),
    ...(parsed.consignee?.trim() ? { consignee: parsed.consignee.trim() } : {}),
    ...(parsed.incoterm ? { incoterm: parsed.incoterm } : {}),
    ...(parsed.currencyCode?.trim() ? { currencyCode: parsed.currencyCode.trim().toUpperCase() } : {}),
    modelUsed: modelId,
  };
}
