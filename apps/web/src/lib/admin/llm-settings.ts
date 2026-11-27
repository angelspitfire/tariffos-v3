import {
  canRunLiveLlm,
  canRunLiveLlmForProvider,
  listConfiguredLlmProviders,
  resolveEmbeddingDims,
  resolveEmbeddingModel,
  resolveMaxRpm,
  resolveProvider,
  rgiModel,
  type RgiLlmRuntimeOverride,
} from '@tariffos/agent';
import { prisma } from '@tariffos/database';
import {
  LlmRuntimeConfigSchema,
  type AdminLlmProvider,
  type AdminLlmSettingsPayload,
  type LlmRuntimeConfig,
} from '@tariffos/shared-types';
import { isCloudModeEnabled } from '../runtime-config';
import {
  ADMIN_LLM_PRESETS,
  LLM_RUNTIME_SETTING_KEY,
  LLM_SETTINGS_CACHE_TTL_MS,
  PROVIDER_ENV_HINTS,
} from './llm-catalog';

export { testLlmRuntimeConfig } from './llm-probe';

export interface ActiveLlmRuntimeConfig extends LlmRuntimeConfig {
  source: 'database' | 'env';
  canRunLive: boolean;
  updatedAt: string | null;
}

/** Converts an active DB-backed LLM runtime config into an agent pipeline override. */
export function toRgiLlmRuntimeOverride(
  config: ActiveLlmRuntimeConfig | null | undefined,
): RgiLlmRuntimeOverride | undefined {
  if (!config || config.source !== 'database') return undefined;
  return {
    provider: config.provider,
    model: config.model,
    deepModel: config.deepModel,
    baseUrl: config.baseUrl,
  };
}

interface DbCacheSlot {
  expiresAt: number;
  override: { config: LlmRuntimeConfig; updatedAt: string } | null;
}

let dbCacheSlot: DbCacheSlot | null = null;
let offlineOverride: { config: LlmRuntimeConfig; updatedAt: string } | null = null;

export function invalidateLlmRuntimeConfigCache(): void {
  dbCacheSlot = null;
}

export function getEnvLlmDefaults(): LlmRuntimeConfig {
  let provider: AdminLlmProvider = 'openai-compatible';
  try {
    provider = resolveProvider();
  } catch {
    provider = 'openai-compatible';
  }
  const maxRpm = resolveMaxRpm();
  return {
    provider,
    model: rgiModel(false),
    deepModel: rgiModel(true),
    ...(maxRpm > 0 ? { maxRpm } : {}),
  };
}

function buildActiveFromConfig(
  config: LlmRuntimeConfig,
  source: 'database' | 'env',
  updatedAt: string | null,
): ActiveLlmRuntimeConfig {
  return {
    ...config,
    source,
    updatedAt,
    canRunLive:
      source === 'env'
        ? canRunLiveLlm()
        : canRunLiveLlmForProvider(config.provider, config.baseUrl),
  };
}

async function readPersistedOverride(): Promise<{
  config: LlmRuntimeConfig;
  updatedAt: string;
} | null> {
  if (!isCloudModeEnabled()) return offlineOverride;
  if (dbCacheSlot && Date.now() < dbCacheSlot.expiresAt) return dbCacheSlot.override;

  let override: { config: LlmRuntimeConfig; updatedAt: string } | null = null;
  try {
    const row = prisma.systemSetting?.findUnique
      ? await prisma.systemSetting.findUnique({ where: { key: LLM_RUNTIME_SETTING_KEY } })
      : null;
    if (row?.value) {
      const parsed = LlmRuntimeConfigSchema.safeParse(JSON.parse(row.value));
      if (parsed.success) {
        override = { config: parsed.data, updatedAt: row.updatedAt.toISOString() };
      }
    }
  } catch {
    // Fall back silently to env defaults so a DB hiccup never blocks classification.
  }

  dbCacheSlot = { expiresAt: Date.now() + LLM_SETTINGS_CACHE_TTL_MS, override };
  return override;
}

export async function getActiveLlmRuntimeConfig(): Promise<ActiveLlmRuntimeConfig> {
  const persisted = await readPersistedOverride();
  if (
    persisted &&
    (!isCloudModeEnabled() ||
      canRunLiveLlmForProvider(persisted.config.provider, persisted.config.baseUrl))
  ) {
    return buildActiveFromConfig(persisted.config, 'database', persisted.updatedAt);
  }
  return buildActiveFromConfig(getEnvLlmDefaults(), 'env', null);
}

export async function getAdminLlmSettingsPayload(): Promise<AdminLlmSettingsPayload> {
  const active = await getActiveLlmRuntimeConfig();
  return {
    active: {
      provider: active.provider,
      model: active.model,
      deepModel: active.deepModel,
      baseUrl: active.baseUrl,
      maxRpm: active.maxRpm,
      canRunLive: active.canRunLive,
    },
    source: active.source,
    updatedAt: active.updatedAt,
    providers: listConfiguredLlmProviders(),
    presets: ADMIN_LLM_PRESETS,
    envDefaults: getEnvLlmDefaults(),
    embeddingLock: {
      model: resolveEmbeddingModel(),
      dims: resolveEmbeddingDims(),
    },
  };
}

export async function saveLlmRuntimeConfig(input: LlmRuntimeConfig) {
  const validated = LlmRuntimeConfigSchema.parse(input);
  const cloudMode = isCloudModeEnabled();
  if (cloudMode && !canRunLiveLlmForProvider(validated.provider, validated.baseUrl)) {
    throw new Error(
      `El proveedor "${validated.provider}" no tiene credencial configurada (${PROVIDER_ENV_HINTS[validated.provider]}) en el servidor.`,
    );
  }

  invalidateLlmRuntimeConfigCache();
  const before = await getActiveLlmRuntimeConfig();
  const nowIso = new Date().toISOString();

  if (!cloudMode) {
    offlineOverride = { config: validated, updatedAt: nowIso };
    invalidateLlmRuntimeConfigCache();
    return { before, after: buildActiveFromConfig(validated, 'database', nowIso) };
  }

  const saved = await prisma.systemSetting.upsert({
    where: { key: LLM_RUNTIME_SETTING_KEY },
    update: { value: JSON.stringify(validated), type: 'json' },
    create: {
      key: LLM_RUNTIME_SETTING_KEY,
      value: JSON.stringify(validated),
      type: 'json',
      description: 'Runtime LLM provider and model override for RGI classification',
    },
  });

  invalidateLlmRuntimeConfigCache();
  return {
    before,
    after: buildActiveFromConfig(validated, 'database', saved.updatedAt.toISOString()),
  };
}

export async function resetLlmRuntimeConfig() {
  invalidateLlmRuntimeConfigCache();
  const before = await getActiveLlmRuntimeConfig();
  if (!isCloudModeEnabled()) {
    offlineOverride = null;
  } else {
    await prisma.systemSetting.deleteMany({ where: { key: LLM_RUNTIME_SETTING_KEY } });
  }
  invalidateLlmRuntimeConfigCache();
  const after = buildActiveFromConfig(getEnvLlmDefaults(), 'env', null);
  return { before, after };
}
