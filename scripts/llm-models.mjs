#!/usr/bin/env node
/**
 * Inspect available LLM models across providers (OpenRouter, NVIDIA Build, Google AI),
 * filter free OpenRouter models, and query live OpenRouter API key quota/usage.
 *
 * Examples:
 *   pnpm llm:models --quota
 *   pnpm llm:models --free --tools
 *   pnpm llm:models --search nemotron
 *   pnpm llm:models --provider nvidia --search nemotron
 *   pnpm llm:models --free --quota --json
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv(resolve(root, '.env.local'));
loadEnv(resolve(root, 'apps/web/.env.local'));

const args = process.argv.slice(2);
const hasFlag = (f) => args.includes(f);
const getOpt = (f, fallback) => {
  const i = args.indexOf(f);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const provider = getOpt('--provider', 'openrouter').toLowerCase();
const freeOnly = hasFlag('--free');
const toolsOnly = hasFlag('--tools');
const showQuota = hasFlag('--quota');
const asJson = hasFlag('--json');
const search = getOpt('--search', '').toLowerCase();
const limit = Number.parseInt(getOpt('--limit', '40'), 10);

async function fetchOpenRouterQuota() {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) return { configured: false };
  const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
    headers: { Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`OpenRouter /auth/key HTTP ${res.status}`);
  const { data } = await res.json();
  return {
    configured: true,
    label: data?.label ?? null,
    isFreeTier: Boolean(data?.is_free_tier),
    limitUsd: data?.limit ?? null,
    remainingUsd: data?.limit_remaining ?? null,
    usageUsd: data?.usage ?? 0,
    usageDailyUsd: data?.usage_daily ?? null,
    usageWeeklyUsd: data?.usage_weekly ?? null,
    usageMonthlyUsd: data?.usage_monthly ?? null,
    rateLimit: data?.rate_limit ?? null,
  };
}

async function fetchModels() {
  if (provider === 'openrouter') {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) throw new Error(`OpenRouter /models HTTP ${res.status}`);
    const { data = [] } = await res.json();
    return data.map((m) => {
      const pIn = Number.parseFloat(m.pricing?.prompt ?? 'NaN');
      const pOut = Number.parseFloat(m.pricing?.completion ?? 'NaN');
      const inM = Number.isFinite(pIn) ? Number((pIn * 1e6).toFixed(4)) : null;
      const outM = Number.isFinite(pOut) ? Number((pOut * 1e6).toFixed(4)) : null;
      return {
        id: m.id,
        contextLength: m.context_length ?? null,
        promptPerMillionUsd: inM,
        completionPerMillionUsd: outM,
        isFree: m.id.endsWith(':free') || (inM === 0 && outM === 0),
        supportsTools: (m.supported_parameters ?? []).includes('tools'),
      };
    });
  }
  if (provider === 'nvidia') {
    const key = process.env.NVIDIA_API_KEY?.trim() ?? '';
    const res = await fetch('https://integrate.api.nvidia.com/v1/models', {
      headers: key ? { Authorization: `Bearer ${key}` } : undefined,
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) throw new Error(`NVIDIA /models HTTP ${res.status}`);
    const { data = [] } = await res.json();
    return data.map((m) => ({
      id: m.id,
      contextLength: null,
      promptPerMillionUsd: null,
      completionPerMillionUsd: null,
      isFree: false,
      supportsTools: true,
    }));
  }
  if (provider === 'google') {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
    if (!key) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
      { signal: AbortSignal.timeout(12_000) },
    );
    if (!res.ok) throw new Error(`Google AI /models HTTP ${res.status}`);
    const { models = [] } = await res.json();
    return models.map((m) => ({
      id: m.name.replace(/^models\//, ''),
      contextLength: m.inputTokenLimit ?? null,
      promptPerMillionUsd: null,
      completionPerMillionUsd: null,
      isFree: false,
      supportsTools: true,
    }));
  }
  throw new Error(`Unsupported provider "${provider}". Use openrouter | nvidia | google.`);
}

const [allModels, quota] = await Promise.all([
  fetchModels(),
  showQuota || provider === 'openrouter' ? fetchOpenRouterQuota().catch((e) => ({ error: e.message })) : null,
]);

const filtered = allModels
  .filter((m) => (!freeOnly || m.isFree))
  .filter((m) => (!toolsOnly || m.supportsTools))
  .filter((m) => (!search || m.id.toLowerCase().includes(search)))
  .sort((a, b) => a.id.localeCompare(b.id));

if (asJson) {
  console.log(JSON.stringify({ provider, total: filtered.length, quota, models: filtered.slice(0, limit) }, null, 2));
  process.exit(0);
}

if (quota && (showQuota || provider === 'openrouter')) {
  console.log('=== OpenRouter API Key Quota ===');
  if (quota.error) console.log(`  error: ${quota.error}`);
  else if (!quota.configured) console.log('  OPENROUTER_API_KEY: not set');
  else {
    console.log(`  label=${quota.label ?? '(none)'} free_tier=${quota.isFreeTier}`);
    console.log(
      `  usage=$${quota.usageUsd.toFixed(4)} daily=${quota.usageDailyUsd ?? 'n/a'} monthly=${quota.usageMonthlyUsd ?? 'n/a'}`,
    );
    console.log(
      `  limit=${quota.limitUsd === null ? 'unlimited' : `$${quota.limitUsd}`} remaining=${quota.remainingUsd === null ? 'n/a' : `$${quota.remainingUsd}`}`,
    );
    if (quota.rateLimit) console.log(`  rate_limit=${quota.rateLimit.requests}/${quota.rateLimit.interval}`);
  }
  console.log('');
}

console.log(`=== ${provider} models (${filtered.length} matching; showing up to ${limit}) ===`);
for (const m of filtered.slice(0, limit)) {
  const price =
    m.promptPerMillionUsd === null
      ? 'n/a'
      : m.isFree
        ? 'FREE'
        : `$${m.promptPerMillionUsd.toFixed(2)}/$${(m.completionPerMillionUsd ?? 0).toFixed(2)} per 1M`;
  const ctx = m.contextLength ? `${Math.round(m.contextLength / 1000)}k` : 'n/a';
  console.log(`  ${m.id.padEnd(52)} ctx=${ctx.padEnd(7)} tools=${String(m.supportsTools).padEnd(6)} ${price}`);
}
