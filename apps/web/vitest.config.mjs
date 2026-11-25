import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));

/**
 * Unit-test config for filings-v2. Referenced from the root vitest.config.ts
 * so package-local runs (`pnpm --filter filings-v2 test`) and the root gate
 * share one definition. `root` is resolved from this file, never from cwd.
 */
export default {
  resolve: {
    alias: {
      '@': path.resolve(root, './src'),
    },
  },
  test: {
    name: 'filings-v2',
    environment: 'jsdom',
    root,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
};
