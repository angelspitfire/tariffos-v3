/**
 * Tool definitions and dispatch for AI SDK.
 * Extracted from chat-tools.ts if/else chain into proper Zod schemas + mock handlers.
 */

import type { z } from 'zod';
import {
  ClassifyBatchManifestParams,
  ClassifySingleItemParams,
  CalculateTaxesParams,
  AuditDiscrepanciesParams,
  ResolveDisambiguationParams,
  VerifyPermitsComplianceParams,
  SimulateExonerationsParams,
  GenerateCustomsDossierParams,
  ExtractDocumentParams,
  PresentDisplaySchema,
  PresentToolSchema,
} from './tool-schemas';

export {
  ClassifyBatchManifestParams,
  ClassifySingleItemParams,
  CalculateTaxesParams,
  AuditDiscrepanciesParams,
  ResolveDisambiguationParams,
  VerifyPermitsComplianceParams,
  SimulateExonerationsParams,
  GenerateCustomsDossierParams,
  ExtractDocumentParams,
  PresentDisplaySchema,
  PresentToolSchema,
};

// Tool definitions for AI SDK v4 (using inputSchema)
export const tools = {
  classify_batch_manifest: {
    description: 'Classify a complete cargo manifest from a filing',
    inputSchema: ClassifyBatchManifestParams,
  },
  classify_single_item: {
    description: 'Classify a single product/item by description',
    inputSchema: ClassifySingleItemParams,
  },
  calculate_taxes: {
    description: 'Calculate tax breakdown for a filing',
    inputSchema: ClassifySingleItemParams,
  },
  audit_discrepancies: {
    description: 'Audit discrepancies between invoice and bill of lading',
    inputSchema: AuditDiscrepanciesParams,
  },
  resolve_disambiguation: {
    description: 'Resolve tariff classification conflicts/disambiguation',
    inputSchema: ResolveDisambiguationParams,
  },
  verify_permits_compliance: {
    description: 'Verify non-tariff permits and compliance requirements',
    inputSchema: VerifyPermitsComplianceParams,
  },
  simulate_exonerations: {
    description: 'Simulate duty relief under trade agreements (FTA)',
    inputSchema: SimulateExonerationsParams,
  },
  generate_customs_dossier: {
    description: 'Generate official customs classification dossier',
    inputSchema: GenerateCustomsDossierParams,
  },
  extract_document: {
    description: 'Extract structured data from uploaded commercial documents',
    inputSchema: ExtractDocumentParams,
  },
} as const;

// Type inference helpers
export type ClassifyBatchManifestParams = z.infer<typeof ClassifyBatchManifestParams>;
export type ClassifySingleItemParams = z.infer<typeof ClassifySingleItemParams>;
export type CalculateTaxesParams = z.infer<typeof CalculateTaxesParams>;
export type AuditDiscrepanciesParams = z.infer<typeof AuditDiscrepanciesParams>;
export type ResolveDisambiguationParams = z.infer<typeof ResolveDisambiguationParams>;
export type VerifyPermitsComplianceParams = z.infer<typeof VerifyPermitsComplianceParams>;
export type SimulateExonerationsParams = z.infer<typeof SimulateExonerationsParams>;
export type GenerateCustomsDossierParams = z.infer<typeof GenerateCustomsDossierParams>;
export type ExtractDocumentParams = z.infer<typeof ExtractDocumentParams>;

export { dispatchTool, type IncomingMessage, type IncomingPart } from './dispatch-tool';
