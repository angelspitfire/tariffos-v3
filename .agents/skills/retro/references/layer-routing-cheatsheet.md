# Layer Routing Cheatsheet & Implementation Patterns

Reference patterns for implementing defenses identified during a `retro` session.

---

## 1. Layer 1 — Static Harness & Invariant Patterns (`< 5s`)

### 1.1 Promote Critical Lint Rules to `"error"` (`.oxlintrc.jsonc`)
When a linter runs with `--quiet`, `"warn"` rules are invisible. Explicitly promote bug-causing rules:
```jsonc
{
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/role-has-required-aria-props": "error"
  }
}
```

### 1.2 Architectural Repo Guardrails (`scripts/lib/repo-guardrails.mjs`)
- **Single Modal Primitive Enforcement:** Ban raw `role="dialog"` or `aria-modal` outside the canonical Radix dialog wrapper so focus trapping, `Escape` stacking, and toast `onPointerDownOutside` exemptions cannot regress.
- **Duplicate CSS Custom Property Check:** Parse token stylesheets (`tokens.css`) per block (`:root`, `.dark`, `@theme`) and fail if any `--token-name` is declared twice in the same scope.

### 1.3 Cartesian State-Machine Invariant Test (Vitest)
Instead of testing 4 hand-picked auth/routing scenarios, test the full Cartesian product of inputs:
```ts
const ROLES = [false, true] as const;
const MEMBERSHIPS = [false, true] as const;
const BILLING_STATES = ['ACTIVE', 'PAST_DUE', 'TRIALING', null] as const;
const PENDING_PAYMENTS = [false, true] as const;
const ROUTES = ['login', 'onboarding', 'activate-plan', 'app', 'admin'] as const;

it('never self-redirects and converges in at most 1 hop across all states', () => {
  for (const isPlatformAdmin of ROLES) {
    for (const hasMembership of MEMBERSHIPS) {
      for (const billingStatus of BILLING_STATES) {
        for (const hasPendingPayment of PENDING_PAYMENTS) {
          for (const route of ROUTES) {
            const state = { isPlatformAdmin, hasMembership, billingStatus, hasPendingPayment };
            const next = resolveAccountRedirect({ ...state, route });
            expect(next).not.toBe(`/${route}`);
            if (next !== null) {
              const nextRoute = next.replace(/^\//, '') as (typeof ROUTES)[number];
              expect(resolveAccountRedirect({ ...state, route: nextRoute })).toBeNull();
            }
          }
        }
      }
    }
  }
});
```

### 1.4 Non-Destructive Deploy Build Check (`NEXT_DIST_DIR`)
Configure `next.config.ts` with `distDir: process.env.NEXT_DIST_DIR?.trim() || '.next'` and run build checks in `.next-check`, cleaning `.next-check` and stripping injected `.next-check/types/**/*.ts` entries from `tsconfig.json` inside a `finally` block so running `next dev` servers never crash.

---

## 2. Layer 2a — Deterministic Playwright Patterns (`< 45s`, `$0` LLM)

### 2.1 Zero-Tolerance Browser Telemetry Fixture (`e2e/fixtures/strict-page.ts`)
Wrap `@playwright/test`'s `page` fixture so **every** E2E spec automatically fails on silent runtime errors:
```ts
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });
    page.on('response', (res) => {
      const url = res.url();
      if (res.status() >= 500 && (url.includes('/api/') || url.includes('/eve/'))) {
        errors.push(`HTTP ${res.status()} on ${url}`);
      }
    });
    await use(page);
    expect(errors, `Unexpected runtime errors:\n${errors.join('\n')}`).toEqual([]);
  },
});
```

### 2.2 High-Signal UI Assertions That Catch JSDOM Blind Spots
- **Overlay / Toast Hit-Testing:** Open a modal, trigger a destructive action with undo toast, and call `await page.getByRole('button', { name: /deshacer|undo/i }).click()` *without* `{ force: true }` — Chromium's actionability check verifies the toast is not occluded by Radix `pointer-events: none` and does not accidentally dismiss the modal.
- **Mobile Viewport & Overflow (`390×844`):**
  ```ts
  await expect(mobileNav).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
  ```
- **Row Action `stopPropagation`:** Focus/select row 1, click an inline action button (e.g., `Copy`) on row 2, and assert row 1 remains the active inspector selection.

---

## 3. Layer 2b — Preview & Production CI/CD Release Gates

1. **Gate 1 — PR CI (`.github/workflows/ci.yml`):**
   - `pnpm check` + `pnpm check:deploy` + deterministic `pnpm test:e2e` (`page.route` SSE mocks).
2. **Gate 2 — Preview Deployment Gate (`on: deployment_status`, `environment == 'Preview'`):**
   - Authenticate automation requests with `x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET` (and `x-vercel-set-bypass-cookie: true` in Playwright).
   - Provision disposable `@*.internal` accounts (hard-guarded by email suffix check), verify HTTPS Auth SSR routing across roles, verify cross-tenant `403` on private storage buckets, execute **1 real end-to-end agent turn**, and run full relational + Auth cleanup in an `if: always()` step.
3. **Gate 3 — Production Post-Deploy Smoke (`on: deployment_status`, `environment == 'Production'`):**
   - **Strictly 100% Read-Only:** public pages, `/login`, unauthenticated `307/401` guards, health/rates endpoints, and headless `0 console.error` check. Never create or delete records in production during automated smoke checks.
