import { getLlmProvider } from '@tariffos/ai-client';

const DEFAULT_MODEL_ID = 'nvidia/nemotron-3.5-embed-1b';
const DEFAULT_DIMS = 768;
const INGEST_EMBED_TIMEOUT_MS = 30_000;

export function embeddingModel(): string {
  return process.env.EMBEDDING_MODEL?.trim() || DEFAULT_MODEL_ID;
}

export function embeddingDims(): number {
  const raw = Number(process.env.EMBEDDING_DIMS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_DIMS;
}

/**
 * Generates 768-dim passage/query embeddings via `@tariffos/ai-client` `embedMany`,
 * honoring NVIDIA NIM asymmetric `input_type` when `NVIDIA_API_KEY` is active.
 */
export async function embedDocuments(
  documents: string[],
  inputType: 'passage' | 'query' = 'passage',
): Promise<number[][]> {
  if (documents.length === 0) return [];
  const safeDocuments = documents.map((d) => d.trim() || 'Partida arancelaria nacional');
  const model = embeddingModel();
  const dims = embeddingDims();
  const nvidiaKey = process.env.NVIDIA_API_KEY?.trim();
  const providerPref = process.env.LLM_PROVIDER?.trim() || 'nvidia';
  const useNvidia = Boolean(nvidiaKey && (providerPref === 'nvidia' || model.startsWith('nvidia/')));

  const provider = getLlmProvider(useNvidia ? { provider: 'nvidia' } : undefined);
  return provider.embedMany(safeDocuments, {
    model,
    dims,
    inputType,
    timeoutMs: INGEST_EMBED_TIMEOUT_MS,
  });
}
