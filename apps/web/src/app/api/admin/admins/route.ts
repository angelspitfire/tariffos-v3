import { getSuperAdminEmailProviderStatus, prisma } from '@tariffos/database';
import type { PlatformAdminAccountRole, PlatformAdminRecord } from '@tariffos/shared-types';
import { requireAdmin } from '@/lib/admin/http-helpers';
import { getOfflineAdminState } from '@/lib/admin/offline-store';
import { normalizePlatformRole } from '@/lib/admin/permissions';
import { isCloudModeEnabled } from '@/lib/runtime-config';

const CLI_ONLY_RESPONSE = {
  error:
    'La creación y revocación de administradores solo está permitida desde la consola local (pnpm admin:users).',
  code: 'CLI_ONLY_ADMIN_MANAGEMENT',
} as const;

function toAccountRole(raw: string): PlatformAdminAccountRole {
  const role = normalizePlatformRole(raw);
  return role === 'user' ? 'support' : role;
}

function mapAdminRow(row: {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  notes?: string | null;
  createdBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}): PlatformAdminRecord {
  return {
    id: row.id,
    email: row.email,
    role: toAccountRole(row.role),
    isActive: row.isActive,
    notes: row.notes ?? null,
    createdBy: row.createdBy ?? null,
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : new Date().toISOString(),
  };
}

export async function GET(): Promise<Response> {
  const guard = await requireAdmin('admins:manage');
  if (!guard.ok) return guard.response;

  const emailProvider = getSuperAdminEmailProviderStatus();
  if (!isCloudModeEnabled()) {
    return Response.json(
      { mode: 'offline', admins: getOfflineAdminState().platformAdmins, emailProvider },
      { status: 200 },
    );
  }

  const rows = await prisma.platformAdmin.findMany({ orderBy: { createdAt: 'asc' } });
  return Response.json(
    { mode: 'cloud', admins: rows.map(mapAdminRow), emailProvider },
    { status: 200 },
  );
}

export async function POST(): Promise<Response> {
  const guard = await requireAdmin('admins:manage');
  if (!guard.ok) return guard.response;
  return Response.json(CLI_ONLY_RESPONSE, { status: 403 });
}

export async function PATCH(): Promise<Response> {
  const guard = await requireAdmin('admins:manage');
  if (!guard.ok) return guard.response;
  return Response.json(CLI_ONLY_RESPONSE, { status: 403 });
}
