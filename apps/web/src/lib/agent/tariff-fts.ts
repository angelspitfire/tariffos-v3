import { Prisma, ancestryOf, composeDocument, prisma } from '@tariffos/database';
import type { TariffCandidateRecord } from '@tariffos/agent';

const DEFAULT_AD_VALOREM_FALLBACK = 0;
const DEFAULT_IVA_FALLBACK = 16;
const DEFAULT_UNIT = 'u';
const DEFAULT_LIMIT = 12;
const FTS_SEED_LIMIT = 10;
const MAX_EXPANSION_PREFIXES = 6;
const PRIMARY_GROUP_LEAF_CAP = 8;
const SECONDARY_GROUP_LEAF_CAP = 4;
const MAX_QUERY_TERMS = 12;
const MAX_FTS_SCORE = 0.84;
const EXACT_HINT_SCORE = 0.95;

const STOP_AND_NOISE_WORDS = new Set([
  'sin', 'con', 'para', 'por', 'del', 'las', 'los', 'una', 'uno', 'unos', 'unas',
  'sobre', 'entre', 'que', 'como', 'desde', 'hasta', 'bajo', 'ante', 'tras',
  'peso', 'pulgadas', 'pulgada', 'cm', 'mm', 'kg', 'litros', 'litro', 'metros',
  'metro', 'unidad', 'unidades', 'nuevo', 'nueva', 'nuevos', 'usado', 'usada',
  'marca', 'modelo', 'color', 'tipo', 'serie', 'talla', 'tamano', 'medida',
]);

interface FtsGroupRow {
  grp6: string;
  distinct_terms: number;
  node_matches: number;
}

export function extractSearchTerms(query: string): string[] {
  const normalized = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  const seen = new Set<string>();
  for (const token of tokens) {
    if (token.length < 3 || /^\d+$/.test(token) || STOP_AND_NOISE_WORDS.has(token)) continue;
    seen.add(token);
    if (seen.size >= MAX_QUERY_TERMS) break;
  }
  return Array.from(seen);
}

export function buildSpanishOrTsQuery(query: string): string | null {
  const terms = extractSearchTerms(query);
  return terms.length > 0 ? terms.join(' | ') : null;
}

export function extractHsPrefixHint(query: string): string | null {
  const match = query.match(/\b(\d{4}(?:\.\d{2}(?:\.\d{2}(?:\.\d{2})?)?|\d{2,6})?)\b/);
  if (!match?.[1]) return null;
  const compact = match[1].replace(/\./g, '');
  return compact.length >= 4 && compact.length <= 10 ? compact : null;
}

function collectAncestorPrefixes(codes: string[]): string[] {
  const prefixes = new Set<string>();
  for (const code of codes) {
    for (let len = 4; len < code.length; len += 1) {
      prefixes.add(code.slice(0, len));
    }
  }
  return Array.from(prefixes);
}

function computeFtsScore(
  hsCode: string,
  hint: string | null,
  group: FtsGroupRow | undefined,
  totalTerms: number,
  rankIndex: number,
): number {
  if (hint && hint.length === 10 && hsCode === hint) return EXACT_HINT_SCORE;
  const termRatio = group && totalTerms > 0 ? group.distinct_terms / totalTerms : 0.35;
  const nodeBonus = group ? Math.min(0.2, group.node_matches * 0.03) : 0.05;
  const decay = Math.min(0.25, rankIndex * 0.02);
  const raw = 0.35 + termRatio * 0.35 + nodeBonus - decay;
  return Number(Math.max(0.15, Math.min(MAX_FTS_SCORE, raw)).toFixed(4));
}

