import { z } from 'zod';

export const ClassifyBatchManifestParams = z.object({
  filingId: z.string().describe('Filing identifier'),
});

export const ClassifySingleItemParams = z.object({
  description: z.string().describe('Product description to classify'),
  hsCode: z.string().optional().describe('Optional HS code hint'),
});

export const CalculateTaxesParams = z.object({
  filingId: z.string().describe('Filing identifier'),
});

export const AuditDiscrepanciesParams = z.object({
  filingId: z.string().describe('Filing identifier'),
});

export const ResolveDisambiguationParams = z.object({
  lineItemId: z.string().describe('Line item identifier to resolve'),
  filingId: z.string().optional().describe('Filing identifier'),
});

export const VerifyPermitsComplianceParams = z.object({
  filingId: z.string().describe('Filing identifier'),
});

export const SimulateExonerationsParams = z.object({
  filingId: z.string().describe('Filing identifier'),
  agreement: z.enum(['eu-fta', 'can', 'mercosur', 'all']).optional().describe('Trade agreement to simulate'),
});

export const GenerateCustomsDossierParams = z.object({
  filingId: z.string().describe('Filing identifier'),
});

export const ExtractDocumentParams = z.object({
  fileName: z.string().describe('Uploaded file name'),
  fileType: z.string().describe('MIME type of the file'),
  fileSize: z.number().describe('File size in bytes'),
});

export const PresentDisplaySchema = z.object({
  type: z.enum(['grid', 'stack', 'card', 'component']),
  title: z.string().optional(),
  component: z.string().optional(),
  props: z.record(z.string(), z.unknown()).optional(),
  children: z.array(z.unknown()).optional(),
});

export const PresentToolSchema = z.object({
  display: PresentDisplaySchema,
});
