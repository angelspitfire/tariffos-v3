import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { isProtectedPath, resolveProxyAction } from '@/lib/supabase/route-gate';

export async function proxy(request: NextRequest) {
  const cloudMode = isCloudModeEnabled();
  const { pathname, search } = request.nextUrl;

  if (!cloudMode) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const hasSession = Boolean(data.user);

  if (isProtectedPath(pathname)) {
    const action = resolveProxyAction({
      pathname,
      search,
      hasSession,
      cloudMode,
    });
    if (action.kind === 'redirect') {
      return NextResponse.redirect(new URL(action.destination, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
