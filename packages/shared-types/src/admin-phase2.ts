import { z } from 'zod';

export const AdminLlmProviderSchema = z.enum([
  'nvidia',
  'google',
  'openrouter',
  'openai-compatible',
]);
export type AdminLlmProvider = z.infer<typeof AdminLlmProviderSchema>;

export const LlmRuntimeConfigSchema = z.object({
  provider: AdminLlmProviderSchema,
  model: z.string().trim().min(2).max(160),
  deepModel: z.string().trim().min(2).max(160).optional(),
  baseUrl: z.string().trim().url().optional(),
  maxRpm: z.number().int().min(0).max(10_000).optional(),
});
export type LlmRuntimeConfig = z.infer<typeof LlmRuntimeConfigSchema>;

export const UpdateLlmSettingsBodySchema = z.union([
  z.object({
    reset: z.literal(true),
    reason: z.string().trim().max(300).optional(),
  }),
  LlmRuntimeConfigSchema.extend({
    reset: z.literal(false).optional(),
    reason: z.string().trim().max(300).optional(),
  }),
]);
export type UpdateLlmSettingsBody = z.infer<typeof UpdateLlmSettingsBodySchema>;

export const TestLlmSettingsBodySchema = z.object({
  provider: AdminLlmProviderSchema,
  model: z.string().trim().min(2).max(160),
  baseUrl: z.string().trim().url().optional(),
});
export type TestLlmSettingsBody = z.infer<typeof TestLlmSettingsBodySchema>;

export interface AdminLlmPreset {
  id: string;
  label: string;
  tier: 'standard' | 'deep';
  note: string;
}

export interface AdminLlmProviderStatus {
  provider: AdminLlmProvider;
  configured: boolean;
  envVar: string;
  defaultBaseUrl: string | null;
}

export interface AdminLlmSettingsPayload {
  active: LlmRuntimeConfig & { canRunLive: boolean };
  source: 'database' | 'env';
  updatedAt: string | null;
  providers: AdminLlmProviderStatus[];
  presets: Record<AdminLlmProvider, AdminLlmPreset[]>;
  envDefaults: LlmRuntimeConfig;
  embeddingLock: {
    model: string;
    dims: number;
  };
}

export interface AdminAiQualityModelStat {
  model: string;
  provider: string;
  count: number;
  avgConfidencePct: number;
  verifiedRatePct: number;
}

export interface AdminAiQualityArtifactSummary {
  id: string;
  classificationId: string;
  tenantId: string;
  tenantName: string;
  query: string;
  hsCode: string;
  officialDescription: string;
  modelUsed: string;
  provider: string;
  tierUsed: string;
  confidencePct: number;
  confidenceLevel: string;
  verifiedAgainstDb: boolean;
  flagCount: number;
  createdAt: string;
}

export interface AdminAiQualityArtifactDetail extends AdminAiQualityArtifactSummary {
  filingId: string | null;
  lineId: string | null;
  retrievalTrace: Record<string, unknown>;
  promptSnapshot: Record<string, unknown>;
  modelMetadata: Record<string, unknown>;
  rerankingScores: Record<string, unknown>;
  sustento: Record<string, unknown> | null;
  finalDecision: Record<string, unknown>;
}
