import {
  SUPPORTED_LIVE_COUNTRIES,
  isSupportedLiveCountry,
  mapBatchToA2UIEnvelope,
  type BatchPipelineResult,
} from '@tariffos/agent';
import { prisma } from '@tariffos/database';
import {
  checkTenantQuota,
  formatQuotaErrorResponse,
  resolveCloudTenantContext,
} from '@/lib/agent/cloud-session';
import { classifyItemOffline } from '@/lib/agent/offline-classifier';
import { buildBatchSummary } from '@/lib/inngest/batch-helpers';
import { parseJsonBatch, parseMultipartBatch } from '@/lib/inngest/batch-request-parser';
import { inngest } from '@/lib/inngest/client';
import { executeCloudBatchInline, resolveBatchExecutionMode } from '@/lib/inngest/run-cloud-batch';
import { isCloudModeEnabled } from '@/lib/runtime-config';

function buildOfflineBatchResult(
  itemsCount: number,
  lines: ReturnType<typeof classifyItemOffline>[],
): BatchPipelineResult {
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

export async function POST(request: Request): Promise<Response> {
  const cloudMode = isCloudModeEnabled();
  let cloudTenantId = 'offline-tenant';
  let cloudUserId = 'offline-user';
  let cloudIsSuperAdmin = false;

  if (cloudMode) {
    const auth = await resolveCloudTenantContext();
    if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
    cloudTenantId = auth.context.tenantId;
    cloudUserId = auth.context.userId;
    cloudIsSuperAdmin = Boolean(auth.context.isSuperAdmin);
  }

  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  const payload = contentType.includes('multipart/form-data')
    ? await parseMultipartBatch(request)
    : await parseJsonBatch(request, { cloudMode, tenantId: cloudTenantId });
  if (payload instanceof Response) return payload;

  if (payload.items.length === 0) {
    return Response.json(
      { error: 'No se encontraron ítems clasificables en el lote.' },
      { status: 400 },
    );
  }

  const filingId = payload.filingId ?? `batch-${Date.now()}`;

  if (cloudMode) {
    if (!isSupportedLiveCountry(payload.countryCode)) {
      return Response.json(
        {
          error: `La jurisdicción ${payload.countryCode} aún no tiene arancel cargado en modo Cloud. Disponible actualmente: ${SUPPORTED_LIVE_COUNTRIES.join(', ')}.`,
          countryCode: payload.countryCode,
          supportedCountries: [...SUPPORTED_LIVE_COUNTRIES],
        },
        { status: 422 },
      );
    }

    const quota = await checkTenantQuota(cloudTenantId, {
      requestedCount: payload.items.length,
      isBatch: true,
      ...(cloudIsSuperAdmin ? { isSuperAdmin: true } : {}),
    });
    if (!quota.allowed) {
      const formatted = formatQuotaErrorResponse(quota.reason, { isBatch: true });
      return Response.json(
        { error: formatted.error, reason: formatted.reason },
        { status: formatted.status },
      );
    }

    if (payload.filingId && typeof prisma.filing.findUnique === 'function') {
      const existing = await prisma.filing.findUnique({
        where: { id: filingId },
        select: { tenantId: true },
      });
      if (existing && existing.tenantId !== cloudTenantId) {
        return Response.json({ error: 'Forbidden filing reference' }, { status: 403 });
      }
    }

    await prisma.filing.upsert({
      where: { id: filingId },
      update: {},
      create: {
        id: filingId,
        tenantId: cloudTenantId,
        userId: cloudUserId,
        referenceId: payload.fileName ?? filingId,
        status: 'In progress',
        items: [],
      },
    });

    if (resolveBatchExecutionMode() === 'inline') {
      const result = await executeCloudBatchInline({
        filingId,
        tenantId: cloudTenantId,
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
        tenantId: cloudTenantId,
        countryCode: payload.countryCode,
        deepMode: payload.deepMode,
        items: payload.items,
        ...(payload.fileName ? { fileName: payload.fileName } : {}),
        ...(payload.extractionMethod ? { extractionMethod: payload.extractionMethod } : {}),
        ...(payload.documentMeta ? { documentMeta: payload.documentMeta } : {}),
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
    title: payload.fileName ?? (filingId.startsWith('batch-') ? 'Manifiesto de lote' : filingId),
  });

  return Response.json(
    {
      filingId,
      queued: false,
      totalItems: payload.items.length,
      fileName: payload.fileName,
      extractionMethod: payload.extractionMethod,
      summary,
      lines,
      envelope,
    },
    { status: 200 },
  );
}
