import type { SessionAuthContext } from 'eve/context';

export interface ParsedCookie {
  readonly name: string;
  readonly value: string;
}

/**
 * Parses an HTTP Cookie header into `{ name, value }` pairs, preserving `=`
 * characters inside cookie values and empty values.
 */
export function parseCookieHeader(header: string | null): ParsedCookie[] {
  if (!header || !header.trim()) {
    return [];
  }

  const parsed: ParsedCookie[] = [];
  for (const segment of header.split(';')) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx <= 0) continue;
    const name = trimmed.slice(0, eqIdx).trim();
    if (!name) continue;
    parsed.push({
      name,
      value: trimmed.slice(eqIdx + 1).trim(),
    });
  }
  return parsed;
}

function toAuthContext(user: { id: string; email?: string | null }): SessionAuthContext {
  return {
    authenticator: 'supabase',
    principalId: user.id,
    principalType: 'user',
    attributes: user.email ? { email: user.email } : {},
  };
}

function extractBearerToken(authorization: string | null): string | null {
  if (!authorization) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match?.[1]?.trim() || null;
}

/**
 * Authenticates incoming Eve channel requests via Supabase session cookies
 * or `Authorization: Bearer <jwt>` tokens.
 */
export function createSupabaseChannelAuth(): (
  req: Request,
) => Promise<SessionAuthContext | null> {
  return async (req: Request): Promise<SessionAuthContext | null> => {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL)?.trim();
    const anonKey = (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.SUPABASE_ANON_KEY
    )?.trim();

    if (!url || !anonKey) {
      return null;
    }

    const cookies = parseCookieHeader(req.headers.get('cookie'));
    const bearerToken = extractBearerToken(req.headers.get('authorization'));
    if (cookies.length === 0 && !bearerToken) {
      return null;
    }

    if (cookies.length > 0) {
      const { createServerClient } = await import('@supabase/ssr');
      const supabase = createServerClient(url, anonKey, {
        cookies: {
          getAll: () => cookies,
          setAll: () => {},
        },
      });
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        return toAuthContext(data.user);
      }
    }

    if (bearerToken) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase.auth.getUser(bearerToken);
      if (!error && data.user) {
        return toAuthContext(data.user);
      }
    }

    return null;
  };
}
