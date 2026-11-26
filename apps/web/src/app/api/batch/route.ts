import { z } from 'zod';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { checkTenantQuota, resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import { classifyItemOffline } from '@/lib/agent/offline-classifier';
import { buildBatchSummary, parseBatchTextToItems } from '@/lib/inngest/batch-helpers';
import { inngest } from '@/lib/inngest/client';

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
    (value) =>
      (value.items !== undefined && value.items.length > 0) ||
      (value.sourceText !== undefined && value.sourceText.length > 0),
    { message: 'Provide either a non-empty items array or sourceText.' },
  );

export async function POST(request: Request): Promise<Response> {
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
  const items =
    input.items && input.items.length > 0
      ? input.items
      : parseBatchTextToItems(input.sourceText ?? '');

  if (items.length === 0) {
    return Response.json({ error: 'No classifiable items found in batch input' }, { status: 400 });
  }

  const filingId = input.filingId ?? `batch-${Date.now()}`;

  if (isCloudModeEnabled()) {
    const auth = await resolveCloudTenantContext();
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const quota = await checkTenantQuota(auth.context.tenantId, {
      requestedCount: items.length,
      isBatch: true,
    });
    if (!quota.allowed) {
      const reason = quota.reason ?? 'LIMIT_REACHED';
      const status =
        reason === 'BATCH_NOT_IN_PLAN' || reason === 'ACCOUNT_CANCELED'
          ? 403
          : reason === 'QUOTA_CHECK_ERROR'
            ? 503
            : 402;
      const error =
        reason === 'BATCH_NOT_IN_PLAN'
          ? 'Tu plan actual no incluye procesamiento masivo por lotes.'
          : reason === 'PAST_DUE'
            ? 'Activa tu Piloto Operativo o Plan Agencia para procesar lotes.'
            : reason === 'QUOTA_CHECK_ERROR'
              ? 'No pudimos verificar tu cuota en este momento. Intenta nuevamente.'
              : 'El tamaño del lote excede tu cuota disponible.';
      return Response.json({ error, reason }, { status });
    }

    await inngest.send({
      id: `filing-batch-${filingId}`,
      name: 'filing/batch.requested',
      data: {
        filingId,
        tenantId: auth.context.tenantId,
        countryCode: input.countryCode,
        deepMode: input.deepMode,
        items,
      },
    });

    return Response.json(
      {
        filingId,
        queued: true,
        totalItems: items.length,
      },
      { status: 202 },
    );
  }

  const lines = items.map((item) => classifyItemOffline(item));
  const summary = buildBatchSummary(lines);

  return Response.json(
    {
      filingId,
      queued: false,
      totalItems: items.length,
      summary,
      lines,
    },
    { status: 200 },
  );
}
