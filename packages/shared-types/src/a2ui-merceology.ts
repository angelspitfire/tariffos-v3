import { z } from 'zod';

export const GroundingSourceSchema = z.object({
  title: z.string(),
  uri: z.string(),
});

export const MerceologicalAttributeKeySchema = z.enum([
  'naturaleza_materia',
  'composicion',
  'funcion_uso',
  'principio_funcionamiento',
  'estado_elaboracion',
  'presentacion',
  'especificaciones_tecnicas',
]);

export const AttributeProvenanceSchema = z.enum([
  'user_input',
  'web_search',
  'inferred',
  'missing',
]);

export const MerceologicalAttributeSchema = z.object({
  key: MerceologicalAttributeKeySchema,
  label: z.string(),
  category: z.enum(['morphological', 'functional', 'technical', 'presentation']),
  value: z.string(),
  provenance: AttributeProvenanceSchema,
  weight: z.number(),
  critical: z.boolean(),
  placeholder: z.string().optional(),
  sourceNote: z.string().optional(),
  sourceUri: z.string().optional(),
});

export const MerceologicalConfidencePenaltySchema = z.object({
  key: z.string(),
  label: z.string(),
  points: z.number(),
  reason: z.string(),
});

export const MerceologicalConfidenceBreakdownSchema = z.object({
  baseScore: z.number(),
  penaltyPoints: z.number(),
  finalScore: z.number(),
  level: z.enum(['Alto', 'Medio', 'Bajo']),
  penalties: z.array(MerceologicalConfidencePenaltySchema),
});

export const A2UIMerceologicalSheetSchema = z.object({
  id: z.string(),
  productName: z.string(),
  brandModel: z.string().optional(),
  summary: z.string(),
  attributes: z.array(MerceologicalAttributeSchema),
  missingCriticalKeys: z.array(MerceologicalAttributeKeySchema),
  missingCriticalLabels: z.array(z.string()),
  webSearchTriggered: z.boolean(),
  webSearchReason: z.string(),
  webSources: z.array(GroundingSourceSchema).optional(),
  confidenceBreakdown: MerceologicalConfidenceBreakdownSchema,
  confirmedByUser: z.boolean().optional(),
  updatedAt: z.string().optional(),
});

export type GroundingSource = z.infer<typeof GroundingSourceSchema>;
export type MerceologicalAttributeKey = z.infer<typeof MerceologicalAttributeKeySchema>;
export type AttributeProvenance = z.infer<typeof AttributeProvenanceSchema>;
export type MerceologicalAttribute = z.infer<typeof MerceologicalAttributeSchema>;
export type MerceologicalConfidenceBreakdown = z.infer<
  typeof MerceologicalConfidenceBreakdownSchema
>;
export type A2UIMerceologicalSheet = z.infer<typeof A2UIMerceologicalSheetSchema>;
