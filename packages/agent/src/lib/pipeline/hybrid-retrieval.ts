import { digits } from '../util/code.js';
import type { LegalNoteRecord, PipelinePorts, TariffCandidateRecord } from './types.js';

export const RRF_K = 60;
export const DEFAULT_HYBRID_LIMIT = 12;

export interface HybridFusionOptions {
  k?: number;
  vectorWeight?: number;
  lexicalWeight?: number;
  limit?: number;
}

interface FusedEntry {
  record: TariffCandidateRecord;
  rrfScore: number;
}

function mergeTariffMetadata(
  existing: TariffCandidateRecord,
  incoming: TariffCandidateRecord,
  preferIncoming: boolean,
): TariffCandidateRecord {
  const primary = preferIncoming ? incoming : existing;
  const secondary = preferIncoming ? existing : incoming;
  return {
    hsCode: primary.hsCode.includes('.') ? primary.hsCode : secondary.hsCode,
    description: primary.description || secondary.description,
    adValoremRate: primary.adValoremRate ?? secondary.adValoremRate,
    ivaRate: primary.ivaRate ?? secondary.ivaRate,
    unit: primary.unit || secondary.unit,
    legalRegime: primary.legalRegime ?? secondary.legalRegime,
    prohibited: Boolean(primary.prohibited || secondary.prohibited),
    permits: primary.permits?.length ? primary.permits : secondary.permits,
    score: primary.score ?? secondary.score,
  };
}

/**
 * Pure Reciprocal Rank Fusion (RRF) combiner merging vector (`TariffNodeEmbedding`)
 * and lexical FTS (`NationalTariff`) ranked candidate lists.
 * Scores are normalized into `(0, 1]` relative to the theoretical max RRF score
 * when a candidate ranks #1 in both lists.
 */
export function fuseHybridTariffCandidates(
  vectorCandidates: TariffCandidateRecord[],
  lexicalCandidates: TariffCandidateRecord[],
  options: HybridFusionOptions = {},
): TariffCandidateRecord[] {
  const k = options.k ?? RRF_K;
  const vectorWeight = options.vectorWeight ?? 1;
  const lexicalWeight = options.lexicalWeight ?? 1;
  const limit = options.limit ?? DEFAULT_HYBRID_LIMIT;

  const byKey = new Map<string, FusedEntry>();

  vectorCandidates.forEach((candidate, rank) => {
    const key = digits(candidate.hsCode) || candidate.hsCode.trim();
    if (!key) return;
    const contrib = vectorWeight / (k + rank + 1);
    const existing = byKey.get(key);
    if (existing) {
      existing.rrfScore += contrib;
    } else {
      byKey.set(key, { record: candidate, rrfScore: contrib });
    }
  });

  lexicalCandidates.forEach((candidate, rank) => {
    const key = digits(candidate.hsCode) || candidate.hsCode.trim();
    if (!key) return;
    const contrib = lexicalWeight / (k + rank + 1);
    const existing = byKey.get(key);
    if (existing) {
      existing.rrfScore += contrib;
      existing.record = mergeTariffMetadata(existing.record, candidate, true);
    } else {
      byKey.set(key, { record: candidate, rrfScore: contrib });
    }
  });

  const maxPossible = (vectorWeight + lexicalWeight) / (k + 1);

  return Array.from(byKey.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, limit)
    .map((entry) => ({
      ...entry.record,
      score: maxPossible > 0 ? Number((entry.rrfScore / maxPossible).toFixed(4)) : 0,
    }));
}

function extractNoteChapter(note: LegalNoteRecord): string | null {
  if (note.chapter) {
    const cleaned = digits(note.chapter).slice(0, 2);
    return cleaned.length === 2 ? cleaned : null;
  }
  const chapterMatch = note.ref.match(/(?:cap(?:[ií]tulo|\.)?|ch(?:apter|\.)?)\s*0?(\d{1,2})\b/i);
  if (chapterMatch?.[1]) {
    return chapterMatch[1].padStart(2, '0');
  }
  const hsMatch = note.ref.match(/\b(\d{2})\d{2}\.\d{2}\b/);
  if (hsMatch?.[1]) {
    return hsMatch[1];
  }
  return null;
}

/**
 * Hard chapter filter on 2-digit HS chapter prefix.
 * Preserves section/general notes (no explicit chapter) and notes matching any
 * candidate's 2-digit chapter, excluding notes bound to unrelated chapters.
 */
export function filterLegalNotesByChapter(
  notes: LegalNoteRecord[],
  hsCodes: string[],
): LegalNoteRecord[] {
  const allowedChapters = new Set(
    hsCodes
      .map((code) => digits(code).slice(0, 2))
      .filter((ch) => ch.length === 2),
  );
  if (allowedChapters.size === 0) return notes;

  return notes.filter((note) => {
    const noteChapter = extractNoteChapter(note);
    if (!noteChapter) return true;
    return allowedChapters.has(noteChapter);
  });
}

/**
 * Runs lexical FTS retrieval and optional `pgvector` candidate retrieval in parallel,
 * fusing both ranked lists via RRF and falling back gracefully to lexical on errors.
 */
export async function retrieveHybridCandidates(
  ports: Pick<PipelinePorts, 'searchTariffCandidates' | 'searchVectorCandidates'>,
  countryCode: string,
  query: string,
  options?: HybridFusionOptions,
): Promise<TariffCandidateRecord[]> {
  if (!ports.searchVectorCandidates) {
    return ports.searchTariffCandidates(countryCode, query);
  }

  const [lexicalCandidates, vectorCandidates] = await Promise.all([
    ports.searchTariffCandidates(countryCode, query),
    ports.searchVectorCandidates(countryCode, query).catch(() => [] as TariffCandidateRecord[]),
  ]);

  if (vectorCandidates.length === 0) {
    return lexicalCandidates;
  }

  return fuseHybridTariffCandidates(vectorCandidates, lexicalCandidates, options);
}

/** Expands up to 3 unique 6-digit NCM/HS sibling prefixes before Tier 2 RGI 6 reasoning. */
export async function expandSiblingsForRgi(
  ports: Pick<PipelinePorts, 'expandSiblingSubheadings'>,
  countryCode: string,
  candidates: TariffCandidateRecord[],
): Promise<TariffCandidateRecord[]> {
  if (!ports.expandSiblingSubheadings || candidates.length === 0) return candidates;
  const siblingPrefixes = Array.from(
    new Set(candidates.map((c) => digits(c.hsCode).slice(0, 6)).filter((p) => p.length === 6)),
  ).slice(0, 3);
  if (siblingPrefixes.length === 0) return candidates;

  const siblings = await ports
    .expandSiblingSubheadings(countryCode, siblingPrefixes)
    .catch(() => [] as TariffCandidateRecord[]);
  const seen = new Set(candidates.map((c) => digits(c.hsCode)));
  const extra = siblings.filter((s) => {
    const key = digits(s.hsCode);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return extra.length > 0 ? [...candidates, ...extra] : candidates;
}
