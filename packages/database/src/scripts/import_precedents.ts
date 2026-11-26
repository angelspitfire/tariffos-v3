/**
 * Bulk-imports historical classified invoices (JSON or CSV) into `ProductMaster`
 * for instant Tier 0 SKU/precedent hits.
 *
 * Usage:
 *   pnpm --filter @tariffos/database exec tsx src/scripts/import_precedents.ts --tenant <tenantId> --file <path.csv|json>
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { parseHistoricalPrecedents } from './precedent-parser.js';

for (const candidate of ['.env.local', 'apps/web/.env.local']) {
  const file = path.resolve(process.cwd(), '../..', candidate);
  if (fs.existsSync(file)) dotenv.config({ path: file });
  if (process.env.DIRECT_URL || process.env.DATABASE_URL) break;
}

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

function readArg(argv: string[], flag: string): string | undefined {
  const idx = argv.indexOf(flag);
  return idx >= 0 ? argv[idx + 1]?.trim() : undefined;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const tenantId = readArg(argv, '--tenant');
  const fileArg = readArg(argv, '--file');
  if (!tenantId || !fileArg) {
    throw new Error('Usage: --tenant <tenantId> --file <path.csv|json>');
  }

  const resolvedFile = path.resolve(process.cwd(), fileArg);
  const raw = fs.readFileSync(resolvedFile, 'utf8');
  const format = resolvedFile.toLowerCase().endsWith('.csv') ? 'csv' : 'json';
  const rows = parseHistoricalPrecedents(raw, format);

  const { getUnscopedSystemPrisma } = await import('../client.js');
  const prisma = getUnscopedSystemPrisma();

  let upserted = 0;
  for (const row of rows) {
    const metadata = {
      sku: row.sku ?? null,
      normalizedSku: row.sku ? row.sku.toUpperCase() : null,
      originCountry: row.originCountry ?? null,
      reviewStatus: 'approved',
      source: 'historical_import',
    };

    await prisma.productMaster.upsert({
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
    });
    upserted += 1;
  }

  console.log(JSON.stringify({ tenantId, parsed: rows.length, upserted }));
  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error('Failed to import historical precedents:', err);
  process.exit(1);
});
