import { classifyInvoiceBatch } from '@tariffos/agent';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import {
  ClassifyStreamRequestSchema,
  type ClassifyStreamRequest,
} from '@/lib/agent/classify-stream-schema';
import {
  checkTenantQuota,
  persistClassificationOutcome,
  resolveCloudTenantContext,
} from '@/lib/agent/cloud-session';
import {
  buildA2UIEnvelopeFromLine,
  buildHitlEnvelope,
} from '@/lib/agent/envelope-builder';
import {
  classifyRequestOffline,
  detectMissingCriticalInfo,
} from '@/lib/agent/offline-classifier';
import { createPrismaPipelinePorts } from '@/lib/agent/prisma-ports';
import {
  encodeErrorEvent,
  encodeProgressEvent,
  encodeResultEvent,
} from '@/lib/agent/sse-encoder';

async function runClassificationLine(
  input: ClassifyStreamRequest,
  tenantId: string,
  cloudMode: boolean,
) {
  const canRunLivePipeline =
    cloudMode &&
    Boolean(process.env.DATABASE_URL) &&
    Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);

  if (!canRunLivePipeline) {
    return classifyRequestOffline(input);
  }

  try {
    const ports = createPrismaPipelinePorts();
    const batch = await classifyInvoiceBatch(
      [
        {
          lineId: 'interactive-1',
          sku: input.sku,
          description: input.query,
          originCountry: input.originCountry,
          cifValue: input.cifValue,
        },
      ],
      ports,
      {
        tenantId,
        countryCode: input.countryCode,
        deepMode: input.deepMode,
      },
    );
    return batch.lines[0] ?? classifyRequestOffline(input);
  } catch {
    return classifyRequestOffline(input);
  }
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
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    tenantId = auth.context.tenantId;

    const quota = await checkTenantQuota(tenantId);
    if (!quota.allowed) {
      return Response.json(
        { error: 'Classification quota reached', reason: quota.reason ?? 'LIMIT_REACHED' },
        { status: 402 },
      );
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (frame: string) => controller.enqueue(encoder.encode(frame));

      try {
        push(encodeProgressEvent({ stage: 'pre_gate', label: 'Validación Compliance Pre-Gate', progressPct: 15 }));
        const hitl = detectMissingCriticalInfo(input.query, input.hitlAnswers);

        push(encodeProgressEvent({ stage: 'sku_lookup', label: 'Consultando precedentes SKU', progressPct: 30 }));
        if (hitl.needsHitl) {
          push(encodeProgressEvent({ stage: 'complete', label: 'Requiere validación técnica HITL', progressPct: 100 }));
          push(encodeResultEvent(buildHitlEnvelope(input, hitl)));
          return;
        }

        push(encodeProgressEvent({ stage: 'hybrid_retrieval', label: 'Recuperando candidatas NCM oficiales', progressPct: 50 }));
        push(encodeProgressEvent({ stage: 'rgi_reasoning', label: 'Aplicando recorrido RGI 1 → 6', progressPct: 70 }));
        const line = await runClassificationLine(input, tenantId, cloudMode);

        push(encodeProgressEvent({ stage: 'verifying_tariff', label: 'Verificando código en Decreto 4.944 y tributos', progressPct: 88 }));
        const envelope = buildA2UIEnvelopeFromLine(line, input);

        if (cloudMode) {
          await persistClassificationOutcome(tenantId, line, input.query);
        }

        push(encodeProgressEvent({ stage: 'complete', label: 'Dictamen arancelario listo', progressPct: 100 }));
        push(encodeResultEvent(envelope));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected classification stream error';
        push(encodeErrorEvent(message));
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
