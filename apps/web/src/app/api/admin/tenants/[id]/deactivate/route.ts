import { prisma, recordAdminAudit } from '@tariffos/database';
import { DeactivateTenantInputSchema } from '@tariffos/shared-types';
import { parseJsonBody, requireAdmin } from '@/lib/admin/http-helpers';
import { appendOfflineAudit, getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guard = await requireAdmin('tenants:deactivate');
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const rawBody = await parseJsonBody(request);
  if (rawBody === null) return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });

  const parsed = DeactivateTenantInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;

  if (!isCloudModeEnabled()) {
    const state = getOfflineAdminState();
    const tenant = state.tenants.find((t) => t.id === id);
    if (!tenant) return Response.json({ error: 'Tenant not found' }, { status: 404 });
    const prevStatus = tenant.billingStatus;
    tenant.billingStatus = 'CANCELED';
    appendOfflineAudit({
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'tenant.deactivated',
      targetType: 'tenant',
      targetId: id,
      tenantId: id,
      reason: input.reason,
      beforeState: { billingStatus: prevStatus },
      afterState: { billingStatus: 'CANCELED', banSoleMembers: input.banSoleMembers },
    });
    return Response.json({ mode: 'offline', tenant }, { status: 200 });
  }

  const existing = await prisma.tenant.findUnique({
    where: { id },
    include: { memberships: { select: { userId: true } } },
  });
  if (!existing) return Response.json({ error: 'Tenant not found' }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.tenant.update({
      where: { id },
      data: { billingStatus: 'CANCELED' },
    });
    if (input.revokePendingInvites) {
      await tx.invitation.updateMany({
        where: { tenantId: id, status: 'PENDING' },
        data: { status: 'REVOKED' },
      });
    }
    await recordAdminAudit(tx, {
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'tenant.deactivated',
      targetType: 'tenant',
      targetId: id,
      tenantId: id,
      beforeState: { billingStatus: existing.billingStatus },
      afterState: { billingStatus: 'CANCELED', revokePendingInvites: input.revokePendingInvites },
      reason: input.reason,
    });
    return row;
  });

  if (input.banSoleMembers && existing.memberships.length > 0) {
    const supabaseAdmin = createSupabaseAdminClient();
    for (const member of existing.memberships) {
      const otherMemberships = await prisma.membership.count({
        where: { userId: member.userId, tenantId: { not: id } },
      });
      if (otherMemberships === 0) {
        await supabaseAdmin.auth.admin.updateUserById(member.userId, {
          ban_duration: '876000h',
        });
      }
    }
  }

  return Response.json({ mode: 'cloud', tenant: updated }, { status: 200 });
}
