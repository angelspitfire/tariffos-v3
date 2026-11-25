/**
 * Backfill `TariffNodeEmbedding` — one vector per arancel node.
 *
 * The arancel is a **prefix tree** (see docs/plans/classifier_resolution_rework.md):
 * only the 10-digit rows are codes; everything above them is an internal node
 * whose text carries the disambiguation. A leaf whose own text is "Los demás"
 * is semantically empty on its own — `0101210090` and `0101290090` share it —
 * so we embed the **ancestry-composed** document:
 *
 *   "CABALLOS, ASNOS, MULOS Y BURDÉGANOS, VIVOS. › Caballos: ›
 *    Reproductores de raza pura: › Para carreras"
 *
 * The same string is what the decision ballot shows Laya, so what the vector
 * matches is exactly what the model reads. This replaces the hardcoded
 * `apps/agent/src/lib/lexicon.ts`: no vocabulary list, no curation, no
 * hallucination surface — the law is the vocabulary.
 *
 * DDL note: `TariffNodeEmbedding` is created out of band (InsForge CLI, never
 * `prisma migrate`); `embedding` is `Unsupported("vector")` in Prisma, so reads
 * and writes go through raw SQL here and in the retrieval path.
 *
 * Usage:
 *   npx tsx src/scripts/embed_tariff_nodes.ts [--country VE] [--limit N]
 *                                             [--dry-run] [--force]
 *
 * Resumable: by default nodes already present for the country are skipped, so a
 * rate-limited run can be re-invoked and will continue. `--force` re-embeds all.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { ancestryOf, composeDocument } from '../arancel-tree.js';
import { embedDocuments, embeddingDims, embeddingModel } from './embeddings.js';

// Load every candidate env file (dotenv does not override an already-set var),
// so the run finds both DATABASE_URL and the provider credentials regardless
// of which file carries which.
for (const candidate of [
  'apps/filings/.env.local',
  '.env.local',
  'apps/agent/.env.local',
]) {
  const file = path.join(process.cwd(), '../..', candidate);
  if (fs.existsSync(file)) dotenv.config({ path: file });
}

const MODEL = embeddingModel();
const DIMS = embeddingDims();
const BATCH = Math.max(1, Number(process.env.EMBED_BATCH ?? 25));
/**
 * Inputs per minute the API accepts. The free tier throttles by *input*
 * (~100/min: 3×32 succeeded, the 4th 429'd), reported as a 429 "quota" error
 * that clears once the window rolls over. Staying under it makes the run
 * long but unattended.
 */
const RPM = Math.max(1, Number(process.env.EMBED_RPM ?? 90));
const MAX_RETRIES = Number(process.env.EMBED_MAX_RETRIES ?? 5);
const BASE_DELAY_MS = Number(process.env.EMBED_BASE_DELAY_MS ?? 1500);

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const message = (e: unknown): string => (e instanceof Error ? e.message.slice(0, 200) : String(e));

