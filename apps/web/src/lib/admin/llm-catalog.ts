import type { AdminLlmPreset, AdminLlmProvider } from '@tariffos/shared-types';

export const LLM_RUNTIME_SETTING_KEY = 'ai.runtime_config';
export const LLM_SETTINGS_CACHE_TTL_MS = 30_000;
export const LLM_TEST_TIMEOUT_MS = 15_000;

export const PROVIDER_ENV_HINTS: Record<AdminLlmProvider, string> = {
  nvidia: 'NVIDIA_API_KEY',
  google: 'GOOGLE_GENERATIVE_AI_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  'openai-compatible': 'LLM_BASE_URL',
};

export const ADMIN_LLM_PRESETS: Record<AdminLlmProvider, AdminLlmPreset[]> = {
  nvidia: [
    {
      id: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
      label: 'Nemotron 3.5 Super VL (120B / 12B activo)',
      tier: 'standard',
      note: 'Rápido y económico para clasificación estándar',
    },
    {
      id: 'nvidia/nemotron-3-ultra-550b-a55b',
      label: 'Nemotron 3 Ultra (550B / 55B activo)',
      tier: 'deep',
      note: 'Razonamiento profundo para casos complejos RGI',
    },
  ],
  google: [
    {
      id: 'gemini-2.5-flash',
      label: 'Gemini 2.5 Flash',
      tier: 'standard',
      note: 'Baja latencia y JSON estructurado estable',
    },
    {
      id: 'gemini-2.5-pro',
      label: 'Gemini 2.5 Pro',
      tier: 'deep',
      note: 'Alta precisión en notas legales y reglas RGI',
    },
  ],
  openrouter: [
    {
      id: 'google/gemini-2.5-flash',
      label: 'Gemini 2.5 Flash (OpenRouter)',
      tier: 'standard',
      note: 'Enrutado vía OpenRouter con fallback gestionado',
    },
    {
      id: 'anthropic/claude-sonnet-4',
      label: 'Claude Sonnet 4 (OpenRouter)',
      tier: 'deep',
      note: 'Razonamiento jurídico y técnico avanzado',
    },
    {
      id: 'openai/gpt-4o-mini',
      label: 'GPT-4o Mini (OpenRouter)',
      tier: 'standard',
      note: 'Opción ligera de bajo costo',
    },
  ],
  'openai-compatible': [
    {
      id: 'qwen3:8b',
      label: 'Qwen 3 8B (Local / vLLM)',
      tier: 'standard',
      note: 'Endpoint local compatible con /v1',
    },
    {
      id: 'gpt-4o-mini',
      label: 'GPT-4o Mini (Compatible)',
      tier: 'standard',
      note: 'Modelo por defecto compatible OpenAI',
    },
  ],
};
