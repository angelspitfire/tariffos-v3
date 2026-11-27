import { defineTool, type ToolContext } from 'eve/tools';
import { z } from 'zod';
import { A2UIEnvelopeSchema, type A2UIEnvelope } from '@tariffos/shared-types';
import { resolveToolTenantId, type MinimalSessionAuth } from '../lib/tenant-auth';

export const MAX_INLINE_MANIFEST_ITEMS = 25;

const ManifestItemSchema = z.object({
  sku: z.string().trim().optional(),
  description: z.string().trim().min(2),
  originCountry: z.string().trim().default('CN'),
  cifValue: z.number().nonnegative().default(0),
});

export const AnalyzeInvoiceManifestInputSchema = z.object({
  documentReference: z.string().trim().min(1).default('Manifiesto en chat'),
  countryCode: z.string().trim().default('VE'),
  deepMode: z.boolean().default(false),
  items: z.array(ManifestItemSchema).min(2).max(MAX_INLINE_MANIFEST_ITEMS),
});

export type AnalyzeInvoiceManifestInput = z.infer<typeof AnalyzeInvoiceManifestInputSchema>;

export interface AnalyzeInvoiceManifestSnapshot {
  phase: string;
  documentReference: string;
  totalItems: number;
  completedItems: number;
  stats: {
    totalLines: number;
    uniqueItems: number;
    blockedByPreGate: number;
    tier0Hits: number;
    tier1Hits: number;
    tier2Hits: number;
    webGroundingUsed: number;
  } | null;
  envelope: A2UIEnvelope | null;
  error?: string;
}

export async function* executeAnalyzeInvoiceManifest(
  input: AnalyzeInvoiceManifestInput,
  options?: { auth?: MinimalSessionAuth },
): AsyncGenerator<AnalyzeInvoiceManifestSnapshot, void, unknown> {
  const totalItems = input.items.length;

  yield {
    phase: `Analizando manifiesto ${input.documentReference} (${totalItems} líneas)…`,
    documentReference: input.documentReference,
    totalItems,
    completedItems: 0,
    stats: null,
    envelope: null,
  };

  const [
    {
      SUPPORTED_LIVE_COUNTRIES,
      classifyInvoiceBatch,
      isSupportedLiveCountry,
      mapBatchToA2UIEnvelope,
    },
    { isCloudModeEnabled },
  ] = await Promise.all([
    import('@tariffos/agent'),
    import('../../apps/web/src/lib/runtime-config'),
  ]);

  const tenantId = await resolveToolTenantId(options?.auth);
  const useCloudLive = isCloudModeEnabled() && tenantId !== 'eve-local-dev';

  if (useCloudLive && !isSupportedLiveCountry(input.countryCode)) {
    yield {
      phase: 'Jurisdicción no soportada en Cloud',
      documentReference: input.documentReference,
      totalItems,
      completedItems: 0,
      stats: null,
      envelope: null,
      error: `Jurisdicción ${input.countryCode} no disponible en Cloud. Soportadas: ${SUPPORTED_LIVE_COUNTRIES.join(', ')}.`,
    };
    return;
  }

  const lineInputs = input.items.map((item, idx) => ({
    lineId: `line-${idx + 1}`,
    sku: item.sku,
    description: item.description,
    originCountry: item.originCountry,
    cifValue: item.cifValue,
  }));

  const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());
  let batchResult;
  if (useCloudLive || hasDatabase) {
    const [{ createPrismaPipelinePorts }, { getActiveLlmRuntimeConfig, toRgiLlmRuntimeOverride }] =
      await Promise.all([
        import('../../apps/web/src/lib/agent/prisma-ports'),
        import('../../apps/web/src/lib/admin/llm-settings'),
      ]);
    const runtimeLlm = await getActiveLlmRuntimeConfig();
    const ports = createPrismaPipelinePorts(toRgiLlmRuntimeOverride(runtimeLlm));
    batchResult = await classifyInvoiceBatch(lineInputs, ports, {
      tenantId,
      countryCode: input.countryCode,
      deepMode: input.deepMode,
    });
  } else {
    const { classifyItemOffline } = await import('../../apps/web/src/lib/agent/offline-classifier');
    batchResult = {
      lines: lineInputs.map((item) => classifyItemOffline(item)),
      stats: {
        totalLines: lineInputs.length,
        uniqueItems: lineInputs.length,
        blockedByPreGate: 0,
        tier0Hits: 0,
        tier1Hits: 0,
        tier2Hits: lineInputs.length,
        webGroundingUsed: 0,
      },
    };
  }

  const envelope = A2UIEnvelopeSchema.parse(
    mapBatchToA2UIEnvelope(batchResult, { documentReference: input.documentReference }),
  );

  yield {
    phase: `Manifiesto procesado (${totalItems} líneas)`,
    documentReference: input.documentReference,
    totalItems,
    completedItems: totalItems,
    stats: batchResult.stats,
    envelope,
  };
}

export default defineTool({
  description:
    'Classify a multi-item commercial invoice, packing list, or manifest (2 to 25 items) directly in chat with live streaming progress, generating an interactive batch_manifest triage view in the Canvas without polling.',
  inputSchema: AnalyzeInvoiceManifestInputSchema,
  async *execute(
    input: AnalyzeInvoiceManifestInput,
    ctx: ToolContext,
  ): AsyncGenerator<AnalyzeInvoiceManifestSnapshot, void, unknown> {
    yield* executeAnalyzeInvoiceManifest(input, { auth: ctx.session.auth });
  },
  label: {
    start: ({ documentReference, items }) =>
      `Analizando manifiesto ${documentReference} (${items.length} ítems)…`,
    delta: (_input, partial) => partial.phase,
    complete: (_input, output) =>
      output.error ? `Error en manifiesto: ${output.documentReference}` : output.phase,
  },
  toModelOutput(output) {
    if (output.error || !output.envelope) {
      return {
        type: 'error-text',
        value: output.error ?? 'No se pudo procesar el manifiesto.',
      };
    }
    const batch = output.envelope.canvasComponents.find((c) => c.type === 'batch_manifest');
    const items = batch?.items ?? [];
    const needsReviewCount = items.filter((item) => item.status === 'needs_review').length;
    return {
      type: 'json',
      value: {
        documentReference: output.documentReference,
        totalItems: output.totalItems,
        classifiedCount: items.length - needsReviewCount,
        needsReviewCount,
        lines: items.map((item) => ({
          lineNumber: item.lineNumber,
          skuOrRef: item.skuOrRef,
          description: item.description,
          hsCode: item.hsCode,
          status: item.status,
          confidencePct: item.confidencePct,
        })),
      },
    };
  },
});
