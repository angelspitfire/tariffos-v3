import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import type { IngestionSourceFormat, LegalDocumentType } from '@tariffos/shared-types';
import { getCountryByCode } from '../country';
import { Prisma } from '../generated/client';
import {
  chunkLegalDocument,
  computeDraftDiff,
  embedDocuments,
  extractPdfTextFromBuffer,
  parseTariffSchedule,
  populateChunkSearchVectors,
  publishLegalDraft,
  stageLegalDocumentDraft,
} from '../ingestion';

const CLI_EMBED_BATCH_SIZE = 20;

export interface IngestCliOptions {
  countryCode: string;
  legalType: LegalDocumentType;
  hierarchyPath: string;
  title: string;
  decreeNumber?: string;
  officialDocumentNumber?: string;
  validFromDate: string;
  filePath: string;
  replaceSameDate: boolean;
  publish: boolean;
  embed: boolean;
  dryRun: boolean;
}

export function detectFormatFromPath(filePath: string): IngestionSourceFormat {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'markdown';
  if (lower.endsWith('.csv')) return 'tariff_csv';
  if (lower.endsWith('.json')) return 'tariff_json';
  return 'txt';
}

export function parseIngestCliArgs(argv: string[]): IngestCliOptions {
  const readFlag = (flag: string): string | undefined => {
    const idx = argv.indexOf(flag);
    return idx >= 0 && argv[idx + 1] && !argv[idx + 1]?.startsWith('--') ? argv[idx + 1] : undefined;
  };

  return {
    countryCode: (readFlag('--country') ?? 'VE').trim().toUpperCase(),
    legalType: (readFlag('--type') ?? 'LEGAL_NOTE') as LegalDocumentType,
    hierarchyPath: readFlag('--path') ?? '',
    title: readFlag('--title') ?? '',
    decreeNumber: readFlag('--decree'),
    officialDocumentNumber: readFlag('--gazette'),
    validFromDate: readFlag('--valid-from') ?? new Date().toISOString().slice(0, 10),
    filePath: readFlag('--file') ?? '',
    replaceSameDate: argv.includes('--replace-same-date'),
    publish: argv.includes('--publish'),
    embed: argv.includes('--embed'),
    dryRun: argv.includes('--dry-run'),
  };
}

function loadMonorepoEnv(): void {
  for (const candidate of ['apps/web/.env.local', '.env.local', '.env']) {
    const file = path.resolve(process.cwd(), '../..', candidate);
    if (fs.existsSync(file)) dotenv.config({ path: file });
  }
}

async function runCli(): Promise<void> {
  loadMonorepoEnv();
  const opts = parseIngestCliArgs(process.argv.slice(2));
  if (!opts.filePath || !opts.hierarchyPath || !opts.title) {
    throw new Error('Uso: --path <ruta> --title <titulo> --file <archivo> [--country VE] [--type LEGAL_NOTE] [--publish] [--dry-run]');
  }

  const resolvedFile = path.resolve(process.cwd(), opts.filePath);
  if (!fs.existsSync(resolvedFile)) throw new Error(`Archivo no encontrado: ${resolvedFile}`);

  const format = detectFormatFromPath(resolvedFile);
  const rawBytes = new Uint8Array(fs.readFileSync(resolvedFile));
  const text = format === 'pdf'
    ? (await extractPdfTextFromBuffer(rawBytes)).text
    : new TextDecoder('utf-8').decode(rawBytes);

  if (opts.dryRun) {
    if (opts.legalType === 'TARIFF_SCHEDULE') {
      const parsed = parseTariffSchedule(text, format === 'tariff_csv' ? 'tariff_csv' : 'tariff_json', {
        code: opts.countryCode,
        nomenclatureDigits: 10,
        codeGrouping: '4.2.2.2',
      });
      console.log(`[dry-run] ${opts.countryCode} TARIFF_SCHEDULE: ${parsed.rows.length} filas (${parsed.leafCount} hojas), errores: ${parsed.errors.length}`);
      return;
    }
    const chunks = chunkLegalDocument({
      title: opts.title,
      content: text,
      format: format === 'pdf' || format === 'markdown' ? format : 'txt',
    });
    console.log(`[dry-run] ${opts.countryCode} ${opts.legalType} (${opts.hierarchyPath}): ${chunks.length} chunks extraídos`);
    return;
  }

  const { getUnscopedSystemPrisma } = await import('../client');
  const prisma = getUnscopedSystemPrisma();
  const validFromDate = new Date(opts.validFromDate);

  try {
    let stagedContent = text;
    let chunks: ReturnType<typeof chunkLegalDocument> = [];
    if (opts.legalType === 'TARIFF_SCHEDULE') {
      const country = await getCountryByCode(opts.countryCode, prisma);
      const parsed = parseTariffSchedule(text, format === 'tariff_csv' ? 'tariff_csv' : 'tariff_json', country);
      if (parsed.rows.length === 0) throw new Error(parsed.errors[0] ?? 'Arancel sin filas válidas');
      stagedContent = JSON.stringify(parsed.rows);
    } else {
      chunks = chunkLegalDocument({
        title: opts.title,
        content: text,
        format: format === 'pdf' || format === 'markdown' ? format : 'txt',
      });
    }

    const staged = await stageLegalDocumentDraft(prisma, {
      countryCode: opts.countryCode,
      legalType: opts.legalType,
      hierarchyPath: opts.hierarchyPath,
      title: opts.title,
      content: stagedContent,
      sourceFile: path.basename(resolvedFile),
      officialDocumentNumber: opts.officialDocumentNumber ?? null,
      decreeNumber: opts.decreeNumber ?? null,
      validFromDate,
      replaceSameDate: opts.replaceSameDate,
      chunks,
    });

    const diff = await computeDraftDiff(prisma, staged.parentId);
    console.log(`[stage] DRAFT ${staged.parentId} (${staged.chunkCount} chunks), solapados=${diff.overlappingPublished.length}`);

    if (opts.publish) {
      const pub = await publishLegalDraft(prisma, staged.parentId);
      await populateChunkSearchVectors(prisma, pub.publishedId);
      let embeddedCount = 0;
      if (opts.embed) {
        const persistedChunks = await prisma.legalKnowledgeChunk.findMany({
          where: { parentId: pub.publishedId },
          select: { id: true, heading: true, content: true },
          orderBy: { chunkIndex: 'asc' },
        });
        for (let i = 0; i < persistedChunks.length; i += CLI_EMBED_BATCH_SIZE) {
          const batch = persistedChunks.slice(i, i + CLI_EMBED_BATCH_SIZE);
          const vectors = await embedDocuments(batch.map((c) => `${c.heading}\n${c.content}`.trim()));
          for (let k = 0; k < batch.length; k += 1) {
            const chunk = batch[k];
            const vec = vectors[k];
            if (!chunk || !vec) continue;
            await prisma.$executeRaw(Prisma.sql`
              UPDATE "LegalKnowledgeChunk" SET "embedding" = ${`[${vec.join(',')}]`}::vector WHERE "id" = ${chunk.id}
            `);
            embeddedCount += 1;
          }
        }
      }
      console.log(`[publish] ${pub.publishedId} publicado (derogados=${pub.derogatedCount}, embeddings=${embeddedCount})`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

const isCliEntry = process.argv[1]?.endsWith('ingest_legal.ts') || process.argv[1]?.endsWith('ingest_legal.js');
if (isCliEntry) {
  runCli().catch((err: unknown) => {
    console.error('[ingest:legal] failed:', err);
    process.exit(1);
  });
}
