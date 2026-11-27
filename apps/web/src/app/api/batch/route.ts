import { mapBatchToA2UIEnvelope, type BatchPipelineResult, type InvoiceItemInput } from '@tariffos/agent';
import { prisma } from '@tariffos/database';
import { z } from 'zod';
import { checkTenantQuota, resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import { classifyItemOffline } from '@/lib/agent/offline-classifier';
import {
  BatchFileExtractionError,
  extractBatchItemsFromFile,
  type BatchDocumentMetadata,
} from '@/lib/inngest/batch-file-extractor';
import { buildBatchSummary, parseBatchTextToItems } from '@/lib/inngest/batch-helpers';
import { inngest } from '@/lib/inngest/client';
import { executeCloudBatchInline, resolveBatchExecutionMode } from '@/lib/inngest/run-cloud-batch';
import { isCloudModeEnabled } from '@/lib/runtime-config';

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
  })
  .refine(
    (v) => (v.items !== undefined && v.items.length > 0) || (v.sourceText !== undefined && v.sourceText.length > 0),
    { message: 'Provide either a non-empty items array or sourceText.' },
  );

interface ParsedBatchPayload {
  filingId?: string;
  countryCode: string;
  deepMode: boolean;
  items: InvoiceItemInput[];
  fileName?: string;
  extractionMethod?: 'deterministic' | 'llm_vl';
  documentMeta?: BatchDocumentMetadata;
}

function buildOfflineBatchResult(itemsCount: number, lines: ReturnType<typeof classifyItemOffline>[]): BatchPipelineResult {
  return {
    lines,
    stats: {
      totalLines: lines.length,
      uniqueItems: itemsCount,
      blockedByPreGate: 0,
      tier0Hits: 0,
      tier1Hits: 0,
      tier2Hits: lines.length,
      webGroundingUsed: 0,
    },
  };
}

function quotaFailureResponse(reason: string | undefined): Response {
  const code = reason ?? 'LIMIT_REACHED';
  const status = code === 'BATCH_NOT_IN_PLAN' || code === 'ACCOUNT_CANCELED' ? 403 : code === 'QUOTA_CHECK_ERROR' ? 503 : 402;
  const error =
    code === 'BATCH_NOT_IN_PLAN'
      ? 'Tu plan actual no incluye procesamiento masivo por lotes.'
      : code === 'PAST_DUE'
        ? 'Activa tu Piloto Operativo o Plan Agencia para procesar lotes.'
        : code === 'QUOTA_CHECK_ERROR'
          ? 'No pudimos verificar tu cuota en este momento. Intenta nuevamente.'
          : 'El tamaño del lote excede tu cuota disponible.';
  return Response.json({ error, reason: code }, { status });
}

async function parseMultipartBatch(request: Request): Promise<ParsedBatchPayload | Response> {
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return Response.json({ error: 'Adjunta un archivo de factura (.xlsx, .csv, .txt o .pdf).' }, { status: 400 });
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

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  let payload: ParsedBatchPayload;

  if (contentType.includes('multipart/form-data')) {
    const parsed = await parseMultipartBatch(request);
    if (parsed instanceof Response) return parsed;
    payload = parsed;
  } else {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    const parsed = BatchRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
    }
    const input = parsed.data;
    payload = {
      filingId: input.filingId,
      countryCode: input.countryCode,
      deepMode: input.deepMode,
      items: input.items && input.items.length > 0 ? input.items : parseBatchTextToItems(input.sourceText ?? ''),
    };
  }

  if (payload.items.length === 0) {
    return Response.json({ error: 'No se encontraron ítems clasificables en el lote.' }, { status: 400 });
  }

  const filingId = payload.filingId ?? `batch-${Date.now()}`;

  if (isCloudModeEnabled()) {
    const auth = await resolveCloudTenantContext();
    if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

    const quota = await checkTenantQuota(auth.context.tenantId, {
      requestedCount: payload.items.length,
      isBatch: true,
    });
    if (!quota.allowed) return quotaFailureResponse(quota.reason);

    await prisma.filing.upsert({
      where: { id: filingId },
      update: {},
      create: {
        id: filingId,
        tenantId: auth.context.tenantId,
        userId: auth.context.userId,
        referenceId: payload.fileName ?? filingId,
        status: 'In progress',
        items: [],
      },
    });

    if (resolveBatchExecutionMode() === 'inline') {
      const result = await executeCloudBatchInline({
        filingId,
        tenantId: auth.context.tenantId,
        countryCode: payload.countryCode,
        deepMode: payload.deepMode,
        items: payload.items,
        fileName: payload.fileName,
        documentMeta: payload.documentMeta,
      });
      return Response.json(
        {
          filingId,
          queued: false,
          executionMode: 'inline',
          totalItems: payload.items.length,
          fileName: payload.fileName,
          extractionMethod: payload.extractionMethod,
          summary: result.summary,
          lines: result.lines,
          envelope: result.envelope,
        },
        { status: 200 },
      );
    }

    await inngest.send({
      id: `filing-batch-${filingId}`,
      name: 'filing/batch.requested',
      data: {
        filingId,
        tenantId: auth.context.tenantId,
        countryCode: payload.countryCode,
        deepMode: payload.deepMode,
        items: payload.items,
      },
    });

    return Response.json(
      {
        filingId,
        queued: true,
        executionMode: 'inngest',
        totalItems: payload.items.length,
        fileName: payload.fileName,
      },
      { status: 202 },
    );
  }

  const lines = payload.items.map((item) => classifyItemOffline(item));
  const summary = buildBatchSummary(lines);
  const envelope = mapBatchToA2UIEnvelope(buildOfflineBatchResult(payload.items.length, lines), {
    id: filingId,
    title: payload.fileName ? `Lote: ${payload.fileName}` : 'Manifiesto de Clasificación en Lote',
    documentReference: payload.documentMeta?.documentReference ?? payload.fileName ?? filingId,
    ...(payload.documentMeta?.shipper ? { shipper: payload.documentMeta.shipper } : {}),
    ...(payload.documentMeta?.consignee ? { consignee: payload.documentMeta.consignee } : {}),
    ...(payload.documentMeta?.incoterm ? { routeOrIncoterm: payload.documentMeta.incoterm } : {}),
  });

  return Response.json(
    { filingId, queued: false, totalItems: payload.items.length, fileName: payload.fileName, summary, lines, envelope },
    { status: 200 },
  );
}
