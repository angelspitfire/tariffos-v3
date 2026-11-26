/**
 * Backfill `TariffNodeEmbedding` — one 768-dim vector per 10-digit arancel leaf
 * composed with its full heading/subheading ancestry.
 *
 * Usage:
 *   pnpm --filter @tariffos/database exec tsx src/scripts/embed_tariff_nodes.ts [--country VE] [--limit N] [--dry-run] [--force] [--sync]
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { ancestryOf, composeDocument } from '../arancel-tree.js';
import { embedDocuments, embeddingDims, embeddingModel } from './embeddings.js';

for (const candidate of [
  'apps/web/.env.local',
  '.env.local',
  'apps/agent/.env.local',
]) {
  const file = path.join(process.cwd(), '../..', candidate);
  if (fs.existsSync(file)) dotenv.config({ path: file });
}

const MODEL = embeddingModel();
const DIMS = embeddingDims();
const BATCH = Math.max(1, Number(process.env.EMBED_BATCH ?? 64));
const RPM = Math.max(1, Number(process.env.EMBED_RPM ?? 2400));
const MAX_RETRIES = Number(process.env.EMBED_MAX_RETRIES ?? 6);
const BASE_DELAY_MS = Number(process.env.EMBED_BASE_DELAY_MS ?? 2000);

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const message = (e: unknown): string => (e instanceof Error ? e.message.slice(0, 200) : String(e));
const toVector = (values: number[]): string => `[${values.join(',')}]`;

async function embedWithRetry(texts: string[], attempt = 0): Promise<number[][]> {
  try {
    return await embedDocuments(texts);
  } catch (err) {
    const text = message(err);
    if (/HTTP 400|HTTP 401|HTTP 403|HTTP 404/i.test(text) || attempt >= MAX_RETRIES) {
      throw err;
    }
    const quota = /429|quota|RESOURCE_EXHAUSTED|Too Many Requests/i.test(text);
    const delay = quota ? 25000 + attempt * 15000 : BASE_DELAY_MS * 2 ** attempt;
    console.warn(`[embed] attempt ${attempt + 1} failed (${text.slice(0, 90)}); retrying in ${delay}ms`);
    await sleep(delay);
    return embedWithRetry(texts, attempt + 1);
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const force = argv.includes('--force');
  const syncMode = argv.includes('--sync');
  const leavesOnly = !argv.includes('--all-nodes');
  const countryIdx = argv.indexOf('--country');
  const country = countryIdx >= 0 ? (argv[countryIdx + 1] ?? 'VE') : (process.env.EMBED_COUNTRY || 'VE');
  const limitIdx = argv.indexOf('--limit');
  const limit = limitIdx >= 0 ? Number(argv[limitIdx + 1]) : Infinity;

  const { getUnscopedSystemPrisma } = await import('../client.js');
  const { Prisma } = await import('../generated/client/index.js');
  const prisma = getUnscopedSystemPrisma();

  try {
    const rows = await prisma.nationalTariff.findMany({
      where: { countryCode: country, isActive: true, isDerogated: false },
      select: { hsCode: true, description: true },
      orderBy: { hsCode: 'asc' },
    });
    const byCode = new Map(rows.map((r) => [r.hsCode, r.description]));

    let pending = rows
      .filter((r) => !leavesOnly || r.hsCode.replace(/[^0-9]/g, '').length === 10)
      .map((r) => {
        const composed = composeDocument(ancestryOf(r.hsCode, byCode), r.description).trim();
        return {
          hsCode: r.hsCode,
          document: composed || `${r.hsCode} — Subpartida arancelaria nacional`,
        };
      });

    const liveCodes = new Set(pending.map((p) => p.hsCode));

    if (syncMode && !dryRun) {
      const existingRows = await prisma.$queryRaw<Array<{ hsCode: string; document: string }>>(
        Prisma.sql`SELECT "hsCode", "document" FROM "TariffNodeEmbedding" WHERE "countryCode" = ${country}`,
      );
      const staleCodes = existingRows.filter((e) => !liveCodes.has(e.hsCode)).map((e) => e.hsCode);
      if (staleCodes.length > 0) {
        await prisma.$executeRaw(
          Prisma.sql`DELETE FROM "TariffNodeEmbedding" WHERE "countryCode" = ${country} AND "hsCode" IN (${Prisma.join(staleCodes)})`,
        );
        console.log(`[embed] pruned ${staleCodes.length} removed tariff embeddings.`);
      }
      const existingDocByCode = new Map(existingRows.map((e) => [e.hsCode, e.document]));
      pending = pending.filter((p) => existingDocByCode.get(p.hsCode) !== p.document);
      console.log(`[embed] --sync: ${pending.length} new or modified leaves to embed.`);
    } else if (!force) {
      const existing = await prisma.$queryRaw<Array<{ hsCode: string }>>(
        Prisma.sql`SELECT "hsCode" FROM "TariffNodeEmbedding" WHERE "countryCode" = ${country} AND "model" = ${MODEL} AND "dims" = ${DIMS}`,
      );
      const done = new Set(existing.map((e) => e.hsCode));
      pending = pending.filter((p) => !done.has(p.hsCode));
      console.log(`[embed] ${rows.length} live nodes, ${done.size} already embedded, ${pending.length} to do (model=${MODEL}, dims=${DIMS}).`);
    } else {
      console.log(`[embed] ${rows.length} live nodes (--force: re-embedding all with ${MODEL}).`);
    }

    pending = pending.slice(0, limit === Infinity ? undefined : limit);
    if (dryRun) {
      for (const p of pending.slice(0, 6)) console.log(`  ${p.hsCode}  ${p.document}`);
      console.log(`--dry-run: ${pending.length} documents composed.`);
      return;
    }
    if (pending.length === 0) {
      console.log('[embed] up to date — nothing to embed.');
      return;
    }

    let written = 0;
    const failures: string[] = [];
    const minGapMs = (BATCH / RPM) * 60000;
    let lastBatchAt = 0;

    for (let i = 0; i < pending.length; i += BATCH) {
      const batch = pending.slice(i, i + BATCH);
      if (lastBatchAt > 0) {
        const since = Date.now() - lastBatchAt;
        if (since < minGapMs) await sleep(minGapMs - since);
      }
      lastBatchAt = Date.now();

      try {
        const vectors = await embedWithRetry(batch.map((b) => b.document));
        const values = Prisma.join(
          batch.map(
            (b, k) =>
              Prisma.sql`(${`${country}:${b.hsCode}`}, ${country}, ${b.hsCode}, ${MODEL}, ${DIMS}, ${b.document}, ${toVector(vectors[k] ?? [])}::vector, now(), now())`,
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
        if (written % (BATCH * 5) === 0 || written === pending.length) {
          console.log(`[embed] ${written}/${pending.length} written...`);
        }
      } catch (err) {
        console.warn(`[embed] batch ${Math.floor(i / BATCH)} failed: ${message(err)}`);
        failures.push(...batch.map((b) => b.hsCode));
      }
    }

    const total = await prisma.$queryRaw<Array<{ n: bigint }>>(
      Prisma.sql`SELECT count(*)::bigint AS n FROM "TariffNodeEmbedding" WHERE "countryCode" = ${country}`,
    );
    console.log(`[embed] done. ${written} written, ${failures.length} failed, ${Number(total[0]?.n ?? 0)} total rows for ${country}.`);
    if (failures.length > 0) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e: unknown) => {
  console.error('[embed] failed:', e);
  process.exit(1);
});
