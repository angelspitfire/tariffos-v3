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
          const allRows = await prisma.nationalTariff.findMany({
            where: { countryCode: data.countryCode, isActive: true, isDerogated: false },
            select: { hsCode: true, description: true },
          });
          const byCode = new Map(allRows.map((r) => [r.hsCode, r.description]));
          const docs = hsCodes.map((code) => {
            const self = byCode.get(code) ?? 'Partida arancelaria nacional';
            return composeDocument(ancestryOf(code, byCode), self).trim() || self;
          });
          const vectors = await embedDocuments(docs);
          const model = embeddingModel();
          const dims = embeddingDims();

          for (let k = 0; k < hsCodes.length; k += 1) {
            const code = hsCodes[k];
            const vec = vectors[k];
            const doc = docs[k];
            if (!code || !vec || !doc) continue;
            await prisma.$executeRaw(Prisma.sql`
              INSERT INTO "TariffNodeEmbedding"
                ("id", "countryCode", "hsCode", "model", "dims", "document", "embedding", "createdAt", "updatedAt")
              VALUES (${`${data.countryCode}:${code}`}, ${data.countryCode}, ${code}, ${model}, ${dims}, ${doc}, ${toVectorLiteral(vec)}::vector, now(), now())
              ON CONFLICT ("countryCode", "hsCode") DO UPDATE SET
                "document" = EXCLUDED."document",
                "embedding" = EXCLUDED."embedding",
                "model" = EXCLUDED."model",
                "dims" = EXCLUDED."dims",
                "updatedAt" = now()
            `);
          }
          return hsCodes.length;
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
