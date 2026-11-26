import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { resolveServerAuthOrigin } from '@/lib/funnel/auth-origin';
import { resolveSafeNext } from '@/lib/funnel/login-actions';
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
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${publicOrigin}${next}`);
    }
  } else if (tokenHash && isEmailOtpType(otpType)) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    if (!error) {
      return NextResponse.redirect(`${publicOrigin}${next}`);
    }
  }

  return NextResponse.redirect(`${publicOrigin}/login?error=auth_callback_failed`);
}
