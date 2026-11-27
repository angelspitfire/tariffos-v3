import {
  ensureInternalTariffosPlan,
  isInternalTariffosPlanSlug,
  prisma,
  UNLIMITED_QUOTA_SENTINEL,
} from '@tariffos/database';
import { isPlatformAdminRole, normalizePlatformRole } from '@/lib/admin/permissions';
import {
  ExpressOnboardingSchema,
  isBootstrapAdminEmail,
} from '@/lib/funnel/onboarding-schema';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export async function POST(request: Request): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = ExpressOnboardingSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (!isCloudModeEnabled()) {
    return Response.json(
      {
        ok: true,
        mode: 'offline',
        profile: {
          id: 'offline-user',
          fullName: data.fullName,
          companyName: data.companyName,
          role: data.role,
          brokerLicense: data.brokerLicense,
          defaultCustomsOffice: data.defaultCustomsOffice ?? '5001 - LA GUAIRA',
          approvalWorkflowMode: data.approvalWorkflowMode,
          defaultIncoterm: data.defaultIncoterm,
          preferredCurrency: data.preferredCurrency,
        },
        tenant: {
          id: 'offline-tenant',
          name: data.companyName,
          taxId: data.taxId,
          countryCode: data.countryCode,
          isOnboarded: true,
        },
      },
      { status: 200 },
    );
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  const normalizedEmail = user.email?.trim().toLowerCase() ?? null;
  const adminEntry = normalizedEmail
    ? await prisma.platformAdmin?.findUnique({
        where: { email: normalizedEmail },
        select: { role: true, isActive: true },
      })
    : null;

  const profile = await prisma.userProfile.upsert({
    where: { id: user.id },
    update: {
      fullName: data.fullName,
      companyName: data.companyName,
      position: data.role,
      brokerLicense: data.brokerLicense || null,
      defaultCustomsOffice: data.defaultCustomsOffice,
      defaultIncoterm: data.defaultIncoterm,
      preferredCurrency: data.preferredCurrency,
      approvalWorkflowMode: data.approvalWorkflowMode,
    },
    create: {
      id: user.id,
      fullName: data.fullName,
      companyName: data.companyName,
      position: data.role,
      brokerLicense: data.brokerLicense || null,
      defaultCustomsOffice: data.defaultCustomsOffice ?? '5001 - LA GUAIRA',
      defaultIncoterm: data.defaultIncoterm,
      preferredCurrency: data.preferredCurrency,
      approvalWorkflowMode: data.approvalWorkflowMode,
      ...(adminEntry?.isActive ? { role: normalizePlatformRole(adminEntry.role) } : {}),
    },
  });

  const isPlatformAdmin =
    Boolean(adminEntry?.isActive && isPlatformAdminRole(normalizePlatformRole(adminEntry.role))) ||
    isPlatformAdminRole(normalizePlatformRole(profile?.role)) ||
    isBootstrapAdminEmail(normalizedEmail);

  const existingMembership = await prisma.membership.findFirst({
    where: { userId: user.id },
    select: {
      tenantId: true,
      tenant: { select: { billingStatus: true, planId: true } },
    },
  });

  const normalizedCountry = data.countryCode.trim().toUpperCase();
  const seededCountry = await prisma.country?.findUnique({
    where: { code: normalizedCountry },
    select: { code: true },
  });
  const resolvedCountryCode = seededCountry?.code ?? 'VE';

  const internalPlan = isPlatformAdmin ? await ensureInternalTariffosPlan(prisma) : null;
  const safeRequestedSlug = isInternalTariffosPlanSlug(data.selectedPlanId)
    ? 'pilot'
    : data.selectedPlanId;

  const shouldResolvePlan =
    !isPlatformAdmin &&
    (!existingMembership ||
      existingMembership.tenant?.billingStatus === 'PAST_DUE' ||
      !existingMembership.tenant?.planId);

  const selectedPlan = shouldResolvePlan
    ? ((await prisma.plan?.findUnique({
        where: { name: safeRequestedSlug },
        select: { id: true, classificationLimit: true },
      })) ??
      (await prisma.plan?.findUnique({
        where: { name: 'pilot' },
        select: { id: true, classificationLimit: true },
      })))
    : null;

  const tenant = existingMembership
    ? await prisma.tenant.update({
        where: { id: existingMembership.tenantId },
        data: {
          name: data.companyName,
          taxId: data.taxId,
          countryCode: resolvedCountryCode,
          ownerName: data.fullName,
          ownerEmail: user.email ?? undefined,
          isOnboarded: true,
          onboardedAt: new Date(),
          ...(selectedPlan?.id && !internalPlan ? { planId: selectedPlan.id } : {}),
          ...(internalPlan
            ? {
                planId: internalPlan.id,
                billingStatus: 'ACTIVE',
                billingLimit: UNLIMITED_QUOTA_SENTINEL,
                allowOverage: true,
              }
            : {}),
        },
      })
    : await prisma.tenant.create({
        data: {
          name: data.companyName,
          taxId: data.taxId,
          countryCode: resolvedCountryCode,
          ownerName: data.fullName,
          ownerEmail: user.email ?? undefined,
          planId: internalPlan ? internalPlan.id : (selectedPlan?.id ?? null),
          billingStatus: isPlatformAdmin ? 'ACTIVE' : 'PAST_DUE',
          billingLimit: isPlatformAdmin ? UNLIMITED_QUOTA_SENTINEL : 0,
          allowOverage: isPlatformAdmin,
          isOnboarded: true,
          onboardedAt: new Date(),
          memberships: {
            create: {
              userId: user.id,
              role: 'OWNER',
              email: user.email ?? null,
              name: data.fullName,
              position: data.role,
            },
          },
        },
      });

  const skipPaymentActivation =
    isPlatformAdmin ||
    tenant?.billingStatus === 'ACTIVE' ||
    tenant?.billingStatus === 'TRIALING';

  return Response.json(
    { ok: true, mode: 'cloud', profile, tenant, skipPaymentActivation },
    { status: 200 },
  );
}
