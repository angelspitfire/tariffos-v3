import { Prisma, prisma } from '@tariffos/database';
import type { TariffCandidateRecord } from '@tariffos/agent';
import { formatHsCode } from '@tariffos/shared-types';
import { embedQueryVectorWithAiClient, type QueryEmbeddingFn } from './query-embedding';

const DEFAULT_DIMS = 768;
const DEFAULT_VECTOR_LIMIT = 12;
const DEFAULT_UNIT = 'u';

interface VectorRow {
  hsCode: string;
  document: string;
  description: string;
  adValorem: number | null;
  iva: number | null;
  legalNotes: string | null;
  customsFee: number | null;
  isBK: boolean;
  isBIT: boolean;
  similarity: number;
}

export async function searchTariffCandidatesVector(
  countryCode: string,
  query: string,
  limit = DEFAULT_VECTOR_LIMIT,
  embedQueryFn: QueryEmbeddingFn = embedQueryVectorWithAiClient,
): Promise<TariffCandidateRecord[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const vec = await embedQueryFn(trimmed, 'query');
  if (!vec) return [];

  const dims = vec.length;
  const vecLiteral = `[${vec.join(',')}]`;

  try {
    const rows =
      dims === DEFAULT_DIMS
        ? await prisma.$queryRaw<VectorRow[]>(Prisma.sql`
            SELECT e."hsCode",
                   e."document",
                   nt."description",
                   nt."adValorem",
                   nt."iva",
                   nt."legalNotes",
                   nt."customsFee",
                   nt."isBK",
                   nt."isBIT",
                   (1 - ((e."embedding")::vector(768) <=> ${vecLiteral}::vector(768)))::float8 AS similarity
            FROM "TariffNodeEmbedding" e
            JOIN "NationalTariff" nt
              ON nt."countryCode" = e."countryCode"
             AND nt."hsCode" = e."hsCode"
            WHERE e."countryCode" = ${countryCode}
              AND e."dims" = 768
              AND nt."isActive" = true
              AND nt."isDerogated" = false
            ORDER BY (e."embedding")::vector(768) <=> ${vecLiteral}::vector(768) ASC
            LIMIT ${limit}
          `)
        : await prisma.$queryRaw<VectorRow[]>(Prisma.sql`
            SELECT e."hsCode",
                   e."document",
                   nt."description",
                   nt."adValorem",
                   nt."iva",
                   nt."legalNotes",
                   nt."customsFee",
                   nt."isBK",
                   nt."isBIT",
                   (1 - (e."embedding" <=> ${vecLiteral}::vector))::float8 AS similarity
            FROM "TariffNodeEmbedding" e
            JOIN "NationalTariff" nt
              ON nt."countryCode" = e."countryCode"
             AND nt."hsCode" = e."hsCode"
            WHERE e."countryCode" = ${countryCode}
              AND e."dims" = ${dims}
              AND nt."isActive" = true
              AND nt."isDerogated" = false
            ORDER BY e."embedding" <=> ${vecLiteral}::vector ASC
            LIMIT ${limit}
          `);

    return rows.map((row) => ({
      hsCode: formatHsCode(row.hsCode),
      description: row.document || row.description,
      adValoremRate: row.adValorem ?? 0,
      ivaRate: row.iva ?? 16,
      unit: DEFAULT_UNIT,
      legalRegime: row.legalNotes ?? undefined,
      prohibited: false,
      permits: [],
      score: Number(Math.max(0.05, Math.min(0.99, row.similarity)).toFixed(4)),
      customsFeeRate: row.customsFee ?? undefined,
      isBK: row.isBK,
      isBIT: row.isBIT,
    }));
  } catch {
    return [];
  }
}
