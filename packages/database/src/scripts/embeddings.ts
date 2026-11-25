/**
 * Embedding provider for the backfill scripts (PR 5).
 *
 * The backfill writes the vectors the retrieval path reads, so the two must
 * agree on the space. The port is the single place that knows how to ask
 * for a vector of a given width: it passes `providerOptions.dimensions`, so
 * the server returns the width that was requested, and it rejects a
 * response whose width differs.
 *
 * The model is read from `EMBEDDING_MODEL`, the width from
 * `EMBEDDING_DIMS` — the same two variables the reader filters on. A
 * mismatch between the two is not a silent degradation here: the width
 * check in the port throws.
 */
import { getLlmProvider } from '@tariffos/ai-client';

/** The model the vectors are produced with. */
export function embeddingModel(): string {
  return process.env.EMBEDDING_MODEL?.trim() || 'text-embedding-3-small';
}

/** The width of the vectors. Must match the index column (`vector(768)`). */
export function embeddingDims(): number {
  const raw = Number(process.env.EMBEDDING_DIMS);
  return Number.isFinite(raw) && raw > 0 ? raw : 768;
}

/**
 * Embed a batch of documents.
 *
 * The batch is embedded one document at a time: the port exposes a single
 * embedding, and a local server takes one text per call. The pacing
 * between batches is the caller's business.
 */
export async function embedDocuments(documents: string[]): Promise<number[][]> {
  const provider = getLlmProvider();
  const dims = embeddingDims();
  const vectors: number[][] = [];
  for (const document of documents) {
    vectors.push(
      await provider.embedText(document, { model: embeddingModel(), dims }),
    );
  }
  return vectors;
}