export async function searchTariffCandidatesFts(
  countryCode: string,
  query: string,
  limit = DEFAULT_LIMIT,
): Promise<TariffCandidateRecord[]> {
  const terms = extractSearchTerms(query);
  const hint = extractHsPrefixHint(query);

  const groupRows: FtsGroupRow[] = terms.length > 0
    ? await prisma.$queryRaw<FtsGroupRow[]>(Prisma.sql`
        WITH terms AS (SELECT unnest(${terms}::text[]) AS term),
        node_hits AS (
          SELECT nt."hsCode",
                 left(nt."hsCode", 6) AS grp6,
                 terms.term
          FROM "NationalTariff" nt
          JOIN terms ON to_tsvector('spanish', translate(nt."description", 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'))
                        @@ plainto_tsquery('spanish', terms.term)
          WHERE nt."countryCode" = ${countryCode}
            AND nt."isActive" = true
            AND nt."isDerogated" = false
        ),
        active_groups AS (
          SELECT DISTINCT grp6 FROM node_hits WHERE length(grp6) = 6
          UNION
          SELECT DISTINCT left(nt."hsCode", 6) AS grp6
          FROM "NationalTariff" nt
          JOIN (SELECT DISTINCT "hsCode" AS prefix FROM node_hits WHERE length("hsCode") < 6) p
            ON nt."hsCode" LIKE p.prefix || '%'
          WHERE nt."countryCode" = ${countryCode}
            AND nt."isActive" = true
            AND nt."isDerogated" = false
            AND length(nt."hsCode") >= 6
        ),
        group_scores AS (
          SELECT ag.grp6,
                 count(DISTINCT nh.term)::int AS distinct_terms,
                 count(nh.term)::int AS node_matches
          FROM active_groups ag
          JOIN node_hits nh
            ON nh.grp6 = ag.grp6
            OR (length(nh."hsCode") < 6 AND ag.grp6 LIKE nh."hsCode" || '%')
          GROUP BY ag.grp6
        )
        SELECT grp6, distinct_terms, node_matches
        FROM group_scores
        ORDER BY distinct_terms DESC, node_matches DESC, grp6 ASC
        LIMIT ${FTS_SEED_LIMIT}
      `)
    : [];

  const groupMap = new Map<string, FtsGroupRow>();
  const expansionPrefixes: string[] = [];
  if (hint) expansionPrefixes.push(hint);

  for (const row of groupRows) {
    if (!groupMap.has(row.grp6)) groupMap.set(row.grp6, row);
    if (!expansionPrefixes.includes(row.grp6)) {
      expansionPrefixes.push(row.grp6);
    }
    if (expansionPrefixes.length >= MAX_EXPANSION_PREFIXES) break;
  }

  if (expansionPrefixes.length === 0) return [];

  const leaves = await prisma.nationalTariff.findMany({
    where: {
      countryCode,
      isActive: true,
      isDerogated: false,
      OR: expansionPrefixes.map((prefix) => ({ hsCode: { startsWith: prefix } })),
    },
    orderBy: { hsCode: 'asc' },
    take: limit * 5,
  });

  const leafRows = leaves.filter((row) => row.hsCode.replace(/[^0-9]/g, '').length === 10);
  const pool = leafRows.length > 0 ? leafRows : leaves;
  const deduped = Array.from(new Map(pool.map((row) => [row.hsCode, row])).values());

  const prefixOrder = new Map(expansionPrefixes.map((p, idx) => [p, idx]));
  const matchPrefix = (hsCode: string) => {
    for (const [prefix, idx] of prefixOrder) {
      if (hsCode.startsWith(prefix)) return { prefix, idx };
    }
    return { prefix: hsCode.slice(0, 6), idx: expansionPrefixes.length };
  };

  deduped.sort((a, b) => {
    const ra = matchPrefix(a.hsCode).idx;
    const rb = matchPrefix(b.hsCode).idx;
    if (ra !== rb) return ra - rb;
    return b.hsCode.localeCompare(a.hsCode);
  });

  const perPrefixCount = new Map<string, number>();
  const selected = deduped.filter((row) => {
    const { prefix, idx } = matchPrefix(row.hsCode);
    const cap = idx === 0 ? PRIMARY_GROUP_LEAF_CAP : SECONDARY_GROUP_LEAF_CAP;
    const count = perPrefixCount.get(prefix) ?? 0;
    if (count >= cap) return false;
    perPrefixCount.set(prefix, count + 1);
    return true;
  }).slice(0, limit);

  if (selected.length === 0) return [];

  const ancestorCodes = collectAncestorPrefixes(selected.map((r) => r.hsCode));
  const ancestors =
    ancestorCodes.length > 0
      ? await prisma.nationalTariff.findMany({
          where: { countryCode, hsCode: { in: ancestorCodes }, isActive: true },
          select: { hsCode: true, description: true },
        })
      : [];

  const byCode = new Map(ancestors.map((a) => [a.hsCode, a.description]));

  return selected.map((row, idx) => {
    const { prefix } = matchPrefix(row.hsCode);
    const group = groupMap.get(prefix);
    const composed = composeDocument(ancestryOf(row.hsCode, byCode), row.description);
    return {
      hsCode: row.hsCode,
      description: composed || row.description,
      adValoremRate: row.adValorem ?? DEFAULT_AD_VALOREM_FALLBACK,
      ivaRate: row.iva ?? DEFAULT_IVA_FALLBACK,
      unit: DEFAULT_UNIT,
      legalRegime: row.legalNotes,
      prohibited: row.legalNotes?.toLowerCase().includes('prohibid') ?? false,
      score: computeFtsScore(row.hsCode, hint, group, terms.length, idx),
    };
  });
}
