import type { Prisma } from './generated/client';
import { recordAdminAudit, type AdminAuditClient } from './admin-audit';
import {
  assertPlatformAdminRole,
  grantPlatformAdmin,
  normalizeAdminEmail,
  type PlatformAdminClient,
} from './platform-admins';

export const INTERNAL_TARIFFOS_PLAN_SLUG = 'tariffos_internal' as const;
export const INTERNAL_TARIFFOS_PLAN_DISPLAY_NAME = 'TariffOS Interno (Ilimitado)' as const;
export const UNLIMITED_QUOTA_SENTINEL = 1_000_000_000 as const;

export interface InternalPlanRow {
  id: string;
  name: string;
  classificationLimit: number;
  allowOverage: boolean;
}

interface InternalPlanPayload {
  description: string;
  basePrice: number;
  overagePrice: number;
  allowOverage: boolean;
  classificationLimit: number;
  maxClassifications: number;
  maxTokens: number;
  features: Prisma.InputJsonValue;
}

export interface InternalPlanClient {
  plan: {
    upsert: (args: {
      where: { name: string };
      update: InternalPlanPayload;
      create: InternalPlanPayload & { name: string };
    }) => Promise<InternalPlanRow>;
  };
}

interface InternalTenantFields {
  name: string;
  countryCode: string;
  ownerName: string;
  ownerEmail: string;
  planId: string;
  billingStatus: 'ACTIVE';
  billingLimit: number;
  allowOverage: boolean;
  isOnboarded: boolean;
  onboardedAt: Date;
}

export interface ProvisionInternalWorkspaceClient
  extends InternalPlanClient,
    PlatformAdminClient,
    AdminAuditClient {
  userProfile: {
    upsert: (args: {
      where: { id: string };
      update: { fullName: string; companyName: string; position: string; role: string };
      create: {
        id: string;
        fullName: string;
        companyName: string;
        position: string;
        role: string;
        defaultCustomsOffice: string;
        defaultIncoterm: string;
        preferredCurrency: string;
        approvalWorkflowMode: string;
      };
    }) => Promise<{ id: string }>;
  };
  membership: {
    findFirst: (args: {
      where: { userId: string };
      select: { id: true; tenantId: true };
    }) => Promise<{ id: string; tenantId: true extends boolean ? string : string } | null>;
    update: (args: {
      where: { id: string };
      data: { role: string; email: string; name: string; position: string };
    }) => Promise<unknown>;
  };
  tenant: {
    create: (args: {
      data: InternalTenantFields & {
        memberships: {
          create: {
            userId: string;
            role: string;
            email: string;
            name: string;
            position: string;
          };
        };
      };
    }) => Promise<{ id: string }>;
    update: (args: {
      where: { id: string };
      data: InternalTenantFields;
    }) => Promise<{ id: string }>;
  };
}

export function isInternalTariffosPlanSlug(raw: string | null | undefined): boolean {
  if (!raw) return false;
  return raw.trim().toLowerCase() === INTERNAL_TARIFFOS_PLAN_SLUG;
}

export function buildInternalTariffosPlanFeatures(): Prisma.InputJsonObject {
  return {
    displayName: INTERNAL_TARIFFOS_PLAN_DISPLAY_NAME,
    unlimited: true,
    internalOnly: true,
    isPublic: false,
    isArchived: false,
    allowBatch: true,
    oneTimeOnly: false,
    annualOnly: false,
    customPricing: false,
    maxUsers: 999,
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    items: [
      'Clasificaciones y lotes ilimitados (uso exclusivo equipo interno TariffOS)',
      'Sin límite de tokens ni pasarela de pago comercial',
      'Acceso directo a Consola Admin (/admin) y Workspace (/app)',
    ],
  };
}

export async function ensureInternalTariffosPlan(
  client: InternalPlanClient,
): Promise<InternalPlanRow> {
  const features = buildInternalTariffosPlanFeatures();
  const payload = {
    description:
      'Plan interno ilimitado exclusivo para Super Admins y operadores del equipo TariffOS.',
    basePrice: 0,
    overagePrice: 0,
    allowOverage: true,
    classificationLimit: UNLIMITED_QUOTA_SENTINEL,
    maxClassifications: UNLIMITED_QUOTA_SENTINEL,
    maxTokens: UNLIMITED_QUOTA_SENTINEL,
    features,
  };

  return client.plan.upsert({
    where: { name: INTERNAL_TARIFFOS_PLAN_SLUG },
    update: payload,
    create: {
      name: INTERNAL_TARIFFOS_PLAN_SLUG,
      ...payload,
    },
  });
}

