import { z } from 'zod';
import { prisma } from '@tariffos/database';
import {
  ManualPaymentMethodSchema,
  ManualPaymentRecordSchema,
  SAAS_PLANS,
  SubscriptionBillingCycleSchema,
  type ManualPaymentRecord,
  type ManualPaymentStatus,
} from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';

const CreatePaymentSchema = z.object({
  planId: z.string().trim().min(1),
  billingCycle: SubscriptionBillingCycleSchema.default('monthly'),
  monthsCovered: z.number().int().positive().default(1),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'VES']).default('USD'),
  method: ManualPaymentMethodSchema,
  referenceCode: z.string().trim().min(2),
  receiptStorageKey: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const PatchPaymentSchema = z.object({
  paymentId: z.string().trim().min(1),
  action: z.enum(['verify', 'reject']),
  rejectionReason: z.string().trim().optional(),
});

const offlinePaymentsStore = new Map<string, ManualPaymentRecord>();

function mapStatus(status: string): ManualPaymentStatus {
  if (status === 'CONFIRMED') return 'verified';
  if (status === 'REJECTED') return 'rejected';
  return 'pending_verification';
}

function resolvePlanName(planId: string | null | undefined): string {
  return SAAS_PLANS.find((p) => p.planId === planId)?.name ?? planId ?? 'Pro';
}

async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET(request: Request): Promise<Response> {
  const statusFilter = new URL(request.url).searchParams.get('status');

  if (!isCloudModeEnabled()) {
    const all = Array.from(offlinePaymentsStore.values());
    const payments = statusFilter ? all.filter((p) => p.status === statusFilter) : all;
    return Response.json({ mode: 'offline', payments }, { status: 200 });
  }

  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const rows = await prisma.payment.findMany({
    where: { tenantId: auth.context.tenantId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const payments: ManualPaymentRecord[] = rows.map((row) =>
    ManualPaymentRecordSchema.parse({
      paymentId: row.id,
      userId: auth.context.userId,
      tenantId: row.tenantId,
      userEmail: auth.context.userEmail ?? 'broker@tariffos.app',
      planId: row.planId ?? 'pro',
      planName: resolvePlanName(row.planId),
      billingCycle: row.billingCycle === 'annual' ? 'annual' : 'monthly',
      monthsCovered: row.billingCycle === 'annual' ? 12 : 1,
      amount: row.amount ?? 1,
      currency: row.currency === 'EUR' || row.currency === 'VES' ? row.currency : 'USD',
      method: ManualPaymentMethodSchema.catch('otro').parse(row.method ?? 'otro'),
      referenceCode: row.referenceCode ?? 'REF-00',
      paidAt: row.createdAt.toISOString(),
      status: mapStatus(row.status),
      receiptStorageKey: row.receiptStorageKey ?? undefined,
      notes: row.notes ?? undefined,
      verifiedBy: row.verifiedBy ?? undefined,
      verifiedAt: row.verifiedAt?.toISOString(),
      rejectionReason: row.rejectionReason ?? undefined,
    }),
  );

  return Response.json({ mode: 'cloud', payments }, { status: 200 });
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await parseJsonBody(request);
  if (rawBody === null) return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });

  const parsed = CreatePaymentSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;

  if (!isCloudModeEnabled()) {
    const payment = ManualPaymentRecordSchema.parse({
      paymentId: `pay-offline-${Date.now()}`,
      userId: 'offline-user',
      tenantId: 'offline-tenant',
      userEmail: 'demo@tariffos.app',
      planId: input.planId,
      planName: resolvePlanName(input.planId),
      billingCycle: input.billingCycle,
      monthsCovered: input.monthsCovered,
      amount: input.amount,
      currency: input.currency,
      method: input.method,
      referenceCode: input.referenceCode,
      paidAt: new Date().toISOString(),
      status: 'pending_verification',
      receiptStorageKey: input.receiptStorageKey,
      notes: input.notes,
    });
    offlinePaymentsStore.set(payment.paymentId, payment);
    return Response.json({ mode: 'offline', payment }, { status: 201 });
  }

  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const created = await prisma.payment.create({
    data: {
      tenantId: auth.context.tenantId,
      status: 'PENDING',
      amount: input.amount,
      currency: input.currency,
      planId: input.planId,
      billingCycle: input.billingCycle,
      method: input.method,
      referenceCode: input.referenceCode,
      receiptStorageKey: input.receiptStorageKey,
      notes: input.notes,
    },
  });

  return Response.json(
    { mode: 'cloud', payment: { paymentId: created.id, status: 'pending_verification' } },
    { status: 201 },
  );
}

export async function PATCH(request: Request): Promise<Response> {
  const rawBody = await parseJsonBody(request);
  if (rawBody === null) return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  const parsed = PatchPaymentSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;

  if (!isCloudModeEnabled()) {
    const existing = offlinePaymentsStore.get(input.paymentId);
    if (!existing) return Response.json({ error: 'Payment not found' }, { status: 404 });
    const updated: ManualPaymentRecord = {
      ...existing,
      status: input.action === 'verify' ? 'verified' : 'rejected',
      verifiedBy: 'offline-admin',
      verifiedAt: new Date().toISOString(),
      rejectionReason: input.action === 'reject' ? (input.rejectionReason ?? 'Rechazado por administración') : undefined,
    };
    offlinePaymentsStore.set(updated.paymentId, updated);
    return Response.json({ mode: 'offline', payment: updated }, { status: 200 });
  }

  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const isVerify = input.action === 'verify';
  const updated = await prisma.payment.update({
    where: { id: input.paymentId },
    data: {
      status: isVerify ? 'CONFIRMED' : 'REJECTED',
      verifiedBy: auth.context.userId,
      verifiedAt: new Date(),
      rejectionReason: isVerify ? null : (input.rejectionReason ?? 'Comprobante rechazado'),
    },
  });
  if (isVerify) {
    await prisma.tenant.update({
      where: { id: updated.tenantId },
      data: { billingStatus: 'ACTIVE', planId: updated.planId ?? undefined },
    });
  }
  return Response.json(
    { mode: 'cloud', payment: { paymentId: updated.id, status: mapStatus(updated.status) } },
    { status: 200 },
  );
}
