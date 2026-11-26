/**
 * Reproducible VE classification & hybrid retrieval evaluator.
 *
 * Usage:
 *   pnpm eval:classify --retrieval-only
 *   pnpm eval:classify --full --limit 10
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import type { EvalCaseResult, GoldenCase } from '@tariffos/agent';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

interface CliFlags {
  retrievalOnly: boolean;
  limit?: number;
  countryCode: string;
  datasetPath: string;
}

function parseFlags(argv: string[]): CliFlags {
  const retrievalOnly = argv.includes('--retrieval-only') || !argv.includes('--full');
  const limitIdx = argv.indexOf('--limit');
  const limitVal = limitIdx >= 0 ? Number.parseInt(argv[limitIdx + 1] ?? '', 10) : Number.NaN;
  const countryIdx = argv.indexOf('--country');
  const countryCode = (countryIdx >= 0 ? argv[countryIdx + 1] : undefined) || 'VE';
  const datasetIdx = argv.indexOf('--dataset');
  const datasetPath =
    (datasetIdx >= 0 ? argv[datasetIdx + 1] : undefined) || 'scripts/eval/ve-golden-set.json';
  return {
    retrievalOnly,
    limit: Number.isFinite(limitVal) && limitVal > 0 ? limitVal : undefined,
    countryCode,
    datasetPath,
  };
}

function loadGoldenSet(datasetArg: string, limit?: number): GoldenCase[] {
  const datasetPath = path.resolve(process.cwd(), datasetArg);
  const raw = JSON.parse(fs.readFileSync(datasetPath, 'utf8')) as GoldenCase[];
  return limit ? raw.slice(0, limit) : raw;
}

async function main(): Promise<void> {
  const [{ classifyInvoiceBatch, summarizeEvalResults }, { createPrismaPipelinePorts }] =
    await Promise.all([
      import('@tariffos/agent'),
      import('../apps/web/src/lib/agent/prisma-ports'),
    ]);

  const flags = parseFlags(process.argv.slice(2));
  const cases = loadGoldenSet(flags.datasetPath, flags.limit);
  const ports = createPrismaPipelinePorts();
  const results: EvalCaseResult[] = [];

  for (const item of cases) {
    const t0 = performance.now();
    const retrieved = await ports.searchTariffCandidates(flags.countryCode, item.query);
    let predictedHs: string | null = retrieved[0]?.hsCode ?? null;

    if (!flags.retrievalOnly) {
      const batch = await classifyInvoiceBatch(
        [{ lineId: item.id, description: item.query, originCountry: 'CN', cifValue: 1000 }],
        ports,
        { tenantId: 'eval-tenant', countryCode: flags.countryCode, deepMode: false },
      );
      predictedHs = batch.lines[0]?.hsCode ?? null;
    }

    results.push({
      id: item.id,
      query: item.query,
      expectedHs10: item.expectedHs10,
      predictedHs,
      retrievedHsCodes: retrieved.map((c) => c.hsCode),
      latencyMs: Math.round(performance.now() - t0),
    });
  }

  const summary = summarizeEvalResults(results);
  const misses = results
    .filter(
      (r) =>
        !r.retrievedHsCodes
          .slice(0, 10)
          .some((c) => c.replace(/\./g, '').startsWith(r.expectedHs10.replace(/\./g, '').slice(0, 6))),
    )
    .map((r) => ({ id: r.id, query: r.query, expected: r.expectedHs10, topHit: r.predictedHs }));

  console.log(
    JSON.stringify(
      {
        mode: flags.retrievalOnly ? 'retrieval-only' : 'full-pipeline',
        countryCode: flags.countryCode,
        summary,
        missCount: misses.length,
        sampleMisses: misses.slice(0, 8),
      },
      null,
      2,
    ),
  );
}

main().catch((err: unknown) => {
  console.error('Evaluation runner failed:', err);
  process.exit(1);
});
