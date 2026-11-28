#!/usr/bin/env node
/**
 * Read-only HTTP Smoke Gate for TariffOS v3 (local dev or production URL).
 *
 * Usage:
 *   pnpm smoke:e2e
 *   pnpm smoke:e2e -- --url https://tariffos.app
 *   node scripts/smoke-e2e.mjs --url https://tariffos.app --strict
 */

const args = process.argv.slice(2);
const urlFlagIdx = args.indexOf('--url');
const strictMode = args.includes('--strict');
const rawBase =
  (urlFlagIdx >= 0 && args[urlFlagIdx + 1]) ||
  process.env.SMOKE_BASE_URL ||
  'http://localhost:3003';
const baseUrl = rawBase.replace(/\/+$/, '');
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();

console.log(`TariffOS HTTP Smoke E2E -> ${baseUrl} (strict=${strictMode})\n`);

let failures = 0;
let warnings = 0;

async function runCheck(name, fn) {
  const started = Date.now();
  try {
    const out = await fn();
    const ms = Date.now() - started;
    if (out?.warn) {
      warnings += 1;
      console.log(`WARN  ${name} (${ms} ms) — ${out.detail}`);
    } else {
      console.log(`PASS  ${name} (${ms} ms)${out?.detail ? ` — ${out.detail}` : ''}`);
    }
  } catch (err) {
    failures += 1;
    const ms = Date.now() - started;
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`FAIL  ${name} (${ms} ms) — ${msg}`);
  }
}

async function fetchTimed(path, init = {}) {
  const headers = new Headers(init.headers ?? {});
  if (bypassSecret) {
    headers.set('x-vercel-protection-bypass', bypassSecret);
  }
  return fetch(`${baseUrl}${path}`, {
    signal: AbortSignal.timeout(12000),
    ...init,
    headers,
  });
}

await runCheck('GET / (Landing & B2B pricing)', async () => {
  const res = await fetchTimed('/');
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  if (!html.includes('TariffOS')) throw new Error('Missing "TariffOS" text');
  if (!html.includes('Piloto Operativo')) throw new Error('Missing "Piloto Operativo" plan');
  return { detail: 'HTTP 200, pricing rendered' };
});

await runCheck('GET /ve (Venezuela country landing)', async () => {
  const res = await fetchTimed('/ve');
  if (res.status === 404 && !strictMode) {
    return { warn: true, detail: 'HTTP 404 (pending deploy of /ve landing)' };
  }
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  if (!html.includes('4.944')) throw new Error('Missing Decreto 4.944 reference on /ve');
  return { detail: 'HTTP 200, localized VE landing rendered' };
});

await runCheck('GET /privacidad (Security & Privacy page)', async () => {
  const res = await fetchTimed('/privacidad');
  if (res.status === 404 && !strictMode) {
    return { warn: true, detail: 'HTTP 404 (pending deploy of /privacidad)' };
  }
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  if (!html.includes('Seguridad y Privacidad')) throw new Error('Missing privacy heading');
  return { detail: 'HTTP 200' };
});

await runCheck('GET /login (Auth surface)', async () => {
  const res = await fetchTimed('/login');
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  if (!html.includes('Inicia sesión en TariffOS')) throw new Error('Missing login heading');
  return { detail: 'HTTP 200' };
});

await runCheck('GET /activate-plan (Session gate redirect)', async () => {
  const res = await fetchTimed('/activate-plan', { redirect: 'manual' });
  const loc = res.headers.get('location') ?? '';
  if (![302, 303, 307, 308].includes(res.status) || !loc.includes('/login')) {
    throw new Error(`Expected redirect to /login, got HTTP ${res.status} (${loc || 'no location'})`);
  }
  return { detail: `HTTP ${res.status} -> ${loc}` };
});

await runCheck('GET /admin/billing (Admin RBAC redirect)', async () => {
  const res = await fetchTimed('/admin/billing', { redirect: 'manual' });
  const loc = res.headers.get('location') ?? '';
  if (![302, 303, 307, 308].includes(res.status) || !loc.includes('/login')) {
    throw new Error(`Expected redirect to /login, got HTTP ${res.status} (${loc || 'no location'})`);
  }
  return { detail: `HTTP ${res.status} -> ${loc}` };
});

await runCheck('GET /app (Workspace session redirect)', async () => {
  const res = await fetchTimed('/app', { redirect: 'manual' });
  const loc = res.headers.get('location') ?? '';
  if (![302, 303, 307, 308].includes(res.status) || !loc.includes('/login')) {
    throw new Error(`Expected redirect to /login, got HTTP ${res.status} (${loc || 'no location'})`);
  }
  return { detail: `HTTP ${res.status} -> ${loc}` };
});

await runCheck('GET /samples/dictamen-ejemplo-tariffos.pdf', async () => {
  const res = await fetchTimed('/samples/dictamen-ejemplo-tariffos.pdf');
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/pdf')) throw new Error(`Unexpected content-type: ${ct}`);
  return { detail: 'HTTP 200 application/pdf' };
});

await runCheck('GET /api/plans/public (Public catalog)', async () => {
  const res = await fetchTimed('/api/plans/public');
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const count = Array.isArray(json.plans) ? json.plans.length : 0;
  if (count < 3) throw new Error(`Expected >= 3 plans, got ${count}`);
  return { detail: `${count} plans` };
});

await runCheck('GET /api/exchange-rates/latest (BCV rates)', async () => {
  const res = await fetchTimed('/api/exchange-rates/latest');
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const usd = Number(
    json.rates?.['USD/VES']?.rate ?? json.usdRate ?? json.rates?.USD ?? json.rate ?? 0,
  );
  if (!Number.isFinite(usd) || usd <= 0) throw new Error('Invalid USD rate payload');
  return { detail: `USD/VES=${usd}` };
});

await runCheck('GET /api/inngest (Serve endpoint)', async () => {
  const res = await fetchTimed('/api/inngest');
  const handled = res.headers.get('x-inngest-sdk-handled') === 'true';
  if (res.status === 200) return { detail: 'HTTP 200 (dev/open)' };
  if (res.status === 401 && handled) return { detail: 'HTTP 401 (INNGEST_SIGNING_KEY verified)' };
  throw new Error(`Unexpected status HTTP ${res.status}`);
});

await runCheck('POST /api/batch/upload-url (Auth guard)', async () => {
  const res = await fetchTimed('/api/batch/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: 'smoke.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1024,
    }),
  });
  if (res.status === 404 && !strictMode) {
    return { warn: true, detail: 'HTTP 404 (pending deploy of latest commit)' };
  }
  if (res.status !== 401 && res.status !== 403) {
    throw new Error(`Expected 401/403 without auth, got HTTP ${res.status}`);
  }
  return { detail: `HTTP ${res.status} unauthenticated rejected` };
});

await runCheck('GET /api/workspace/threads (Auth guard)', async () => {
  const res = await fetchTimed('/api/workspace/threads');
  if (res.status !== 401 && res.status !== 403) {
    throw new Error(`Expected 401/403 without auth, got HTTP ${res.status}`);
  }
  return { detail: `HTTP ${res.status} unauthenticated rejected` };
});

console.log(`\nSummary: failures=${failures}, warnings=${warnings}`);
process.exit(failures === 0 ? 0 : 1);
