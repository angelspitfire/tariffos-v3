import { getLlmProvider, resolveEmbeddingDims, resolveEmbeddingModel } from '@tariffos/agent';

export type QueryEmbeddingFn = (
  text: string,
  inputType?: 'query' | 'passage',
) => Promise<number[] | null>;

const DEFAULT_EMBED_TIMEOUT_MS = 4_500;

/**
 * Generates a single embedding vector via `@tariffos/ai-client` (NVIDIA NIM when configured),
 * returning `null` safely if credentials are missing or the upstream call fails.
 */
export async function embedQueryVectorWithAiClient(
  text: string,
  inputType: 'query' | 'passage' = 'query',
  timeoutMs = DEFAULT_EMBED_TIMEOUT_MS,
): Promise<number[] | null> {
  const trimmed = text.trim();
  if (!trimmed || !process.env.NVIDIA_API_KEY?.trim()) return null;

  try {
    const provider = getLlmProvider({ provider: 'nvidia' });
    return await provider.embedText(trimmed, {
      model: resolveEmbeddingModel(),
      dims: resolveEmbeddingDims(),
      inputType,
      timeoutMs,
    });
  } catch {
    return null;
  }
}

/**
 * Creates a request-scoped memoizing wrapper so Tier 0 semantic lookup, pre-HITL
 * check, and hybrid vector search share a single embedding roundtrip per query.
 */
export function createQueryEmbeddingCache(
  embedImpl: QueryEmbeddingFn = embedQueryVectorWithAiClient,
): (text: string) => Promise<number[] | null> {
  const cache = new Map<string, Promise<number[] | null>>();
  return (text: string) => {
    const key = text.trim().toLowerCase();
    if (!key) return Promise.resolve(null);
    const existing = cache.get(key);
    if (existing) return existing;
    const promise = embedImpl(text, 'query');
    cache.set(key, promise);
    return promise;
  };
}
