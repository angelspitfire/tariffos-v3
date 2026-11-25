import { z } from 'zod';

/**
 * Payload schemas for the generative UI organisms that do not have a
 * dedicated domain module (data-visualizer, process-timeline,
 * document-previewer). Kept here so `lib/` modules stay free of
 * `components/` imports while sharing one source of truth with `types/`.
 */

export const DataVisualizerPayloadSchema = z.object({
  data: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
  xKey: z.string(),
  series: z.array(z.unknown()),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  height: z.number().optional(),
  showLegend: z.boolean().optional(),
  showTooltip: z.boolean().optional(),
  showGrid: z.boolean().optional(),
});

export type DataVisualizerPayload = z.infer<typeof DataVisualizerPayloadSchema>;

export const ProcessTimelinePayloadSchema = z.object({
  steps: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      status: z.enum(['pending', 'active', 'completed', 'failed', 'skipped']),
      timestamp: z.string().optional(),
      metadata: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
    }),
  ),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export type ProcessTimelinePayload = z.infer<typeof ProcessTimelinePayloadSchema>;

export const DocumentPreviewerPayloadSchema = z.object({
  src: z.string(),
  fileName: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export type DocumentPreviewerPayload = z.infer<typeof DocumentPreviewerPayloadSchema>;
