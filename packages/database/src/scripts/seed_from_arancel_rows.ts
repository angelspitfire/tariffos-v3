/**
 * Seed `NationalTariff` (Venezuela) from the deterministic arancel extraction.
 *
 * Input:  packages/database/seed-data/ve/arancel-4.944.rows.json
 *         produced by `extract_arancel_pdf.ts` from
 *         docs/laws/ve/Tradex-Arancel-de-Aduanas-Decreto-4.944-GOE-6.804.pdf
 *
 * This replaces the LLM-derived seed (`seed_from_portable.ts`), whose corpus
 * was missing 28% of the decree's codes and invented others. See
 * docs/research/arancel_corpus_validity.md.
 *
 * Decisions (see docs/laws/README.md):
 *   - ALL rows are loaded, 4-10 digits, so headings and subheadings carry their
 *     own real description instead of being inferred from a leaf fragment.
 *   - `description` is composed as the full ancestry chain, because retrieval
 *     (apps/agent/src/lib/candidates.ts) scores tariff rows on `description`
 *     alone and a bare "- - - Los demás" is unrankable.
 *   - `requirements` is rebuilt from the régime legal list using Article 21's
 *     21 codes (docs/laws/ve/arancel-4.944.regimen-legal.json) — the previous
 *     8-entry mapping mismapped codes 5, 7 and 8 and omitted 9-21.
 *   - `iva` is NOT in the arancel (it comes from the IVA law), so the general
 *     rate is used as a placeholder and flagged here rather than invented per row.
 *
 * Usage:
 *   npx tsx src/scripts/seed_from_arancel_rows.ts [--dry-run]
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

// The active apps (apps/filings, apps/agent) point at the current InsForge
// project. Resolve the connection explicitly, in precedence order, and never
// override an already-exported DATABASE_URL.
for (const candidate of [
  'apps/filings/.env.local',
  '.env.local',
  'apps/agent/.env.local',
  'apps/web/.env.local',
]) {
  const file = path.join(process.cwd(), '../..', candidate);
  if (fs.existsSync(file)) dotenv.config({ path: file });
  if (process.env.DATABASE_URL) break;
}

/**
 * Known typographical defects in the decree's régime cells, resolved by a human
 * against the instrument (see docs/laws/ve/_sources.json -> notes).
 *
 * `0901.12.00.00` prints the cell as "5,612"; the sibling leaves and the sense of
 * the tariff make "5,6,12" the only reading (a dropped comma between 6 and 12).
 * The raw value stays in the extraction artifact; this table is the deliberate,
 * reviewed interpretation and nothing else is auto-corrected.
 */
const KNOWN_REGIMEN_TYPOS: Record<string, number[]> = {
  '0901120000': [5, 6, 12],
};

/** Column (3) AEC, e.g. "14", "14BK", "0BIT" -> { rate, isBK, isBIT }. */
function parseAec(aec: string | null): { rate: number; isBK: boolean; isBIT: boolean } {
  const raw = (aec ?? '').trim();
  const isBIT = /BIT$/.test(raw);
  const isBK = !isBIT && /BK$/.test(raw);
  const match = raw.match(/^(\d+(?:\.\d+)?)/);
  return { rate: match ? Number.parseFloat(match[1]) : 0, isBK, isBIT };
}

/**
 * Requirements projection for the 21 régimen legal codes of Article 21.
 * The legal wording comes from the catalogue file; the agency/permit naming is
 * application vocabulary and lives here.
 */
const REGIMEN_REQUIREMENTS: Record<
  number,
  { regulatoryEntity: string; permitType: string }
> = {
  1: { regulatoryEntity: 'Ministerio de Comercio Exterior', permitType: 'Importación o Exportación Prohibida' },
  2: { regulatoryEntity: 'Ejecutivo Nacional', permitType: 'Importación o Exportación Reservada al Ejecutivo Nacional' },
  3: { regulatoryEntity: 'MPPS (Salud)', permitType: 'Permiso Sanitario' },
  4: { regulatoryEntity: 'MPP Industrias y Producción Nacional', permitType: 'Permiso de Importación' },
  5: { regulatoryEntity: 'MPPS (Salud)', permitType: 'Certificado Sanitario del País de Origen' },
  6: { regulatoryEntity: 'MPP Agricultura Productiva y Tierras', permitType: 'Permiso Sanitario' },
  7: { regulatoryEntity: 'MPP Defensa', permitType: 'Permiso de Importación' },
  8: { regulatoryEntity: 'MPP Alimentación', permitType: 'Licencia de Importación' },
  9: { regulatoryEntity: 'MPP Comercio Exterior', permitType: 'Licencia de Importación' },
  10: { regulatoryEntity: 'MPP Ecosocialismo', permitType: 'Permiso de Importación' },
  11: { regulatoryEntity: 'MPP Petróleo', permitType: 'Permiso de Importación' },
  12: { regulatoryEntity: 'MPPS (Salud)', permitType: 'Registro Sanitario' },
  13: { regulatoryEntity: 'MPP Agricultura Productiva y Tierras', permitType: 'Registro Sanitario' },
  14: { regulatoryEntity: 'MPP Alimentación', permitType: 'Permiso de Importación' },
  15: { regulatoryEntity: 'MPP Ciencia, Tecnología e Innovación', permitType: 'Permiso de Importación' },
  16: { regulatoryEntity: 'MPP Industrias y Producción Nacional', permitType: 'Licencia de Importación' },
  17: { regulatoryEntity: 'MPP Energía Eléctrica', permitType: 'Permiso de Importación' },
  18: { regulatoryEntity: 'MPP Pesca y Acuicultura', permitType: 'Permiso de Importación' },
  19: { regulatoryEntity: 'MPP Comercio Exterior', permitType: 'Certificado del Proceso Kimberley' },
  20: { regulatoryEntity: 'SENCAMER', permitType: 'Constancia de Registro COVENIN / Reglamento Técnico' },
  21: { regulatoryEntity: 'SUNAQUIM', permitType: 'Permiso del Registro Nacional Único de Operadores de Sustancias Químicas Controladas' },
};

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
  rows: ArancelArtifactRow[];
}

