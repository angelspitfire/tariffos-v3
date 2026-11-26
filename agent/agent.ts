import { defineAgent, defineDynamic } from 'eve';
import { readSystemLlmRuntimeOverride, resolveEveModelFromOverride } from './model-resolver';

const DEFAULT_CONTEXT_WINDOW_TOKENS = 200_000;

export default defineAgent({
  model: defineDynamic(async (ctx) => {
    const override = await ctx.memo(
      ['ai.runtime_config', ctx.turn?.id ?? null],
      readSystemLlmRuntimeOverride,
    );
    return {
      model: resolveEveModelFromOverride(override),
      modelContextWindowTokens: DEFAULT_CONTEXT_WINDOW_TOKENS,
    };
  }),
  reasoning: 'high',
  build: {
    externalDependencies: ['@tariffos/database'],
  },
});
