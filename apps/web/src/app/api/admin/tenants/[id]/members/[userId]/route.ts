import { prisma, recordAdminAudit } from '@tariffos/database';
import { OffboardUserInputSchema } from '@tariffos/shared-types';
import { parseJsonBody, requireAdmin } from '@/lib/admin/http-helpers';
import { appendOfflineAudit, getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; userId: string }> },
): Promise<Response> {
  const guard = await requireAdmin('tenants:deactivate');
  if (!guard.ok) return guard.response;

  const { id: tenantId, userId } = await context.params;
  const rawBody = await parseJsonBody(request);
  if (rawBody === null) return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });

  const parsed = OffboardUserInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;

  if (!isCloudModeEnabled()) {
    const state = getOfflineAdminState();
    const tenant = state.tenants.find((t) => t.id === tenantId);
    if (!tenant) return Response.json({ error: 'Tenant not found' }, { status: 404 });
    const member = tenant.members.find((m) => m.userId === userId);
    if (!member) return Response.json({ error: 'Member not found' }, { status: 404 });
    tenant.members = tenant.members.filter((m) => m.userId !== userId);
    appendOfflineAudit({
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'user.offboarded',
      targetType: 'user',
      targetId: userId,
      tenantId,
      reason: input.reason,
      beforeState: { email: member.email, role: member.role },
      afterState: { removedFromTenant: tenantId, banAuthAccount: input.banAuthAccount },
    });
    return Response.json({ mode: 'offline', removedUserId: userId }, { status: 200 });
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
  });
  if (!membership) return Response.json({ error: 'Member not found' }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.membership.delete({ where: { userId_tenantId: { userId, tenantId } } });
    await recordAdminAudit(tx, {
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'user.offboarded',
      targetType: 'user',
      targetId: userId,
      tenantId,
      beforeState: { email: membership.email, role: membership.role },
      afterState: { removedFromTenant: tenantId, banAuthAccount: input.banAuthAccount },
      reason: input.reason,
    });
  });

  if (input.banAuthAccount) {
    const remaining = await prisma.membership.count({ where: { userId } });
    if (remaining === 0) {
      const supabaseAdmin = createSupabaseAdminClient();
      await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
    }
  }

  return Response.json({ mode: 'cloud', removedUserId: userId }, { status: 200 });
}
