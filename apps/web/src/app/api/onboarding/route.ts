import { z } from 'zod';
import { prisma } from '@tariffos/database';
import { ApprovalWorkflowModeSchema, IncotermCodeSchema } from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { getAuthenticatedUser } from '@/lib/supabase/server';

const ExpressOnboardingSchema = z.object({
  fullName: z.string().trim().min(2, 'Nombre completo requerido.'),
  companyName: z.string().trim().min(2, 'Nombre de empresa o agencia requerido.'),
  role: z.string().trim().min(2).default('Agente Aduanal'),
  brokerLicense: z.string().trim().optional().default(''),
  taxId: z.string().trim().optional(),
  countryCode: z.string().trim().length(2).default('VE'),
  defaultCustomsOffice: z.string().trim().optional(),
  defaultIncoterm: IncotermCodeSchema.default('FOB'),
  preferredCurrency: z.enum(['USD', 'EUR']).default('USD'),
  approvalWorkflowMode: ApprovalWorkflowModeSchema.default('agent_decides'),
});

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
          approvalWorkflowMode: data.approvalWorkflowMode,
          defaultIncoterm: data.defaultIncoterm,
          preferredCurrency: data.preferredCurrency,
        },
        tenant: {
          id: 'offline-tenant',
          name: data.companyName,
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
    },
  });

  const existingMembership = await prisma.membership.findFirst({
    where: { userId: user.id },
    select: { tenantId: true },
  });

  const tenant = existingMembership
    ? await prisma.tenant.update({
        where: { id: existingMembership.tenantId },
        data: {
          name: data.companyName,
          taxId: data.taxId,
          countryCode: data.countryCode,
          ownerName: data.fullName,
          ownerEmail: user.email ?? undefined,
          isOnboarded: true,
          onboardedAt: new Date(),
        },
      })
    : await prisma.tenant.create({
        data: {
          name: data.companyName,
          taxId: data.taxId,
          countryCode: data.countryCode,
          ownerName: data.fullName,
          ownerEmail: user.email ?? undefined,
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

  return Response.json({ ok: true, mode: 'cloud', profile, tenant }, { status: 200 });
}
