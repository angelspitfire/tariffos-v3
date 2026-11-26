import { describe, it, expect } from 'vitest';
import { checkRepoHygiene } from '../../../../scripts/lib/repo-guardrails.mjs';

describe('checkRepoHygiene', () => {
  it('passes for clean TypeScript source files and allowed root config/script files', () => {
    const files = [
      'apps/web/src/app/page.tsx',
      'apps/web/src/lib/utils.ts',
      'apps/web/postcss.config.mjs',
      'apps/web/vitest.config.mjs',
      'packages/agent/src/index.ts',
      'packages/database/src/generated/client/index.js',
      'agent/agent.ts',
      'scripts/check.mjs',
    ];

    expect(checkRepoHygiene(files)).toEqual([]);
  });

  it('flags JavaScript source files inside apps/*/src, packages/*/src, and agent/', () => {
    const files = [
      'apps/web/src/components/Foo.js',
      'apps/web/src/components/Bar.jsx',
      'packages/agent/src/helper.mjs',
      'packages/shared-types/src/legacy.cjs',
      'agent/tools/search.js',
    ];

    const issues = checkRepoHygiene(files);
    expect(issues).toHaveLength(5);
    expect(issues.every((i) => i.code === 'forbidden_js_source' && i.level === 'error')).toBe(true);
  });

  it('flags tracked generated or runtime artifact directories (.eve, .next, dist, node_modules, .vercel, coverage)', () => {
    const files = [
      'apps/web/.eve/dev-runtime/snapshots/abc/module.mjs',
      '.eve/dev-hosts/host.mjs',
      'apps/web/.next/server/app/page.js',
      'packages/agent/dist/index.js',
      'apps/web/node_modules/pkg/index.js',
      'apps/web/.vercel/project.json',
      'coverage/index.html',
    ];

    const issues = checkRepoHygiene(files);
    expect(issues).toHaveLength(7);
    expect(issues.every((i) => i.code === 'tracked_artifact' && i.level === 'error')).toBe(true);
  });

  it('normalizes Windows backslash paths', () => {
    const issues = checkRepoHygiene([
      'apps\\web\\.eve\\dev-runtime\\bundle.mjs',
      'apps\\web\\src\\bad.js',
    ]);

    expect(issues.map((i) => i.code)).toEqual(['tracked_artifact', 'forbidden_js_source']);
  });
});
