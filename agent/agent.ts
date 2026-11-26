import { defineAgent } from 'eve';
import { resolveEveModel } from './model-resolver';

const DEFAULT_CONTEXT_WINDOW_TOKENS = 200_000;

export default defineAgent({
  model: resolveEveModel(),
  modelContextWindowTokens: DEFAULT_CONTEXT_WINDOW_TOKENS,
  reasoning: 'high',
  build: {
    externalDependencies: ['@tariffos/database'],
  },
});
