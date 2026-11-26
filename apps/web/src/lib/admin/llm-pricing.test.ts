import { describe, expect, it } from 'vitest';
import {
  computeAvgTokensPerClassification,
  estimateTokenCostUsd,
} from './llm-pricing';

describe('llm-pricing', () => {
  it('estimates USD cost from known OpenRouter model rates', () => {
    // nvidia/nemotron-3.5-super-vl: $0.15 / 1M in, $0.47 / 1M out
    const cost = estimateTokenCostUsd('nvidia/nemotron-3.5-super-vl', 4_000, 1_000);
    expect(cost).toBeCloseTo(0.00107, 6);
  });

  it('uses fallback pricing when model id is unknown or null', () => {
    const cost = estimateTokenCostUsd(null, 1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(0.62, 4);
  });

  it('computes average tokens per classification safely (zero-safe)', () => {
    expect(computeAvgTokensPerClassification(4000, 1000, 0)).toBe(0);
    expect(computeAvgTokensPerClassification(12000, 3000, 3)).toBe(5000);
  });
});