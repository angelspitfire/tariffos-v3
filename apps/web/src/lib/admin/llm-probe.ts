import { canRunLiveLlmForProvider, getLlmProvider } from '@tariffos/agent';
import type { AdminLlmProvider } from '@tariffos/shared-types';
import { z } from 'zod';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { LLM_TEST_TIMEOUT_MS, PROVIDER_ENV_HINTS } from './llm-catalog';

const ProbeSchema = z.object({ ok: z.boolean(), pong: z.string().optional() });

export async function testLlmRuntimeConfig(input: {
  provider: AdminLlmProvider;
  model: string;
  baseUrl?: string;
}) {
  const startedAt = Date.now();
  if (!isCloudModeEnabled()) {
    return {
      ok: true,
      provider: input.provider,
      model: input.model,
      latencyMs: Date.now() - startedAt,
    };
  }
  if (!canRunLiveLlmForProvider(input.provider, input.baseUrl)) {
    return {
      ok: false,
      provider: input.provider,
      model: input.model,
      latencyMs: Date.now() - startedAt,
      error: `Falta configurar ${PROVIDER_ENV_HINTS[input.provider]} en el servidor.`,
    };
  }
  try {
    const llm = getLlmProvider({ provider: input.provider, baseUrl: input.baseUrl });
    await llm.generateJson(
      'Responde únicamente con el JSON exacto {"ok": true, "pong": "tariffos"}.',
      ProbeSchema,
      { model: input.model, temperature: 0, timeoutMs: LLM_TEST_TIMEOUT_MS },
    );
    return {
      ok: true,
      provider: input.provider,
      model: input.model,
      latencyMs: Date.now() - startedAt,
    };
  } catch (err) {
    return {
      ok: false,
      provider: input.provider,
      model: input.model,
      latencyMs: Date.now() - startedAt,
      error: err instanceof Error ? err.message : 'Error al probar el modelo LLM',
    };
  }
}
