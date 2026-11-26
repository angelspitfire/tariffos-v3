import { prisma, recordAdminAudit } from '@tariffos/database';
import {
  CreatePlanInputSchema,
  type AdminPlanRecord,
} from '@tariffos/shared-types';
import {
  extractPlanFeaturesMeta,
  parseJsonBody,
  requireAdmin,
} from '@/lib/admin/http-helpers';
import { appendOfflineAudit, getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

function mapCloudPlan(row: {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  classificationLimit: number;
  maxTokens: number;
  overagePrice: number;
  allowOverage: boolean;
  features: unknown;
  _count?: { tenants: number };
}): AdminPlanRecord {
  const meta = extractPlanFeaturesMeta(row.features);
  return {
    id: row.id,
    name: row.name,
    displayName: meta.displayName ?? row.name,
    description: row.description,
    basePrice: row.basePrice,
    annualPriceUsd: meta.annualPriceUsd ?? row.basePrice * 10,
    annualOnly: meta.annualOnly,
    classificationLimit: row.classificationLimit,
    maxTokens: row.maxTokens,
    maxUsers: meta.maxUsers,
    overagePrice: row.overagePrice,
    allowOverage: row.allowOverage,
    isPublic: meta.isPublic,
    isArchived: meta.isArchived,
    features: meta.items,
    tenantCount: row._count?.tenants ?? 0,
  };
}

export async function GET(): Promise<Response> {
  const guard = await requireAdmin('admin:read');
  if (!guard.ok) return guard.response;

  if (!isCloudModeEnabled()) {
    return Response.json({ mode: 'offline', plans: getOfflineAdminState().plans }, { status: 200 });
  }

  const rows = await prisma.plan.findMany({
    orderBy: { basePrice: 'asc' },
    include: { _count: { select: { tenants: true } } },
  });

  return Response.json({ mode: 'cloud', plans: rows.map(mapCloudPlan) }, { status: 200 });
}

export async function POST(request: Request): Promise<Response> {
  const guard = await requireAdmin('plans:manage');
  if (!guard.ok) return guard.response;

  const rawBody = await parseJsonBody(request);
  if (rawBody === null) {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = CreatePlanInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const slug = input.name.toLowerCase();

  if (!isCloudModeEnabled()) {
    const state = getOfflineAdminState();
    if (state.plans.some((p) => p.name.toLowerCase() === slug)) {
      return Response.json({ error: 'Ya existe un plan con ese identificador.' }, { status: 409 });
    }
    const plan: AdminPlanRecord = {
      id: slug,
      name: slug,
      displayName: input.displayName,
      description: input.description ?? null,
      basePrice: input.basePrice,
      annualPriceUsd: input.annualPriceUsd ?? input.basePrice * 10,
      annualOnly: input.annualOnly,
      classificationLimit: input.classificationLimit,
      maxTokens: input.maxTokens,
      maxUsers: input.maxUsers,
      overagePrice: input.overagePrice,
      allowOverage: input.allowOverage,
      isPublic: input.isPublic,
      isArchived: false,
      features: input.features,
      tenantCount: 0,
    };
    state.plans.push(plan);
    appendOfflineAudit({
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'plan.created',
      targetType: 'plan',
      targetId: plan.id,
      tenantId: null,
      reason: `Creación de plan ${plan.displayName}`,
      beforeState: null,
      afterState: plan,
    });
    return Response.json({ mode: 'offline', plan }, { status: 201 });
  }

  const existing = await prisma.plan.findUnique({ where: { name: slug }, select: { id: true } });
  if (existing) {
    return Response.json({ error: 'Ya existe un plan con ese identificador.' }, { status: 409 });
  }

  const created = await prisma.$transaction(async (tx) => {
    const featuresPayload = {
      displayName: input.displayName,
      monthlyPriceUsd: input.basePrice,
      annualPriceUsd: input.annualPriceUsd ?? input.basePrice * 10,
      annualOnly: input.annualOnly,
      maxUsers: input.maxUsers,
      isPublic: input.isPublic,
      isArchived: false,
      items: input.features,
    };
    const planRow = await tx.plan.create({
      data: {
        name: slug,
        description: input.description ?? null,
        basePrice: input.basePrice,
        classificationLimit: input.classificationLimit,
        maxClassifications: input.classificationLimit,
        maxTokens: input.maxTokens,
        overagePrice: input.overagePrice,
        allowOverage: input.allowOverage,
        features: featuresPayload,
      },
    });
    await recordAdminAudit(tx, {
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'plan.created',
      targetType: 'plan',
      targetId: planRow.id,
      afterState: { name: slug, basePrice: input.basePrice, classificationLimit: input.classificationLimit },
      reason: `Creación de plan ${input.displayName}`,
    });
    return planRow;
  });

  return Response.json({ mode: 'cloud', plan: mapCloudPlan(created) }, { status: 201 });
}
