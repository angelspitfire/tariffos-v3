/**
 * Upserts the 21 Venezuela Article 21 `PermitType` records (`RL-1` .. `RL-21`)
 * and populates `HsPermitRequirement` from active 10-digit `NationalTariff.legalNotes`.
 *
 * Usage:
 *   pnpm --filter @tariffos/database exec tsx src/scripts/seed_ve_permits.ts
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { parseVeLegalRegimeCodes } from './ve-regimen-parser.js';
import { REGIMEN_REQUIREMENTS } from './ve-regimen-requirements.js';

for (const candidate of ['.env.local', 'apps/web/.env.local']) {
  const file = path.resolve(process.cwd(), '../..', candidate);
  if (fs.existsSync(file)) {
    dotenv.config({ path: file });
  }
  if (process.env.DIRECT_URL || process.env.DATABASE_URL) break;
}

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const CHUNK_SIZE = 1000;
const COUNTRY_CODE = 'VE';

async function main(): Promise<void> {
  const { getUnscopedSystemPrisma } = await import('../client.js');
  const prisma = getUnscopedSystemPrisma();

  const permitIdByCode = new Map<number, string>();
  const entries = Object.entries(REGIMEN_REQUIREMENTS);

  for (const [rawNum, info] of entries) {
    const num = Number(rawNum);
    const code = `RL-${num}`;
    const upserted = await prisma.permitType.upsert({
      where: { code },
      update: {
        name: info.permitType,
        agency: info.regulatoryEntity,
        countryCode: COUNTRY_CODE,
        isActive: true,
      },
      create: {
        code,
        name: info.permitType,
        agency: info.regulatoryEntity,
        countryCode: COUNTRY_CODE,
        validityMonths: 12,
        isActive: true,
      },
      select: { id: true },
    });
    permitIdByCode.set(num, upserted.id);
  }

  const tariffRows = await prisma.nationalTariff.findMany({
    where: {
      countryCode: COUNTRY_CODE,
      isActive: true,
      isDerogated: false,
      legalNotes: { not: null },
    },
    select: { hsCode: true, legalNotes: true },
  });

  const requirements: Array<{
    hsCode: string;
    permitTypeId: string;
    isRequired: boolean;
    notes: string | null;
  }> = [];

  for (const row of tariffRows) {
    const cleanDigits = row.hsCode.replace(/[^0-9]/g, '');
    if (cleanDigits.length !== 10) continue;

    const codes = parseVeLegalRegimeCodes(row.legalNotes);
    for (const num of codes) {
      const permitTypeId = permitIdByCode.get(num);
      if (!permitTypeId) continue;
      requirements.push({
        hsCode: row.hsCode,
        permitTypeId,
        isRequired: true,
        notes: row.legalNotes,
      });
    }
  }

  let requirementsInserted = 0;
  for (let i = 0; i < requirements.length; i += CHUNK_SIZE) {
    const chunk = requirements.slice(i, i + CHUNK_SIZE);
    const res = await prisma.hsPermitRequirement.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    requirementsInserted += res.count;
  }

  console.log(
    JSON.stringify({
      permitTypes: permitIdByCode.size,
      candidatesScanned: tariffRows.length,
      requirementsParsed: requirements.length,
      requirementsInserted,
    }),
  );

  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error('Failed to seed VE permits:', err);
  process.exit(1);
});
