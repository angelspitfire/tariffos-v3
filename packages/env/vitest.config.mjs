import { fileURLToPath } from 'node:url';

/**
 * Unit-test config for @tariffos/env. Referenced from the root
 * vitest.config.ts so package-local runs (`pnpm --filter @tariffos/env test`)
 * and the root gate share one definition. `root` is resolved from this file,
 * never from cwd.
 */
export default {
  test: {
    name: 'env',
    environment: 'node',
    root: fileURLToPath(new URL('.', import.meta.url)),
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globals: false,
  },
};
