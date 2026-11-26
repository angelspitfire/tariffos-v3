import { execSync } from 'node:child_process';
import { withEve } from 'eve/vercel';

// Build workspace packages once before Vercel compiles config and spawns parallel service builds.
if (process.env.VERCEL) {
  execSync('pnpm build:packages', { stdio: 'inherit' });
}

export default await withEve({
  services: {
    web: {
      framework: 'nextjs',
      root: 'apps/web',
      buildCommand: 'pnpm build',
    },
  },
  routes: [
    {
      src: '^(.*)$',
      destination: { type: 'service', service: 'web' },
    },
  ],
});
