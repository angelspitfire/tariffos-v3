/**
 * Bulk-imports historical classified invoices (JSON or CSV) into `ProductMaster`
 * for instant Tier 0 SKU/precedent hits, with optional `--embed` vector backfill.
 *
 * Usage:
 *   pnpm --filter @tariffos/database exec tsx src/scripts/import_precedents.ts --tenant <tenantId> --file <path.csv|json> [--embed]
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { Prisma } from '../generated/client';
import { embedDocuments } from '../ingestion/embeddings.js';
import { parseHistoricalPrecedents } from './precedent-parser.js';

for (const candidate of ['.env.local', 'apps/web/.env.local']) {
  const file = path.resolve(process.cwd(), '../..', candidate);
  if (fs.existsSync(file)) dotenv.config({ path: file });
  if (process.env.DIRECT_URL || process.env.DATABASE_URL) break;
}

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const EMBED_BATCH_SIZE = 32;

function readArg(argv: string[], flag: string): string | undefined {
  const idx = argv.indexOf(flag);
  return idx >= 0 ? argv[idx + 1]?.trim() : undefined;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const tenantId = readArg(argv, '--tenant');
  const fileArg = readArg(argv, '--file');
  const shouldEmbed = argv.includes('--embed');
  if (!tenantId || !fileArg) {
    throw new Error('Usage: --tenant <tenantId> --file <path.csv|json> [--embed]');
  }

  const resolvedFile = path.resolve(process.cwd(), fileArg);
  const raw = fs.readFileSync(resolvedFile, 'utf8');
  const format = resolvedFile.toLowerCase().endsWith('.csv') ? 'csv' : 'json';
  const rows = parseHistoricalPrecedents(raw, format);

  const { getUnscopedSystemPrisma } = await import('../client.js');
  const prisma = getUnscopedSystemPrisma();

  const savedRows: Array<{ id: string; description: string }> = [];
  for (const row of rows) {
    const metadata = {
      sku: row.sku ?? null,
      normalizedSku: row.sku ? row.sku.toUpperCase() : null,
      originCountry: row.originCountry ?? null,
      reviewStatus: 'approved',
      source: 'historical_import',
    };

    const saved = await prisma.productMaster.upsert({
      where: { tenantId_description: { tenantId, description: row.description } },
      update: {
        hsCode: row.hsCode,
        confidence: row.confidence,
        reasoning: row.notes ?? null,
        metadata,
      },
      create: {
        tenantId,
        description: row.description,
        hsCode: row.hsCode,
        confidence: row.confidence,
        reasoning: row.notes ?? null,
        metadata,
      },
      select: { id: true, description: true },
    });
    savedRows.push(saved);
  }

  let embeddedCount = 0;
  if (shouldEmbed && savedRows.length > 0) {
    for (let i = 0; i < savedRows.length; i += EMBED_BATCH_SIZE) {
      const batch = savedRows.slice(i, i + EMBED_BATCH_SIZE);
      const vectors = await embedDocuments(batch.map((b) => b.description), 'passage');
      for (let j = 0; j < batch.length; j += 1) {
        const vec = vectors[j];
        if (!vec) continue;
        const literal = `[${vec.join(',')}]`;
        await prisma.$executeRaw(Prisma.sql`
          UPDATE "ProductMaster"
          SET "embedding" = ${literal}::vector(768)
          WHERE "id" = ${batch[j]!.id}
        `);
        embeddedCount += 1;
      }
    }
  }

  console.log(JSON.stringify({ tenantId, parsed: rows.length, upserted: savedRows.length, embeddedCount }));
  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error('Failed to import historical precedents:', err);
  process.exit(1);
});
