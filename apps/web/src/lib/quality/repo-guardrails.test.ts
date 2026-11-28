import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  checkDuplicateCssTokens,
  checkForbiddenRawDialogs,
  checkRepoHygiene,
} from '../../../../../scripts/lib/repo-guardrails.mjs';

describe('repo-guardrails', () => {
  it('flags .next-check, .next-e2e, playwright-report, and test-results as forbidden tracked artifacts', () => {
    const issues = checkRepoHygiene([
      'apps/web/src/app/page.tsx',
      'apps/web/.next-check/server/app.js',
      'apps/web/.next-e2e/build-manifest.json',
      'apps/web/playwright-report/index.html',
      'apps/web/test-results/run.zip',
    ]);

    expect(issues.map((i) => i.code)).toEqual([
      'tracked_artifact',
      'tracked_artifact',
      'tracked_artifact',
      'tracked_artifact',
    ]);
  });

  it('rejects raw role="dialog" or aria-modal in workspace components outside WorkspaceDialogShell.tsx', () => {
    const ok = checkForbiddenRawDialogs([
      {
        file: 'apps/web/src/components/workspace/atoms/WorkspaceDialogShell.tsx',
        content: '<div role="dialog" aria-modal="true" />',
      },
      {
        file: 'apps/web/src/components/workspace/organisms/SkuCatalogModal.test.tsx',
        content: 'expect(screen.getByRole("dialog")).toBeInTheDocument(); // role="dialog"',
      },
    ]);
    expect(ok).toEqual([]);

    const bad = checkForbiddenRawDialogs([
      {
        file: 'apps/web/src/components/workspace/organisms/RogueModal.tsx',
        content: '<div role="dialog" aria-modal="true">Oops</div>',
      },
    ]);
    expect(bad).toHaveLength(1);
    expect(bad[0]?.code).toBe('forbidden_raw_dialog');
  });

  it('detects duplicate CSS custom properties inside the same block while allowing dark/@media overrides', () => {
    const tokensCss = readFileSync(
      resolve(process.cwd(), 'src/app/tokens.css'),
      'utf8',
    );
    expect(checkDuplicateCssTokens('apps/web/src/app/tokens.css', tokensCss)).toEqual([]);

    const validOverrides = `
      :root { --accent-brand: blue; --gutter: 64px; }
      .dark { --accent-brand: skyblue; }
      @media (max-width: 60rem) { :root { --gutter: 24px; } }
    `;
    expect(checkDuplicateCssTokens('valid.css', validOverrides)).toEqual([]);

    const duplicated = `
      /* --surface-app ignored in comment */
      :root {
        --surface-app: white;
        --ink-primary: black;
        /* --surface-app: gray; */
        --surface-app: offwhite;
      }
    `;
    const issues = checkDuplicateCssTokens('dup.css', duplicated);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe('duplicate_css_token');
    expect(issues[0]?.message).toContain('--surface-app');
  });
});
