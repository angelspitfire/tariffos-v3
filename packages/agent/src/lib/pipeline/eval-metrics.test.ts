import { describe, expect, it } from 'vitest';
import { matchPrefixDigits, summarizeEvalResults } from './eval-metrics.js';

describe('eval-metrics', () => {
  it('compares dotted and compact HS codes at 4, 6, and 10 digit granularities', () => {
    expect(matchPrefixDigits('8471.30.90.90', '8471301990', 4)).toBe(true);
    expect(matchPrefixDigits('8471.30.90.90', '8471301990', 6)).toBe(true);
    expect(matchPrefixDigits('8471.30.90.90', '8471301990', 10)).toBe(false);
    expect(matchPrefixDigits('8471.30.90.90', '8471309090', 10)).toBe(true);
  });

  it('computes hit4/6/10, recall@5/10, and latency percentiles accurately', () => {
    const summary = summarizeEvalResults([
      {
        id: '1',
        query: 'Laptop',
        expectedHs10: '8471.30.90.90',
        predictedHs: '8471.30.90.90',
        retrievedHsCodes: ['8471.30.90.90', '8471.30.19.90'],
        latencyMs: 100,
      },
      {
        id: '2',
        query: 'Smartwatch',
        expectedHs10: '9102.19.00.00',
        predictedHs: '9102.11.00.00',
        retrievedHsCodes: ['8517.62.00.00', '9102.19.00.00'],
        latencyMs: 300,
      },
    ]);

    expect(summary).toEqual({
      total: 2,
      hit4Pct: 100,
      hit6Pct: 50,
      hit10Pct: 50,
      recallAt5Pct: 100,
      recallAt10Pct: 100,
      p50LatencyMs: 200,
      p95LatencyMs: 300,
    });
  });

  it('returns zeroed summary for empty input', () => {
    expect(summarizeEvalResults([])).toEqual({
      total: 0,
      hit4Pct: 0,
      hit6Pct: 0,
      hit10Pct: 0,
      recallAt5Pct: 0,
      recallAt10Pct: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
    });
  });
});
