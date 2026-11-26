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
      id: 'nvidia/nemotron-3.5-super-vl',
      label: 'Nemotron 3.5 Super VL (OpenRouter)',
      tier: 'standard',
      note: 'Multimodal 1M ctx, económico ($0.15/$0.47 per 1M); sin sufijo -120b-a12b',
    },
    {
      id: 'nvidia/nemotron-3.5-super-vl:free',
      label: 'Nemotron 3.5 Super VL Free (OpenRouter)',
      tier: 'standard',
      note: 'Tier gratuito en OpenRouter para pruebas y dev (rate-limited)',
    },
    {
      id: 'nvidia/nemotron-3-ultra-550b-a55b',
      label: 'Nemotron 3 Ultra 550B (OpenRouter)',
      tier: 'deep',
      note: 'Razonamiento profundo RGI ($0.50/$2.20 per 1M)',
    },
    {
      id: 'nvidia/nemotron-3.5-lightning',
      label: 'Nemotron 3.5 Lightning (OpenRouter)',
      tier: 'standard',
      note: 'Ultra rápido y económico ($0.07/$0.20 per 1M) para lotes',
    },
    {
      id: 'google/gemini-2.5-flash',
      label: 'Gemini 2.5 Flash (OpenRouter)',
      tier: 'standard',
      note: 'Enrutado vía OpenRouter con fallback gestionado',
    },
    {
      id: 'google/gemini-2.5-pro',
      label: 'Gemini 2.5 Pro (OpenRouter)',
      tier: 'deep',
      note: 'Alta precisión jurídica y notas RGI',
    },
    {
      id: 'deepseek/deepseek-v3.2',
      label: 'DeepSeek V3.2 (OpenRouter)',
      tier: 'standard',
      note: 'Excelente relación calidad/precio ($0.26/$0.38 per 1M)',
    },
    {
      id: 'qwen/qwen3-235b-a22b-2507',
      label: 'Qwen 3 235B A22B (OpenRouter)',
      tier: 'standard',
      note: 'MoE open-weights sólido en español y tools ($0.14/$0.80 per 1M)',
    },
    {
      id: 'moonshotai/kimi-k2.5',
      label: 'Kimi K2.5 (OpenRouter)',
      tier: 'standard',
      note: 'Agéntico fuerte en tool calling ($0.50/$2.50 per 1M)',
    },
    {
      id: 'anthropic/claude-sonnet-4.6',
      label: 'Claude Sonnet 4.6 (OpenRouter)',
      tier: 'deep',
      note: 'Razonamiento jurídico y técnico de frontera',
    },
    {
      id: 'openai/gpt-4.1-mini',
      label: 'GPT-4.1 Mini (OpenRouter)',
      tier: 'standard',
      note: 'Opción ligera y estable en JSON/tools ($0.40/$1.60 per 1M)',
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
