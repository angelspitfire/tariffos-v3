export interface LegalChunkDraft {
  heading: string;
  ruleNumber: string | null;
  content: string;
  scope: string[];
  chunkIndex: number;
}

/** Matches both 2-by-2 (`84.71`, `21.06.90`) and 4+2 (`1602.10`, `8517.62.91.00`) HS notations. */
export const HS_SCOPE_REF_RE = /\b(?:\d{4}(?:\.\d{2}){1,3}|\d{2}(?:\.\d{2}){1,4})\b/g;

const MARKDOWN_HEADING_RE = /^#{1,3}\s+(.+)$/;
const ARTICLE_RE = /^(?:Art[íi]culo|Art\.?)\s+(\d+(?:°|º)?)\s*[.\-–—:]*\s*(.*)$/i;
const NUMBERED_RULE_RE = /^(\d{1,3})\.\s+(.*)$/;
const SUB_ITEM_RE = /^(?:[a-zñ]\)|Par[áa]grafo\b|\([a-z0-9]+\))/i;
const BARE_YEAR_RE = /^(?:19|20)\d{2}$/;
const MAX_CHAPTER_PREFIX = 98;

function isPlausibleHsReference(code: string, rawContext: string, matchIndex: number): boolean {
  if (BARE_YEAR_RE.test(code)) return false;
  const parts = code.split('.');
  const firstPart = Number.parseInt(parts[0] ?? '', 10);
  const firstTwo = Number.parseInt(code.slice(0, 2), 10);
  if (Number.isNaN(firstTwo) || firstTwo < 1 || firstTwo > MAX_CHAPTER_PREFIX) return false;

  // Exclude 1-dot 4-digit gazette numbers such as "Gaceta Oficial 6.804"
  if (parts.length === 2 && parts[0]?.length === 1 && parts[1]?.length === 3) return false;
  if (parts.length === 2 && parts[0]?.length === 4 && parts[1]?.length === 2) {
    return true;
  }
  if (parts.length >= 2 && parts[0]?.length === 2) {
    const prefixWindow = rawContext.slice(Math.max(0, matchIndex - 24), matchIndex).toLowerCase();
    if (/gaceta|decreto|ley|resoluci[óo]n|n[°º]/.test(prefixWindow)) return false;
    return firstPart >= 1 && firstPart <= MAX_CHAPTER_PREFIX;
  }
  return true;
}

/** Extracts normalized, deduplicated HS references from a legal rule text. */
export function extractHsScopeCodes(text: string): string[] {
  const seen = new Set<string>();
  const matches = text.matchAll(HS_SCOPE_REF_RE);
  for (const match of matches) {
    const code = match[0];
    const index = match.index ?? 0;
    if (!isPlausibleHsReference(code, text, index)) continue;
    seen.add(code);
  }
  return Array.from(seen);
}

/**
 * Deterministically chunks legal instruments (Decree notes, LOA articles,
 * or Markdown sections) while keeping lettered sub-items and paragraphs attached.
 */
export function chunkLegalDocument(input: {
  title: string;
  content: string;
  format: 'pdf' | 'markdown' | 'txt';
}): LegalChunkDraft[] {
  const lines = input.content
    .replace(/\f/g, '\n')
    .split(/\r?\n/)
    .map((line) => line.trimEnd());

  const chunks: LegalChunkDraft[] = [];
  let currentHeading = input.title.trim() || 'Instrumento Legal';
  let currentRuleNumber: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    const body = buffer.join('\n').trim();
    buffer = [];
    if (!body) return;
    chunks.push({
      heading: currentHeading,
      ruleNumber: currentRuleNumber,
      content: body,
      scope: extractHsScopeCodes(body),
      chunkIndex: chunks.length,
    });
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (buffer.length > 0 && buffer[buffer.length - 1] !== '') buffer.push('');
      continue;
    }

    const mdMatch = input.format === 'markdown' ? line.match(MARKDOWN_HEADING_RE) : null;
    if (mdMatch?.[1]) {
      flush();
      currentHeading = mdMatch[1].trim();
      currentRuleNumber = null;
      continue;
    }

    const artMatch = line.match(ARTICLE_RE);
    if (artMatch?.[1]) {
      flush();
      currentRuleNumber = artMatch[1].replace(/[°º]/g, '');
      buffer.push(line);
      continue;
    }

    const numMatch = line.match(NUMBERED_RULE_RE);
    if (numMatch?.[1] && !SUB_ITEM_RE.test(line)) {
      flush();
      currentRuleNumber = numMatch[1];
      buffer.push(line);
      continue;
    }

    buffer.push(line);
  }

  flush();

  if (chunks.length === 0 && input.content.trim()) {
    const trimmed = input.content.trim();
    return [
      {
        heading: currentHeading,
        ruleNumber: null,
        content: trimmed,
        scope: extractHsScopeCodes(trimmed),
        chunkIndex: 0,
      },
    ];
  }

  return chunks;
}
