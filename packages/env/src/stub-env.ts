/**
 * Deterministic environment stubbing for env tests. Each call wipes the
 * known variables before applying `vars`, so a test only sees what it sets;
 * `restoreEnv` puts back whatever was on the machine when stubbing began.
 */
const STUBBED = [
  'FOO_KEY',
  'FOO_ALT',
  'BAR_KEY',
  'GATE_KEY',
  'LLM_PROVIDER',
  'LLM_BASE_URL',
  'LLM_API_KEY',
  'LLM_MODEL',
  'VISION_MODEL',
  'EMBEDDING_BASE_URL',
  'EMBEDDING_MODEL',
  'EMBEDDING_DIMS',
  'WEB_SEARCH_PROVIDER',
  'WEB_SEARCH_SERPER_API_KEY',
  'WEB_SEARCH_SERPER_BASE_URL',
  'WEB_SEARCH_CONTEXT_API_KEY',
  'WEB_SEARCH_CONTEXT_BASE_URL',
  'WEB_SEARCH_CONTEXT_DEV_API_KEY',
  'SERPER_API_KEY',
  'CONTEXT_DEV_API_KEY',
  'WEB_SEARCH_LIMIT',
  'WEB_SEARCH_TIMEOUT_MS',
];

const saved: Record<string, string | undefined> = {};

export function stubEnv(vars: Record<string, string | undefined>): void {
  for (const k of STUBBED) {
    if (!(k in saved)) saved[k] = process.env[k];
    delete process.env[k];
  }
  for (const [k, v] of Object.entries(vars)) {
    if (!(k in saved)) saved[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

export function restoreEnv(): void {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  for (const k of Object.keys(saved)) delete saved[k];
}
