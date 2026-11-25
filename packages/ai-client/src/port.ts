/**
 * Canonical provider port (F0) — the single seam every model call in the
 * workspace must cross. Domain code sees only this interface: never a
 * provider SDK, never a raw provider client, never `fetch`.
 *
 * The provider becomes a deployment decision (`LLM_PROVIDER`) instead of
 * a code change.
 *
 * This file mirrors `apps/filings/src/lib/ai/provider.ts`, which is already
 * in production, so that PR 3 can swap the local copy for this one without
 * changing a single call site. Three deliberate differences:
 *
 * - `EmbedCallOptions.dims` is a contract, not a hint. The adapter MUST
 *   request that width from the server and MUST fail when the returned
 *   vector has a different width. The tariff index stores `vector(768)` and
 *   pgvector refuses to compare vectors of different dimensions, so a
 *   mismatch does not error — it silently returns no matches.
 * - `generateJson` is generic in the schema, so the caller keeps the
 *   inferred type of the validated payload.
 * - No `nativeSchema`. It carried a provider-native structured-output
 *   descriptor that only the retired engine could consume. With the
 *   migration done, the Zod schema is the whole contract.
 *
 * Errors are typed, never strings: `SchemaViolationError` is deterministic
 * (do not blind-retry it), anything thrown by the transport is transient.
 */
import type { ZodType } from 'zod';

/** Default per-call timeout: the workspace's established 30s ceiling. */
export const DEFAULT_TIMEOUT_MS = 30_000;

/** Options shared by all text calls; adapters map them per provider. */
export interface GenerateCallOptions {
  /** Model override; adapters fall back to the configured default model. */
  model?: string;
  temperature?: number;
  /**
   * Ask for a valid JSON envelope (provider-specific JSON mode on).
   *
   * Honoured only by adapters whose provider supports a JSON mode; the
   * deterministic barrier is `generateJson`, which validates regardless.
   */
  json?: boolean;
  timeoutMs?: number;
  /**
   * Cancels the call. The copilot uses it: when the broker closes the tab
   * mid-answer, the request must stop instead of running to completion.
   */
  abortSignal?: AbortSignal;
  /**
   * Multimodal attachments sent alongside the prompt text. Adapters that
   * cannot carry a given kind reject it explicitly rather than dropping it
   * silently.
   */
  attachments?: Attachment[];
}

/**
 * A part of a multimodal prompt.
 *
 * Two shapes, because providers differ in how they take a document:
 *
 * - `inline`: the bytes travel with the request, as a data URL. Works
 *   everywhere — an OpenAI-compatible server and OpenRouter both accept
 *   one — but the payload grows with the document and the request has to
 *   fit in a single body.
 * - `reference`: the file was uploaded before, and the call names it. The
 *   bytes were already sent once.
 *
 * The adapter decides how to carry each one; the caller only says which
 * shape it has.
 */
export type Attachment =
  | { type: 'text'; text: string }
  | {
      type: 'inline';
      /** The document as a data URL: `data:<mimeType>;base64,<bytes>`. */
      dataUrl: string;
      mimeType: string;
    }
  | {
      type: 'reference';
      /** The provider's handle for the uploaded file. */
      uri: string;
      mimeType: string;
    };

/** Options for an embedding call. */
export interface EmbedCallOptions {
  /** Model override; adapters fall back to the configured embedding model. */
  model?: string;
  /**
   * Width of the requested vector. Adapters MUST honour it and MUST reject a
   * response whose width differs — see the note at the top of this file.
   */
  dims?: number;
}

/**
 * A stream of text fragments.
 *
 * The copilot needs it: a 150-word answer takes seconds, and the broker
 * waits on screen. It is an `AsyncIterable` of strings so the port stays
 * agnostic of how the provider delivers them — the SDK's own stream type
 * never crosses this boundary.
 */
export type TextStream = AsyncIterable<string>;

/** The single interface every provider adapter implements. */
export interface LlmProviderPort {
  /** Free-form completion (grounded answers, prose, meters). */
  generateText(prompt: string, options?: GenerateCallOptions): Promise<string>;

  /**
   * Structured completion. `schema` is mandatory and doubles as the
   * deterministic barrier; the returned data is always validated against it.
   * Returns schema-valid data or throws `SchemaViolationError`.
   */
  generateJson<T>(
    prompt: string,
    schema: ZodType<T>,
    options?: GenerateCallOptions,
  ): Promise<T>;

  /** One embedding vector; always full-length, adapters never truncate here. */
  embedText(text: string, options?: EmbedCallOptions): Promise<number[]>;

  /**
   * The same completion as `generateText`, delivered in fragments.
   *
   * The streamed text is identical to what `generateText` would have
   * returned; only the delivery differs.
   */
  streamText(prompt: string, options?: GenerateCallOptions): TextStream;
}

/** The model answered, but the shape/JSON did not survive validation. */
export class SchemaViolationError extends Error {
  readonly issues: string[];

  constructor(issues: string[], preview?: string) {
    const detail = issues.length > 0 ? issues.join('; ') : 'empty response';
    super(
      `model output failed schema validation: ${detail}${preview ? ` (raw: ${preview})` : ''}`,
    );
    this.name = 'SchemaViolationError';
    this.issues = issues;
  }
}

/**
 * The server returned a vector whose width differs from the one requested.
 *
 * Distinct from `SchemaViolationError` on purpose: this is not a model
 * quality problem, it is a contract violation between the adapter and the
 * index, and it must never be retried blindly.
 */
export class EmbeddingDimensionMismatchError extends Error {
  readonly expected: number;
  readonly actual: number;

  constructor(expected: number, actual: number) {
    super(
      `embedding width mismatch: asked ${expected}, got ${actual}. ` +
        'The provider ignored the requested dimensions; the vector index is vector(768).',
    );
    this.name = 'EmbeddingDimensionMismatchError';
    this.expected = expected;
    this.actual = actual;
  }
}

/** Parse + validate a raw model string against a Zod schema, or fail typed. */
export function validateJson<T>(raw: string, schema: ZodType<T>): T {
  const trimmed = raw.trim();
  if (!trimmed) throw new SchemaViolationError(['empty response']);
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new SchemaViolationError(['response is not valid JSON'], trimmed.slice(0, 200));
  }
  const check = schema.safeParse(parsed);
  if (!check.success) {
    const issues = check.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    throw new SchemaViolationError(
      issues.length > 0 ? issues : ['schema mismatch'],
      trimmed.slice(0, 200),
    );
  }
  return check.data;
}
