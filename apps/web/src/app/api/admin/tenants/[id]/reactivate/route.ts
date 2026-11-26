import { z } from 'zod';
import { prisma, recordAdminAudit } from '@tariffos/database';
import { parseJsonBody, requireAdmin } from '@/lib/admin/http-helpers';
import { appendOfflineAudit, getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const ReactivateSchema = z.object({
  reason: z.string().trim().min(3),
  unbanMembers: z.boolean().default(true),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guard = await requireAdmin('tenants:deactivate');
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const rawBody = await parseJsonBody(request);
  if (rawBody === null) return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });

  const parsed = ReactivateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;

  if (!isCloudModeEnabled()) {
    const state = getOfflineAdminState();
    const tenant = state.tenants.find((t) => t.id === id);
    if (!tenant) return Response.json({ error: 'Tenant not found' }, { status: 404 });
    const prevStatus = tenant.billingStatus;
    tenant.billingStatus = 'ACTIVE';
    appendOfflineAudit({
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'tenant.reactivated',
      targetType: 'tenant',
      targetId: id,
      tenantId: id,
      reason: input.reason,
      beforeState: { billingStatus: prevStatus },
      afterState: { billingStatus: 'ACTIVE' },
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
      data: { billingStatus: 'ACTIVE' },
    });
    await recordAdminAudit(tx, {
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'tenant.reactivated',
      targetType: 'tenant',
      targetId: id,
      tenantId: id,
      beforeState: { billingStatus: existing.billingStatus },
      afterState: { billingStatus: 'ACTIVE' },
      reason: input.reason,
    });
    return row;
  });

  if (input.unbanMembers && existing.memberships.length > 0) {
    const supabaseAdmin = createSupabaseAdminClient();
    for (const member of existing.memberships) {
      await supabaseAdmin.auth.admin.updateUserById(member.userId, { ban_duration: 'none' });
    }
  }

  return Response.json({ mode: 'cloud', tenant: updated }, { status: 200 });
}
