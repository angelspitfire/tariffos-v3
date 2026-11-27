import { prisma } from '@tariffos/database';
import type { AdminPermission, PlatformRole } from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { hasAdminPermission, isPlatformAdminRole, normalizePlatformRole } from './permissions';
import { isBootstrapAdminEmail } from './super-admin';

export interface PlatformAdminContext {
  userId: string;
  userEmail: string | null;
  role: PlatformRole;
}

export type PlatformAdminAuthResult =
  | { ok: true; context: PlatformAdminContext }
  | { ok: false; status: 401 | 403; error: string };

export async function resolvePlatformAdminContext(
  requiredPermission: AdminPermission = 'admin:read',
): Promise<PlatformAdminAuthResult> {
  if (!isCloudModeEnabled()) {
    return {
      ok: true,
      context: {
        userId: 'offline-admin',
        userEmail: 'admin@tariffos.app',
        role: 'super_admin',
      },
    };
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return { ok: false, status: 401, error: 'Authentication required' };
  }

  let role: PlatformRole = 'user';
  let hasExplicitAdminEntry = false;

  if (user.email) {
    const adminEntry = await prisma.platformAdmin.findUnique({
      where: { email: user.email.trim().toLowerCase() },
      select: { role: true, isActive: true },
    });
    if (adminEntry) {
      hasExplicitAdminEntry = true;
      if (!adminEntry.isActive) {
        return {
          ok: false,
          status: 403,
          error: 'Platform administrator privileges required',
        };
      }
      role = normalizePlatformRole(adminEntry.role);
    }
  }

  if (!hasExplicitAdminEntry && role === 'user') {
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    role = normalizePlatformRole(profile?.role);
  }

  if (!hasExplicitAdminEntry && role === 'user' && isBootstrapAdminEmail(user.email)) {
    role = 'super_admin';
  }

  if (!isPlatformAdminRole(role)) {
    return {
      ok: false,
      status: 403,
      error: 'Platform administrator privileges required',
    };
  }

  if (!hasAdminPermission(role, requiredPermission)) {
    return {
      ok: false,
      status: 403,
      error: `Insufficient permissions for ${requiredPermission}`,
    };
  }

  return {
    ok: true,
    context: {
      userId: user.id,
      userEmail: user.email ?? null,
      role,
    },
  };
}
