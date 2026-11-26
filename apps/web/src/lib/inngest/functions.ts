import {
  calculateDeterministicDuties,
  classifyInvoiceBatch,
  deduplicateInvoiceItems,
  type InvoiceItemInput,
} from '@tariffos/agent';
import { billingService, prisma } from '@tariffos/database';
import type { ClassificationLinePayload } from '@tariffos/shared-types';
import { createPrismaPipelinePorts } from '@/lib/agent/prisma-ports';
import {
  buildBatchSummary,
  chunkItems,
  DEFAULT_MICRO_BATCH_SIZE,
  parseBatchTextToItems,
} from './batch-helpers';
import { inngest } from './client';

const PER_TENANT_CONCURRENCY_LIMIT = 3;
const GLOBAL_BATCH_CONCURRENCY_LIMIT = 15;
const BATCH_THROTTLE_LIMIT = 60;
const AUTO_STATUS_CONFIDENCE_THRESHOLD = 85;

export interface ClassifyBatchEventData {
  filingId: string;
  tenantId: string;
  countryCode: string;
  deepMode: boolean;
  items?: InvoiceItemInput[];
  sourceText?: string;
}

function mapLineStatus(line: ClassificationLinePayload): 'AUTO' | 'CONFIRM' | 'BLOCKED' {
  if (line.tierUsed === 'pre_gate_blocked' || line.flags.some((f) => f.type === 'blocking')) {
    return 'BLOCKED';
  }
  return line.confidencePct >= AUTO_STATUS_CONFIDENCE_THRESHOLD && line.verifiedAgainstDb
    ? 'AUTO'
    : 'CONFIRM';
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

    const parsedItems = await step.run('parse-source-document', async () => {
      if (data.items && data.items.length > 0) return data.items;
      return data.sourceText ? parseBatchTextToItems(data.sourceText) : [];
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

    for (let idx = 0; idx < chunks.length; idx += 1) {
      const chunk = chunks[idx];
      const chunkLines = await step.run(`classify-micro-batch-${idx}`, async () => {
        const ports = createPrismaPipelinePorts();
        const result = await classifyInvoiceBatch(chunk, ports, {
          tenantId: data.tenantId,
          countryCode: data.countryCode,
          deepMode: data.deepMode,
        });
        return result.lines;
      });

      for (const line of chunkLines) {
        classifiedByRepId.set(line.lineId, line);
      }
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

    await step.run('persist-filing-and-usage', async () => {
      if (!process.env.DATABASE_URL) return { persisted: 0 };

      for (let i = 0; i < allLines.length; i += 1) {
        const line = allLines[i];
        await prisma.filingLine.upsert({
          where: {
            filingId_lineNumber: {
              filingId: data.filingId,
              lineNumber: i + 1,
            },
          },
          update: {
            description: line.product,
            hsCode: line.hsCode,
            confidence: line.confidencePct / 100,
            status: mapLineStatus(line),
            cifValue: line.duties.cif,
            taxBreakdown: line.duties,
            rgiSteps: line.rgiSteps,
            candidates: line.alternatives,
            rawResult: line,
          },
          create: {
            tenantId: data.tenantId,
            filingId: data.filingId,
            lineNumber: i + 1,
            description: line.product,
            hsCode: line.hsCode,
            confidence: line.confidencePct / 100,
            status: mapLineStatus(line),
            cifValue: line.duties.cif,
            taxBreakdown: line.duties,
            rgiSteps: line.rgiSteps,
            candidates: line.alternatives,
            rawResult: line,
          },
        });
      }

      if (allLines.length > 0) {
        await billingService.incrementUsage(data.tenantId, 'classification', allLines.length);
      }
      return { persisted: allLines.length };
    });

    return {
      filingId: data.filingId,
      linesProcessed: allLines.length,
      summary: buildBatchSummary(allLines),
    };
  },
);

export const inngestFunctions = [classifyInvoiceBatchFn];