export async function provisionInternalAdminWorkspace(
  client: ProvisionInternalWorkspaceClient,
  input: {
    userId: string;
    email: string;
    fullName: string;
    companyName?: string;
    position?: string;
    role?: string;
    countryCode?: string;
    actor?: string;
  },
): Promise<{
  adminId: string;
  tenantId: string;
  tenantAction: 'created' | 'updated';
  planId: string;
  planSlug: typeof INTERNAL_TARIFFOS_PLAN_SLUG;
}> {
  const email = normalizeAdminEmail(input.email);
  const role = assertPlatformAdminRole(input.role ?? 'super_admin');
  const fullName = input.fullName.trim() || email.split('@')[0] || 'TariffOS Admin';
  const companyName = input.companyName?.trim() || 'TariffOS';
  const position = input.position?.trim() || 'Super Admin · TariffOS';
  const countryCode = (input.countryCode ?? 'VE').trim().toUpperCase();
  const actor = input.actor ?? `user:${input.userId}`;

  const internalPlan = await ensureInternalTariffosPlan(client);
  const adminRow = await grantPlatformAdmin(client, {
    email,
    role,
    notes: `${position} (${companyName})`,
    actor,
  });

  await client.userProfile.upsert({
    where: { id: input.userId },
    update: {
      fullName,
      companyName,
      position,
      role,
    },
    create: {
      id: input.userId,
      fullName,
      companyName,
      position,
      role,
      defaultCustomsOffice: '5001 - LA GUAIRA',
      defaultIncoterm: 'FOB',
      preferredCurrency: 'USD',
      approvalWorkflowMode: 'agent_decides',
    },
  });

  const existingMembership = await client.membership.findFirst({
    where: { userId: input.userId },
    select: { id: true, tenantId: true },
  });

  let tenantId: string;
  let tenantAction: 'created' | 'updated';

  if (existingMembership) {
    const updated = await client.tenant.update({
      where: { id: existingMembership.tenantId },
      data: {
        name: companyName,
        countryCode,
        ownerName: fullName,
        ownerEmail: email,
        planId: internalPlan.id,
        billingStatus: 'ACTIVE',
        billingLimit: UNLIMITED_QUOTA_SENTINEL,
        allowOverage: true,
        isOnboarded: true,
        onboardedAt: new Date(),
      },
    });
    await client.membership.update({
      where: { id: existingMembership.id },
      data: { role: 'OWNER', email, name: fullName, position },
    });
    tenantId = updated.id;
    tenantAction = 'updated';
  } else {
    const created = await client.tenant.create({
      data: {
        name: companyName,
        countryCode,
        ownerName: fullName,
        ownerEmail: email,
        planId: internalPlan.id,
        billingStatus: 'ACTIVE',
        billingLimit: UNLIMITED_QUOTA_SENTINEL,
        allowOverage: true,
        isOnboarded: true,
        onboardedAt: new Date(),
        memberships: {
          create: {
            userId: input.userId,
            role: 'OWNER',
            email,
            name: fullName,
            position,
          },
        },
      },
    });
    tenantId = created.id;
    tenantAction = 'created';
  }

  await recordAdminAudit(client, {
    actorUserId: actor,
    actorEmail: email,
    actorRole: role,
    action: 'super_admin.workspace_provisioned',
    targetType: 'tenant',
    targetId: tenantId,
    tenantId,
    afterState: {
      email,
      role,
      planSlug: INTERNAL_TARIFFOS_PLAN_SLUG,
      unlimited: true,
      billingStatus: 'ACTIVE',
    },
    reason: 'Provisión de cuenta interna TariffOS con plan ilimitado exclusivo',
  });

  return {
    adminId: adminRow.id,
    tenantId,
    tenantAction,
    planId: internalPlan.id,
    planSlug: INTERNAL_TARIFFOS_PLAN_SLUG,
  };
}
