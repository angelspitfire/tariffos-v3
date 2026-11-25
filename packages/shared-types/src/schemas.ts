import { z } from 'zod';
import { CLASSIFICATION_SESSION_STATUSES } from './classification-session.js';

export const MerceologicalMorphologySchema = z.object({
  materiaPrimaria: z.string().min(1),
  materiaSecundaria: z.string().optional(),
  componentesCriticos: z.array(z.string()).default([]),
});

export const MerceologicalSheetSchema = z.object({
  nombreComercial: z.string().min(1),
  morfologia: MerceologicalMorphologySchema,
  funcionPrincipal: z.string().min(1),
  presentacionComercial: z.string().min(1),
  categoria: z.enum(['QUÍMICO', 'MAQUINARIA', 'TEXTIL', 'CONSUMO', 'OTRO']).optional(),
  clarifReq: z.array(z.string()).optional(),
  documentosRequeridos: z.array(z.string()).optional(),
  idioma: z.string().length(2).default('es'),
});

export const DiagnosticMetaSchema = z.object({
  timestamp: z.string().datetime(),
  paisDestino: z.string().length(2),
  idioma: z.string().min(2).max(5),
  sessionId: z.string().min(1),
  tenantId: z.string().min(1),
  schemaVersion: z.literal('1'),
});

export const AnalisisMerceologicoUniversalSchema = z.object({
  nombreComercial: z.string().min(1),
  morfologia: MerceologicalMorphologySchema,
  funcionPrincipal: z.string().min(1),
  presentacionComercial: z.string().min(1),
  codigoOma6Digitos: z.string().regex(/^\d{4}\.\d{2}$/),
  reglasGeneralesInterpretacion: z.array(z.number().int().min(1).max(6)),
  sustentoTecnico: z.string().min(1),
  fichaMerceologica: MerceologicalSheetSchema.optional(),
});

export const RegimenLegalPermisoSchema = z.object({
  entidadReguladora: z.string().min(1),
  tipoPermiso: z.string().min(1),
  obligatorioParaDespacho: z.boolean(),
  explicacionAmigable: z.string().min(1),
});

export const CargaImpositivaSchema = z.object({
  arancelGeneralAdv: z.number().min(0).max(100),
  iva: z.number().min(0).max(100),
  tasasAduanerasEstimadas: z.number().min(0).max(100).optional(),
  impuestosEspecificos: z.string().optional(),
  estimatedTotalTax: z.number().min(0).max(100).optional(),
});

export const LocalizacionPaisSchema = z.object({
  codigoArancelarioNacional: z.string().min(4),
  descripcionArancelLocal: z.string().min(1),
  regimenLegalYPermisos: z.array(RegimenLegalPermisoSchema),
  cargaImpositiva: CargaImpositivaSchema,
  dataSource: z.enum(['database', 'llm_estimate', 'pending']).optional(),
});

export const InterfazUsuarioSchema = z.object({
  explicacionColoquial: z.string().min(1),
  alertasCriticas: z.array(z.string()),
});

export const ClassificationDiagnosticV1Schema = z.object({
  meta: DiagnosticMetaSchema,
  analisisMerceologicoUniversal: AnalisisMerceologicoUniversalSchema,
  localizacionPais: LocalizacionPaisSchema,
  interfazUsuario: InterfazUsuarioSchema,
  status: z.enum(CLASSIFICATION_SESSION_STATUSES),
  confidence: z.number().min(0).max(1),
  missingDocuments: z.array(z.string()).optional(),
});

export const DescriptionPartSchema = z.object({
  type: z.enum(['text', 'image']),
  text: z.string().optional(),
  image: z.string().optional(),
  url: z.string().optional(),
  data: z.string().optional(),
  mimeType: z.string().optional(),
});

/**
 * Validate Normalizer output before the pipeline may act on it.
 * Throws ZodError when the sheet does not satisfy the contract.
 */
export function parseMerceologicalSheet(value: unknown): import('./merceological-sheet.js').MerceologicalSheet {
  return MerceologicalSheetSchema.parse(value);
}
