/**
 * Seed `NationalTariff`, `TariffExemptionRule` and BK/BIT `EXEMPTION` rows (Venezuela)
 * from the deterministic arancel extraction (`seed-data/ve/arancel-2026.rows.json`).
 *
 * Usage:
 *   pnpm --filter @tariffos/database exec tsx src/scripts/seed_from_arancel_rows.ts [--dry-run] [--input path.json]
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import {
  buildVeSeedPayloads,
  type ArancelArtifact,
} from './ve-arancel-seed-builder.js';

for (const candidate of [
  'apps/web/.env.local',
  '.env.local',
  'apps/agent/.env.local',
]) {
  const file = path.join(process.cwd(), '../..', candidate);
  if (fs.existsSync(file)) dotenv.config({ path: file });
  if (process.env.DATABASE_URL) break;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const inputIdx = argv.indexOf('--input');
  const relInput =
    inputIdx >= 0 && argv[inputIdx + 1]
      ? argv[inputIdx + 1]
      : 'seed-data/ve/arancel-2026.rows.json';
  const artifactPath = path.resolve(process.cwd(), relInput);
  const cataloguePath = path.join(
    process.cwd(),
    '../../docs/laws/ve/arancel-4.944.regimen-legal.json',
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Extraction not found: ${artifactPath}`);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8')) as ArancelArtifact;
  const catalogue = fs.existsSync(cataloguePath)
    ? (JSON.parse(fs.readFileSync(cataloguePath, 'utf8')) as {
        regimes: Array<{ code: number; text: string }>;
      })
    : { regimes: [] };
  const regimenText = new Map(catalogue.regimes.map((r) => [r.code, r.text]));
  const sourceFile = artifact.sourceFile
    ? path.basename(artifact.sourceFile)
    : 'Consolidado Arancel 2026.pdf';

  const { rows, tariffs, exemptionRules, exemptions, unknownRegimens } =
    buildVeSeedPayloads(artifact, regimenText, sourceFile);

  console.log(
    `source: ${path.relative(process.cwd(), artifactPath)} | rows: ${rows.length} | exemptionRules: ${exemptionRules.length} | bkBitExemptions: ${exemptions.length}`,
  );
  if (unknownRegimens.size > 0) {
    throw new Error(`Unknown régimen legal codes: ${[...unknownRegimens].join(', ')}`);
  }
  if (dryRun) {
    console.log('--dry-run: verified cleanly, nothing written.');
    return;
  }

  const { getUnscopedSystemPrisma } = await import('../client.js');
  const prisma = getUnscopedSystemPrisma();
  try {
    await prisma.nationalTariff.deleteMany({ where: { countryCode: 'VE' } });
    await prisma.tariffExemptionRule.deleteMany({ where: { countryCode: 'VE' } });
    await prisma.legalKnowledgeParent.deleteMany({
      where: { countryCode: 'VE', legalType: 'EXEMPTION' },
    });

    const chunkSize = 500;
    for (let i = 0; i < tariffs.length; i += chunkSize) {
      await prisma.nationalTariff.createMany({
        data: tariffs.slice(i, i + chunkSize) as never,
        skipDuplicates: true,
      });
    }
    for (let i = 0; i < exemptionRules.length; i += chunkSize) {
      await prisma.tariffExemptionRule.createMany({
        data: exemptionRules.slice(i, i + chunkSize),
        skipDuplicates: true,
      });
    }
    for (let i = 0; i < exemptions.length; i += chunkSize) {
      await prisma.legalKnowledgeParent.createMany({
        data: exemptions.slice(i, i + chunkSize),
        skipDuplicates: true,
      });
    }

    const total = await prisma.nationalTariff.count({ where: { countryCode: 'VE' } });
    const datasetVersion =
      path.basename(artifactPath, '.rows.json') || 'consolidado-arancel-2026';
    await prisma.country
      .update({
        where: { code: 'VE' },
        data: {
          datasetVersion,
          legislation: artifact.instrument,
        },
      })
      .catch(() => undefined);
    console.log(
      `NationalTariff VE seeded: ${total} rows (${exemptionRules.length} Dec. 5.197 COMEX rules, ${exemptions.length} BK/BIT exemptions).`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
