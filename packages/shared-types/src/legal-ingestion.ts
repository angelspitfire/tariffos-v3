import { z } from 'zod';

export const LegalDocumentTypeSchema = z.enum([
  'SECTION',
  'CHAPTER',
  'SUBHEADING',
  'LEGAL_NOTE',
  'EXEMPTION',
  'TARIFF_SCHEDULE',
]);
export type LegalDocumentType = z.infer<typeof LegalDocumentTypeSchema>;

export const LegalDocumentStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'DEROGATED']);
export type LegalDocumentStatus = z.infer<typeof LegalDocumentStatusSchema>;

export const IngestionSourceFormatSchema = z.enum([
  'pdf',
  'markdown',
  'txt',
  'tariff_json',
  'tariff_csv',
]);
export type IngestionSourceFormat = z.infer<typeof IngestionSourceFormatSchema>;

const CODE_GROUPING_RE = /^\d+(?:\.\d+)*$/;

export function sumCodeGroupingDigits(codeGrouping: string): number {
  if (!CODE_GROUPING_RE.test(codeGrouping.trim())) return 0;
  return codeGrouping
    .trim()
    .split('.')
    .reduce((acc, part) => acc + Number.parseInt(part, 10), 0);
}

export const CountryConfigInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/, 'Código ISO-2 debe tener exactamente 2 letras'),
    name: z.string().trim().min(2).max(100),
    legislation: z.string().trim().min(3).max(240),
    nomenclatureDigits: z.number().int().min(6).max(12),
    codeGrouping: z.string().trim().regex(CODE_GROUPING_RE, 'Formato inválido (ej. 4.2.2.2)'),
    datasetVersion: z.string().trim().max(120).optional(),
    isActive: z.boolean().default(true),
  })
  .refine((val) => sumCodeGroupingDigits(val.codeGrouping) === val.nomenclatureDigits, {
    message: 'La suma de dígitos en codeGrouping debe coincidir con nomenclatureDigits',
    path: ['codeGrouping'],
  });
export type CountryConfigInput = z.infer<typeof CountryConfigInputSchema>;

export const CountryIngestionSummarySchema = z.object({
  code: z.string(),
  name: z.string(),
  legislation: z.string(),
  nomenclatureDigits: z.number().int(),
  codeGrouping: z.string(),
  datasetVersion: z.string().nullable(),
  isActive: z.boolean(),
  publishedDocuments: z.number().int().nonnegative(),
  draftDocuments: z.number().int().nonnegative(),
  derogatedDocuments: z.number().int().nonnegative(),
  activeTariffs: z.number().int().nonnegative(),
  embeddedTariffs: z.number().int().nonnegative(),
});
export type CountryIngestionSummary = z.infer<typeof CountryIngestionSummarySchema>;

export const LegalDocumentUploadInputSchema = z
  .object({
    countryCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/)
      .default('VE'),
    legalType: LegalDocumentTypeSchema,
    hierarchyPath: z.string().trim().min(1).max(120),
    title: z.string().trim().min(2).max(240),
    sourceFormat: IngestionSourceFormatSchema,
    sourceFile: z.string().trim().max(260).optional(),
    officialDocumentNumber: z.string().trim().max(160).optional(),
    decreeNumber: z.string().trim().max(160).optional(),
    validFromDate: z.string().trim().min(8),
    replaceSameDate: z.boolean().default(false),
    content: z.string().optional(),
    storageKey: z.string().trim().min(1).max(400).optional(),
  })
  .refine((val) => Boolean(val.content?.trim() || val.storageKey?.trim()), {
    message: 'Debe proporcionar content o storageKey',
    path: ['content'],
  });
export type LegalDocumentUploadInput = z.infer<typeof LegalDocumentUploadInputSchema>;

export const SignedUploadRequestSchema = z.object({
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/).default('VE'),
  fileName: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(1).max(120),
  fileSizeBytes: z.number().int().positive().max(50 * 1024 * 1024),
});
export type SignedUploadRequest = z.infer<typeof SignedUploadRequestSchema>;

export const SignedUploadResponseSchema = z.object({
  mode: z.enum(['cloud', 'offline']),
  directInline: z.boolean(),
  storageKey: z.string().optional(),
  signedUrl: z.string().optional(),
});
export type SignedUploadResponse = z.infer<typeof SignedUploadResponseSchema>;

export const LegalDraftSummarySchema = z.object({
  id: z.string(),
  countryCode: z.string(),
  legalType: LegalDocumentTypeSchema,
  hierarchyPath: z.string(),
  title: z.string(),
  sourceFile: z.string().nullable(),
  officialDocumentNumber: z.string().nullable(),
  decreeNumber: z.string().nullable(),
  validFromDate: z.string(),
  validToDate: z.string().nullable(),
  isDerogated: z.boolean(),
  status: LegalDocumentStatusSchema,
  chunkCount: z.number().int().nonnegative(),
  embeddedChunkCount: z.number().int().nonnegative(),
  createdAt: z.string(),
});
export type LegalDraftSummary = z.infer<typeof LegalDraftSummarySchema>;

export const LegalChunkDiffItemSchema = z.object({
  status: z.enum(['added', 'modified', 'removed']),
  heading: z.string(),
  ruleNumber: z.string().nullable(),
  preview: z.string(),
  scope: z.array(z.string()),
});
export type LegalChunkDiffItem = z.infer<typeof LegalChunkDiffItemSchema>;

export const TariffRowChangeSchema = z.object({
  hsCode: z.string(),
  changeType: z.enum(['added', 'modified', 'removed']),
  description: z.string(),
  fieldsChanged: z.array(z.string()),
  beforeAdValorem: z.number().optional(),
  afterAdValorem: z.number().optional(),
});
export type TariffRowChange = z.infer<typeof TariffRowChangeSchema>;

export const LegalDraftDiffSchema = z.object({
  draftId: z.string(),
  countryCode: z.string(),
  legalType: LegalDocumentTypeSchema,
  hierarchyPath: z.string(),
  kind: z.enum(['legal', 'tariff']).default('legal'),
  overlappingPublished: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      decreeNumber: z.string().nullable(),
      validFromDate: z.string(),
    }),
  ),
  addedChunks: z.number().int().nonnegative(),
  modifiedChunks: z.number().int().nonnegative(),
  removedChunks: z.number().int().nonnegative(),
  affectedHsCodes: z.array(z.string()),
  sampleChanges: z.array(LegalChunkDiffItemSchema).default([]),
  tariffChanges: z.array(TariffRowChangeSchema).optional(),
});
export type LegalDraftDiff = z.infer<typeof LegalDraftDiffSchema>;

export const PublishDraftResultSchema = z.object({
  publishedId: z.string(),
  countryCode: z.string(),
  legalType: LegalDocumentTypeSchema,
  hierarchyPath: z.string(),
  status: LegalDocumentStatusSchema,
  derogatedCount: z.number().int().nonnegative(),
  derogatedIds: z.array(z.string()),
  indexingEnqueued: z.boolean(),
});
export type PublishDraftResult = z.infer<typeof PublishDraftResultSchema>;
