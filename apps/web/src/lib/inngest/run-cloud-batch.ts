import {
  calculateDeterministicDuties,
  classifyInvoiceBatch,
  deduplicateInvoiceItems,
  mapBatchToA2UIEnvelope,
  type BatchPipelineResult,
  type InvoiceItemInput,
} from '@tariffos/agent';
import type { A2UIEnvelope, ClassificationLinePayload } from '@tariffos/shared-types';
import { getActiveLlmRuntimeConfig } from '@/lib/admin/llm-settings';
import { createPrismaPipelinePorts } from '@/lib/agent/prisma-ports';
import {
  buildBatchSummary,
  chunkItems,
  DEFAULT_MICRO_BATCH_SIZE,
  type BatchSummary,
} from './batch-helpers';
import type { BatchDocumentMetadata } from './batch-file-extractor';
import { persistFilingLinesAndUsage } from './persist-filing';

export type BatchExecutionMode = 'inline' | 'inngest';

/**
 * Selects inline execution by default in local dev so invoices run end-to-end
 * without launching an external Inngest dev server. Uses Inngest in production
 * (when `INNGEST_EVENT_KEY` is configured), when `INNGEST_DEV=1|true`, or when
 * explicitly forced via `BATCH_EXECUTION_MODE`.
 */
export function resolveBatchExecutionMode(): BatchExecutionMode {
  const explicit = process.env.BATCH_EXECUTION_MODE?.trim().toLowerCase();
  if (explicit === 'inline') return 'inline';
  if (explicit === 'inngest') return 'inngest';

  if (process.env.INNGEST_DEV === '1' || process.env.INNGEST_DEV === 'true') {
    return 'inngest';
  }
  if (process.env.NODE_ENV === 'production' && Boolean(process.env.INNGEST_EVENT_KEY?.trim())) {
    return 'inngest';
  }
  return 'inline';
}

export interface InlineBatchResult {
  lines: ClassificationLinePayload[];
  summary: BatchSummary;
  envelope: A2UIEnvelope;
}

/** Runs full cloud batch classification inline and persists results into Supabase Filing tables. */
export async function executeCloudBatchInline(params: {
  filingId: string;
  tenantId: string;
  countryCode: string;
  deepMode: boolean;
  items: readonly InvoiceItemInput[];
  fileName?: string;
  documentMeta?: BatchDocumentMetadata;
}): Promise<InlineBatchResult> {
  const deduped = deduplicateInvoiceItems([...params.items]);
  const representatives = deduped.map((g) => g.representative);
  const chunks = chunkItems(representatives, DEFAULT_MICRO_BATCH_SIZE);
  const runtimeLlm = await getActiveLlmRuntimeConfig();
  const ports = createPrismaPipelinePorts(
    runtimeLlm.source === 'database'
      ? {
          provider: runtimeLlm.provider,
          model: runtimeLlm.model,
          deepModel: runtimeLlm.deepModel,
          baseUrl: runtimeLlm.baseUrl,
        }
      : undefined,
  );

  const classifiedByRepId = new Map<string, ClassificationLinePayload>();
  let tier0Hits = 0;
  let tier1Hits = 0;
  let tier2Hits = 0;
  let blockedByPreGate = 0;
  let webGroundingUsed = 0;

  for (const chunk of chunks) {
    const res = await classifyInvoiceBatch(chunk, ports, {
      tenantId: params.tenantId,
      countryCode: params.countryCode,
      deepMode: params.deepMode,
    });
    tier0Hits += res.stats.tier0Hits;
    tier1Hits += res.stats.tier1Hits;
    tier2Hits += res.stats.tier2Hits;
    blockedByPreGate += res.stats.blockedByPreGate;
    webGroundingUsed += res.stats.webGroundingUsed;
    for (const line of res.lines) classifiedByRepId.set(line.lineId, line);
  }

  const lines: ClassificationLinePayload[] = [];
  for (const group of deduped) {
    const template = classifiedByRepId.get(group.representative.lineId);
    if (!template) continue;
    for (const member of group.members) {
      lines.push(
        member.lineId === template.lineId
          ? template
          : {
              ...template,
              lineId: member.lineId,
              duties: calculateDeterministicDuties(member.cifValue, template.duties),
            },
      );
    }
  }

  await persistFilingLinesAndUsage({
    filingId: params.filingId,
    tenantId: params.tenantId,
    lines,
  });

  const pipelineResult: BatchPipelineResult = {
    lines,
    stats: {
      totalLines: lines.length,
      uniqueItems: representatives.length,
      blockedByPreGate,
      tier0Hits,
      tier1Hits,
      tier2Hits,
      webGroundingUsed,
    },
  };

  return {
    lines,
    summary: buildBatchSummary(lines),
    envelope: mapBatchToA2UIEnvelope(pipelineResult, {
      id: params.filingId,
      title: params.fileName ? `Lote: ${params.fileName}` : 'Manifiesto de Clasificación en Lote',
      documentReference: params.documentMeta?.documentReference ?? params.fileName ?? params.filingId,
      ...(params.documentMeta?.shipper ? { shipper: params.documentMeta.shipper } : {}),
      ...(params.documentMeta?.consignee ? { consignee: params.documentMeta.consignee } : {}),
      ...(params.documentMeta?.incoterm ? { routeOrIncoterm: params.documentMeta.incoterm } : {}),
    }),
  };
}
