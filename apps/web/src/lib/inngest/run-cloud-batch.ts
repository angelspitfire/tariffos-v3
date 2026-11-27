import { mapBatchToA2UIEnvelope, type InvoiceItemInput } from '@tariffos/agent';
import type { A2UIEnvelope, ClassificationLinePayload } from '@tariffos/shared-types';
import { executeChunkedBatchPlan } from './batch-executor';
import type { BatchDocumentMetadata } from './batch-file-extractor';
import { buildBatchSummary, type BatchSummary } from './batch-helpers';
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
  const pipelineResult = await executeChunkedBatchPlan({
    items: params.items,
    tenantId: params.tenantId,
    countryCode: params.countryCode,
    deepMode: params.deepMode,
  });

  await persistFilingLinesAndUsage({
    filingId: params.filingId,
    tenantId: params.tenantId,
    lines: pipelineResult.lines,
  });

  return {
    lines: pipelineResult.lines,
    summary: buildBatchSummary(pipelineResult.lines),
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
