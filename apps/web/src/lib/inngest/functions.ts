import {
  calculateDeterministicDuties,
  classifyInvoiceBatch,
  deduplicateInvoiceItems,
  type InvoiceItemInput,
} from '@tariffos/agent';
import type { ClassificationLinePayload } from '@tariffos/shared-types';
import { getActiveLlmRuntimeConfig } from '@/lib/admin/llm-settings';
import { createPrismaPipelinePorts } from '@/lib/agent/prisma-ports';
import {
  buildBatchSummary,
  chunkItems,
  DEFAULT_MICRO_BATCH_SIZE,
  parseBatchTextToItems,
} from './batch-helpers';
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

    const deduped = await step.run('deduplicate-invoice-lines', async () => {
      const groups = deduplicateInvoiceItems(parsedItems);
      return groups.map((group) => ({
        key: group.key,
        representative: group.representative,
        members: group.members,
      }));
    });

    const representativeItems = deduped.map((g) => g.representative);
    const chunks = chunkItems(representativeItems, DEFAULT_MICRO_BATCH_SIZE);
    const classifiedByRepId = new Map<string, ClassificationLinePayload>();
    const groupSizeByRepId = new Map<string, number>();
    for (const group of deduped) groupSizeByRepId.set(group.representative.lineId, group.members.length);

    let coveredCount = 0;
    for (let idx = 0; idx < chunks.length; idx += 1) {
      const chunk = chunks[idx];
      const chunkLines = await step.run(`classify-micro-batch-${idx}`, async () => {
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
        const result = await classifyInvoiceBatch(chunk, ports, {
          tenantId: data.tenantId,
          countryCode: data.countryCode,
          deepMode: data.deepMode,
        });
        return result.lines;
      });

      for (const line of chunkLines) {
        classifiedByRepId.set(line.lineId, line);
        coveredCount += groupSizeByRepId.get(line.lineId) ?? 1;
      }

      const pct = chunks.length > 0 ? Math.round(20 + ((idx + 1) / chunks.length) * 65) : 85;
      await publishProgress(`emit-chunk-${idx}`, {
        stage: 'classifying',
        label: `Clasificando bloque ${idx + 1} de ${chunks.length}…`,
        completedItems: Math.min(coveredCount, parsedItems.length),
        totalItems: parsedItems.length,
        progressPct: pct,
        chunkIndex: idx + 1,
        totalChunks: chunks.length,
      });
    }

    const allLines: ClassificationLinePayload[] = [];
    for (const group of deduped) {
      const template = classifiedByRepId.get(group.representative.lineId);
      if (!template) continue;
      for (const member of group.members) {
        allLines.push(
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

    await publishProgress('emit-persisting', {
      stage: 'persisting',
      label: 'Guardando expediente y métricas…',
      completedItems: allLines.length,
      totalItems: parsedItems.length || allLines.length,
      progressPct: 92,
    });

    await step.run('persist-filing-and-usage', async () =>
      persistFilingLinesAndUsage({
        filingId: data.filingId,
        tenantId: data.tenantId,
        lines: allLines,
      }),
    );

    await publishProgress('emit-completed', {
      stage: 'completed',
      label: 'Lote clasificado y listo para triage',
      completedItems: allLines.length,
      totalItems: parsedItems.length || allLines.length,
      progressPct: 100,
    });

    return {
      filingId: data.filingId,
      linesProcessed: allLines.length,
      summary: buildBatchSummary(allLines),
    };
  },
);

export const inngestFunctions = [classifyInvoiceBatchFn, ingestLegalDocumentFn, indexPublishedLegalFn];
