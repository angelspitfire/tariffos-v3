import {
  SUPPORTED_LIVE_COUNTRIES,
  classifyInvoiceBatch,
  isSupportedLiveCountry,
} from '@tariffos/agent';
import type { StreamProgressEvent } from '@tariffos/shared-types';
import { getActiveLlmRuntimeConfig, toRgiLlmRuntimeOverride } from '@/lib/admin/llm-settings';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { ClassifyStreamRequestSchema, type ClassifyStreamRequest } from '@/lib/agent/classify-stream-schema';
import {
  checkTenantQuota,
  formatQuotaErrorResponse,
  persistClassificationOutcome,
  resolveCloudTenantContext,
} from '@/lib/agent/cloud-session';
import { buildFullClassificationDescription, evaluateDynamicHitl } from '@/lib/agent/dynamic-hitl';
import { buildA2UIEnvelopeFromLine, buildHitlEnvelope } from '@/lib/agent/envelope-builder';
import { classifyRequestOffline, detectMissingCriticalInfo } from '@/lib/agent/offline-classifier';
import { createPrismaPipelinePorts } from '@/lib/agent/prisma-ports';
import { encodeErrorEvent, encodeProgressEvent, encodeResultEvent } from '@/lib/agent/sse-encoder';

async function runLiveClassificationLine(
  input: ClassifyStreamRequest,
  tenantId: string,
  ports: ReturnType<typeof createPrismaPipelinePorts>,
  onProgress: (event: StreamProgressEvent) => void,
) {
  const batch = await classifyInvoiceBatch(
    [
      {
        lineId: 'interactive-1',
        sku: input.sku,
        description: buildFullClassificationDescription(input),
        originCountry: input.originCountry,
        cifValue: input.cifValue,
        ...(input.imageDataUrls?.length ? { imageDataUrls: input.imageDataUrls } : {}),
      },
    ],
    ports,
    {
      tenantId,
      countryCode: input.countryCode,
      deepMode: input.deepMode,
      onProgress,
    },
  );
  const line = batch.lines[0];
  if (!line) throw new Error('Live classification pipeline returned no result line.');
  return line;
}

export async function POST(request: Request): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = ClassifyStreamRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const cloudMode = isCloudModeEnabled();
  let tenantId = 'offline-tenant';

  if (cloudMode) {
    const auth = await resolveCloudTenantContext();
    if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
    tenantId = auth.context.tenantId;

    const quota = await checkTenantQuota(tenantId);
    if (!quota.allowed) {
      const formatted = formatQuotaErrorResponse(quota.reason);
      return Response.json(
        { error: formatted.error, reason: formatted.reason },
        { status: formatted.status },
      );
    }

    if (!isSupportedLiveCountry(input.countryCode)) {
      return Response.json(
        {
          error: `La jurisdicción ${input.countryCode} aún no tiene arancel cargado en modo Cloud. Disponible actualmente: ${SUPPORTED_LIVE_COUNTRIES.join(', ')}.`,
          countryCode: input.countryCode,
          supportedCountries: [...SUPPORTED_LIVE_COUNTRIES],
        },
        { status: 422 },
      );
    }
  }

  const runtimeLlm = cloudMode ? await getActiveLlmRuntimeConfig() : null;
  const canRunLivePipeline =
    cloudMode && Boolean(process.env.DATABASE_URL) && Boolean(runtimeLlm?.canRunLive);
  const llmOverride = toRgiLlmRuntimeOverride(runtimeLlm);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (frame: string) => controller.enqueue(encoder.encode(frame));
      try {
        if (canRunLivePipeline) {
          const ports = createPrismaPipelinePorts(llmOverride);
          push(encodeProgressEvent({ stage: 'hybrid_retrieval', label: 'Recuperando candidatas NCM oficiales', progressPct: 40 }));
          const candidates = await ports.searchTariffCandidates(
            input.countryCode,
            buildFullClassificationDescription(input),
          );
          const dynamicHitl = evaluateDynamicHitl({
            query: input.query,
            attachmentsText: input.attachmentsText,
            hitlAnswers: input.hitlAnswers,
            candidates,
            deepMode: input.deepMode,
          });
          if (dynamicHitl) {
            push(encodeProgressEvent({ stage: 'complete', label: 'Requiere validación técnica HITL', progressPct: 100 }));
            push(encodeResultEvent(dynamicHitl));
            return;
          }

          const line = await runLiveClassificationLine(input, tenantId, ports, (event) =>
            push(encodeProgressEvent(event)),
          );
          const envelope = buildA2UIEnvelopeFromLine(line, input);
          await persistClassificationOutcome(tenantId, line, input.query, runtimeLlm?.provider);
          push(encodeProgressEvent({ stage: 'complete', label: 'Dictamen arancelario listo', progressPct: 100 }));
          push(encodeResultEvent(envelope));
          return;
        }

        const hitl = detectMissingCriticalInfo(input.query, input.hitlAnswers);
        if (hitl.needsHitl) {
          push(encodeProgressEvent({ stage: 'pre_gate', label: 'Validación Compliance Pre-Gate', progressPct: 15 }));
          push(encodeProgressEvent({ stage: 'sku_lookup', label: 'Consultando precedentes SKU', progressPct: 30 }));
          push(encodeProgressEvent({ stage: 'complete', label: 'Requiere validación técnica HITL', progressPct: 100 }));
          push(encodeResultEvent(buildHitlEnvelope(input, hitl)));
          return;
        }

        push(encodeProgressEvent({ stage: 'pre_gate', label: 'Validación Compliance Pre-Gate', progressPct: 15 }));
        push(encodeProgressEvent({ stage: 'sku_lookup', label: 'Consultando precedentes SKU', progressPct: 30 }));
        push(encodeProgressEvent({ stage: 'hybrid_retrieval', label: 'Recuperando candidatas NCM oficiales', progressPct: 50 }));
        push(encodeProgressEvent({ stage: 'rgi_reasoning', label: 'Aplicando recorrido RGI 1 → 6', progressPct: 70 }));
        push(encodeProgressEvent({ stage: 'verifying_tariff', label: 'Verificando código en Decreto 4.944 y tributos', progressPct: 88 }));
        const line = classifyRequestOffline(input);
        const envelope = buildA2UIEnvelopeFromLine(line, input);
        if (cloudMode) {
          await persistClassificationOutcome(tenantId, line, input.query, runtimeLlm?.provider);
        }
        push(encodeProgressEvent({ stage: 'complete', label: 'Dictamen arancelario listo', progressPct: 100 }));
        push(encodeResultEvent(envelope));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected classification stream error';
        console.error('[classify-stream] Classification failed:', err);
        push(encodeErrorEvent(message, canRunLivePipeline ? 'LIVE_PIPELINE_ERROR' : 'CLASSIFICATION_ERROR'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
