import { withEve } from 'eve/vercel';

export default await withEve({
  installCommand: 'pnpm install --frozen-lockfile && pnpm build:packages',
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
