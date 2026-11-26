import { Prisma, prisma } from '@tariffos/database';
import type { SkuPrecedentRecord } from '@tariffos/agent';

export const SEMANTIC_TIER0_THRESHOLD = 0.94;
const DEFAULT_MODEL = 'nvidia/nemotron-3.5-embed-1b';
const DEFAULT_DIMS = 768;
const NVIDIA_EMBED_URL = 'https://integrate.api.nvidia.com/v1';

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
  const trimmed = text.trim();
  const nvidiaKey = process.env.NVIDIA_API_KEY?.trim();
  if (!trimmed || !nvidiaKey) return null;

  const model = process.env.EMBEDDING_MODEL?.trim() || DEFAULT_MODEL;
  const dimsRaw = Number(process.env.EMBEDDING_DIMS);
  const dims = Number.isFinite(dimsRaw) && dimsRaw > 0 ? dimsRaw : DEFAULT_DIMS;

  try {
    const baseUrl = (process.env.NVIDIA_BASE_URL?.trim() || NVIDIA_EMBED_URL).replace(/\/+$/, '');
    const res = await fetch(`${baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${nvidiaKey}`,
      },
      body: JSON.stringify({
        model,
        input: [trimmed],
        input_type: inputType,
        dimensions: dims,
        truncate: 'END',
      }),
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return null;
    const parsed = (await res.json()) as { data?: Array<{ embedding?: number[] }> };
    const vec = parsed.data?.[0]?.embedding;
    return vec && vec.length === dims ? vec : null;
  } catch {
    return null;
  }
}

/**
 * Semantic Tier 0 fallback against `ProductMaster.embedding` (`cosine >= 0.94`).
 */
export async function searchProductMasterSemantic(
  tenantId: string,
  query: string,
): Promise<SkuPrecedentRecord | null> {
  const vec = await embedProductMasterText(query, 'query');
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
