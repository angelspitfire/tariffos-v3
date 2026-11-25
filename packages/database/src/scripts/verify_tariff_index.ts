/**
 * `verify:index` — is the tariff embedding index usable *right now*?
 *
 * Every failure this checks for is silent in production. A truncated index
 * reads as a smaller ballot; an index holding two embedding spaces reads as a
 * slightly wrong ballot; a build/runtime model mismatch reads as normal. The
 * 2026-10-26 diagnosis and the 2026-10-28 mixed-index finding were both found
 * by hand, after the fact. This makes it one command.
 *
 *   pnpm --filter @tariffos/database verify:index
 *   pnpm --filter @tariffos/database verify:index --country VE
 *
 * Exit 0 = every gate passed. Exit 1 = at least one gate failed, with the cause
 * named. Zero API quota: it only reads the database.
 *
 * Env: DATABASE_URL, plus EMBEDDING_MODEL / EMBEDDING_DIMS (the same two vars
 * the query path reads — that is the point of the coherence gate).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

import * as dotenv from 'dotenv';

for (const candidate of [
  'packages/database/.env.embed',
  'packages/database/.env.local',
  '.env.local',
  'apps/agent/.env.local',
]) {
  const file = path.join(process.cwd(), '../..', candidate);
  if (fs.existsSync(file)) dotenv.config({ path: file });
}

const DEFAULT_MODEL = 'gemini-embedding-001';
const DEFAULT_DIMS = 768;
/** Coverage floor from the roadmap's sanity-v2 gate. */
const MIN_COVERAGE = 0.98;
/** Self-cosine of a stored vector must be ~1; below this the index is broken. */
const MIN_SELF_COS = 0.999;
/** Headings that were absent from the truncated index — the spot-check set. */
const SPOT_CHECK_HEADINGS = ['8712', '9404', '2523'];

interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

function pass(name: string, detail: string): Check {
  return { name, ok: true, detail };
}

