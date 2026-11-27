import {
  ancestryOf,
  composeDocument,
  embedDocuments,
  embeddingDims,
  embeddingModel,
  getCountryByCode,
  populateChunkSearchVectors,
  Prisma,
  prisma,
} from '@tariffos/database';
import { inngest } from './client';
import {
  chunkIdsIntoBatches,
  LEGAL_INDEX_BATCH_SIZE,
  resolveIndexingKind,
  shouldEmbedLegalType,
  type LegalDraftPublishedEventData,
} from './legal-ingestion-helpers';

const COUNTRY_CONCURRENCY = 2;
const EMBED_THROTTLE_PER_MIN = 60;
const toVectorLiteral = (values: number[]): string => `[${values.join(',')}]`;

function collectScopedTariffCodes(hsCodes: readonly string[]): string[] {
  const needed = new Set<string>();
  for (const code of hsCodes) {
    needed.add(code);
    const digits = code.replace(/[^0-9]/g, '');
    for (const prefixLen of [2, 4, 6, 8]) {
      if (digits.length > prefixLen) {
        const p = digits.slice(0, prefixLen);
        needed.add(p);
        if (prefixLen === 4) needed.add(p);
        if (prefixLen === 6) needed.add(`${p.slice(0, 4)}.${p.slice(4, 6)}`);
        if (prefixLen === 8) needed.add(`${p.slice(0, 4)}.${p.slice(4, 6)}.${p.slice(6, 8)}`);
      }
    }
  }
  return Array.from(needed);
}

