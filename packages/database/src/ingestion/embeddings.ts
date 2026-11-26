import { getLlmProvider, NVIDIA_BASE_URL } from '@tariffos/ai-client';

const DEFAULT_MODEL_ID = 'nvidia/nemotron-3.5-embed-1b';
const DEFAULT_DIMS = 768;

export function embeddingModel(): string {
  return process.env.EMBEDDING_MODEL?.trim() || DEFAULT_MODEL_ID;
}

export function embeddingDims(): number {
  const raw = Number(process.env.EMBEDDING_DIMS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_DIMS;
}

interface NvidiaEmbeddingResponse {
  data?: Array<{ index: number; embedding: number[] }>;
}

async function embedNvidiaBatch(
  documents: string[],
  model: string,
  dims: number,
  apiKey: string,
  inputType: 'passage' | 'query' = 'passage',
): Promise<number[][]> {
  const baseUrl = (process.env.NVIDIA_BASE_URL?.trim() || NVIDIA_BASE_URL).replace(/\/+$/, '');
  const res = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: documents,
      input_type: inputType,
      dimensions: dims,
      truncate: 'END',
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text();
    throw new Error(`NVIDIA embeddings HTTP ${res.status}: ${bodyText.slice(0, 240)}`);
  }

  const parsed = (await res.json()) as NvidiaEmbeddingResponse;
  const rows = [...(parsed.data ?? [])].sort((a, b) => a.index - b.index);
  if (rows.length !== documents.length) {
    throw new Error(`Expected ${documents.length} embeddings, received ${rows.length}`);
  }
  for (const row of rows) {
    if (row.embedding.length !== dims) {
      throw new Error(`Expected ${dims}-dim vector, received ${row.embedding.length}`);
    }
  }
  return rows.map((r) => r.embedding);
}

/**
 * Generates 768-dim passage embeddings aligned with productive vector search
 * (`nvidia/nemotron-3.5-embed-1b`, `input_type: 'passage'`), falling back to
 * `@tariffos/ai-client` when NVIDIA NIM is not configured.
 */
export async function embedDocuments(documents: string[]): Promise<number[][]> {
  if (documents.length === 0) return [];
  const safeDocuments = documents.map((d) => d.trim() || 'Partida arancelaria nacional');
  const model = embeddingModel();
  const dims = embeddingDims();
  const nvidiaKey = process.env.NVIDIA_API_KEY?.trim();
  const providerPref = process.env.LLM_PROVIDER?.trim() || 'nvidia';

  if (nvidiaKey && (providerPref === 'nvidia' || model.startsWith('nvidia/'))) {
    return embedNvidiaBatch(safeDocuments, model, dims, nvidiaKey, 'passage');
  }

  const provider = getLlmProvider();
  const vectors: number[][] = [];
  for (const document of safeDocuments) {
    vectors.push(await provider.embedText(document, { model, dims }));
  }
  return vectors;
}
