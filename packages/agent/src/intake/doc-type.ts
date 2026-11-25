/**
 * Detección del tipo de documento (F2-05).
 *
 * Reconoce factura, packing list, conocimien­to de embarque, ficha técnica y
 * catálogo por palabras clave. Todo lo que no coincide entra como texto con
 * tipo 'unknown' y confianza `low`.
 */

export type DocType =
  | 'invoice'
  | 'packing'
  | 'bol'
  | 'datasheet'
  | 'catalog'
  | 'unknown';

export type DocConfidence = 'high' | 'low';

export interface DocTypeDetection {
  type: DocType;
  confidence: DocConfidence;
  matched: string[];
}

const KEYWORDS: Record<Exclude<DocType, 'unknown'>, string[]> = {
  invoice: ['factura', 'invoice', 'facturación'],
  packing: ['packing list', 'lista de empaque', 'packing-list'],
  bol: ['bill of lading', 'conocimiento de embarque', 'b/l', 'bol'],
  datasheet: ['ficha técnica', 'datasheet', 'data sheet', 'hoja de datos'],
  catalog: ['catálogo', 'catalog', 'catalogo'],
};

export function detectDocType(text: string): DocTypeDetection {
  const lowered = text.toLowerCase();
  const scores: Array<{ type: Exclude<DocType, 'unknown'>; matches: string[] }> =
    [];

  for (const [type, keywords] of Object.entries(KEYWORDS)) {
    const matches = keywords.filter((kw) => lowered.includes(kw.toLowerCase()));
    if (matches.length > 0) {
      scores.push({ type: type as Exclude<DocType, 'unknown'>, matches });
    }
  }

  if (scores.length === 0) {
    return { type: 'unknown', confidence: 'low', matched: [] };
  }

  scores.sort((a, b) => b.matches.length - a.matches.length);
  const best = scores[0];
  return {
    type: best.type,
    confidence: 'high',
    matched: best.matches,
  };
}

export { KEYWORDS };
