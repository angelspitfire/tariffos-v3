import { z } from 'zod';
import { DEFAULT_CURRENCY } from '../lib/constants';

export const TaxConceptSchema = z.object({
  concept: z.string(),
  rate: z.number(),
  amount: z.number(),
});

export const TaxSummarySchema = z.object({
  id: z.string(),
  vendor: z.string(),
  invoiceId: z.string().optional(),
  currency: z.string().default(DEFAULT_CURRENCY),
  totalAmount: z.number(),
  dueDate: z.string(),
  breakdown: z.array(TaxConceptSchema).default([]),
  status: z.enum(['pending', 'paid', 'overdue', 'disputed']).default('pending'),
});

export type TaxSummary = z.infer<typeof TaxSummarySchema>;

export const CandidateHSSchema = z.object({
  hsCode: z.string(),
  description: z.string(),
  dutyRate: z.number(),
  confidence: z.number(),
  rationale: z.string(),
});

export type CandidateHS = z.infer<typeof CandidateHSSchema>;

export const ManifestLineItemSchema = z.object({
  id: z.string(),
  itemNumber: z.number(),
  hsCode: z.string(),
  description: z.string(),
  quantity: z.number(),
  unit: z.string(),
  fobValue: z.number(),
  cifValue: z.number(),
  dutyRate: z.number(),
  vatRate: z.number(),
  confidence: z.number(),
  permits: z.array(z.string()).default([]),
  candidates: z.array(CandidateHSSchema).optional(),
  justification: z.string().optional(),
});

export type ManifestLineItem = z.infer<typeof ManifestLineItemSchema>;

export const ManifestGridPayloadSchema = z.object({
  filingId: z.string(),
  mode: z.enum(['single', 'batch']).default('batch'),
  items: z.array(ManifestLineItemSchema),
  totalCif: z.number(),
  totalDuties: z.number(),
});

export type ManifestGridPayload = z.infer<typeof ManifestGridPayloadSchema>;

export const DiscrepancyItemSchema = z.object({
  id: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  field: z.string(),
  expected: z.union([z.string(), z.number()]),
  found: z.union([z.string(), z.number()]),
  recommendation: z.string(),
});

export const DiscrepancyReportSchema = z.object({
  filingId: z.string(),
  title: z.string(),
  discrepancies: z.array(DiscrepancyItemSchema),
});

export type DiscrepancyReport = z.infer<typeof DiscrepancyReportSchema>;

export const DataListItemSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  subtext: z.string().optional(),
});

export const DataListPayloadSchema = z.object({
  title: z.string(),
  items: z.array(DataListItemSchema),
});

export type DataListPayload = z.infer<typeof DataListPayloadSchema>;

export const DisambiguationCandidateSchema = z.object({
  hsCode: z.string(),
  description: z.string(),
  dutyRate: z.number(),
  vatRate: z.number(),
  fodinfaRate: z.number(),
  totalDutyUsd: z.number(),
  confidence: z.number(),
  legalBasis: z.string(),
  rationale: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

export type DisambiguationCandidate = z.infer<typeof DisambiguationCandidateSchema>;

export const DisambiguationPayloadSchema = z.object({
  filingId: z.string(),
  lineItemId: z.string(),
  itemNumber: z.number(),
  productDescription: z.string(),
  cifValue: z.number(),
  deltaUsd: z.number(),
  recommendedHsCode: z.string(),
  candidates: z.array(DisambiguationCandidateSchema),
});

export type DisambiguationPayload = z.infer<typeof DisambiguationPayloadSchema>;

import { type PermitsMatrixPayload } from './permits';
import { type ExonerationSimulatorPayload } from './exoneration';
import { type CustomsDossierPayload } from './dossier';
import { type DataVisualizerPayload, type DocumentPreviewerPayload, type ProcessTimelinePayload } from './generative-payloads';

// ─── A2UI Artifact Definition ────────────────────────────────────────────────
export type A2UIArtifactType =
  | 'single-item'
  | 'batch-manifest'
  | 'tax-breakdown'
  | 'discrepancy-audit'
  | 'disambiguation'
  | 'permits-matrix'
  | 'exoneration-simulator'
  | 'customs-dossier';

export interface A2UIArtifact {
  id: string;
  type: A2UIArtifactType;
  title: string;
  subtitle: string;
  badge: string;
  version: number;
  timestamp: string;
  data:
    | ManifestLineItem
    | ManifestGridPayload
    | TaxSummary
    | DiscrepancyReport
    | DisambiguationPayload
    | PermitsMatrixPayload
    | ExonerationSimulatorPayload
    | CustomsDossierPayload;
}

export type OrganismPayload =
  | { kind: 'single-item'; data: ManifestLineItem }
  | { kind: 'tax-summary'; data: TaxSummary }
  | { kind: 'manifest-grid'; data: ManifestGridPayload }
  | { kind: 'discrepancy-report'; data: DiscrepancyReport }
  | { kind: 'disambiguation'; data: DisambiguationPayload }
  | { kind: 'permits-matrix'; data: PermitsMatrixPayload }
  | { kind: 'exoneration-simulator'; data: ExonerationSimulatorPayload }
  | { kind: 'customs-dossier'; data: CustomsDossierPayload }
  | { kind: 'data-list'; data: DataListPayload }
  | { kind: 'data-visualizer'; data: DataVisualizerPayload }
  | { kind: 'document-previewer'; data: DocumentPreviewerPayload }
  | { kind: 'process-timeline'; data: ProcessTimelinePayload };

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  organism?: OrganismPayload;
  display?: unknown;
  artifactId?: string;
}
