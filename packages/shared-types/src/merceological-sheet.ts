/**
 * Structured product facts extracted from any input channel
 * (text, image, PDF) before HS classification.
 * Internal name in research: "ficha merceológica fantasma".
 *
 * Source contract: docs/program/classification-diagnostic-schema.md §5.
 */

export interface MerceologicalMorphology {
  /** Primary constitutive material (e.g. "Acero inoxidable", "Harina de almendra 70%") */
  materiaPrimaria: string;
  /** Secondary materials, casing, additives */
  materiaSecundaria?: string;
  /** Legally relevant components (nicotine %, Bluetooth module, whey protein, etc.) */
  componentesCriticos: string[];
}

export interface MerceologicalSheet {
  /** Commercial / colloquial name as understood from user input */
  nombreComercial: string;
  morfologia: MerceologicalMorphology;
  /** Primary purpose or essential character (merceología) */
  funcionPrincipal: string;
  /** How the product is sold: retail ready, kit, bulk, disposable unit, etc. */
  presentacionComercial: string;
  /**
   * Product category hint from Normalizer — used by Router.
   * Values align with NORMALIZER_PROMPT: QUÍMICO | MAQUINARIA | TEXTIL | CONSUMO | OTRO
   */
  categoria?: 'QUÍMICO' | 'MAQUINARIA' | 'TEXTIL' | 'CONSUMO' | 'OTRO';
  /**
   * Plain-language questions still needed before classification.
   * If length > 0, pipeline MUST NOT adjudicate (status NEEDS_INFO).
   */
  clarifReq?: string[];
  /**
   * Documents required before final code (MSDS, certificado libre venta, etc.)
   */
  documentosRequeridos?: string[];
  /** ISO 639-1 — default "es" */
  idioma?: string;
}
