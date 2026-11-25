// One-off safety backup before a --force model migration: dumps every
// TariffNodeEmbedding row (vector included, gzipped JSONL) so a bad migration
// can be reversed by re-loading instead of re-embedding under quota walls.
//
//   npx tsx src/scripts/backup_embeddings.ts [--country VE] [--only-model m]
//   → packages/database/.backups/tariff-node-embedding-<ts>.jsonl.gz
//
// NOT wired to CI or cron: deliberate, operator-run.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
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
import { Prisma } from '../generated/client/index.js';

async function main(): Promise<void> {
  // Late dynamic import, same pattern as embed_tariff_nodes.ts: the env chain
  // above must be in place before the Prisma client initializes.
  const { getUnscopedSystemPrisma } = await import('../client.js');
  const prisma = getUnscopedSystemPrisma();

  const argv = process.argv.slice(2);
  const cc = argv.includes('--country') ? argv[argv.indexOf('--country') + 1] : null;
  const onlyModel = argv.includes('--only-model') ? argv[argv.indexOf('--only-model') + 1] : null;

  const conditions = [
    cc ? Prisma.sql`"countryCode" = ${cc}` : undefined,
    onlyModel ? Prisma.sql`"model" = ${onlyModel}` : undefined,
  ].filter(Boolean);
  const where = conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;

  const outDir = path.resolve('.backups');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `tariff-node-embedding-${Date.now()}.jsonl.gz`);

  const rows = await prisma.$queryRaw<Array<{ id: string; countryCode: string; hsCode: string; model: string; dims: number; document: string | null; embedding: string }>>`
    SELECT "id", "countryCode", "hsCode", "model", "dims", "document", "embedding"::text AS "embedding"
    FROM "TariffNodeEmbedding" ${where}`;

  const gzip = zlib.createGzip();
  const out = fs.createWriteStream(file);
  let failed: Error | null = null;
  const failure = (err: Error) => {
    failed = err;
  };
  gzip.on('error', failure);
  out.on('error', failure);
  gzip.on('data', (chunk: Buffer) => out.write(chunk));
  gzip.on('end', () => out.end());
  const payload = rows.length > 0 ? `${rows.map((r) => JSON.stringify(r)).join('\n')}\n` : '';
  gzip.end(payload);
  await new Promise<void>((resolve, reject) => {
    out.on('finish', resolve);
  });
  if (failed) throw failed;

  const size = fs.statSync(file).size;
  console.log(`[backup] ${rows.length} rows → ${file} (${(size / 1e6).toFixed(1)} MB)`);
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((err) => {
    console.error('[backup] failed:', err);
    process.exit(1);
  });
