/**
 * Seed `NationalTariff` and BK/BIT `EXEMPTION` rows (Venezuela) from the
 * deterministic arancel extraction (`seed-data/ve/arancel-2026.rows.json`).
 *
 * Usage:
 *   pnpm --filter @tariffos/database exec tsx src/scripts/seed_from_arancel_rows.ts [--dry-run] [--input path.json]
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { REGIMEN_REQUIREMENTS } from './ve-regimen-requirements.js';

for (const candidate of [
  'apps/web/.env.local',
  '.env.local',
  'apps/agent/.env.local',
]) {
  const file = path.join(process.cwd(), '../..', candidate);
  if (fs.existsSync(file)) dotenv.config({ path: file });
  if (process.env.DATABASE_URL) break;
}

const KNOWN_REGIMEN_TYPOS: Record<string, number[]> = {
  '0901120000': [5, 6, 12],
};

function parseAec(aec: string | null): { rate: number; isBK: boolean; isBIT: boolean } {
  const raw = (aec ?? '').trim();
  const isBIT = /BIT$/.test(raw);
  const isBK = !isBIT && /BK$/.test(raw);
  const match = raw.match(/^(\d+(?:\.\d+)?)/);
  return { rate: match?.[1] ? Number.parseFloat(match[1]) : 0, isBK, isBIT };
}

interface ArancelArtifactRow {
  code: string;
  digits: string;
  digitCount: number;
  guiones: number;
  description: string;
  path: Array<{ code: string; description: string }>;
  aec: string | null;
  exAec: string | null;
  importacionRaw: string | null;
  exportacionRaw: string | null;
  regimenImportacion: number[];
  regimenExportacion: number[];
  unidad: string | null;
  page: number;
}

interface ArancelArtifact {
  schemaVersion: string;
  instrument: string;
  gazette: string;
  instrumentDate: string;
  publishedDate: string;
  sourceFile?: string;
  rows: ArancelArtifactRow[];
}

function buildLegalNotes(row: ArancelArtifactRow): string | null {
  const parts: string[] = [];
  if (row.exAec) parts.push(`Ex.AEC: ${row.exAec}`);
  if (row.regimenImportacion.length > 0) parts.push(`Régimen Legal Importación: ${row.regimenImportacion.join(',')}`);
  if (row.regimenExportacion.length > 0) parts.push(`Régimen Legal Exportación: ${row.regimenExportacion.join(',')}`);
  if (row.unidad) parts.push(`Unidad: ${row.unidad}`);
  return parts.length > 0 ? parts.join('. ') : null;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const inputIdx = argv.indexOf('--input');
  const relInput = inputIdx >= 0 && argv[inputIdx + 1] ? argv[inputIdx + 1] : 'seed-data/ve/arancel-2026.rows.json';
  const artifactPath = path.resolve(process.cwd(), relInput);
  const cataloguePath = path.join(process.cwd(), '../../docs/laws/ve/arancel-4.944.regimen-legal.json');

  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Extraction not found: ${artifactPath}`);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8')) as ArancelArtifact;
  const catalogue = fs.existsSync(cataloguePath)
    ? (JSON.parse(fs.readFileSync(cataloguePath, 'utf8')) as { regimes: Array<{ code: number; text: string }> })
    : { regimes: [] };
  const regimenText = new Map(catalogue.regimes.map((r) => [r.code, r.text]));

  const best = new Map<string, ArancelArtifactRow>();
  for (const row of artifact.rows) {
    const existing = best.get(row.digits);
    const score = (r: ArancelArtifactRow) =>
      r.description.length + (r.aec ? 100 : 0) + (r.regimenImportacion.length > 0 ? 100 : 0);
    if (!existing || score(row) > score(existing)) best.set(row.digits, row);
  }
  const rows = [...best.values()];
  const validFrom = new Date(`${artifact.publishedDate}T00:00:00.000Z`);
  const sourceFile = artifact.sourceFile ? path.basename(artifact.sourceFile) : 'Consolidado Arancel 2026.pdf';

  const tariffs: Array<{
    countryCode: string;
    hsCode: string;
    description: string;
    adValorem: number;
    iva: number;
    customsFee: number;
    legalNotes: string | null;
    isBK: boolean;
    isBIT: boolean;
    isActive: boolean;
    isDerogated: boolean;
    validFromDate: Date;
    validToDate: null;
    requirements?: Array<Record<string, unknown>>;
  }> = [];

  const exemptions: Array<{
    countryCode: string;
    legalType: 'EXEMPTION';
    hierarchyPath: string;
    content: string;
    sourceFile: string;
    officialDocumentNumber: string;
    decreeNumber: string;
    validFromDate: Date;
    validToDate: null;
    isDerogated: boolean;
    status: 'PUBLISHED';
  }> = [];

  const unknownRegimens = new Set<number>();
  for (const row of rows) {
    const { rate, isBK, isBIT } = parseAec(row.aec);
    const regimenCodes = KNOWN_REGIMEN_TYPOS[row.digits] ?? row.regimenImportacion;
    const requirements: Array<Record<string, unknown>> = [];

    for (const code of [...new Set(regimenCodes)].sort((a, b) => a - b)) {
      const projection = REGIMEN_REQUIREMENTS[code];
      if (!projection) {
        unknownRegimens.add(code);
        continue;
      }
      requirements.push({
        regulatoryEntity: projection.regulatoryEntity,
        permitType: projection.permitType,
        mandatoryForClearance: true,
        friendlyExplanation: `Régimen Legal ${code}: ${regimenText.get(code) ?? projection.permitType}`.trim(),
      });
    }

    tariffs.push({
      countryCode: 'VE',
      hsCode: row.digits,
      description: String(row.description ?? '').replace(/\s+/g, ' ').trim(),
      adValorem: rate,
      iva: 16.0,
      customsFee: 1.0,
      legalNotes: buildLegalNotes(row),
      isBK,
      isBIT,
      isActive: true,
      isDerogated: false,
      validFromDate: validFrom,
      validToDate: null,
      ...(requirements.length > 0 ? { requirements } : {}),
    });

    if (isBK || isBIT) {
      exemptions.push({
        countryCode: 'VE',
        legalType: 'EXEMPTION',
        hierarchyPath: row.code,
        content: `De conformidad con el Artículo 8 del ${artifact.instrument}, las mercancías clasificadas bajo este código arancelario identificadas como ${isBK ? 'BK (Bien de Capital)' : 'BIT (Bien de Informática y Telecomunicaciones)'} gozarán de una alícuota Ad Valorem de 0% sujeta al Certificado de Exoneración correspondiente.`,
        sourceFile,
        officialDocumentNumber: artifact.gazette,
        decreeNumber: artifact.instrument,
        validFromDate: validFrom,
        validToDate: null,
        isDerogated: false,
        status: 'PUBLISHED',
      });
    }
  }

  console.log(`source: ${path.relative(process.cwd(), artifactPath)} | rows: ${rows.length} | exemptions: ${exemptions.length}`);
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
    await prisma.legalKnowledgeParent.deleteMany({ where: { countryCode: 'VE', legalType: 'EXEMPTION' } });

    const chunkSize = 500;
    for (let i = 0; i < tariffs.length; i += chunkSize) {
      await prisma.nationalTariff.createMany({ data: tariffs.slice(i, i + chunkSize) as never, skipDuplicates: true });
    }
    for (let i = 0; i < exemptions.length; i += chunkSize) {
      await prisma.legalKnowledgeParent.createMany({ data: exemptions.slice(i, i + chunkSize), skipDuplicates: true });
    }
    const total = await prisma.nationalTariff.count({ where: { countryCode: 'VE' } });
    const datasetVersion = path.basename(artifactPath, '.rows.json') || 'consolidado-arancel-2026';
    await prisma.country
      .update({
        where: { code: 'VE' },
        data: {
          datasetVersion,
          legislation: artifact.instrument,
        },
      })
      .catch(() => undefined);
    console.log(`NationalTariff VE seeded: ${total} rows (${exemptions.length} BK/BIT exemptions).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
