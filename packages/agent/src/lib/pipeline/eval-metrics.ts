import { digits } from '../util/code.js';

export interface GoldenCase {
  id: string;
  query: string;
  expectedHs4: string;
  expectedHs6: string;
  expectedHs10: string;
  notes?: string;
}

export interface EvalCaseResult {
  id: string;
  query: string;
  expectedHs10: string;
  predictedHs: string | null;
  retrievedHsCodes: string[];
  latencyMs: number;
}

export interface EvalSummary {
  total: number;
  hit4Pct: number;
  hit6Pct: number;
  hit10Pct: number;
  recallAt5Pct: number;
  recallAt10Pct: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
}

const PCT_MULTIPLIER = 100;

export function matchPrefixDigits(
  actualHs: string | null | undefined,
  expectedHs: string,
  digitsCount: 4 | 6 | 10,
): boolean {
  if (!actualHs) return false;
  const cleanActual = digits(actualHs);
  const cleanExpected = digits(expectedHs);
  if (cleanActual.length < digitsCount || cleanExpected.length < digitsCount) {
    return false;
  }
  return cleanActual.slice(0, digitsCount) === cleanExpected.slice(0, digitsCount);
}

function roundPct(count: number, total: number): number {
  if (total === 0) return 0;
  return Number(((count / total) * PCT_MULTIPLIER).toFixed(1));
}

function percentile(sorted: number[], pct: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 2 && pct === 0.5) {
    return Math.round((sorted[0]! + sorted[1]!) / 2);
  }
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * pct) - 1));
  return Math.round(sorted[index]!);
}

/** Aggregates 4/6/10-digit precision, retrieval recall@5/@10, and latency percentiles. */
export function summarizeEvalResults(results: EvalCaseResult[]): EvalSummary {
  const total = results.length;
  if (total === 0) {
    return {
      total: 0,
      hit4Pct: 0,
      hit6Pct: 0,
      hit10Pct: 0,
      recallAt5Pct: 0,
      recallAt10Pct: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
    };
  }

  let hit4 = 0;
  let hit6 = 0;
  let hit10 = 0;
  let recall5 = 0;
  let recall10 = 0;
  const latencies: number[] = [];

  for (const r of results) {
    if (matchPrefixDigits(r.predictedHs, r.expectedHs10, 4)) hit4 += 1;
    if (matchPrefixDigits(r.predictedHs, r.expectedHs10, 6)) hit6 += 1;
    if (matchPrefixDigits(r.predictedHs, r.expectedHs10, 10)) hit10 += 1;
    if (r.retrievedHsCodes.slice(0, 5).some((c) => matchPrefixDigits(c, r.expectedHs10, 6))) {
      recall5 += 1;
    }
    if (r.retrievedHsCodes.slice(0, 10).some((c) => matchPrefixDigits(c, r.expectedHs10, 6))) {
      recall10 += 1;
    }
    latencies.push(r.latencyMs);
  }

  const sortedLatencies = latencies.slice().sort((a, b) => a - b);

  return {
    total,
    hit4Pct: roundPct(hit4, total),
    hit6Pct: roundPct(hit6, total),
    hit10Pct: roundPct(hit10, total),
    recallAt5Pct: roundPct(recall5, total),
    recallAt10Pct: roundPct(recall10, total),
    p50LatencyMs: percentile(sortedLatencies, 0.5),
    p95LatencyMs: percentile(sortedLatencies, 0.95),
  };
}
