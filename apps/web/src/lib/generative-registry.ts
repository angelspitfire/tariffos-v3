"use generative";

import {
  ManifestLineItemSchema,
  ManifestGridPayloadSchema,
  TaxSummarySchema,
  DiscrepancyReportSchema,
  DisambiguationPayloadSchema,
  DataListPayloadSchema,
  OrganismPayload,
} from '@/types/domain';
import {
  DataVisualizerPayloadSchema,
  DocumentPreviewerPayloadSchema,
  ProcessTimelinePayloadSchema,
} from '@/types/generative-payloads';
import { PermitsMatrixPayloadSchema } from '@/types/permits';
import { ExonerationSimulatorPayloadSchema } from '@/types/exoneration';
import { CustomsDossierPayloadSchema } from '@/types/dossier';
export { generativeUILibrary, library } from './generative-ui-library';

export const GENERATIVE_TOOLS = {
  MANIFEST_GRID: 'manifest-grid',
  TAX_BREAKDOWN: 'tax-summary',
  DISCREPANCY_REPORT: 'discrepancy-report',
  DISAMBIGUATION: 'disambiguation',
  PERMITS_MATRIX: 'permits-matrix',
  EXONERATION_SIMULATOR: 'exoneration-simulator',
  CUSTOMS_DOSSIER: 'customs-dossier',
  DATA_LIST: 'data-list',
  SINGLE_ITEM: 'single-item',
  DATA_VISUALIZER: 'data-visualizer',
  PROCESS_TIMELINE: 'process-timeline',
  DOCUMENT_PREVIEWER: 'document-previewer',
} as const;

export type GenerativeToolName = (typeof GENERATIVE_TOOLS)[keyof typeof GENERATIVE_TOOLS];

export const GenerativeToolSchemas = {
  [GENERATIVE_TOOLS.MANIFEST_GRID]: {
    description: 'Renders the dense manifest table',
    parameters: ManifestGridPayloadSchema,
  },
  [GENERATIVE_TOOLS.TAX_BREAKDOWN]: {
    description: 'Renders the cascade tax breakdown',
    parameters: TaxSummarySchema,
  },
  [GENERATIVE_TOOLS.DISCREPANCY_REPORT]: {
    description: 'Renders the discrepancy audit',
    parameters: DiscrepancyReportSchema,
  },
  [GENERATIVE_TOOLS.DISAMBIGUATION]: {
    description: 'Renders the tariff disambiguation resolver',
    parameters: DisambiguationPayloadSchema,
  },
  [GENERATIVE_TOOLS.PERMITS_MATRIX]: {
    description: 'Renders the permits compliance matrix',
    parameters: PermitsMatrixPayloadSchema,
  },
  [GENERATIVE_TOOLS.EXONERATION_SIMULATOR]: {
    description: 'Renders the exoneration fiscal savings simulator',
    parameters: ExonerationSimulatorPayloadSchema,
  },
  [GENERATIVE_TOOLS.CUSTOMS_DOSSIER]: {
    description: 'Renders the customs classification dossier inspector',
    parameters: CustomsDossierPayloadSchema,
  },
  [GENERATIVE_TOOLS.DATA_LIST]: {
    description: 'Renders a structured data list',
    parameters: DataListPayloadSchema,
  },
  [GENERATIVE_TOOLS.SINGLE_ITEM]: {
    description: 'Renders the single-item tariff classification ficha',
    parameters: ManifestLineItemSchema,
  },
  [GENERATIVE_TOOLS.DATA_VISUALIZER]: {
    description: 'Renders the chart data visualizer',
    parameters: DataVisualizerPayloadSchema,
  },
  [GENERATIVE_TOOLS.PROCESS_TIMELINE]: {
    description: 'Renders the process stepper timeline',
    parameters: ProcessTimelinePayloadSchema,
  },
  [GENERATIVE_TOOLS.DOCUMENT_PREVIEWER]: {
    description: 'Renders the PDF document previewer',
    parameters: DocumentPreviewerPayloadSchema,
  },
};

/**
 * Type-safe parser for Generative UI tool calls.
 * Returns null if the tool name or arguments fail Zod validation.
 */
export function parseGenerativePayload(
  toolName: string,
  args: unknown,
): OrganismPayload | null {
  try {
    switch (toolName) {
      case GENERATIVE_TOOLS.MANIFEST_GRID:
        return { kind: 'manifest-grid', data: ManifestGridPayloadSchema.parse(args) };
      case GENERATIVE_TOOLS.TAX_BREAKDOWN:
        return { kind: 'tax-summary', data: TaxSummarySchema.parse(args) };
      case GENERATIVE_TOOLS.DISCREPANCY_REPORT:
        return { kind: 'discrepancy-report', data: DiscrepancyReportSchema.parse(args) };
      case GENERATIVE_TOOLS.DISAMBIGUATION:
        return { kind: 'disambiguation', data: DisambiguationPayloadSchema.parse(args) };
      case GENERATIVE_TOOLS.PERMITS_MATRIX:
        return { kind: 'permits-matrix', data: PermitsMatrixPayloadSchema.parse(args) };
      case GENERATIVE_TOOLS.EXONERATION_SIMULATOR:
        return { kind: 'exoneration-simulator', data: ExonerationSimulatorPayloadSchema.parse(args) };
      case GENERATIVE_TOOLS.CUSTOMS_DOSSIER:
        return { kind: 'customs-dossier', data: CustomsDossierPayloadSchema.parse(args) };
      case GENERATIVE_TOOLS.DATA_LIST:
        return { kind: 'data-list', data: DataListPayloadSchema.parse(args) };
      case GENERATIVE_TOOLS.SINGLE_ITEM:
        return { kind: 'single-item', data: ManifestLineItemSchema.parse(args) };
      case GENERATIVE_TOOLS.DATA_VISUALIZER:
        return { kind: 'data-visualizer', data: DataVisualizerPayloadSchema.parse(args) };
      case GENERATIVE_TOOLS.PROCESS_TIMELINE:
        return { kind: 'process-timeline', data: ProcessTimelinePayloadSchema.parse(args) };
      case GENERATIVE_TOOLS.DOCUMENT_PREVIEWER:
        return { kind: 'document-previewer', data: DocumentPreviewerPayloadSchema.parse(args) };
      default:
        return null;
    }
  } catch {
    return null;
  }
}


