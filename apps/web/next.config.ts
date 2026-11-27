import type { NextConfig } from 'next';

const DEFAULT_LOCAL_EVE_ORIGIN = 'http://127.0.0.1:2000';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
  async rewrites() {
    // When running `pnpm dev` + `pnpm dev:eve` without `vercel dev --local`,
    // proxy same-origin /eve/* requests to the local Eve server so browser cookies
    // and NDJSON streams work without cross-origin CORS issues.
    if (process.env.NODE_ENV !== 'development' || process.env.VERCEL === '1') {
      return [];
    }
    const eveOrigin = (process.env.EVE_BASE_URL?.trim() || DEFAULT_LOCAL_EVE_ORIGIN).replace(
      /\/+$/,
      '',
    );
    return [
      {
        source: '/eve/:path*',
        destination: `${eveOrigin}/eve/:path*`,
      },
    ];
  },
};

export default nextConfig;
