// Embedding-index status: rows per (model, dims) per country for the tariff
// tree, plus leaf coverage. Diagnostic only, zero API quota.
//
//   npx tsx src/scripts/embed_status.ts [--country VE]
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

for (const candidate of [
  'apps/filings/.env.local',
  '.env.local',
  'apps/agent/.env.local',
  'apps/web/.env.local',
]) {
  const file = path.join(process.cwd(), '../..', candidate);
  if (fs.existsSync(file)) dotenv.config({ path: file });
}

async function main(): Promise<void> {
  const { getUnscopedSystemPrisma } = await import('../client.js');
  const prisma = getUnscopedSystemPrisma();
  const argv = process.argv.slice(2);
  const cc = argv.includes('--country') ? argv[argv.indexOf('--country') + 1] : 'VE';

  const rows = await prisma.$queryRaw<Array<{ model: string; dims: number; n: bigint }>>`
    SELECT "model", "dims", count(*)::bigint AS n
    FROM "TariffNodeEmbedding" WHERE "countryCode" = ${cc}
    GROUP BY "model", "dims" ORDER BY n DESC`;
  for (const r of rows) console.log(`${r.model} @${r.dims}: ${Number(r.n)}`);

  const leaves = await prisma.$queryRaw<Array<{ n: bigint }>>`
    SELECT count(*)::bigint AS n FROM "NationalTariff"
    WHERE "countryCode" = ${cc} AND "isActive" = true AND "isDerogated" = false
      AND length("hsCode") = 10`;
  const missing = await prisma.$queryRaw<Array<{ n: bigint }>>`
    SELECT count(*)::bigint AS n FROM "NationalTariff" t
    WHERE t."countryCode" = ${cc} AND t."isActive" = true AND t."isDerogated" = false
      AND length(t."hsCode") = 10
      AND NOT EXISTS (
        SELECT 1 FROM "TariffNodeEmbedding" e
        WHERE e."countryCode" = t."countryCode" AND e."hsCode" = t."hsCode"
          AND e."model" = 'gemini-embedding-2'
      )`;
  console.log(`leaves: ${Number(leaves[0]?.n ?? 0)} | sin v2: ${Number(missing[0]?.n ?? 0)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
