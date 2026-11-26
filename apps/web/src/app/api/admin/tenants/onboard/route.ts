import { isInternalTariffosPlanSlug, prisma, recordAdminAudit } from '@tariffos/database';
import { AdminOnboardTenantInputSchema } from '@tariffos/shared-types';
import { parseJsonBody, requireAdmin } from '@/lib/admin/http-helpers';
import {
  appendOfflineAudit,
  findOfflinePlan,
  getOfflineAdminState,
} from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { buildAuthCallbackUrl, resolveServerAuthOrigin } from '@/lib/funnel/auth-origin';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

async function resolveOrInviteCloudUser(
  email: string,
  fullName: string,
  sendInviteEmail: boolean,
  publicOrigin: string,
): Promise<{ userId: string; invited: boolean }> {
  const supabaseAdmin = createSupabaseAdminClient();
  if (sendInviteEmail) {
    const inviteRes = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: buildAuthCallbackUrl(publicOrigin, '/app'),
    });
    if (!inviteRes.error && inviteRes.data.user) {
      return { userId: inviteRes.data.user.id, invited: true };
    }
  }

  const createRes = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: !sendInviteEmail,
    user_metadata: { full_name: fullName },
  });
  if (!createRes.error && createRes.data.user) {
    return { userId: createRes.data.user.id, invited: false };
  }

  const listRes = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
  const existing = listRes.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    return { userId: existing.id, invited: false };
  }

  throw new Error(createRes.error?.message ?? 'No se pudo aprovisionar el usuario en Supabase Auth');
}

export async function POST(request: Request): Promise<Response> {
  const guard = await requireAdmin('tenants:onboard');
  if (!guard.ok) return guard.response;

  const rawBody = await parseJsonBody(request);
  if (rawBody === null) {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = AdminOnboardTenantInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const ownerEmail = input.ownerEmail.toLowerCase();

  if (!isCloudModeEnabled()) {
    const state = getOfflineAdminState();
    const plan = findOfflinePlan(input.planId);
    const limit = input.billingLimit ?? plan?.classificationLimit ?? 100;
    const tenantId = `ten-${Date.now()}`;
    const userId = `usr-${Date.now()}`;
    const tenant = {
      id: tenantId,
      name: input.companyName,
      taxId: input.taxId ?? null,
      ownerName: input.ownerName,
      ownerEmail,
      countryCode: input.countryCode,
      planId: plan?.id ?? input.planId,
      billingStatus: input.billingStatus,
      billingLimit: limit,
      allowOverage: input.allowOverage ?? plan?.allowOverage ?? false,
      createdAt: new Date().toISOString(),
      members: [{ userId, email: ownerEmail, name: input.ownerName, role: 'OWNER' }],
      usedThisMonth: 0,
      inputTokensThisMonth: 0,
      outputTokensThisMonth: 0,
      activeBatchJobs: 0,
      failedBatchJobs: 0,
    };
    state.tenants.unshift(tenant);
    if (plan) plan.tenantCount += 1;
    if (input.leadId) {
      const lead = state.leads.find((l) => l.id === input.leadId);
      if (lead) {
        lead.status = 'CONVERTED';
        lead.approvedAt = new Date().toISOString();
      }
    }
    appendOfflineAudit({
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'tenant.onboarded',
      targetType: 'tenant',
      targetId: tenantId,
      tenantId,
      reason: `Onboarding asistido (${input.billingStatus})`,
      beforeState: null,
      afterState: { companyName: input.companyName, ownerEmail, planId: tenant.planId },
    });
    return Response.json({ mode: 'offline', tenant, invited: input.sendInviteEmail }, { status: 201 });
  }

  const plan =
    (await prisma.plan.findUnique({ where: { id: input.planId } })) ??
    (await prisma.plan.findUnique({ where: { name: input.planId } }));
  if (!plan) {
    return Response.json({ error: `Plan ${input.planId} not found` }, { status: 404 });
  }
  if (isInternalTariffosPlanSlug(plan.name)) {
    const targetAdmin = await prisma.platformAdmin?.findUnique({
      where: { email: ownerEmail },
      select: { isActive: true },
    });
    if (!targetAdmin?.isActive) {
      return Response.json(
        { error: 'El plan TariffOS Interno es exclusivo para cuentas internas de TariffOS.' },
        { status: 403 },
      );
    }
  }

  const provisioned = await resolveOrInviteCloudUser(
    ownerEmail,
    input.ownerName,
    input.sendInviteEmail,
    resolveServerAuthOrigin(request),
  );
  const effectiveLimit = input.billingLimit ?? plan.classificationLimit;

  const tenant = await prisma.$transaction(async (tx) => {
    await tx.userProfile.upsert({
      where: { id: provisioned.userId },
      update: { fullName: input.ownerName, companyName: input.companyName },
      create: { id: provisioned.userId, fullName: input.ownerName, companyName: input.companyName },
    });
    const created = await tx.tenant.create({
      data: {
        name: input.companyName,
        taxId: input.taxId ?? null,
        countryCode: input.countryCode,
        ownerName: input.ownerName,
        ownerEmail,
        planId: plan.id,
        billingStatus: input.billingStatus,
        billingLimit: effectiveLimit,
        allowOverage: input.allowOverage ?? plan.allowOverage,
        isOnboarded: true,
        onboardedAt: new Date(),
        memberships: {
          create: {
            userId: provisioned.userId,
            role: 'OWNER',
            email: ownerEmail,
            name: input.ownerName,
            position: 'Agente Aduanal',
          },
        },
      },
    });
    if (input.leadId) {
      await tx.waitlistLead.update({
        where: { id: input.leadId },
        data: { status: 'CONVERTED', approvedAt: new Date() },
      });
    }
    await recordAdminAudit(tx, {
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'tenant.onboarded',
      targetType: 'tenant',
      targetId: created.id,
      tenantId: created.id,
      afterState: { companyName: input.companyName, ownerEmail, planId: plan.id },
      reason: 'Onboarding asistido desde consola admin',
    });
    return created;
  });

  return Response.json(
    { mode: 'cloud', tenant, invited: provisioned.invited },
    { status: 201 },
  );
}