/**
 * The row's own description, exactly as the decree prints it.
 *
 * Deliberately NOT prefixed with its ancestry. Retrieval
 * (apps/agent/src/lib/candidates.ts) scores rows on this field and breaks
 * score ties by *longest* description, so gluing the shared parent text onto
 * every leaf both dilutes the discriminating words and turns the tie-break into
 * noise — measured as a golden-eval regression. The hierarchy is available
 * separately: the 4-digit rows carry the heading text, and the code itself
 * encodes the path.
 */
function composeDescription(row: ArancelArtifactRow): string {
  return String(row.description ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildLegalNotes(row: ArancelArtifactRow): string | null {
  const parts: string[] = [];
  if (row.exAec) parts.push(`Ex.AEC: ${row.exAec}`);
  if (row.regimenImportacion.length > 0) parts.push(`Régimen Legal Importación: ${row.regimenImportacion.join(',')}`);
  if (row.regimenExportacion.length > 0) parts.push(`Régimen Legal Exportación: ${row.regimenExportacion.join(',')}`);
  if (row.unidad) parts.push(`Unidad: ${row.unidad}`);
  return parts.length > 0 ? parts.join('. ') : null;
}

function main() {
  const dryRun = process.argv.includes('--dry-run');

  const artifactPath = path.join(process.cwd(), 'seed-data/ve/arancel-4.944.rows.json');
  const cataloguePath = path.join(process.cwd(), '../../docs/laws/ve/arancel-4.944.regimen-legal.json');
  if (!fs.existsSync(artifactPath)) {
    console.error(`Extraction not found: ${artifactPath}\nRun extract_arancel_pdf.ts first.`);
    process.exit(1);
  }

  const artifact: ArancelArtifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const catalogue: { regimes: Array<{ code: number; text: string }> } = JSON.parse(
    fs.readFileSync(cataloguePath, 'utf8'),
  );
  const regimenText = new Map(catalogue.regimes.map((r) => [r.code, r.text]));

  // Deduplicate by digits (page-boundary repeats). Prefer the copy with the
  // richest description, then one carrying tariff/regime columns.
  const best = new Map<string, ArancelArtifactRow>();
  for (const row of artifact.rows) {
    const existing = best.get(row.digits);
    if (!existing) {
      best.set(row.digits, row);
      continue;
    }
    const score = (r: ArancelArtifactRow) =>
      r.description.length + (r.aec ? 100 : 0) + (r.regimenImportacion.length > 0 ? 100 : 0);
    if (score(row) > score(existing)) best.set(row.digits, row);
  }
  const rows = [...best.values()];

  const VALID_FROM = new Date(`${artifact.publishedDate}T00:00:00.000Z`);
  const tariffs: any[] = [];
  const exemptions: any[] = [];
  const unknownRegimens = new Set<number>();
  let correctedRows = 0;
  let bkCount = 0;
  let bitCount = 0;

  for (const row of rows) {
    const { rate, isBK, isBIT } = parseAec(row.aec);
    if (isBK) bkCount++;
    if (isBIT) bitCount++;

    const regimenCodes = KNOWN_REGIMEN_TYPOS[row.digits] ?? row.regimenImportacion;
    if (KNOWN_REGIMEN_TYPOS[row.digits]) correctedRows++;

    const requirements: any[] = [];
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
        friendlyExplanation: `Régimen Legal ${code}: ${regimenText.get(code) ?? ''}`.trim(),
      });
    }

    const tariff: Record<string, unknown> = {
      countryCode: 'VE',
      hsCode: row.digits,
      description: composeDescription(row),
      adValorem: rate,
      // IVA is not part of the arancel; general rate is a placeholder.
      iva: 16.0,
      customsFee: 1.0,
      legalNotes: buildLegalNotes(row),
      isBK,
      isBIT,
      isActive: true,
      isDerogated: false,
      validFromDate: VALID_FROM,
      validToDate: null,
    };
    // Omit the key entirely when empty: a JS `null` on a Json field is stored as
    // JSON `null`, not SQL NULL, which makes `is not null` queries lie.
    if (requirements.length > 0) tariff.requirements = requirements;
    tariffs.push(tariff);

    if (isBK || isBIT) {
      exemptions.push({
        countryCode: 'VE',
        legalType: 'EXEMPTION',
        hierarchyPath: row.code, // dotted, so prefix match works
        content:
          `De conformidad con el Artículo 8 del ${artifact.instrument}, las mercancías ` +
          `clasificadas bajo este código arancelario identificadas como ` +
          `${isBK ? 'BK (Bien de Capital)' : 'BIT (Bien de Informática y Telecomunicaciones)'} ` +
          `gozarán de una alícuota Ad Valorem de 0% sujeta a la obtención del Certificado de Exoneración correspondiente.`,
        sourceFile: 'Tradex-Arancel-de-Aduanas-Decreto-4.944-GOE-6.804.pdf',
        officialDocumentNumber: artifact.gazette,
        decreeNumber: artifact.instrument,
        validFromDate: VALID_FROM,
        validToDate: null,
        isDerogated: false,
        status: 'PUBLISHED',
      });
    }
  }

  const byLength = new Map<number, number>();
  for (const row of rows) byLength.set(row.digitCount, (byLength.get(row.digitCount) ?? 0) + 1);
  const withRequirements = tariffs.filter((t) => t.requirements).length;

  console.log(`source            : ${path.relative(process.cwd(), artifactPath)}`);
  console.log(`instrument        : ${artifact.instrument} (${artifact.gazette})`);
  console.log(`rows extracted    : ${artifact.rows.length}`);
  console.log(`rows after dedupe : ${rows.length}`);
  console.log(`  by code length  : ${[...byLength.entries()].sort((a, b) => a[0] - b[0]).map(([n, c]) => `${n}:${c}`).join('  ')}`);
  console.log(`with requirements : ${withRequirements}`);
  console.log(`BK / BIT rows     : ${bkCount} / ${bitCount}`);
  if (correctedRows > 0) {
    console.log(`régime typos fixed: ${correctedRows} (${Object.keys(KNOWN_REGIMEN_TYPOS).join(', ')})`);
  }
  console.log(`validFrom         : ${VALID_FROM.toISOString().slice(0, 10)}`);
  if (unknownRegimens.size > 0) {
    console.error(`\nERROR: régime codes outside Article 21's catalogue: ${[...unknownRegimens].join(', ')}`);
    process.exit(1);
  }
  console.log(`\ntarget DATABASE_URL: ${(process.env.DATABASE_URL ?? '(unset)').replace(/:\/\/([^:]+):[^@]+@/, '://$1:***@')}`);

  if (dryRun) {
    console.log('\n--dry-run: nothing written.');
    const sample = tariffs.find((t) => t.hsCode === '2106903012') ?? tariffs[0];
    console.log('sample row:\n' + JSON.stringify(sample, null, 2));
    return;
  }

  return (async () => {
    const { getUnscopedSystemPrisma } = await import('../client.js');
    const prisma = getUnscopedSystemPrisma();

    try {
      const deletedTariffs = await prisma.nationalTariff.deleteMany({ where: { countryCode: 'VE' } });
      console.log(`\ndeleted NationalTariff VE rows      : ${deletedTariffs.count}`);
      const deletedExemptions = await prisma.legalKnowledgeParent.deleteMany({
        where: { countryCode: 'VE', legalType: 'EXEMPTION' },
      });
      console.log(`deleted EXEMPTION LegalKnowledgeParent (VE): ${deletedExemptions.count}`);

      const chunkSize = 500;
      // createMany() with a blank id lets Prisma apply the cuid() default.
      for (let i = 0; i < tariffs.length; i += chunkSize) {
        const chunk = tariffs.slice(i, i + chunkSize);
        await prisma.nationalTariff.createMany({ data: chunk, skipDuplicates: true });
        console.log(`  inserted NationalTariff ${Math.min(i + chunk.length, tariffs.length)}/${tariffs.length}`);
      }
      for (let i = 0; i < exemptions.length; i += chunkSize) {
        const chunk = exemptions.slice(i, i + chunkSize);
        await prisma.legalKnowledgeParent.createMany({ data: chunk, skipDuplicates: true });
      }
      console.log(`inserted EXEMPTION rows             : ${exemptions.length}`);

      const total = await prisma.nationalTariff.count({ where: { countryCode: 'VE' } });
      console.log(`\nNationalTariff VE now holds        : ${total} rows`);
      console.log('Seeding completed successfully.');
    } finally {
      await prisma.$disconnect();
    }
  })();
}

Promise.resolve(main()).catch((err) => {
  console.error(err);
  process.exit(1);
});
