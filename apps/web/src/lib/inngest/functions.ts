import type { InvoiceItemInput } from '@tariffos/agent';
import { executeChunkedBatchPlan } from './batch-executor';
import type { BatchDocumentMetadata } from './batch-file-extractor';
import { buildBatchSummary, parseBatchTextToItems } from './batch-helpers';
import { batchChannel, type BatchProgressEvent } from './channels';
import { inngest } from './client';
import { indexPublishedLegalFn } from './legal-indexing-fn';
import { ingestLegalDocumentFn } from './legal-ingestion-fn';
import { persistFilingLinesAndUsage } from './persist-filing';

const PER_TENANT_CONCURRENCY_LIMIT = 3;
const GLOBAL_BATCH_CONCURRENCY_LIMIT = 15;
const BATCH_THROTTLE_LIMIT = 60;

export interface ClassifyBatchEventData {
  filingId: string;
  tenantId: string;
  countryCode: string;
  deepMode: boolean;
  items?: InvoiceItemInput[];
  sourceText?: string;
  fileName?: string;
  extractionMethod?: 'deterministic' | 'llm_vl';
  documentMeta?: BatchDocumentMetadata;
}

export const classifyInvoiceBatchFn = inngest.createFunction(
  {
    id: 'classify-invoice-batch',
    retries: 2,
    concurrency: [
      { limit: PER_TENANT_CONCURRENCY_LIMIT, key: 'event.data.tenantId' },
      { limit: GLOBAL_BATCH_CONCURRENCY_LIMIT },
    ],
    throttle: {
      limit: BATCH_THROTTLE_LIMIT,
      period: '1m',
    },
    triggers: [{ event: 'filing/batch.requested' }],
  },
  async ({ event, step }) => {
    const data = event.data as ClassifyBatchEventData;
    const totalRequested = data.items?.length ?? 0;

    const publishProgress = async (
      stepId: string,
      payload: Omit<BatchProgressEvent, 'filingId' | 'ts'>,
    ) => {
      if (!step.realtime?.publish) return;
      try {
        await step.realtime.publish(stepId, batchChannel(data.filingId).progress, {
          filingId: data.filingId,
          ...payload,
          ts: Date.now(),
        });
      } catch {
        // Realtime broadcast must never fail durable batch classification
      }
    };

    await publishProgress('emit-parsing', {
      stage: 'parsing',
      label: 'Extrayendo líneas de factura…',
      completedItems: 0,
      totalItems: totalRequested,
      progressPct: 5,
    });

    const parsedItems = await step.run('parse-source-document', async () => {
      if (data.items && data.items.length > 0) return data.items;
      return data.sourceText ? parseBatchTextToItems(data.sourceText) : [];
    });

    await publishProgress('emit-deduplicating', {
      stage: 'deduplicating',
      label: 'Agrupando SKUs idénticos…',
      completedItems: 0,
      totalItems: parsedItems.length,
      progressPct: 15,
    });

    const batchResult = await executeChunkedBatchPlan({
      items: parsedItems,
      tenantId: data.tenantId,
      countryCode: data.countryCode,
      deepMode: data.deepMode,
      runStep: (stepId, fn) => step.run(stepId, fn),
      onChunkDone: async ({ chunkIndex, totalChunks, coveredCount, totalItems }) => {
        const pct = totalChunks > 0 ? Math.round(20 + ((chunkIndex + 1) / totalChunks) * 65) : 85;
        await publishProgress(`emit-chunk-${chunkIndex}`, {
          stage: 'classifying',
          label: `Clasificando bloque ${chunkIndex + 1} de ${totalChunks}…`,
          completedItems: Math.min(coveredCount, totalItems),
          totalItems,
          progressPct: pct,
          chunkIndex: chunkIndex + 1,
          totalChunks,
        });
      },
    });

    await publishProgress('emit-persisting', {
      stage: 'persisting',
      label: 'Guardando expediente y métricas…',
      completedItems: batchResult.lines.length,
      totalItems: parsedItems.length || batchResult.lines.length,
      progressPct: 92,
    });

    await step.run('persist-filing-and-usage', async () =>
      persistFilingLinesAndUsage({
        filingId: data.filingId,
        tenantId: data.tenantId,
        lines: batchResult.lines,
      }),
    );

    await publishProgress('emit-completed', {
      stage: 'completed',
      label: 'Lote clasificado y listo para triage',
      completedItems: batchResult.lines.length,
      totalItems: parsedItems.length || batchResult.lines.length,
      progressPct: 100,
    });

    return {
      filingId: data.filingId,
      linesProcessed: batchResult.lines.length,
      summary: buildBatchSummary(batchResult.lines),
    };
  },
);

export const inngestFunctions = [classifyInvoiceBatchFn, ingestLegalDocumentFn, indexPublishedLegalFn];
