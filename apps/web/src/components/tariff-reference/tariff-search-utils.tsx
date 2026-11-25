import type { ReactNode } from 'react';
import { type TariffSearchResult } from '@/types/tariff-reference';

// ─── Constants ───
export const DEBOUNCE_MS = 300;
export const MAX_SUGGESTIONS = 10;
export const FUZZY_THRESHOLD = 0.3;
export const PREFIX_MATCH_SCORE = 19 / 20;

export type MatchInfo = { score: number; indices: number[] } | null;

// ─── Fuzzy search (code + description) ───
export function fuzzyMatch(text: string, query: string): MatchInfo {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (q.length === 0) return null;
  if (t === q) return { score: 1, indices: t.split('').map((_, i) => i) };
  if (t.startsWith(q)) return { score: PREFIX_MATCH_SCORE, indices: q.split('').map((_, i) => i) };

  const indices: number[] = [];
  let j = 0;
  let consecutive = 0;
  let score = 0;
  for (let i = 0; i < t.length; i++) {
    if (j < q.length && t[i] === q[j]) {
      indices.push(i);
      j++;
      consecutive++;
      score += 1 + consecutive * 0.1;
    } else {
      consecutive = 0;
    }
  }
  if (j < q.length) return null;
  const normalized = Math.min(score / t.length, 1);
  return normalized >= FUZZY_THRESHOLD ? { score: normalized, indices } : null;
}

export function filterItems(items: TariffSearchResult[], query: string): TariffSearchResult[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const scored: Array<{ item: TariffSearchResult; score: number }> = [];
  for (const item of items) {
    const code = fuzzyMatch(item.code, trimmed);
    const desc = fuzzyMatch(item.description, trimmed);
    const descEs = fuzzyMatch(item.descriptionEs ?? '', trimmed);
    const best = [code, desc, descEs]
      .filter((m): m is { score: number; indices: number[] } => m !== null)
      .sort((a, b) => b.score - a.score)[0];
    if (best) scored.push({ item, score: best.score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.item.code.localeCompare(b.item.code))
    .slice(0, MAX_SUGGESTIONS)
    .map((r) => r.item);
}

// ─── Match indices for highlighting ───
export function matchIndices(text: string, query: string): number[] {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  const indices: number[] = [];
  let j = 0;
  for (let i = 0; i < t.length && j < q.length; i++) {
    if (t[i] === q[j]) {
      indices.push(i);
      j++;
    }
  }
  return j === q.length ? indices : [];
}

// ─── Highlight matched characters ───
export function highlight(text: string, indices: number[]): ReactNode {
  const set = new Set(indices);
  const nodes: React.ReactNode[] = [];
  let buf = '';
  const flush = () => {
    if (buf) {
      nodes.push(buf);
      buf = '';
    }
  };
  for (let i = 0; i < text.length; i++) {
    if (set.has(i)) {
      flush();
      nodes.push(
        <mark key={`mark-${i}-${text[i]}`} className="bg-[var(--brand)] text-[var(--text-hi)] rounded-sm px-0.5">
          {text[i]}
        </mark>,
      );
    } else {
      buf += text[i];
    }
  }
  flush();
  return nodes;
}
