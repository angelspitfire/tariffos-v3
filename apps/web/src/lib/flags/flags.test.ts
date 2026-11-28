// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  vercelDecide: vi.fn(),
  getVercelProviderData: vi.fn(),
}));

vi.mock('@flags-sdk/vercel', () => ({
  vercelAdapter: () => ({
    decide: mocks.vercelDecide,
  }),
  getProviderData: mocks.getVercelProviderData,
}));

import {
  APP_FLAGS,
  getBatchExecutionModeFlag,
  getDefaultLandingCountryFlag,
  isCountrySwitcherFlagEnabled,
  isGoogleOAuthFlagEnabled,
  isVercelFlagsConfigured,
} from './index';

describe('portable feature flags', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('exposes all four registered flags with stable kebab-case keys', () => {
    expect(APP_FLAGS.defaultLandingCountryFlag.key).toBe('default-landing-country');
    expect(APP_FLAGS.showCountrySwitcherFlag.key).toBe('show-country-switcher');
    expect(APP_FLAGS.googleOAuthEnabledFlag.key).toBe('google-oauth-enabled');
    expect(APP_FLAGS.batchExecutionModeFlag.key).toBe('batch-execution-mode');
  });

  it('detects whether Vercel Flags should evaluate remotely (Vercel server or explicit FLAGS key only)', () => {
    vi.stubEnv('FLAGS', '');
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');
    expect(isVercelFlagsConfigured()).toBe(false);

    // Local dev with an OIDC token stays on .env.local fallbacks
    vi.stubEnv('VERCEL_OIDC_TOKEN', 'oidc-token-local');
    expect(isVercelFlagsConfigured()).toBe(false);

    // Deployed on Vercel (Preview / Production) with OIDC token
    vi.stubEnv('VERCEL', '1');
    expect(isVercelFlagsConfigured()).toBe(true);

    // Explicit SDK key works anywhere
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');
    vi.stubEnv('FLAGS', 'flags:sdk-key-123');
    expect(isVercelFlagsConfigured()).toBe(true);
  });

  it('falls back to env vars for landing country and country switcher when Vercel Flags is unconfigured', async () => {
    vi.stubEnv('FLAGS', '');
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LANDING_COUNTRY', '');
    vi.stubEnv('NEXT_PUBLIC_SHOW_COUNTRY_SWITCHER', '');

    expect(await getDefaultLandingCountryFlag()).toBe('global');
    expect(await isCountrySwitcherFlagEnabled()).toBe(true);

    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LANDING_COUNTRY', 've');
    expect(await getDefaultLandingCountryFlag()).toBe('ve');
    expect(await isCountrySwitcherFlagEnabled()).toBe(false);

    vi.stubEnv('NEXT_PUBLIC_SHOW_COUNTRY_SWITCHER', 'true');
    expect(await isCountrySwitcherFlagEnabled()).toBe(true);
  });

  it('respects offline mode and NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED fallback', async () => {
    vi.stubEnv('FLAGS', '');
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED', 'false');

    expect(await isGoogleOAuthFlagEnabled(false)).toBe(true);
    expect(await isGoogleOAuthFlagEnabled(true)).toBe(false);

    vi.stubEnv('NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED', 'true');
    expect(await isGoogleOAuthFlagEnabled(true)).toBe(true);
  });

  it('resolves batch execution mode from env fallback when Vercel Flags is unconfigured', async () => {
    vi.stubEnv('FLAGS', '');
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');
    vi.stubEnv('BATCH_EXECUTION_MODE', '');
    vi.stubEnv('INNGEST_DEV', '');
    vi.stubEnv('NODE_ENV', 'development');

    expect(await getBatchExecutionModeFlag()).toBe('inline');

    vi.stubEnv('BATCH_EXECUTION_MODE', 'inngest');
    expect(await getBatchExecutionModeFlag()).toBe('inngest');

    vi.stubEnv('BATCH_EXECUTION_MODE', 'inline');
    expect(await getBatchExecutionModeFlag()).toBe('inline');
  });

  it('delegates to vercelAdapter when configured and falls back safely if adapter throws', async () => {
    vi.stubEnv('FLAGS', 'flags:sdk-key-live');
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LANDING_COUNTRY', 'global');

    const decide = APP_FLAGS.defaultLandingCountryFlag.decide;
    expect(decide).toBeDefined();
    if (!decide) return;

    mocks.vercelDecide.mockResolvedValueOnce('ve');
    const liveValue = await decide({
      headers: new Headers(),
      cookies: { get: () => undefined } as never,
      entities: { country: { code: 'VE' } },
    });
    expect(liveValue).toBe('ve');
    expect(mocks.vercelDecide).toHaveBeenCalledTimes(1);

    mocks.vercelDecide.mockRejectedValueOnce(new Error('network timeout'));
    const fallbackValue = await decide({
      headers: new Headers(),
      cookies: { get: () => undefined } as never,
      entities: {},
    });
    expect(fallbackValue).toBe('global');
  });
});
