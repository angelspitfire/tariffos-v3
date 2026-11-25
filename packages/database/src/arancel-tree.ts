/**
 * The arancel as a prefix tree: pure helpers that turn a tariff node into the
 * **ancestry-composed document** used both to embed it and to show it on the
 * decision ballot.
 *
 * Measured structure (see docs/plans/classifier_resolution_rework.md): the
 * decree prints only the 10-digit rows as codes; everything above them is an
 * internal node whose text carries the disambiguation, and a grouping node's
 * code is the longest common prefix of its children (`0101.2`, not `0101.20`).
 * A leaf whose own text is "Los demás" is therefore meaningless alone —
 * `0101210090` and `0101290090` share it — so the text we embed and display is
 * the whole chain:
 *
 *   "CABALLOS, ASNOS, MULOS Y BURDÉGANOS, VIVOS › Caballos ›
 *    Reproductores de raza pura › Para carreras"
 *
 * No vocabulary list, no curation: the law is the vocabulary.
 */

/** Hard cap on a composed document; real chains run ~300–600 chars. */
export const MAX_DOC = 1000;

/** Separator between tree levels — the same glyph the ballot shows. */
export const ANCESTRY_SEPARATOR = ' › ';

/**
 * Normalise one decree fragment into a phrase. Descriptions are stored as the
 * row's own text (e.g. "Caballos:", "Los demás", headings upper-case); strip
 * the dash markers and terminal punctuation so the composed document reads as
 * prose rather than a table extract.
 */
export function clean(text: string): string {
  return String(text ?? '')
    .replace(/^[\s\-–—]+/, '')
    .replace(/\s+/g, ' ')
    .replace(/[\s:.;,]+$/, '')
    .trim();
}

/**
 * The ancestry-composed document. Consecutive duplicates are collapsed: an
 * internal node often repeats its parent's wording verbatim (the leaf "Los
 * demás" under the grouping node "Los demás"), and repeating it adds noise to
 * the embedding without adding meaning.
 */
export function composeDocument(ancestry: string[], self: string): string {
  const parts: string[] = [];
  for (const raw of [...ancestry, self]) {
    const text = clean(raw);
    if (text && text !== parts[parts.length - 1]) parts.push(text);
  }
  return parts.join(ANCESTRY_SEPARATOR).slice(0, MAX_DOC);
}

/**
 * Every stored prefix of `code`, shortest first — i.e. its tree ancestry
 * (heading → grouping nodes). `byCode` maps a node's digits to its own text.
 *
 * Prefixes are matched by text, not by fixed level widths, because the decree
 * emits grouping nodes at arbitrary lengths (4, 5, 7, 8, 9 digits).
 */
export function ancestryOf(code: string, byCode: Map<string, string>): string[] {
  const out: string[] = [];
  for (let len = 1; len < code.length; len++) {
    const text = byCode.get(code.slice(0, len));
    if (text !== undefined) out.push(text);
  }
  return out;
}
