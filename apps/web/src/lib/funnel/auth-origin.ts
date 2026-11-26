const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]', '::1', '0.0.0.0']);
const FALLBACK_PRODUCTION_ORIGIN = 'https://tariffos.app';

function normalizeOriginCandidate(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    return parsed.origin;
  } catch {
    return null;
  }
}

export function isLoopbackOrigin(urlOrOrigin: string): boolean {
  try {
    const parsed = new URL(urlOrOrigin);
    return LOOPBACK_HOSTNAMES.has(parsed.hostname.toLowerCase());
  } catch {
    return true;
  }
}

function readConfiguredPublicOrigin(): string | null {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
  ];
  for (const candidate of candidates) {
    const normalized = normalizeOriginCandidate(candidate);
    if (normalized && !isLoopbackOrigin(normalized)) {
      return normalized;
    }
  }
  return null;
}

export function resolveBrowserAuthOrigin(
  windowOrigin: string | undefined = typeof window !== 'undefined' ? window.location.origin : undefined,
): string {
  const normalizedWindow = normalizeOriginCandidate(windowOrigin);
  if (normalizedWindow && !isLoopbackOrigin(normalizedWindow)) {
    return normalizedWindow;
  }
  const configured = readConfiguredPublicOrigin();
  if (configured) {
    return configured;
  }
  if (normalizedWindow && process.env.NODE_ENV === 'development') {
    return normalizedWindow;
  }
  return FALLBACK_PRODUCTION_ORIGIN;
}

export function resolveServerAuthOrigin(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  if (forwardedHost) {
    const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
    const forwardedOrigin = normalizeOriginCandidate(`${forwardedProto}://${forwardedHost}`);
    if (forwardedOrigin && !isLoopbackOrigin(forwardedOrigin)) {
      return forwardedOrigin;
    }
  }

  const requestOrigin = normalizeOriginCandidate(request.url);
  if (requestOrigin && !isLoopbackOrigin(requestOrigin)) {
    return requestOrigin;
  }

  const configured = readConfiguredPublicOrigin();
  if (configured) {
    return configured;
  }

  if (requestOrigin && process.env.NODE_ENV === 'development') {
    return requestOrigin;
  }

  return FALLBACK_PRODUCTION_ORIGIN;
}

export function sanitizeNextPath(raw: string | null | undefined, fallback = '/app'): string {
  if (!raw) return fallback;
  return raw.startsWith('/') && !raw.startsWith('//') ? raw : fallback;
}

export function buildAuthCallbackUrl(origin: string, nextPath: string): string {
  const cleanOrigin = normalizeOriginCandidate(origin) ?? FALLBACK_PRODUCTION_ORIGIN;
  const safeNext = sanitizeNextPath(nextPath, '/app');
  return `${cleanOrigin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}
