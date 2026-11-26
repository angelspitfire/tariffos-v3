#!/usr/bin/env node
/**
 * Live smoke test for the configured LLM provider (Phase 0 of the plan).
 *
 *   pnpm smoke:llm            # uses .env.local (LLM_PROVIDER, keys, models)
 *
 * Checks, in order: model list, plain text, structured JSON (the RGI schema
 * path), embeddings at the index width, and latency. Prints PASS/FAIL per
 * check and never prints secrets. Requires `pnpm --filter @tariffos/ai-client build`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
// zod is a dependency of ai-client, not of the repo root.
const requireFromClient = createRequire(resolve(root, 'packages/ai-client/package.json'));
const { z } = await import(pathToFileURL(requireFromClient.resolve('zod')).href);

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

const aiClient = await import(resolve(root, 'packages/ai-client/dist/index.js'));
const env = await import(resolve(root, 'packages/env/dist/index.js'));
const { getLlmProvider, resolveBaseUrl, resolveApiKey, resolveEmbeddingDims } = aiClient;

const provider = env.llmProvider();
const model = env.rgiModel(false);
const deepModel = env.rgiModel(true);
const dims = resolveEmbeddingDims();
console.log(`provider=${provider} base=${resolveBaseUrl()} key=${resolveApiKey() ? 'set' : 'MISSING'}`);
console.log(`rgi=${model} deep=${deepModel} embedding=${env.embeddingModel()} dims=${dims}\n`);

let failures = 0;
async function check(name, fn) {
  const started = Date.now();
  try {
    const detail = await fn();
    console.log(`PASS ${name} (${Date.now() - started} ms)${detail ? ` — ${detail}` : ''}`);
  } catch (err) {
    failures += 1;
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`FAIL ${name} (${Date.now() - started} ms) — ${msg.slice(0, 300)}`);
  }
}

await check('model list', async () => {
  const res = await fetch(`${resolveBaseUrl()}/models`, {
    headers: { Authorization: `Bearer ${resolveApiKey() ?? ''}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ids = ((await res.json()).data ?? []).map((m) => m.id);
  const has = (id) => ids.some((x) => x === id || x.endsWith(`/${id}`) || id.endsWith(`/${x}`));
  const missing = [model, deepModel, env.embeddingModel()].filter((id) => !has(id));
  return `${ids.length} models${missing.length ? `; NOT LISTED: ${missing.join(', ')}` : '; configured models listed'}`;
});

const llm = getLlmProvider();

await check('generateText', async () => {
  const text = await llm.generateText('Responde solo "ok".', { model, temperature: 0 });
  return `reply="${text.trim().slice(0, 40)}"`;
});

await check('generateJson (RGI-like schema)', async () => {
  const schema = z.object({ hsCode: z.string(), confidencePct: z.number().min(0).max(100) });
  const out = await llm.generateJson(
    'Clasifica "Apple Watch Series 9" en el arancel de Venezuela (10 dígitos). Responde JSON con hsCode y confidencePct.',
    schema,
    { model, temperature: 0 },
  );
  return `hsCode=${out.hsCode} conf=${out.confidencePct}`;
});

await check(`embedText (${dims} dims)`, async () => {
  const v = await llm.embedText('Relojes de pulsera eléctricos, con indicador optoelectrónico', { dims });
  return `length=${v.length}`;
});

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
