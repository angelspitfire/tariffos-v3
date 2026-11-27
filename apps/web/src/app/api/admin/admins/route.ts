import {
  generateTemporaryAdminPassword,
  getSuperAdminEmailProviderStatus,
  grantPlatformAdmin,
  INTERNAL_TARIFFOS_PLAN_SLUG,
  prisma,
  provisionInternalAdminWorkspace,
  revokePlatformAdmin,
  sendSuperAdminCredentialsEmail,
} from '@tariffos/database';
import {
  CreatePlatformAdminInputSchema,
  UpdatePlatformAdminInputSchema,
  type PlatformAdminAccountRole,
  type PlatformAdminRecord,
} from '@tariffos/shared-types';
import { parseJsonBody, requireAdmin } from '@/lib/admin/http-helpers';
import { getOfflineAdminState } from '@/lib/admin/offline-store';
import { normalizePlatformRole } from '@/lib/admin/permissions';
import {
  updateOfflinePlatformAdmin,
  upsertCloudAdminAuthUser,
  upsertOfflinePlatformAdmin,
} from '@/lib/admin/provision-admin-user';
import { isCloudModeEnabled } from '@/lib/runtime-config';

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

export async function POST(request: Request): Promise<Response> {
  const guard = await requireAdmin('admins:manage');
  if (!guard.ok) return guard.response;

  const rawBody = await parseJsonBody(request);
  if (rawBody === null) return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });

  const parsed = CreatePlatformAdminInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data;
  const email = input.email.trim().toLowerCase();
  const temporaryPassword = input.password ?? generateTemporaryAdminPassword();
  const actor = `admin:${guard.context.userId}`;

  if (!isCloudModeEnabled()) {
    const admin = upsertOfflinePlatformAdmin({
      input,
      email,
      planSlug: INTERNAL_TARIFFOS_PLAN_SLUG,
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
    });
    const emailDelivery = await sendSuperAdminCredentialsEmail({
      recipientEmail: email,
      recipientName: input.fullName,
      temporaryPassword,
      role: input.role,
    });
    return Response.json(
      { mode: 'offline', admin, temporaryPassword, emailDelivery, planSlug: INTERNAL_TARIFFOS_PLAN_SLUG },
      { status: 201 },
    );
  }

  const auth = await upsertCloudAdminAuthUser({
    email,
    password: temporaryPassword,
    fullName: input.fullName,
    role: input.role,
    mustChangePassword: !input.password,
  });

  const ws = await prisma.$transaction((tx) =>
    provisionInternalAdminWorkspace(tx, {
      userId: auth.userId,
      email,
      fullName: input.fullName,
      companyName: input.companyName,
      role: input.role,
      actor,
    }),
  );

  const emailDelivery = await sendSuperAdminCredentialsEmail({
    recipientEmail: email,
    recipientName: input.fullName,
    temporaryPassword,
    role: input.role,
  });

  const now = new Date().toISOString();
  const admin: PlatformAdminRecord = {
    id: ws.adminId,
    email,
    role: input.role,
    isActive: true,
    notes: `${input.fullName} (${input.companyName})`,
    createdBy: guard.context.userEmail ?? actor,
    createdAt: now,
    updatedAt: now,
  };

  return Response.json(
    { mode: 'cloud', admin, temporaryPassword, emailDelivery, planSlug: ws.planSlug, tenantId: ws.tenantId },
    { status: 201 },
  );
}

export async function PATCH(request: Request): Promise<Response> {
  const guard = await requireAdmin('admins:manage');
  if (!guard.ok) return guard.response;

  const rawBody = await parseJsonBody(request);
  if (rawBody === null) return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });

  const parsed = UpdatePlatformAdminInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data;
  const email = input.email.trim().toLowerCase();
  if (input.action === 'revoke' && guard.context.userEmail?.trim().toLowerCase() === email) {
    return Response.json({ error: 'No puedes revocar tu propio acceso Super Admin.' }, { status: 400 });
  }

  if (!isCloudModeEnabled()) {
    const updated = updateOfflinePlatformAdmin({
      input,
      email,
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
    });
    if (!updated) return Response.json({ error: `Administrador ${email} no encontrado` }, { status: 404 });
    return Response.json({ mode: 'offline', admin: updated }, { status: 200 });
  }

  const actor = `admin:${guard.context.userId}`;
  const row =
    input.action === 'revoke'
      ? await revokePlatformAdmin(prisma, { email, reason: input.reason, actor })
      : await grantPlatformAdmin(prisma, {
          email,
          role: input.role ?? 'super_admin',
          notes: input.reason,
          actor,
        });

  return Response.json({ mode: 'cloud', admin: mapAdminRow(row) }, { status: 200 });
}
