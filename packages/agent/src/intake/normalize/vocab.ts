/**
 * Vocabularios controlados (F2-21, F2-22, F2-23).
 *
 * Cada vocabulario mapea sinónimos a un valor canónico. Un texto que no
 * coincide con ningún sinónimo se normaliza a `unknown` conservando el texto
 * original (el original se preserva para trazabilidad y para la capa de
 * salida, que puede mostrarlo al usuario).
 */

export type Material = 'algodon' | 'poliester' | 'acero' | 'aluminio' | 'plastico' | 'madera' | 'cuero' | 'seda' | 'lana' | 'nylon' | 'caucho' | 'unknown';

export type Unit = 'kg' | 'u' | 'm²' | 'm³' | 'ℓ' | '2u' | '1000 u' | 'unknown';

export type Presentation = 'bulk' | 'retail' | 'dosified' | 'disassembled' | 'assortment' | 'unknown';

export interface Normalized<T> {
  normalized: T;
  original: string;
}

const UNKNOWN_MATERIAL: Material = 'unknown';
const UNKNOWN_UNIT: Unit = 'unknown';
const UNKNOWN_PRESENTATION: Presentation = 'unknown';

/** Material: valor canónico → sinónimos (incluido el canónico). */
const MATERIAL_SYNONYMS: Record<Material, string[]> = {
  algodon: ['algodón', 'algodon', 'cotton'],
  poliester: ['poliéster', 'poliester', 'polyester'],
  acero: ['acero', 'steel', 'inoxidable'],
  aluminio: ['aluminio', 'aluminum'],
  plastico: ['plástico', 'plastico', 'plastic'],
  madera: ['madera', 'wood'],
  cuero: ['cuero', 'leather'],
  seda: ['seda', 'silk'],
  lana: ['lana', 'wool'],
  nylon: ['nylon'],
  caucho: ['caucho', 'rubber'],
  unknown: [],
};

/** Unidad arancelaria: valor canónico → sinónimos. */
const UNIT_SYNONYMS: Record<Unit, string[]> = {
  kg: ['kg', 'kilogramo', 'kilogramos'],
  u: ['u', 'unidad', 'unidades', 'und', 'un.'],
  'm²': ['m²', 'm2', 'metro cuadrado'],
  'm³': ['m³', 'm3', 'metro cubico'],
  'ℓ': ['ℓ', 'l', 'litro', 'litros'],
  '2u': ['2u', '2 u'],
  '1000 u': ['1000 u', '1000u'],
  unknown: [],
};

/** Presentación: valor canónico → sinónimos. */
const PRESENTATION_SYNONYMS: Record<Presentation, string[]> = {
  bulk: ['granel', 'bulk'],
  retail: ['menudeo', 'retail'],
  dosified: ['dosificado', 'dosified'],
  disassembled: ['desmontado', 'disassembled'],
  assortment: ['surtido', 'assortment'],
  unknown: [],
};

function buildLookup<T extends string>(synonyms: Record<T, string[]>): Map<string, T> {
  const lookup = new Map<string, T>();
  for (const [canonical, values] of Object.entries(synonyms)) {
    for (const v of values as unknown as string[]) {
      lookup.set(v.toLowerCase().trim(), canonical as T);
    }
  }
  return lookup;
}

const MATERIAL_LOOKUP = buildLookup(MATERIAL_SYNONYMS);
const UNIT_LOOKUP = buildLookup(UNIT_SYNONYMS);
const PRESENTATION_LOOKUP = buildLookup(PRESENTATION_SYNONYMS);

function normalizeTerm<T extends string>(text: string, lookup: Map<string, T>, unknown: T): Normalized<T> {
  const key = text.toLowerCase().trim();
  const normalized = lookup.get(key) ?? unknown;
  return { normalized, original: text };
}

/**
 * Normaliza un material contra el vocabulario controlado.
 * Desconocido → normalized 'unknown' con el texto original preservado.
 */
export function normalizeMaterial(text: string): Normalized<Material> {
  return normalizeTerm(text, MATERIAL_LOOKUP, UNKNOWN_MATERIAL);
}

/**
 * Normaliza una unidad arancelaria contra el vocabulario controlado.
 * Desconocido → normalized 'unknown' con el texto original preservado.
 */
export function normalizeUnit(text: string): Normalized<Unit> {
  return normalizeTerm(text, UNIT_LOOKUP, UNKNOWN_UNIT);
}

/**
 * Normaliza una presentación contra el vocabulario controlado.
 * Desconocido → normalized 'unknown' con el texto original preservado.
 */
export function normalizePresentation(text: string): Normalized<Presentation> {
  return normalizeTerm(text, PRESENTATION_LOOKUP, UNKNOWN_PRESENTATION);
}

export { MATERIAL_SYNONYMS, UNIT_SYNONYMS, PRESENTATION_SYNONYMS };
