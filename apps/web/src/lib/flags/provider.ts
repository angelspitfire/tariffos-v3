import {
  getProviderData as getVercelProviderData,
  vercelAdapter,
} from '@flags-sdk/vercel';
import type { GenerousOption, JsonValue, ProviderData, ReadonlyHeaders } from 'flags';
import {
  dedupe,
  flag,
  getProviderData as getLocalProviderData,
  type KeyedFlagDefinitionType,
} from 'flags/next';

export interface FlagEntities {
  user?: { id: string };
  tenant?: { id: string };
  country?: { code: string };
}

export interface PortableFlagSpec<T extends JsonValue> {
  key: string;
  description: string;
  defaultValue: T;
  options: GenerousOption<T>[];
  fallback: (entities?: FlagEntities) => T;
}

/**
 * True when remote Vercel Flags evaluation should run:
 * - On Vercel deployments (`VERCEL=1` with `VERCEL_OIDC_TOKEN`), or
 * - When an explicit `FLAGS` SDK key is configured.
 *
 * Local development stays strictly on `.env.local` fallbacks even if an OIDC token
 * happens to be present in the local environment.
 */
export function isVercelFlagsConfigured(): boolean {
  if (process.env.FLAGS?.trim()) return true;
  return process.env.VERCEL === '1' && Boolean(process.env.VERCEL_OIDC_TOKEN?.trim());
}

/** Lightweight request-scoped entity extraction shared across public and authed routes. */
export const identifyFlagEntities = dedupe(
  ({ headers }: { headers: ReadonlyHeaders }): FlagEntities => {
    const rawCountry = headers.get('x-vercel-ip-country')?.trim().toUpperCase();
    return rawCountry ? { country: { code: rawCountry } } : {};
  },
);

/**
 * Declares a portable feature flag behind a single provider boundary.
 * To migrate away from Vercel Flags in the future, replace `vercelAdapter` here only.
 */
export function createPortableFlag<T extends JsonValue>(spec: PortableFlagSpec<T>) {
  const remoteOrigin = isVercelFlagsConfigured()
    ? (vercelAdapter<T, FlagEntities>().origin as string | undefined)
    : undefined;

  return flag<T, FlagEntities>({
    key: spec.key,
    description: spec.description,
    defaultValue: spec.defaultValue,
    options: spec.options,
    ...(remoteOrigin ? { origin: remoteOrigin } : {}),
    identify: identifyFlagEntities,
    async decide({ headers, cookies, entities }) {
      if (!isVercelFlagsConfigured()) {
        return spec.fallback(entities);
      }
      try {
        const adapter = vercelAdapter<T, FlagEntities>();
        const evaluated = await adapter.decide({
          key: spec.key,
          entities,
          headers,
          cookies,
        });
        return evaluated === undefined ? spec.fallback(entities) : evaluated;
      } catch (err) {
        if (process.env.VERCEL === '1') {
          console.warn(`[flags] Falling back for "${spec.key}":`, err instanceof Error ? err.message : String(err));
        }
        return spec.fallback(entities);
      }
    },
  });
}

/**
 * Evaluates a Next.js flag safely in both request-scoped SSR/Route Handlers and
 * non-request environments (Vitest, CLI scripts) without throwing on `next/headers`.
 */
export async function evaluateFlagSafe<T extends JsonValue>(
  flagFn: ReturnType<typeof createPortableFlag<T>>,
  fallback: () => T,
  entities?: FlagEntities,
): Promise<T> {
  try {
    return entities ? await flagFn.run({ identify: entities }) : await flagFn();
  } catch {
    return fallback();
  }
}

/**
 * Returns Flags Explorer discovery metadata for `/.well-known/vercel/flags`.
 * Uses Vercel provider data when configured, and local code definitions otherwise.
 */
export async function getFlagsDiscoveryData(
  flagsRegistry: Record<string, KeyedFlagDefinitionType | readonly unknown[]>,
): Promise<ProviderData> {
  if (isVercelFlagsConfigured()) {
    try {
      return await getVercelProviderData(flagsRegistry);
    } catch {
      return getLocalProviderData(flagsRegistry);
    }
  }
  return getLocalProviderData(flagsRegistry);
}
