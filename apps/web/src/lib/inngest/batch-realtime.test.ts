import { describe, expect, it } from 'vitest';
import { BatchProgressEventSchema, batchChannel } from './channels';

describe('Inngest v4 batchChannel & progress schema', () => {
  it('builds a per-filing parametric realtime channel and validates progress events', () => {
    const instance = batchChannel('batch-42');
    expect(instance.name).toBe('batch:batch-42');
    expect(instance.progress.channel).toBe('batch:batch-42');
    expect(instance.progress.topic).toBe('progress');

    const parsed = BatchProgressEventSchema.parse({
      filingId: 'batch-42',
      stage: 'classifying',
      label: 'Clasificando bloque 2 de 4…',
      completedItems: 20,
      totalItems: 35,
      progressPct: 58,
      chunkIndex: 2,
      totalChunks: 4,
      ts: Date.now(),
    });
    expect(parsed.progressPct).toBe(58);
  });
});
