/**
 * In-memory fake for the canonical port (F0).
 *
 * A real adapter, not a module mock: it implements `LlmProviderPort`, so a
 * test depends on the contract and never on how the SDK is wired. That is
 * what lets the domain be exercised without a network or a Docker container.
 *
 * Two properties make it a faithful double:
 * - It enforces the same schema barrier as the production adapter. A double
 *   that skipped validation would let through exactly the bugs the port
 *   exists to catch.
 * - Each instance owns its own state, so two tests running in parallel
 *   cannot overwrite each other's programmed responses.
 */
import type { ZodType } from 'zod';
import {
  EmbeddingDimensionMismatchError,
  SchemaViolationError,
  validateJson,
  type EmbedCallOptions,
  type GenerateCallOptions,
  type LlmProviderPort,
} from '../port.js';

/** One recorded call, so a test can assert on what the domain asked for. */
export interface RecordedCall {
  operation: 'generateText' | 'generateJson' | 'embedText' | 'embedMany' | 'streamText';
  prompt: string;
  options: GenerateCallOptions | EmbedCallOptions;
}

/** Programmable responses. Each entry may be a value or a function of the input. */
export interface FakeResponses {
  text?: string | ((prompt: string) => string);
  json?: unknown | ((prompt: string) => unknown);
  embedding?: number[] | ((text: string) => number[]);
}

/** A fake provider that also exposes its recorded calls. */
export interface FakeProvider extends LlmProviderPort {
  /** Every call made through this instance, in order. */
  readonly calls: RecordedCall[];
  /** Forget the recorded calls. Programmed responses survive. */
  reset(): void;
}

/** Seed derived from the text, so different inputs get different vectors. */
function seedFrom(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 9973;
  }
  return hash;
}

/**
 * Deterministic pseudo-random value in [0, 1) derived from a seed.
 *
 * The fake's vectors must vary with the input — a constant vector (all
 * zeros, all the same number) makes every comparison degenerate, so
 * retrieval tests would pass for the wrong reason.
 */
function pseudoRandom(seed: number, index: number): number {
  const x = Math.sin(seed * 1000 + index) * 10000;
  return x - Math.floor(x);
}

/** Build a deterministic, non-degenerate vector of the requested width. */
export function defaultVector(text: string, dims: number): number[] {
  const seed = seedFrom(text);
  const vector: number[] = [];
  for (let i = 0; i < dims; i++) {
    vector.push(pseudoRandom(seed, i));
  }
  return vector;
}

function resolveValue<T>(entry: T | ((input: string) => T) | undefined, input: string, fallback: T): T {
  if (entry === undefined) return fallback;
  if (typeof entry === 'function') {
    return (entry as (value: string) => T)(input);
  }
  return entry;
}

/**
 * Create a fake provider.
 *
 * `responses` programs what the model answers; anything not programmed gets
 * a deterministic default, so a test only states what it cares about.
 */
export function createFakeProvider(responses: FakeResponses = {}): FakeProvider {
  const calls: RecordedCall[] = [];

  return {
    calls,

    reset() {
      calls.length = 0;
    },

    async generateText(prompt: string, options: GenerateCallOptions = {}): Promise<string> {
      calls.push({ operation: 'generateText', prompt, options });
      return resolveValue(responses.text, prompt, `Response to: ${prompt}`);
    },

    async generateJson<T>(
      prompt: string,
      schema: ZodType<T>,
      options: GenerateCallOptions = {},
    ): Promise<T> {
      calls.push({ operation: 'generateJson', prompt, options });
      const answer = resolveValue(responses.json, prompt, { ok: true });
      try {
        return validateJson(JSON.stringify(answer), schema);
      } catch (err) {
        throw new SchemaViolationError(
          [`fake response did not satisfy the schema: ${err instanceof Error ? err.message : String(err)}`],
        );
      }
    },

    async embedText(text: string, options: EmbedCallOptions = {}): Promise<number[]> {
      calls.push({ operation: 'embedText', prompt: text, options });
      const dims = options.dims ?? 768;
      const vector = resolveValue(responses.embedding, text, defaultVector(text, dims));
      if (vector.length !== dims) {
        throw new EmbeddingDimensionMismatchError(dims, vector.length);
      }
      return vector;
    },

    async embedMany(texts: string[], options: EmbedCallOptions = {}): Promise<number[][]> {
      calls.push({ operation: 'embedMany', prompt: texts.join('\n'), options });
      const dims = options.dims ?? 768;
      return texts.map((text) => {
        const vector = resolveValue(responses.embedding, text, defaultVector(text, dims));
        if (vector.length !== dims) {
          throw new EmbeddingDimensionMismatchError(dims, vector.length);
        }
        return vector;
      });
    },

    async *streamText(prompt: string, options: GenerateCallOptions = {}): AsyncGenerator<string> {
      calls.push({ operation: 'streamText', prompt, options });
      const whole = resolveValue(responses.text, prompt, `Response to: ${prompt}`);
      // Framed in two pieces so a test can assert the caller really consumed
      // a stream rather than one blocking string.
      const cut = Math.ceil(whole.length / 2);
      yield whole.slice(0, cut);
      yield whole.slice(cut);
    },
  };
}
