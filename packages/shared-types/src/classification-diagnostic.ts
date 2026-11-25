import type { MerceologicalSheet } from './merceological-sheet.js';
import type { ClassificationSessionStatus } from './classification-session.js';

/** ISO 3166-1 alpha-2 */
export type CountryCode = string;

export interface DiagnosticMeta {
  /** ISO 8601 */
  timestamp: string;
  paisDestino: CountryCode;
  idioma: string;
  sessionId: string;
  tenantId: string;
  /** Schema version for PDF/API consumers */
  schemaVersion: '1';
}

export interface AnalisisMerceologicoUniversal {
  nombreComercial: string;
  morfologia: MerceologicalSheet['morfologia'];
  funcionPrincipal: string;
  presentacionComercial: string;
  /** First 6 digits of Harmonized System (OMA layer) */
  codigoOma6Digitos: string;
  /** RGI numbers applied (e.g. [1, 3, 6]) */
  reglasGeneralesInterpretacion: number[];
  /**
   * Technical/legal paragraph for customs broker.
   * May cite RGI, chapter notes — NOT shown as first screen to novice user.
   */
  sustentoTecnico: string;
  /** Full merceological sheet as produced by Normalizer (audit trail) */
  fichaMerceologica?: MerceologicalSheet;
}

export interface RegimenLegalPermiso {
  entidadReguladora: string;
  tipoPermiso: string;
  obligatorioParaDespacho: boolean;
  explicacionAmigable: string;
}

export interface CargaImpositiva {
  arancelGeneralAdv: number;
  iva: number;
  tasasAduanerasEstimadas?: number;
  /** Free-text for special taxes (e.g. internal tobacco tax) */
  impuestosEspecificos?: string;
  /** Computed total rate estimate — from DB formula, not LLM */
  estimatedTotalTax?: number;
}

/**
 * National layer — populated by NationalTariffService lookup in Phase 5.
 * Until Phase 5, may be partial with `source: 'pending'`.
 */
export interface LocalizacionPais {
  codigoArancelarioNacional: string;
  descripcionArancelLocal: string;
  regimenLegalYPermisos: RegimenLegalPermiso[];
  cargaImpositiva: CargaImpositiva;
  /** Provenance for compliance audits */
  dataSource?: 'database' | 'llm_estimate' | 'pending';
}

export interface InterfazUsuario {
  /** Plain Spanish — no "Nota Legal", no "RGI" in first paragraph */
  explicacionColoquial: string;
  alertasCriticas: string[];
}

/**
 * Complete classification output — v1.
 * See docs/program/classification-diagnostic-schema.md
 */
export interface ClassificationDiagnosticV1 {
  meta: DiagnosticMeta;
  analisisMerceologicoUniversal: AnalisisMerceologicoUniversal;
  localizacionPais: LocalizacionPais;
  interfazUsuario: InterfazUsuario;
  /** Pipeline status at time of emission */
  status: ClassificationSessionStatus;
  /** 0–1 from adjudicator */
  confidence: number;
  /** Documents still missing for a "final" export */
  missingDocuments?: string[];
}

/** Type guard helper */
export function isClassificationDiagnosticV1(
  value: unknown,
): value is ClassificationDiagnosticV1 {
  return (
    typeof value === 'object' &&
    value !== null &&
    'meta' in value &&
    (value as ClassificationDiagnosticV1).meta?.schemaVersion === '1'
  );
}
