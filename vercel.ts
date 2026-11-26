import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { withEve } from 'eve/vercel';

// Reset per-deployment stamp/lock quickly (<1ms) so parallel service builds
// (`web` and `eve`) coordinate a single `pnpm build:packages` run without
// exceeding Vercel's 10s config loader timeout.
const vercelDir = join(process.cwd(), '.vercel');
rmSync(join(vercelDir, '.packages-built.stamp'), { force: true });
rmSync(join(vercelDir, '.packages-build.lock'), { recursive: true, force: true });

const config = await withEve({
  services: {
    web: {
      framework: 'nextjs',
      root: 'apps/web',
      buildCommand: 'node ../../scripts/ensure-packages-built.mjs && pnpm build',
    },
  },
  routes: [
    {
      src: '^(.*)$',
      destination: { type: 'service', service: 'web' },
    },
  ],
});

const eveService = config.services.eve;
const services = eveService?.buildCommand
  ? {
      ...config.services,
      eve: {
        ...eveService,
        buildCommand: `node ../../../scripts/ensure-packages-built.mjs && ${eveService.buildCommand}`,
      },
    }
  : config.services;

export default {
  ...config,
  services,
};
