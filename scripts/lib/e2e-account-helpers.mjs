import { randomBytes } from 'node:crypto';

export const E2E_INTERNAL_DOMAIN = '@tariffos.internal';
export const E2E_EMAIL_PATTERN = /^e2e\.[a-z0-9._-]+@tariffos\.internal$/i;

/**
 * Normalizes a CI run identifier into a safe email local-part fragment.
 */
export function sanitizeRunId(raw) {
  const normalized = String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!normalized || !/[a-z0-9]/.test(normalized)) {
    throw new Error('runId must contain at least one alphanumeric character.');
  }
  return normalized.slice(0, 48);
}

/**
 * Hard isolation guard: aborts unless email belongs to `e2e.*@tariffos.internal`.
 */
export function assertE2EEmail(email) {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (!normalized.endsWith(E2E_INTERNAL_DOMAIN)) {
    throw new Error(`Refusing non-internal E2E email (${normalized}): domain must be ${E2E_INTERNAL_DOMAIN}`);
  }
  if (!normalized.startsWith('e2e.')) {
    throw new Error(`Refusing E2E email (${normalized}): local part must start with "e2e."`);
  }
  if (!E2E_EMAIL_PATTERN.test(normalized)) {
    throw new Error(`Invalid E2E email format: ${normalized}`);
  }
  return normalized;
}

/**
 * Constructs a verified `e2e.run-<id>@tariffos.internal` address for ephemeral runs.
 */
export function buildE2EEmail(runId) {
  const safeId = sanitizeRunId(runId);
  return assertE2EEmail(`e2e.run-${safeId}${E2E_INTERNAL_DOMAIN}`);
}

/**
 * Generates a high-entropy password suitable for ephemeral Supabase Auth accounts.
 */
export function generateE2EPassword() {
  return `TfE2e!${randomBytes(18).toString('base64url')}9a`;
}
