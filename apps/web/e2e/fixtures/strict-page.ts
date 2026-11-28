import { test as base, expect } from '@playwright/test';

const ALLOWED_CONSOLE_NOISE_PATTERNS: readonly RegExp[] = [
  /Download the React DevTools/i,
];

function isAllowedConsoleError(text: string): boolean {
  return ALLOWED_CONSOLE_NOISE_PATTERNS.some((pattern) => pattern.test(text));
}

export const test = base.extend({});

test.beforeEach(async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const serverErrors: string[] = [];

  page.on('pageerror', (err) => {
    pageErrors.push(err.message || String(err));
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!isAllowedConsoleError(text)) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('response', (res) => {
    const url = res.url();
    if ((url.includes('/api/') || url.includes('/eve/')) && res.status() >= 500) {
      serverErrors.push(`HTTP ${res.status()} ${url}`);
    }
  });

  (page as unknown as { __tariffosStrictErrors?: unknown }).__tariffosStrictErrors = {
    pageErrors,
    consoleErrors,
    serverErrors,
  };
});

test.afterEach(async ({ page }) => {
  const bucket = (
    page as unknown as {
      __tariffosStrictErrors?: {
        pageErrors: string[];
        consoleErrors: string[];
        serverErrors: string[];
      };
    }
  ).__tariffosStrictErrors;
  if (!bucket) return;

  expect(bucket.pageErrors, `Uncaught pageerrors:\n${bucket.pageErrors.join('\n')}`).toEqual([]);
  expect(bucket.consoleErrors, `Console errors:\n${bucket.consoleErrors.join('\n')}`).toEqual([]);
  expect(bucket.serverErrors, `Server 5xx responses:\n${bucket.serverErrors.join('\n')}`).toEqual([]);
});

export { expect };