function fail(name: string, detail: string): Check {
  return { name, ok: false, detail };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const countryIdx = argv.indexOf('--country');
  const country = countryIdx >= 0 ? argv[countryIdx + 1] : 'VE';
  const model = process.env.EMBEDDING_MODEL?.trim() || DEFAULT_MODEL;
  const dims = Number(process.env.EMBEDDING_DIMS ?? DEFAULT_DIMS);

  const { getUnscopedSystemPrisma } = await import('../client.js');
  const db = getUnscopedSystemPrisma();
  const checks: Check[] = [];

  const leaves = await db.$queryRaw<Array<{ n: number }>>`
    SELECT count(*)::int AS n
    FROM "NationalTariff"
    WHERE "countryCode" = ${country} AND "isActive" = true
      AND length(regexp_replace("hsCode", '[^0-9]', '', 'g')) = 10
  `;
  const leafCount = Number(leaves[0]?.n ?? 0);

  const spaces = await db.$queryRaw<Array<{ model: string; dims: number; n: number; chapters: number }>>`
    SELECT "model", "dims", count(*)::int AS n,
           count(DISTINCT left(regexp_replace("hsCode", '[^0-9]', '', 'g'), 2))::int AS chapters
    FROM "TariffNodeEmbedding"
    WHERE "countryCode" = ${country}
    GROUP BY "model", "dims"
    ORDER BY n DESC
  `;

  const expected = spaces.find((s) => s.model === model && Number(s.dims) === dims);
  const foreign = spaces.filter((s) => !(s.model === model && Number(s.dims) === dims));

  // 1. Space coherence — the same (model, dims) the query path will filter on.
  checks.push(
    expected
      ? pass(
          'space coherence',
          `${model}@${dims}: ${expected.n} rows over ${expected.chapters} chapters` +
            (foreign.length > 0
              ? ` (foreign rows present: ${foreign.map((f) => `${f.model}@${f.dims}:${f.n}`).join(', ')} — ignored by the read path since the model/dims filter)`
              : ''),
        )
      : fail(
          'space coherence',
          `no rows for ${model}@${dims}; index holds ` +
            (spaces.length === 0
              ? 'nothing at all'
              : spaces.map((s) => `${s.model}@${s.dims}:${s.n}`).join(', ')),
        ),
  );

  // 2. Leaf coverage in the expected space.
  const covered = await db.$queryRaw<Array<{ n: number }>>`
    SELECT count(*)::int AS n
    FROM "NationalTariff" t
    JOIN "TariffNodeEmbedding" e
      ON e."countryCode" = t."countryCode" AND e."hsCode" = t."hsCode"
    WHERE t."countryCode" = ${country} AND t."isActive" = true
      AND length(regexp_replace(t."hsCode", '[^0-9]', '', 'g')) = 10
      AND e."model" = ${model} AND e."dims" = ${dims}
  `;
  const coveredCount = Number(covered[0]?.n ?? 0);
  const coverage = leafCount === 0 ? 0 : coveredCount / leafCount;
  checks.push(
    leafCount === 0
      ? fail('leaf coverage', `no live 10-digit leaves for ${country}`)
      : coverage >= MIN_COVERAGE
        ? pass('leaf coverage', `${coveredCount}/${leafCount} (${(coverage * 100).toFixed(1)}%)`)
        : fail(
            'leaf coverage',
            `${coveredCount}/${leafCount} (${(coverage * 100).toFixed(1)}%) < ${(MIN_COVERAGE * 100).toFixed(0)}% — ` +
              `resume the backfill: pnpm --filter @tariffos/database exec tsx src/scripts/embed_tariff_nodes.ts --country ${country}`,
          ),
  );

  // 3. Self-cosine on a sample: a stored vector must match itself.
  const sample = await db.$queryRaw<Array<{ hsCode: string; selfCos: number }>>`
    SELECT "hsCode", (1 - ("embedding" <=> "embedding"))::float AS "selfCos"
    FROM "TariffNodeEmbedding"
    WHERE "countryCode" = ${country} AND "model" = ${model} AND "dims" = ${dims}
    ORDER BY random()
    LIMIT 5
  `;
  const worst = sample.reduce((m, r) => Math.min(m, Number(r.selfCos)), 1);
  checks.push(
    sample.length === 0
      ? fail('self-cosine', 'no rows to sample')
      : worst >= MIN_SELF_COS
        ? pass('self-cosine', `5 sampled, worst ${worst.toFixed(6)}`)
        : fail('self-cosine', `worst ${worst.toFixed(6)} < ${MIN_SELF_COS} on ${sample.length} sampled`),
  );

  // 4. Spot-check the headings that the truncated index was missing.
  const present = await db.$queryRaw<Array<{ heading: string; n: number }>>`
    SELECT left(regexp_replace("hsCode", '[^0-9]', '', 'g'), 4) AS heading, count(*)::int AS n
    FROM "TariffNodeEmbedding"
    WHERE "countryCode" = ${country} AND "model" = ${model} AND "dims" = ${dims}
    GROUP BY 1
  `;
  const presentHeadings = new Set(present.map((p) => p.heading));
  const missing = SPOT_CHECK_HEADINGS.filter((h) => !presentHeadings.has(h));
  checks.push(
    missing.length === 0
      ? pass('spot-check headings', SPOT_CHECK_HEADINGS.join(', '))
      : fail('spot-check headings', `absent: ${missing.join(', ')}`),
  );

  // 5. Document text is the ballot text: an empty document defeats the purpose.
  const emptyDoc = await db.$queryRaw<Array<{ n: number }>>`
    SELECT count(*)::int AS n
    FROM "TariffNodeEmbedding"
    WHERE "countryCode" = ${country} AND "model" = ${model} AND "dims" = ${dims}
      AND ("document" IS NULL OR length(trim("document")) = 0)
  `;
  const emptyCount = Number(emptyDoc[0]?.n ?? 0);
  checks.push(
    emptyCount === 0
      ? pass('document text', 'every row carries its ancestry text')
      : fail('document text', `${emptyCount} rows have no document text`),
  );

  const width = Math.max(...checks.map((c) => c.name.length));
  console.log(`\nTariff embedding index — ${country}\n`);
  for (const c of checks) {
    console.log(`  ${c.ok ? '✅' : '❌'} ${c.name.padEnd(width)}  ${c.detail}`);
  }
  const failed = checks.filter((c) => !c.ok);
  console.log(
    `\n${failed.length === 0 ? 'OK — index usable' : `FAILED — ${failed.length} gate(s): ${failed.map((f) => f.name).join(', ')}`}\n`,
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('[verify:index] failed:', e);
  process.exit(1);
});
