import { withEve } from 'eve/vercel';

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