const toVector = (values: number[]): string => `[${values.join(',')}]`;

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const force = argv.includes('--force');
  // Default to 10-digit leaves: each leaf's document already composes its full
  // ancestry, so embedding the internal nodes too is ~31% more api calls for no
  // extra reachability. `--all-nodes` restores one vector per node.
  const leavesOnly = !argv.includes('--all-nodes');
  const countryIdx = argv.indexOf('--country');
  const country = countryIdx >= 0 ? argv[countryIdx + 1] : process.env.EMBED_COUNTRY || 'VE';
  const limitIdx = argv.indexOf('--limit');
  const limit = limitIdx >= 0 ? Number(argv[limitIdx + 1]) : Infinity;

  const { getUnscopedSystemPrisma } = await import('../client.js');
  const { Prisma } = await import('../generated/client/index.js');
  const prisma = getUnscopedSystemPrisma();

  // 1. Every live node of the country — headings, grouping nodes and leaves.
  const rows = await prisma.nationalTariff.findMany({
    where: { countryCode: country, isActive: true, isDerogated: false },
    select: { hsCode: true, description: true },
    orderBy: { hsCode: 'asc' },
  });
  const byCode = new Map(rows.map((r) => [r.hsCode, r.description]));

  let pending = rows
    .filter((r) => !leavesOnly || r.hsCode.replace(/[^0-9]/g, '').length === 10)
    .map((r) => ({
      hsCode: r.hsCode,
      document: composeDocument(ancestryOf(r.hsCode, byCode), r.description),
    }));

  if (!force) {
    const existing = await prisma.$queryRaw<Array<{ hsCode: string }>>(
      Prisma.sql`SELECT "hsCode" FROM "TariffNodeEmbedding" WHERE "countryCode" = ${country} AND "model" = ${MODEL} AND "dims" = ${DIMS}`,
    );
    const done = new Set(existing.map((e) => e.hsCode));
    pending = pending.filter((p) => !done.has(p.hsCode));
    console.log(`[embed] ${rows.length} live nodes, ${done.size} already embedded, ${pending.length} to do.`);
  } else {
    console.log(`[embed] ${rows.length} live nodes (--force: re-embedding all).`);
  }
  if (leavesOnly) console.log('[embed] leaves only (10-digit); --all-nodes to include internal nodes.');
  pending = pending.slice(0, limit === Infinity ? undefined : limit);

  if (dryRun) {
    for (const p of pending.slice(0, 8)) console.log(`  ${p.hsCode}  ${p.document}`);
    console.log(`\n--dry-run: ${pending.length} documents composed, nothing embedded.`);
    return;
  }
  if (pending.length === 0) {
    console.log('[embed] nothing to do.');
    return;
  }

  let written = 0;
  const failures: string[] = [];

  // Sequential batches, rate-limited: the free embedding tier accepts ~100
  // inputs/min and answers 429 beyond that (the window then rolls over), so a
  // steady trickle is the only way to finish 11.8k leaves unattended.
  const minGapMs = (BATCH / RPM) * 60000;
  let lastBatchAt = 0;
  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH);

    if (lastBatchAt > 0) {
      const since = Date.now() - lastBatchAt;
      if (since < minGapMs) await sleep(minGapMs - since);
    }
    lastBatchAt = Date.now();

    let vectors: number[][];
    try {
      vectors = await embedWithRetry(batch.map((b) => b.document));
    } catch (err) {
      console.warn(`⚠️ [embed] batch ${i / BATCH} failed permanently: ${message(err)}`);
      failures.push(...batch.map((b) => b.hsCode));
      continue;
    }

    const values = Prisma.join(
      batch.map(
        (b, k) => Prisma.sql`(${`${country}:${b.hsCode}`}, ${country}, ${b.hsCode}, ${MODEL}, ${DIMS}, ${b.document}, ${toVector(vectors[k])}::vector, now(), now())`,
      ),
    );
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "TariffNodeEmbedding"
        ("id", "countryCode", "hsCode", "model", "dims", "document", "embedding", "createdAt", "updatedAt")
      VALUES ${values}
      ON CONFLICT ("countryCode", "hsCode") DO UPDATE SET
        "document"  = EXCLUDED."document",
        "embedding" = EXCLUDED."embedding",
        "model"     = EXCLUDED."model",
        "dims"      = EXCLUDED."dims",
        "updatedAt" = now()
    `);

    written += batch.length;
    if (written % (BATCH * 10) === 0 || written === pending.length) {
      console.log(`[embed] ${written}/${pending.length} written…`);
    }
  }

  const total = await prisma.$queryRaw<Array<{ n: bigint }>>(
    Prisma.sql`SELECT count(*)::bigint AS n FROM "TariffNodeEmbedding" WHERE "countryCode" = ${country}`,
  );
  console.log(`\n[embed] done. ${written} written, ${failures.length} failed, ${Number(total[0]?.n ?? 0)} rows for ${country}.`);
  if (failures.length > 0) {
    console.log(`[embed] failed codes (re-run to retry): ${failures.slice(0, 20).join(', ')}${failures.length > 20 ? ' …' : ''}`);
    process.exitCode = 1;
  }
}

/**
 * Embed a batch, with the retry policy the free tier needs.
 *
 * A quota error here means the per-minute window is full, not that the
 * server is dead: wait out the window rather than a sub-second backoff.
 */
async function embedWithRetry(
  texts: string[],
  attempt = 0,
): Promise<number[][]> {
  try {
    const embeddings = await embedDocuments(texts);
    if (embeddings.length !== texts.length) {
      throw new Error(`expected ${texts.length} embeddings, got ${embeddings.length}`);
    }
    return embeddings;
  } catch (err) {
    if (attempt >= MAX_RETRIES) throw err;
    const text = message(err);
    const quota = /429|quota|RESOURCE_EXHAUSTED/i.test(text);
    const delay = quota ? 65000 : BASE_DELAY_MS * 2 ** attempt;
    console.warn(`⚠️ [embed] attempt ${attempt + 1} failed (${text.slice(0, 80)}); retrying in ${delay}ms`);
    await sleep(delay);
    return embedWithRetry(texts, attempt + 1);
  }
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((e) => {
    console.error('[embed] failed:', e);
    process.exit(1);
  });
