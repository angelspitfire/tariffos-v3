import {
  resolveBatchExecutionMode,
  type BatchExecutionMode,
} from '@/lib/inngest/run-cloud-batch';
import {
  getDefaultLandingCountry,
  isCloudModeEnabled,
  isCountrySwitcherEnabled,
  isGoogleOAuthEnabled,
} from '@/lib/runtime-config';
import {
  createPortableFlag,
  evaluateFlagSafe,
  getFlagsDiscoveryData,
  isVercelFlagsConfigured,
  type FlagEntities,
} from './provider';

export type BatchExecutionFlagValue = 'auto' | BatchExecutionMode;

function readBatchModeEnvFallback(): BatchExecutionFlagValue {
  const explicit = process.env.BATCH_EXECUTION_MODE?.trim().toLowerCase();
  if (explicit === 'inline' || explicit === 'inngest') return explicit;
  return 'auto';
}

export const defaultLandingCountryFlag = createPortableFlag<string>({
  key: 'default-landing-country',
  description: 'Country edition pinned to root "/" landing ("global" or "ve").',
  defaultValue: 'global',
  options: [
    { label: 'Global (international)', value: 'global' },
    { label: 'Venezuela (VE pilot)', value: 've' },
  ],
  fallback: () => getDefaultLandingCountry(),
});

export const showCountrySwitcherFlag = createPortableFlag<boolean>({
  key: 'show-country-switcher',
  description: 'Show the country edition switcher and GeoIP banner on marketing pages.',
  defaultValue: true,
  options: [
    { label: 'Visible', value: true },
    { label: 'Hidden', value: false },
  ],
  fallback: () => isCountrySwitcherEnabled(),
});

export const googleOAuthEnabledFlag = createPortableFlag<boolean>({
  key: 'google-oauth-enabled',
  description: 'Enable Google OAuth sign-in button in Cloud mode.',
  defaultValue: true,
  options: [
    { label: 'Enabled', value: true },
    { label: 'Disabled', value: false },
  ],
  fallback: () => isGoogleOAuthEnabled(true),
});

export const batchExecutionModeFlag = createPortableFlag<BatchExecutionFlagValue>({
  key: 'batch-execution-mode',
  description: 'Controls whether cloud invoice batches run inline, via Inngest, or auto.',
  defaultValue: 'auto',
  options: [
    { label: 'Auto (env default)', value: 'auto' },
    { label: 'Inline (synchronous)', value: 'inline' },
    { label: 'Inngest (durable queue)', value: 'inngest' },
  ],
  fallback: () => readBatchModeEnvFallback(),
});

export const APP_FLAGS = {
  defaultLandingCountryFlag,
  showCountrySwitcherFlag,
  googleOAuthEnabledFlag,
  batchExecutionModeFlag,
} as const;

export async function getDefaultLandingCountryFlag(): Promise<string> {
  const raw = await evaluateFlagSafe(defaultLandingCountryFlag, () => getDefaultLandingCountry());
  return raw.trim().toLowerCase() || 'global';
}

export async function isCountrySwitcherFlagEnabled(): Promise<boolean> {
  return evaluateFlagSafe(showCountrySwitcherFlag, () => isCountrySwitcherEnabled());
}

export async function isGoogleOAuthFlagEnabled(
  isCloud = isCloudModeEnabled(),
): Promise<boolean> {
  if (!isCloud) return true;
  return evaluateFlagSafe(googleOAuthEnabledFlag, () => isGoogleOAuthEnabled(isCloud));
}

export async function getBatchExecutionModeFlag(
  entities?: FlagEntities,
): Promise<BatchExecutionMode> {
  const mode = await evaluateFlagSafe(
    batchExecutionModeFlag,
    () => readBatchModeEnvFallback(),
    entities,
  );
  if (mode === 'inline' || mode === 'inngest') return mode;
  return resolveBatchExecutionMode();
}

export { getFlagsDiscoveryData, isVercelFlagsConfigured, type FlagEntities };
