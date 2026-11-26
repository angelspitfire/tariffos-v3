import type { Prisma } from './generated/client';

export interface AdminAuditClient {
  adminAuditLog: {
    create: (args: { data: Prisma.AdminAuditLogCreateInput }) => Promise<unknown>;
  };
}

export interface AdminAuditInput {
  actorUserId: string;
  actorEmail?: string | null;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  tenantId?: string | null;
  beforeState?: Prisma.InputJsonValue;
  afterState?: Prisma.InputJsonValue;
  reason?: string | null;
}

/**
 * Records an immutable platform administration audit event using the active
 * Prisma client or transaction client.
 */
export async function recordAdminAudit(
  client: AdminAuditClient,
  entry: AdminAuditInput,
): Promise<void> {
  await client.adminAuditLog.create({
    data: {
      actorUserId: entry.actorUserId,
      actorEmail: entry.actorEmail ?? null,
      actorRole: entry.actorRole,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      tenantId: entry.tenantId ?? null,
      beforeState: entry.beforeState,
      afterState: entry.afterState,
      reason: entry.reason ?? null,
    },
  });
}
