import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { resolveServerAuthOrigin } from '@/lib/funnel/auth-origin';
import { resolveSafeNext } from '@/lib/funnel/login-actions';
import { resolvePostAuthCallbackRedirect } from '@/lib/funnel/server-account-gate';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const VALID_EMAIL_OTP_TYPES: ReadonlySet<EmailOtpType> = new Set([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]);

function isEmailOtpType(raw: string | null): raw is EmailOtpType {
  return raw !== null && VALID_EMAIL_OTP_TYPES.has(raw as EmailOtpType);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicOrigin = resolveServerAuthOrigin(request);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const otpType = searchParams.get('type');
  const next = resolveSafeNext(searchParams.get('next')) ?? '/app';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const target = data.user?.id
        ? await resolvePostAuthCallbackRedirect({ userId: data.user.id, nextPath: next })
        : next;
      return NextResponse.redirect(`${publicOrigin}${target}`);
    }
  } else if (tokenHash && isEmailOtpType(otpType)) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    if (!error) {
      const target = data.user?.id
        ? await resolvePostAuthCallbackRedirect({ userId: data.user.id, nextPath: next })
        : next;
      return NextResponse.redirect(`${publicOrigin}${target}`);
    }
  }

  return NextResponse.redirect(`${publicOrigin}/login?error=auth_callback_failed`);
}