export const indexPublishedLegalFn = inngest.createFunction(
  {
    id: 'index-published-legal',
    retries: 3,
    concurrency: [{ limit: COUNTRY_CONCURRENCY, key: 'event.data.countryCode' }],
    throttle: { limit: EMBED_THROTTLE_PER_MIN, period: '1m' },
    triggers: [{ event: 'legal/draft.published' }],
  },
  async ({ event, step }) => {
    const data = event.data as LegalDraftPublishedEventData;
    const kind = data.kind ?? resolveIndexingKind(data.legalType);

    if (kind === 'tariff') {
      const pendingCodes = await step.run('compute-pending-tariff-embeddings', async () => {
        const country = await getCountryByCode(data.countryCode, prisma);
        const rows = await prisma.nationalTariff.findMany({
          where: { countryCode: data.countryCode, isActive: true, isDerogated: false },
          select: { hsCode: true, description: true },
          orderBy: { hsCode: 'asc' },
        });
        const byCode = new Map(rows.map((r) => [r.hsCode, r.description]));
        const leaves = rows.filter(
          (r) => r.hsCode.replace(/[^0-9]/g, '').length === country.nomenclatureDigits,
        );
        const liveSet = new Set(leaves.map((l) => l.hsCode));

        const existing = await prisma.$queryRaw<Array<{ hsCode: string; document: string }>>(
          Prisma.sql`SELECT "hsCode", "document" FROM "TariffNodeEmbedding" WHERE "countryCode" = ${data.countryCode}`,
        );
        const staleCodes = existing.filter((e) => !liveSet.has(e.hsCode)).map((e) => e.hsCode);
        if (staleCodes.length > 0) {
          await prisma.$executeRaw(
            Prisma.sql`DELETE FROM "TariffNodeEmbedding" WHERE "countryCode" = ${data.countryCode} AND "hsCode" IN (${Prisma.join(staleCodes)})`,
          );
        }

        const existingDocs = new Map(existing.map((e) => [e.hsCode, e.document]));
        return leaves
          .filter((leaf) => {
            const doc = composeDocument(ancestryOf(leaf.hsCode, byCode), leaf.description).trim();
            return existingDocs.get(leaf.hsCode) !== doc;
          })
          .map((leaf) => leaf.hsCode);
      });

      const batches = chunkIdsIntoBatches(pendingCodes, LEGAL_INDEX_BATCH_SIZE);
      let embeddedTariffs = 0;

      for (let idx = 0; idx < batches.length; idx += 1) {
        const hsCodes = batches[idx] ?? [];
        const written = await step.run(`embed-tariff-batch-${idx}`, async () => {
          const scopedCodes = collectScopedTariffCodes(hsCodes);
          const scopedRows =
            scopedCodes.length > 0
              ? await prisma.nationalTariff.findMany({
                  where: {
                    countryCode: data.countryCode,
                    hsCode: { in: scopedCodes },
                    isActive: true,
                    isDerogated: false,
                  },
                  select: { hsCode: true, description: true },
                })
              : [];
          const byCode = new Map(scopedRows.map((r) => [r.hsCode, r.description]));
          const docs = hsCodes.map((code) => {
            const self = byCode.get(code) ?? 'Partida arancelaria nacional';
            return composeDocument(ancestryOf(code, byCode), self).trim() || self;
          });
          const vectors = await embedDocuments(docs);
          const model = embeddingModel();
          const dims = embeddingDims();

          const ids: string[] = [];
          const countryCodes: string[] = [];
          const codes: string[] = [];
          const models: string[] = [];
          const dimsList: number[] = [];
          const documents: string[] = [];
          const vectorLiterals: string[] = [];

          for (let k = 0; k < hsCodes.length; k += 1) {
            const code = hsCodes[k];
            const vec = vectors[k];
            const doc = docs[k];
            if (!code || !vec || !doc) continue;
            ids.push(`${data.countryCode}:${code}`);
            countryCodes.push(data.countryCode);
            codes.push(code);
            models.push(model);
            dimsList.push(dims);
            documents.push(doc);
            vectorLiterals.push(toVectorLiteral(vec));
          }

          if (codes.length > 0) {
            await prisma.$executeRaw(Prisma.sql`
              INSERT INTO "TariffNodeEmbedding"
                ("id", "countryCode", "hsCode", "model", "dims", "document", "embedding", "createdAt", "updatedAt")
              SELECT u.id, u.country_code, u.hs_code, u.model, u.dims, u.document, u.vec::vector, now(), now()
              FROM UNNEST(
                ${ids}::text[],
                ${countryCodes}::text[],
                ${codes}::text[],
                ${models}::text[],
                ${dimsList}::integer[],
                ${documents}::text[],
                ${vectorLiterals}::text[]
              ) AS u(id, country_code, hs_code, model, dims, document, vec)
              ON CONFLICT ("countryCode", "hsCode") DO UPDATE SET
                "document" = EXCLUDED."document",
                "embedding" = EXCLUDED."embedding",
                "model" = EXCLUDED."model",
                "dims" = EXCLUDED."dims",
                "updatedAt" = now()
            `);
          }
          return codes.length;
        });
        embeddedTariffs += written;
      }

      return { kind: 'tariff' as const, embeddedTariffs };
    }

    await step.run('update-fts-tsvector', async () => {
      await populateChunkSearchVectors(prisma, data.parentId);
      return { parentId: data.parentId };
    });

    if (!shouldEmbedLegalType(data.legalType, data.forceEmbeddings)) {
      return { kind: 'legal' as const, embeddedChunks: 0, skippedEmbeddings: true };
    }

    const chunkIds = await step.run('list-pending-chunks', async () => {
      const rows = await prisma.$queryRaw<Array<{ id: string }>>(
        Prisma.sql`SELECT "id" FROM "LegalKnowledgeChunk" WHERE "parentId" = ${data.parentId} AND "embedding" IS NULL ORDER BY "chunkIndex" ASC`,
      );
      return rows.map((r) => r.id);
    });

    const batches = chunkIdsIntoBatches(chunkIds, LEGAL_INDEX_BATCH_SIZE);
    let embeddedChunks = 0;

    for (let idx = 0; idx < batches.length; idx += 1) {
      const batchIds = batches[idx] ?? [];
      const written = await step.run(`embed-legal-batch-${idx}`, async () => {
        const chunks = await prisma.legalKnowledgeChunk.findMany({
          where: { id: { in: batchIds } },
          select: { id: true, heading: true, content: true },
          orderBy: { chunkIndex: 'asc' },
        });
        if (chunks.length === 0) return 0;

        const docs = chunks.map((c) => `${c.heading}\n${c.content}`.trim());
        const vectors = await embedDocuments(docs);
        for (let k = 0; k < chunks.length; k += 1) {
          const chunk = chunks[k];
          const vec = vectors[k];
          if (!chunk || !vec) continue;
          await prisma.$executeRaw(Prisma.sql`
            UPDATE "LegalKnowledgeChunk"
            SET "embedding" = ${toVectorLiteral(vec)}::vector
            WHERE "id" = ${chunk.id}
          `);
        }
        return chunks.length;
      });
      embeddedChunks += written;
    }

    return { kind: 'legal' as const, embeddedChunks, skippedEmbeddings: false };
  },
);
