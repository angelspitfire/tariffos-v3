import {
  calculateDeterministicDuties,
  classifyInvoiceBatch,
  deduplicateInvoiceItems,
  type BatchPipelineResult,
  type InvoiceItemInput,
} from '@tariffos/agent';
import type { ClassificationLinePayload } from '@tariffos/shared-types';
import { getActiveLlmRuntimeConfig, toRgiLlmRuntimeOverride } from '@/lib/admin/llm-settings';
import { createPrismaPipelinePorts } from '@/lib/agent/prisma-ports';
import { chunkItems, DEFAULT_MICRO_BATCH_SIZE } from './batch-helpers';

export interface BatchChunkDoneContext {
  chunkIndex: number;
  totalChunks: number;
  coveredCount: number;
  totalItems: number;
}

export type BatchStepRunner = (stepId: string, fn: () => Promise<unknown>) => Promise<unknown>;

export interface ExecuteChunkedBatchParams {
  items: readonly InvoiceItemInput[];
  tenantId: string;
  countryCode: string;
  deepMode: boolean;
  runStep?: BatchStepRunner;
  onChunkDone?: (ctx: BatchChunkDoneContext) => Promise<void>;
}

const directStepRunner: BatchStepRunner = (_stepId, fn) => fn();

interface DedupGroupRow {
  key: string;
  representative: InvoiceItemInput;
  members: InvoiceItemInput[];
}

interface ChunkOutcome {
  lines: ClassificationLinePayload[];
  webGroundingUsed: number;
}

function stripTokenUsageFromClone(line: ClassificationLinePayload): Omit<ClassificationLinePayload, 'tokenUsage'> {
  const { tokenUsage: _omitTokenUsage, ...rest } = line;
  return rest;
}

/**
 * Shared chunked batch execution core used by both inline execution and Inngest durable jobs.
 * Deduplicates items, classifies representatives in micro-batches, strips tokenUsage from cloned
 * duplicates (preventing N× token billing), preserves original item order, and computes member-weighted stats.
 */
export async function executeChunkedBatchPlan(
  params: ExecuteChunkedBatchParams,
): Promise<BatchPipelineResult> {
  const runStep = params.runStep ?? directStepRunner;
  const deduped = (await runStep('deduplicate-invoice-lines', async () => {
    const groups = deduplicateInvoiceItems([...params.items]);
    return groups.map((group) => ({
      key: group.key,
      representative: group.representative,
      members: group.members,
    }));
  })) as DedupGroupRow[];

  const representatives = deduped.map((g) => g.representative);
  const chunks = chunkItems(representatives, DEFAULT_MICRO_BATCH_SIZE);
  const classifiedByRepId = new Map<string, ClassificationLinePayload>();
  const groupSizeByRepId = new Map<string, number>();
  for (const group of deduped) {
    groupSizeByRepId.set(group.representative.lineId, group.members.length);
  }

  let coveredCount = 0;
  let webGroundingUsed = 0;

  for (let idx = 0; idx < chunks.length; idx += 1) {
    const chunk = chunks[idx]!;
    const chunkOutcome = (await runStep(`classify-micro-batch-${idx}`, async () => {
      const runtimeLlm = await getActiveLlmRuntimeConfig();
      const ports = createPrismaPipelinePorts(toRgiLlmRuntimeOverride(runtimeLlm));
      const result = await classifyInvoiceBatch(chunk, ports, {
        tenantId: params.tenantId,
        countryCode: params.countryCode,
        deepMode: params.deepMode,
      });
      return { lines: result.lines, webGroundingUsed: result.stats.webGroundingUsed };
    })) as ChunkOutcome;

    webGroundingUsed += chunkOutcome.webGroundingUsed;
    for (const line of chunkOutcome.lines) {
      classifiedByRepId.set(line.lineId, line);
      coveredCount += groupSizeByRepId.get(line.lineId) ?? 1;
    }

    if (params.onChunkDone) {
      await params.onChunkDone({
        chunkIndex: idx,
        totalChunks: chunks.length,
        coveredCount,
        totalItems: params.items.length,
      });
    }
  }

  const byLineId = new Map<string, ClassificationLinePayload>();
  let blockedByPreGate = 0;
  let tier0Hits = 0;
  let tier1Hits = 0;
  let tier2Hits = 0;

  for (const group of deduped) {
    const template = classifiedByRepId.get(group.representative.lineId);
    if (!template) continue;
    const count = group.members.length;
    if (template.tierUsed === 'pre_gate_blocked') blockedByPreGate += count;
    else if (template.tierUsed === 'tier0_sku') tier0Hits += count;
    else if (template.tierUsed === 'tier1_fast') tier1Hits += count;
    else if (template.tierUsed === 'tier2_rgi') tier2Hits += count;

    for (const member of group.members) {
      byLineId.set(
        member.lineId,
        member.lineId === template.lineId
          ? template
          : {
              ...stripTokenUsageFromClone(template),
              lineId: member.lineId,
              duties: calculateDeterministicDuties(member.cifValue, template.duties),
            },
      );
    }
  }

  const lines = params.items
    .map((item) => byLineId.get(item.lineId))
    .filter((line): line is ClassificationLinePayload => Boolean(line));

  return {
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
}
