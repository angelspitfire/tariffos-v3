import { buildAuthCallbackUrl } from '@/lib/funnel/auth-origin';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const MAX_LIST_PAGES = 20;
const LIST_PER_PAGE = 200;

export async function resolveOrInviteCloudUser(
  email: string,
  fullName: string,
  sendInviteEmail: boolean,
  publicOrigin: string,
): Promise<{ userId: string; invited: boolean }> {
  const supabaseAdmin = createSupabaseAdminClient();
  if (sendInviteEmail) {
    const inviteRes = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: buildAuthCallbackUrl(publicOrigin, '/app'),
    });
    if (!inviteRes.error && inviteRes.data.user) {
      return { userId: inviteRes.data.user.id, invited: true };
    }
  }

  const createRes = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: !sendInviteEmail,
    user_metadata: { full_name: fullName },
  });
  if (!createRes.error && createRes.data.user) {
    return { userId: createRes.data.user.id, invited: false };
  }

  const normalizedTarget = email.toLowerCase();
  for (let page = 1; page <= MAX_LIST_PAGES; page++) {
    const listRes = await supabaseAdmin.auth.admin.listUsers({ page, perPage: LIST_PER_PAGE });
    if (listRes.error) break;
    const users = listRes.data?.users ?? [];
    const existing = users.find((u) => u.email?.toLowerCase() === normalizedTarget);
    if (existing) {
      return { userId: existing.id, invited: false };
    }
    if (users.length < LIST_PER_PAGE) break;
  }

  throw new Error(
    createRes.error?.message ?? 'No se pudo aprovisionar el usuario en Supabase Auth',
  );
}
