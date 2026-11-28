export type AgentRuntimeMode = 'eve';

export interface DualRuntimeConfig {
  cloudMode: boolean;
  supabaseConfigured: boolean;
  agentRuntimeMode: AgentRuntimeMode;
}

/**
 * Checks whether browser-reachable Supabase Auth credentials are configured.
 * Uses only NEXT_PUBLIC_* variables so SSR, proxy.ts, and Client Components
 * always agree on cloud vs. local mode without hydration mismatches.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey);
}

export function isCloudModeEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_CLOUD_MODE === 'false') {
    return false;
  }
  return isSupabaseConfigured();
}

export function isGoogleOAuthEnabled(isCloud = isCloudModeEnabled()): boolean {
  if (!isCloud) return true;
  return process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED !== 'false';
}

/**
 * Eve (`@assistant-ui/eve`) is the single durable chat runtime across local dev and Cloud.
 * `NEXT_PUBLIC_AGENT_RUNTIME` defaults to `'eve'`.
 */
export function getAgentRuntimeMode(_isCloud = isCloudModeEnabled()): AgentRuntimeMode {
  return 'eve';
}

export function getEveBaseUrl(): string {
  return process.env.NEXT_PUBLIC_EVE_URL?.trim() || '';
}

/**
 * Country slug pinned to the root landing `/` (defaults to `"ve"` during Venezuela rollout).
 * Set to `"global"` (or override via Vercel Flags `default-landing-country`) to serve the international landing at `/`.
 */
export function getDefaultLandingCountry(): string {
  const raw =
    process.env.DEFAULT_LANDING_COUNTRY?.trim() ||
    process.env.NEXT_PUBLIC_DEFAULT_LANDING_COUNTRY?.trim();
  return raw?.toLowerCase() || 've';
}

/**
 * Controls visibility of the country edition switcher and GeoIP suggestion banner.
 * Automatically hidden while `/` is pinned to a single country (`"ve"`) unless explicitly set to `"true"`.
 */
export function isCountrySwitcherEnabled(): boolean {
  const explicit = (
    process.env.SHOW_COUNTRY_SWITCHER?.trim() ||
    process.env.NEXT_PUBLIC_SHOW_COUNTRY_SWITCHER?.trim()
  )?.toLowerCase();
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;
  return getDefaultLandingCountry() === 'global';
}

export function getDualRuntimeConfig(): DualRuntimeConfig {
  const supabaseConfigured = isSupabaseConfigured();
  const cloudMode = isCloudModeEnabled();
  return {
    supabaseConfigured,
    cloudMode,
    agentRuntimeMode: getAgentRuntimeMode(cloudMode),
  };
}
