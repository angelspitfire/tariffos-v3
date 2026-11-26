import { describe, expect, it } from 'vitest';
import {
  chunkIdsIntoBatches,
  LEGAL_INDEX_BATCH_SIZE,
  resolveIndexingKind,
  shouldEmbedLegalType,
} from './legal-ingestion-helpers';

describe('legal-ingestion-helpers', () => {
  it('resolves indexing kind and embedding eligibility by legalType', () => {
    expect(resolveIndexingKind('TARIFF_SCHEDULE')).toBe('tariff');
    expect(resolveIndexingKind('LEGAL_NOTE')).toBe('legal');

    expect(shouldEmbedLegalType('SECTION', false)).toBe(false);
    expect(shouldEmbedLegalType('CHAPTER', false)).toBe(false);
    expect(shouldEmbedLegalType('CHAPTER', true)).toBe(true);
    expect(shouldEmbedLegalType('LEGAL_NOTE', false)).toBe(true);
    expect(shouldEmbedLegalType('EXEMPTION', false)).toBe(true);
  });

  it('splits chunk IDs or hsCodes into bounded micro-batches', () => {
    const ids = Array.from({ length: 45 }, (_, i) => `id-${i}`);
    const batches = chunkIdsIntoBatches(ids, LEGAL_INDEX_BATCH_SIZE);
    expect(LEGAL_INDEX_BATCH_SIZE).toBe(20);
    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(20);
    expect(batches[1]).toHaveLength(20);
    expect(batches[2]).toHaveLength(5);
  });
});
