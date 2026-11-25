// @tariffos/ai-client — the canonical LLM port for the TariffOS workspace.
//
// One port, one factory, one production adapter:
//
//   • LlmProviderPort — the interface every model call crosses
//     (generateText / generateJson / embedText).
//   • getLlmProvider() — the only factory; resolves the provider per call.
//   • OpenAICompatibleAdapter — the production adapter (OpenRouter, Ollama,
//     vLLM, any OpenAI-compatible `/v1` server).
//   • createFakeProvider() — the in-memory double, for tests.
//
// Everything else is provider-agnostic and reusable: the prompt registry,
// the token budget tracker, the timeout helper.
//
// The provider is a deployment decision (`LLM_PROVIDER`), never a code
// change. Importing this module touches no network.

// Core port
export {
  DEFAULT_TIMEOUT_MS,
  EmbeddingDimensionMismatchError,
  SchemaViolationError,
  validateJson,
} from './port.js';
export type {
  Attachment,
  EmbedCallOptions,
  GenerateCallOptions,
  LlmProviderPort,
  TextStream,
} from './port.js';



// Adapters
export {
  OpenAICompatibleAdapter,
  PROVIDER_NAME,
  createFakeProvider,
  defaultVector,
  repairJson,
  type FakeProvider,
  type FakeResponses,
  type ProviderLike,
  type RecordedCall,
} from './adapters/index.js';

// Factory
export {
  getFakeProvider,
  getLlmProvider,
  resetProviderKind,
  setProviderKind,
  type ProviderKind,
} from './factory.js';

// Configuration
export {
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_MODEL,
  DEFAULT_LLM_PROVIDER,
  OPENROUTER_BASE_URL,
  resolveApiKey,
  resolveBaseUrl,
  resolveEmbeddingDims,
  resolveEmbeddingModel,
  resolveMaxRpm,
  resolveModel,
  resolveProvider,
  type LlmProvider,
} from './config.js';

// Throttling
export { paceGenerateCall, resetPacing } from './throttle.js';

// Provider-agnostic utilities
export {
  PROMPTS,
  getPrompt,
  listPrompts,
  renderPrompt,
  type PromptDef,
} from './prompts/registry.js';
export {
  TokenBudgetTracker,
  defaultBudget,
  defaultTracker,
  type BudgetSnapshot,
  type TokenBudget,
  type TokenUsage,
} from './token-budget.js';
export { TimeoutError, withTimeout } from './util/with-timeout.js';
