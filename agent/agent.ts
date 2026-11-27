import { defineAgent, defineDynamic } from 'eve';
import { readSystemLlmRuntimeOverride, resolveEveModelFromOverride } from './model-resolver';

const DEFAULT_CONTEXT_WINDOW_TOKENS = 200_000;

export const EVE_REASONING_LEVELS = [
  'provider-default',
  'none',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
] as const;

export type EveReasoningEffort = (typeof EVE_REASONING_LEVELS)[number];

/**
 * Resolves Eve's default reasoning effort. Defaults to `'low'` so simple
 * conversational turns and tool-dispatch steps stay fast while `EVE_REASONING`
 * allows raising effort when needed.
 */
export function resolveEveReasoningEffort(
  raw: string | undefined = process.env.EVE_REASONING,
): EveReasoningEffort {
  const normalized = raw?.trim().toLowerCase();
  if (normalized && (EVE_REASONING_LEVELS as readonly string[]).includes(normalized)) {
    return normalized as EveReasoningEffort;
  }
  return 'low';
}

/**
 * In local non-production dev outside Vercel deployments, honor `.env.local`'s
 * `EVE_MODEL` directly without querying or letting a Cloud DB override take over.
 */
export function shouldUseLocalEnvModel(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const isDeployedVercel =
    env.VERCEL === '1' && (env.VERCEL_ENV === 'production' || env.VERCEL_ENV === 'preview');
  return env.NODE_ENV !== 'production' && !isDeployedVercel && Boolean(env.EVE_MODEL?.trim());
}

export default defineAgent({
  defaultTools: false,
  model: defineDynamic(async (ctx) => {
    const override = shouldUseLocalEnvModel()
      ? null
      : await ctx.memo(
          ['ai.runtime_config', ctx.turn?.id ?? null],
          readSystemLlmRuntimeOverride,
        );
    return {
      model: resolveEveModelFromOverride(override),
      modelContextWindowTokens: DEFAULT_CONTEXT_WINDOW_TOKENS,
    };
  }),
  reasoning: resolveEveReasoningEffort(),
  build: {
    externalDependencies: ['@tariffos/database'],
  },
});
