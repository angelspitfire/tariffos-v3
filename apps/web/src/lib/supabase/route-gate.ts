const PROTECTED_PREFIXES = ['/app', '/onboarding', '/activate-plan', '/admin'] as const;
const PUBLIC_EXACT_OR_PREFIX = ['/', '/login', '/api/inngest'] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_EXACT_OR_PREFIX.some(
    (prefix) =>
      prefix !== '/' && (pathname === prefix || pathname.startsWith(`${prefix}/`)),
  );
}

export type ProxyAction =
  | { kind: 'allow' }
  | { kind: 'redirect'; destination: string };

export function resolveProxyAction(params: {
  pathname: string;
  search: string;
  hasSession: boolean;
  cloudMode: boolean;
}): ProxyAction {
  const { pathname, search, hasSession, cloudMode } = params;

  if (!cloudMode || isPublicPath(pathname) || !isProtectedPath(pathname)) {
    return { kind: 'allow' };
  }

  if (hasSession) {
    return { kind: 'allow' };
  }

  const target = encodeURIComponent(`${pathname}${search}`);
  const isOnboardingRoute = pathname === '/onboarding' || pathname.startsWith('/onboarding/');
  return {
    kind: 'redirect',
    destination: isOnboardingRoute ? `/login?mode=signup&next=${target}` : `/login?next=${target}`,
  };
}
