import { prisma, recordAdminAudit } from '@tariffos/database';
import { LeadStatusSchema, UpdateLeadInputSchema } from '@tariffos/shared-types';
import { parseJsonBody, requireAdmin } from '@/lib/admin/http-helpers';
import { appendOfflineAudit, getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guard = await requireAdmin('leads:manage');
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const rawBody = await parseJsonBody(request);
  if (rawBody === null) {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = UpdateLeadInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  if (!isCloudModeEnabled()) {
    const state = getOfflineAdminState();
    const index = state.leads.findIndex((l) => l.id === id);
    if (index === -1) return Response.json({ error: 'Lead not found' }, { status: 404 });
    const prev = state.leads[index];
    const updated = {
      ...prev,
      status: input.status,
      notes: input.notes !== undefined ? input.notes : prev.notes,
      approvedAt: input.status === 'CONVERTED' ? new Date().toISOString() : prev.approvedAt,
    };
    state.leads[index] = updated;
    appendOfflineAudit({
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'lead.updated',
      targetType: 'lead',
      targetId: id,
      tenantId: null,
      reason: `Estado cambiado a ${input.status}`,
      beforeState: { status: prev.status },
      afterState: { status: updated.status },
    });
    return Response.json({ mode: 'offline', lead: updated }, { status: 200 });
  }

  const existing = await prisma.waitlistLead.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: 'Lead not found' }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.waitlistLead.update({
      where: { id },
      data: {
        status: input.status,
        notes: input.notes !== undefined ? input.notes : existing.notes,
        approvedAt: input.status === 'CONVERTED' ? new Date() : existing.approvedAt,
      },
    });
    await recordAdminAudit(tx, {
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'lead.updated',
      targetType: 'lead',
      targetId: id,
      beforeState: { status: existing.status },
      afterState: { status: row.status },
      reason: `Estado cambiado a ${input.status}`,
    });
    return row;
  });

  return Response.json(
    {
      mode: 'cloud',
      lead: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        company: updated.company,
        phone: updated.phone,
        notes: updated.notes,
        country: updated.country ?? 'VE',
        volume: updated.volume,
        source: updated.source,
        status: LeadStatusSchema.catch('PENDING').parse(updated.status),
        approvedAt: updated.approvedAt?.toISOString() ?? null,
        createdAt: updated.createdAt.toISOString(),
      },
    },
    { status: 200 },
  );
}
