import type { AdminAuditClient } from './admin-audit';
import { recordAdminAudit } from './admin-audit';

export const VALID_PLATFORM_ADMIN_ROLES = ['super_admin', 'ops_billing', 'support'] as const;
export type PlatformAdminRole = (typeof VALID_PLATFORM_ADMIN_ROLES)[number];

export interface PlatformAdminRow {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  notes?: string | null;
  createdBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlatformAdminClient extends AdminAuditClient {
  platformAdmin: {
    upsert: (args: {
      where: { email: string };
      update: { role: string; isActive: boolean; notes?: string | null };
      create: {
        email: string;
        role: string;
        isActive: boolean;
        notes?: string | null;
        createdBy?: string | null;
      };
    }) => Promise<PlatformAdminRow>;
    findUnique: (args: {
      where: { email: string };
      select?: { id?: boolean; email?: boolean; role?: boolean; isActive?: boolean };
    }) => Promise<Partial<PlatformAdminRow> | null>;
    findMany: (args: { orderBy: { createdAt: 'asc' | 'desc' } }) => Promise<PlatformAdminRow[]>;
    update: (args: {
      where: { email: string };
      data: { isActive: boolean; notes?: string | null };
    }) => Promise<PlatformAdminRow>;
  };
}

export function normalizeAdminEmail(raw: string): string {
  const normalized = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error(`Correo electrónico inválido: "${raw}"`);
  }
  return normalized;
}

export function assertPlatformAdminRole(raw: string): PlatformAdminRole {
  const normalized = raw.trim().toLowerCase();
  if (
    normalized === 'super_admin' ||
    normalized === 'ops_billing' ||
    normalized === 'support'
  ) {
    return normalized;
  }
  throw new Error(
    `Rol inválido "${raw}". Usa uno de: ${VALID_PLATFORM_ADMIN_ROLES.join(', ')}`,
  );
}

export async function grantPlatformAdmin(
  client: PlatformAdminClient,
  input: { email: string; role?: string; notes?: string; actor?: string },
): Promise<PlatformAdminRow> {
  const email = normalizeAdminEmail(input.email);
  const role = assertPlatformAdminRole(input.role ?? 'super_admin');
  const actor = input.actor ?? 'cli:local';

  const row = await client.platformAdmin.upsert({
    where: { email },
    update: { role, isActive: true, notes: input.notes ?? null },
    create: {
      email,
      role,
      isActive: true,
      notes: input.notes ?? null,
      createdBy: actor,
    },
  });

  await recordAdminAudit(client, {
    actorUserId: actor,
    actorEmail: actor,
    actorRole: 'super_admin',
    action: 'platform_admin.granted',
    targetType: 'platform_admin',
    targetId: row.id,
    afterState: { email, role, isActive: true },
    reason: input.notes ?? `Acceso admin habilitado (${role})`,
  });

  return row;
}

export async function revokePlatformAdmin(
  client: PlatformAdminClient,
  input: { email: string; reason?: string; actor?: string },
): Promise<PlatformAdminRow> {
  const email = normalizeAdminEmail(input.email);
  const actor = input.actor ?? 'cli:local';

  const existing = await client.platformAdmin.findUnique({
    where: { email },
    select: { id: true, role: true, isActive: true },
  });
  if (!existing) {
    throw new Error(`No existe un administrador registrado con el correo ${email}`);
  }

  const row = await client.platformAdmin.update({
    where: { email },
    data: { isActive: false },
  });

  await recordAdminAudit(client, {
    actorUserId: actor,
    actorEmail: actor,
    actorRole: 'super_admin',
    action: 'platform_admin.revoked',
    targetType: 'platform_admin',
    targetId: row.id,
    beforeState: { role: existing.role, isActive: existing.isActive },
    afterState: { role: row.role, isActive: false },
    reason: input.reason ?? 'Acceso admin revocado desde consola',
  });

  return row;
}

export async function listPlatformAdmins(client: PlatformAdminClient): Promise<PlatformAdminRow[]> {
  return client.platformAdmin.findMany({ orderBy: { createdAt: 'asc' } });
}

export async function findActivePlatformAdminByEmail(
  client: Pick<PlatformAdminClient, 'platformAdmin'>,
  rawEmail: string | null | undefined,
): Promise<{ role: PlatformAdminRole } | null> {
  if (!rawEmail) return null;
  const email = rawEmail.trim().toLowerCase();
  if (!email) return null;

  const row = await client.platformAdmin.findUnique({
    where: { email },
    select: { role: true, isActive: true },
  });
  if (!row?.isActive || !row.role) return null;

  return { role: assertPlatformAdminRole(row.role) };
}
