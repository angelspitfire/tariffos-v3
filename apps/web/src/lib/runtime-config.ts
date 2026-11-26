export interface DualRuntimeConfig {
  cloudMode: boolean;
  supabaseConfigured: boolean;
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
  return process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true';
}

export function getDualRuntimeConfig(): DualRuntimeConfig {
  const supabaseConfigured = isSupabaseConfigured();
  return {
    supabaseConfigured,
    cloudMode: isCloudModeEnabled(),
  };
}
