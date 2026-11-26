import { channel } from 'inngest/realtime';
import { z } from 'zod';

export const BatchProgressStageSchema = z.enum([
  'queued',
  'parsing',
  'deduplicating',
  'classifying',
  'persisting',
  'completed',
  'failed',
]);

export const BatchProgressEventSchema = z.object({
  filingId: z.string(),
  stage: BatchProgressStageSchema,
  label: z.string(),
  completedItems: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  progressPct: z.number().min(0).max(100),
  chunkIndex: z.number().int().nonnegative().optional(),
  totalChunks: z.number().int().nonnegative().optional(),
  error: z.string().optional(),
  ts: z.number(),
});

export type BatchProgressStage = z.infer<typeof BatchProgressStageSchema>;
export type BatchProgressEvent = z.infer<typeof BatchProgressEventSchema>;

/** Per-filing Inngest v4 Realtime channel for live invoice batch progress. */
export const batchChannel = channel({
  name: (filingId: string) => `batch:${filingId}`,
  topics: {
    progress: {
      schema: BatchProgressEventSchema,
    },
  },
});
