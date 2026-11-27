import { Prisma, prisma } from '@tariffos/database';
import type { SkuPrecedentRecord } from '@tariffos/agent';
import { embedQueryVectorWithAiClient, type QueryEmbeddingFn } from './query-embedding';

export const SEMANTIC_TIER0_THRESHOLD = 0.94;
const PRODUCT_EMBED_TIMEOUT_MS = 4_000;

interface SemanticProductRow {
  hsCode: string | null;
  description: string;
  confidence: number | null;
  similarity: number;
}

/** Embeds a single `ProductMaster` description or lookup query (`768` dims). */
export async function embedProductMasterText(
  text: string,
  inputType: 'query' | 'passage',
): Promise<number[] | null> {
  return embedQueryVectorWithAiClient(text, inputType, PRODUCT_EMBED_TIMEOUT_MS);
}

/**
 * Semantic Tier 0 fallback against `ProductMaster.embedding` (`cosine >= 0.94`).
 */
export async function searchProductMasterSemantic(
  tenantId: string,
  query: string,
  embedQueryFn: QueryEmbeddingFn = embedQueryVectorWithAiClient,
): Promise<SkuPrecedentRecord | null> {
  const vec = await embedQueryFn(query, 'query');
  if (!vec) return null;

  const vecLiteral = `[${vec.join(',')}]`;
  try {
    const rows = await prisma.$queryRaw<SemanticProductRow[]>(Prisma.sql`
      SELECT "hsCode",
             "description",
             "confidence",
             (1 - (("embedding")::vector(768) <=> ${vecLiteral}::vector(768)))::float8 AS similarity
      FROM "ProductMaster"
      WHERE "tenant_id" = ${tenantId}
        AND "embedding" IS NOT NULL
        AND "hsCode" IS NOT NULL
      ORDER BY ("embedding")::vector(768) <=> ${vecLiteral}::vector(768) ASC
      LIMIT 1
    `);

    const top = rows[0];
    if (!top?.hsCode || top.similarity < SEMANTIC_TIER0_THRESHOLD) {
      return null;
    }

    return {
      hsCode: top.hsCode,
      officialDescription: top.description,
      confidencePct: Math.min(99, Math.round(top.similarity * 100)),
      approvedByBroker: true,
    };
  } catch {
    return null;
  }
}

/** Best-effort passage embedding backfill for newly saved `ProductMaster` rows. */
export async function saveProductMasterEmbedding(
  productId: string,
  description: string,
): Promise<void> {
  const vec = await embedProductMasterText(description, 'passage');
  if (!vec) return;

  const vecLiteral = `[${vec.join(',')}]`;
  try {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "ProductMaster"
      SET "embedding" = ${vecLiteral}::vector(768)
      WHERE "id" = ${productId}
    `);
  } catch {
    // Non-blocking: Tier 0 exact lookup still works without vector
  }
}
