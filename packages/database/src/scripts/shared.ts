/**
 * Shared setup for the arancel extraction scripts (PR 5).
 *
 * The extraction talks to a model through the canonical port
 * (`@tariffos/ai-client`), so the provider is a deployment decision:
 * `LLM_PROVIDER`, `LLM_BASE_URL` and `LLM_MODEL` decide it. A local model
 * (Ollama, vLLM, LM Studio) and a hosted one are the same code path.
 */
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load the env before anything reads it. Every candidate is tried, and
// dotenv does not override an already-set variable, so the first file that
// carries a key wins for that key.
for (const candidate of [
  'apps/filings/.env.local',
  '.env.local',
  'apps/agent/.env.local',
]) {
  const file = path.join(process.cwd(), '../../', candidate);
  dotenv.config({ path: file });
}

/** The consolidated arancel PDF the extractors read. */
export const PDF_PATH = path.join(process.cwd(), '../../.data/Consolidado Arancel 2026.pdf');
