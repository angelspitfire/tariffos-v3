// @tariffos/ai-client — the canonical LLM port for the TariffOS workspace.
//
// One port, one factory, one production adapter:
//
//   • LlmProviderPort — the interface every model call crosses
//     (generateText / generateJson / embedText / embedMany).
//   • getLlmProvider() — the only factory; resolves the provider per call.
//   • OpenAICompatibleAdapter — the production adapter (OpenRouter, Nvidia,
//     Google, vLLM, any OpenAI-compatible `/v1` server).
//   • createFakeProvider() — the in-memory double, for tests.
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
  type LlmRuntimeOverride,
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
  GOOGLE_BASE_URL,
  NVIDIA_BASE_URL,
  OPENROUTER_BASE_URL,
  canRunLiveLlm,
  canRunLiveLlmForProvider,
  listConfiguredLlmProviders,
  resolveApiKey,
  resolveApiKeyForProvider,
  resolveBaseUrl,
  resolveBaseUrlForProvider,
  resolveEmbeddingDims,
  resolveEmbeddingModel,
  resolveMaxRpm,
  resolveModel,
  resolveProvider,
  type LlmProvider,
  type LlmProviderAvailability,
} from './config.js';
