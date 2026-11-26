import { Prisma, prisma } from '@tariffos/database';
import type { TariffCandidateRecord } from '@tariffos/agent';

const DEFAULT_MODEL = 'nvidia/nemotron-3.5-embed-1b';
const DEFAULT_DIMS = 768;
const DEFAULT_VECTOR_LIMIT = 12;
const DEFAULT_UNIT = 'u';
const NVIDIA_EMBED_URL = 'https://integrate.api.nvidia.com/v1';

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

async function embedQueryVector(query: string): Promise<number[] | null> {
  const model = process.env.EMBEDDING_MODEL?.trim() || DEFAULT_MODEL;
  const dimsRaw = Number(process.env.EMBEDDING_DIMS);
  const dims = Number.isFinite(dimsRaw) && dimsRaw > 0 ? dimsRaw : DEFAULT_DIMS;
  const nvidiaKey = process.env.NVIDIA_API_KEY?.trim();
  if (!nvidiaKey) return null;

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
        input: [query],
        input_type: 'query',
        dimensions: dims,
        truncate: 'END',
      }),
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) return null;
    const parsed = (await res.json()) as { data?: Array<{ embedding?: number[] }> };
    const vec = parsed.data?.[0]?.embedding;
    return vec && vec.length === dims ? vec : null;
  } catch {
    return null;
  }
}

export async function searchTariffCandidatesVector(
  countryCode: string,
  query: string,
  limit = DEFAULT_VECTOR_LIMIT,
): Promise<TariffCandidateRecord[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const vec = await embedQueryVector(trimmed);
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
      hsCode:
        row.hsCode.length === 10
          ? `${row.hsCode.slice(0, 4)}.${row.hsCode.slice(4, 6)}.${row.hsCode.slice(6, 8)}.${row.hsCode.slice(8, 10)}`
          : row.hsCode,
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
