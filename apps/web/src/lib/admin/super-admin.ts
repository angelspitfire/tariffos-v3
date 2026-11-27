import { prisma } from '@tariffos/database';
import { normalizePlatformRole } from './permissions';

export function isBootstrapAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.PLATFORM_ADMIN_EMAILS ?? '';
  if (!raw.trim()) return false;
  const normalized = email.trim().toLowerCase();
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .some((entry) => entry.length > 0 && entry === normalized);
}

export async function isSuperAdminUser(params: {
  userId?: string | null;
  email?: string | null;
}): Promise<boolean> {
  let resolvedEmail = params.email?.trim().toLowerCase() || null;

  if (!resolvedEmail && params.userId) {
    const membership = await prisma.membership?.findFirst({
      where: { userId: params.userId },
      select: { email: true },
    });
    resolvedEmail = membership?.email?.trim().toLowerCase() || null;
  }

  if (resolvedEmail) {
    const adminEntry = await prisma.platformAdmin?.findUnique({
      where: { email: resolvedEmail },
      select: { role: true, isActive: true },
    });
    if (adminEntry) {
      return Boolean(adminEntry.isActive && normalizePlatformRole(adminEntry.role) === 'super_admin');
    }
  }

  if (isBootstrapAdminEmail(resolvedEmail)) {
    return true;
  }

  if (params.userId) {
    const profile = await prisma.userProfile?.findUnique({
      where: { id: params.userId },
      select: { role: true },
    });
    if (normalizePlatformRole(profile?.role) === 'super_admin') {
      return true;
    }
  }

  return false;
}
