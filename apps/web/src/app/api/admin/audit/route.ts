import { prisma } from '@tariffos/database';
import type { AdminAuditLogItem } from '@tariffos/shared-types';
import { requireAdmin } from '@/lib/admin/http-helpers';
import { getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function GET(request: Request): Promise<Response> {
  const guard = await requireAdmin('audit:read');
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId')?.trim();
  const action = searchParams.get('action')?.trim();

  if (!isCloudModeEnabled()) {
    let logs = [...getOfflineAdminState().auditLogs];
    if (tenantId) logs = logs.filter((l) => l.tenantId === tenantId);
    if (action) logs = logs.filter((l) => l.action === action);
    return Response.json({ mode: 'offline', logs }, { status: 200 });
  }

  const rows = await prisma.adminAuditLog.findMany({
    where: {
      ...(tenantId ? { tenantId } : {}),
      ...(action ? { action } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const logs: AdminAuditLogItem[] = rows.map((row) => ({
    id: row.id,
    actorUserId: row.actorUserId,
    actorEmail: row.actorEmail,
    actorRole: row.actorRole,
    action: row.action,
    targetType: row.targetType,
    targetId: row.targetId,
    tenantId: row.tenantId,
    reason: row.reason,
    beforeState: row.beforeState,
    afterState: row.afterState,
    createdAt: row.createdAt.toISOString(),
  }));

  return Response.json({ mode: 'cloud', logs }, { status: 200 });
}
