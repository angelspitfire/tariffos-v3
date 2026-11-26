import { prisma, recordAdminAudit } from '@tariffos/database';
import { UpdatePlanInputSchema } from '@tariffos/shared-types';
import {
  extractPlanFeaturesMeta,
  parseJsonBody,
  requireAdmin,
} from '@/lib/admin/http-helpers';
import { appendOfflineAudit, getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guard = await requireAdmin('plans:manage');
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const rawBody = await parseJsonBody(request);
  if (rawBody === null) {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = UpdatePlanInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  if (!isCloudModeEnabled()) {
    const state = getOfflineAdminState();
    const index = state.plans.findIndex((p) => p.id === id);
    if (index === -1) return Response.json({ error: 'Plan not found' }, { status: 404 });
    const prev = state.plans[index];
    const updated = {
      ...prev,
      displayName: input.displayName ?? prev.displayName,
      description: input.description !== undefined ? input.description : prev.description,
      basePrice: input.basePrice ?? prev.basePrice,
      annualPriceUsd: input.annualPriceUsd ?? prev.annualPriceUsd,
      annualOnly: input.annualOnly ?? prev.annualOnly,
      classificationLimit: input.classificationLimit ?? prev.classificationLimit,
      maxTokens: input.maxTokens ?? prev.maxTokens,
      maxUsers: input.maxUsers ?? prev.maxUsers,
      overagePrice: input.overagePrice ?? prev.overagePrice,
      allowOverage: input.allowOverage ?? prev.allowOverage,
      isPublic: input.isPublic ?? prev.isPublic,
      isArchived: input.isArchived ?? prev.isArchived,
      features: input.features ?? prev.features,
    };
    state.plans[index] = updated;
    appendOfflineAudit({
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'plan.updated',
      targetType: 'plan',
      targetId: id,
      tenantId: null,
      reason: input.isArchived ? 'Plan archivado' : 'Actualización de plan',
      beforeState: prev,
      afterState: updated,
    });
    return Response.json({ mode: 'offline', plan: updated }, { status: 200 });
  }

  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: 'Plan not found' }, { status: 404 });

  const prevMeta = extractPlanFeaturesMeta(existing.features);
  const nextFeatures = {
    displayName: input.displayName ?? prevMeta.displayName ?? existing.name,
    monthlyPriceUsd: input.basePrice ?? existing.basePrice,
    annualPriceUsd: input.annualPriceUsd ?? prevMeta.annualPriceUsd ?? existing.basePrice * 10,
    annualOnly: input.annualOnly ?? prevMeta.annualOnly,
    maxUsers: input.maxUsers ?? prevMeta.maxUsers,
    isPublic: input.isPublic ?? prevMeta.isPublic,
    isArchived: input.isArchived ?? prevMeta.isArchived,
    items: input.features ?? prevMeta.items,
  };

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.plan.update({
      where: { id },
      data: {
        description: input.description !== undefined ? input.description : existing.description,
        basePrice: input.basePrice ?? existing.basePrice,
        classificationLimit: input.classificationLimit ?? existing.classificationLimit,
        maxClassifications: input.classificationLimit ?? existing.maxClassifications,
        maxTokens: input.maxTokens ?? existing.maxTokens,
        overagePrice: input.overagePrice ?? existing.overagePrice,
        allowOverage: input.allowOverage ?? existing.allowOverage,
        features: nextFeatures,
      },
    });
    await recordAdminAudit(tx, {
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'plan.updated',
      targetType: 'plan',
      targetId: id,
      beforeState: { basePrice: existing.basePrice, classificationLimit: existing.classificationLimit },
      afterState: { basePrice: row.basePrice, classificationLimit: row.classificationLimit },
      reason: input.isArchived ? 'Plan archivado' : 'Actualización de plan',
    });
    return row;
  });

  return Response.json({ mode: 'cloud', plan: updated }, { status: 200 });
}
