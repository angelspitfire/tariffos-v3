'use client';

import React from 'react';
import { z } from 'zod';
import type { GenerativeUILibrary } from '@assistant-ui/react-generative-ui';
import { DataListCard } from '@/components/organisms/DataListCard';
import { DataVisualizer } from '@/components/organisms/DataVisualizer';
import { DisambiguationResolver } from '@/components/organisms/DisambiguationResolver';
import { DiscrepancyInspector } from '@/components/organisms/DiscrepancyInspector';
import { DocumentPreviewer } from '@/components/organisms/DocumentPreviewer';
import { ExonerationSimulator } from '@/components/organisms/ExonerationSimulator';
import { FichaInspector } from '@/components/organisms/FichaInspector';
import { ManifestGrid } from '@/components/organisms/ManifestGrid';
import { PermitsComplianceMatrix } from '@/components/organisms/PermitsComplianceMatrix';
import { ProcessTimeline } from '@/components/organisms/ProcessTimeline';
import { TaxBreakdownCard } from '@/components/organisms/TaxBreakdownCard';
import { CustomsDossierInspector } from '@/components/organisms/CustomsDossierInspector';

import {
  ManifestLineItemSchema,
  ManifestGridPayloadSchema,
  TaxSummarySchema,
  DiscrepancyReportSchema,
  DataListPayloadSchema,
  DisambiguationPayloadSchema,
} from '@/types/domain';
import { PermitsMatrixPayloadSchema } from '@/types/permits';
import { ExonerationSimulatorPayloadSchema } from '@/types/exoneration';
import { CustomsDossierPayloadSchema } from '@/types/dossier';
import {
  DataVisualizerPayloadSchema,
  DocumentPreviewerPayloadSchema,
  ProcessTimelinePayloadSchema,
} from '@/types/generative-payloads';

import type { ManifestLineItem } from '@/types/domain';
import type { ManifestGridPayload } from '@/types/domain';
import type { TaxSummary } from '@/types/domain';
import type { DiscrepancyReport } from '@/types/domain';
import type { DisambiguationPayload } from '@/types/domain';
import type { PermitsMatrixPayload } from '@/types/permits';
import type { ExonerationSimulatorPayload } from '@/types/exoneration';
import type { CustomsDossierPayload } from '@/types/dossier';
import type { DataListPayload } from '@/types/domain';
import type { DataVisualizerPayload } from '@/types/generative-payloads';
import type { DocumentPreviewerPayload } from '@/types/generative-payloads';
import type { ProcessTimelinePayload } from '@/types/generative-payloads';

export const generativeUILibrary = {
  'single-item': {
    component: FichaInspector,
    schema: ManifestLineItemSchema,
    render: (props: ManifestLineItem) => React.createElement(FichaInspector, { item: props, isLoading: false }),
  },
  'manifest-grid': {
    component: ManifestGrid,
    schema: ManifestGridPayloadSchema,
    render: (props: ManifestGridPayload) => React.createElement(ManifestGrid, { payload: props, isLoading: false }),
  },
  'tax-summary': {
    component: TaxBreakdownCard,
    schema: TaxSummarySchema,
    render: (props: TaxSummary) => React.createElement(TaxBreakdownCard, { payload: props, isLoading: false }),
  },
  'discrepancy-report': {
    component: DiscrepancyInspector,
    schema: DiscrepancyReportSchema,
    render: (props: DiscrepancyReport) => React.createElement(DiscrepancyInspector, { payload: props, isLoading: false }),
  },
  'disambiguation': {
    component: DisambiguationResolver,
    schema: DisambiguationPayloadSchema,
    render: (props: DisambiguationPayload) => React.createElement(DisambiguationResolver, { payload: props, isLoading: false }),
  },
  'permits-matrix': {
    component: PermitsComplianceMatrix,
    schema: PermitsMatrixPayloadSchema,
    render: (props: PermitsMatrixPayload) => React.createElement(PermitsComplianceMatrix, { payload: props, isLoading: false }),
  },
  'exoneration-simulator': {
    component: ExonerationSimulator,
    schema: ExonerationSimulatorPayloadSchema,
    render: (props: ExonerationSimulatorPayload) => React.createElement(ExonerationSimulator, { payload: props, isLoading: false }),
  },
  'customs-dossier': {
    component: CustomsDossierInspector,
    schema: CustomsDossierPayloadSchema,
    render: (props: CustomsDossierPayload) => React.createElement(CustomsDossierInspector, { payload: props, isLoading: false }),
  },
  'data-list': {
    component: DataListCard,
    schema: DataListPayloadSchema,
    render: (props: DataListPayload) => React.createElement(DataListCard, { payload: props, isLoading: false }),
  },
  'data-visualizer': {
    component: DataVisualizer,
    schema: DataVisualizerPayloadSchema,
    render: (props: DataVisualizerPayload) => React.createElement(DataVisualizer, { payload: props, isLoading: false }),
  },
  'process-timeline': {
    component: ProcessTimeline,
    schema: ProcessTimelinePayloadSchema,
    render: (props: ProcessTimelinePayload) => React.createElement(ProcessTimeline, { payload: props, isLoading: false }),
  },
  'document-previewer': {
    component: DocumentPreviewer,
    schema: DocumentPreviewerPayloadSchema,
    render: (props: DocumentPreviewerPayload) => React.createElement(DocumentPreviewer, { payload: props, isLoading: false }),
  },
} as const;

export type GenerativeUIComponent = keyof typeof generativeUILibrary;

export const library = Object.fromEntries(
  Object.entries(generativeUILibrary).map(([name, entry]) => [name, {
    description: '',
    properties: entry.schema as unknown as z.ZodType<Record<string, unknown>>,
    streamProperties: false,
    render: entry.render,
  }]),
) as GenerativeUILibrary;
