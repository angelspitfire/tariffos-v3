import { fileURLToPath } from 'node:url';

export default {
  test: {
    name: 'ai-client',
    environment: 'node',
    root: fileURLToPath(new URL('.', import.meta.url)),
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globals: false,
  },
};
