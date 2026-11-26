/**
 * The single factory of the canonical port (F0).
 *
 * `getLlmProvider()` resolves the provider on every call — never cached at
 * module level — so a deployment (or a test) can flip providers without a
 * restart. The adapter itself stays lazy: importing this module touches no
 * network.
 *
 * The fake is selected explicitly through `setProviderKind('fake')`, not
 * through the environment: `LLM_PROVIDER` names a real endpoint, and a test
 * double must never be reachable by a stray env var in production.
 */
import { resolveProvider } from './config.js';
import { OpenAICompatibleAdapter, type LlmRuntimeOverride } from './adapters/openai-compatible.js';
import { createFakeProvider, type FakeProvider } from './adapters/fake.js';
import type { LlmProviderPort } from './port.js';

/** Which implementation satisfies the port. */
export type ProviderKind = 'production' | 'fake';

/**
 * Explicit override for tests. `null` means "read the environment", which is
 * the production path.
 */
let override: ProviderKind | null = null;

/** Force a specific implementation; used by tests to inject the fake. */
export function setProviderKind(kind: ProviderKind): void {
  override = kind;
}

/** Drop the override and go back to reading the environment. */
export function resetProviderKind(): void {
  override = null;
}

/**
 * Get the provider that satisfies the port right now.
 *
 * Returns a fresh instance per call: the adapters hold no mutable state
 * worth sharing, and a fresh instance cannot leak one call's configuration
 * into the next.
 */
export function getLlmProvider(runtimeOverride?: LlmRuntimeOverride): LlmProviderPort {
  if (override === 'fake') return createFakeProvider();
  // Validate env provider when no explicit runtime override was supplied.
  if (!runtimeOverride?.provider) {
    resolveProvider();
  }
  return new OpenAICompatibleAdapter(undefined, runtimeOverride);
}

/**
 * Get the fake provider, for tests that need to program responses.
 *
 * Separate from `getLlmProvider()` on purpose: the fake's whole value is
 * that the test controls the answers, which requires holding the instance.
 */
export function getFakeProvider(): FakeProvider {
  return createFakeProvider();
}
