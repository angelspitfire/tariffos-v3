import { prisma } from '@tariffos/database';
import {
  AdminRecordManualPaymentInputSchema,
  AdminVerifyPaymentInputSchema,
} from '@tariffos/shared-types';
import { parseJsonBody, requireAdmin } from '@/lib/admin/http-helpers';
import { getOfflineAdminState } from '@/lib/admin/offline-store';
import { toManualPaymentRecord } from '@/lib/admin/payment-mapper';
import {
  recordCloudManualPayment,
  recordOfflineManualPayment,
  verifyCloudPayment,
  verifyOfflinePayment,
} from '@/lib/admin/payment-service';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function GET(request: Request): Promise<Response> {
  const guard = await requireAdmin('billing:read');
  if (!guard.ok) return guard.response;

  const statusFilter = new URL(request.url).searchParams.get('status')?.trim();

  if (!isCloudModeEnabled()) {
    const all = getOfflineAdminState().payments;
    const payments = statusFilter ? all.filter((p) => p.status === statusFilter) : all;
    return Response.json({ mode: 'offline', payments }, { status: 200 });
  }

  const dbStatus =
    statusFilter === 'verified'
      ? 'CONFIRMED'
      : statusFilter === 'rejected'
        ? 'REJECTED'
        : statusFilter === 'pending_verification'
          ? 'PENDING'
          : undefined;

  const rows = await prisma.payment.findMany({
    where: dbStatus ? { status: dbStatus } : undefined,
    include: { tenant: { select: { name: true, ownerEmail: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return Response.json(
    { mode: 'cloud', payments: rows.map(toManualPaymentRecord) },
    { status: 200 },
  );
}

export async function POST(request: Request): Promise<Response> {
  const guard = await requireAdmin('billing:approve');
  if (!guard.ok) return guard.response;

  const rawBody = await parseJsonBody(request);
  if (rawBody === null) return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });

  const parsed = AdminRecordManualPaymentInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  if (!isCloudModeEnabled()) {
    const payment = recordOfflineManualPayment(parsed.data, guard.context);
    if (!payment) return Response.json({ error: 'Tenant not found' }, { status: 404 });
    return Response.json({ mode: 'offline', payment }, { status: 201 });
  }

  const payment = await recordCloudManualPayment(parsed.data, guard.context);
  return Response.json({ mode: 'cloud', payment }, { status: 201 });
}

export async function PATCH(request: Request): Promise<Response> {
  const guard = await requireAdmin('billing:approve');
  if (!guard.ok) return guard.response;

  const rawBody = await parseJsonBody(request);
  if (rawBody === null) return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });

  const parsed = AdminVerifyPaymentInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  if (!isCloudModeEnabled()) {
    const payment = verifyOfflinePayment(parsed.data, guard.context);
    if (!payment) return Response.json({ error: 'Payment not found' }, { status: 404 });
    return Response.json({ mode: 'offline', payment }, { status: 200 });
  }

  const payment = await verifyCloudPayment(parsed.data, guard.context);
  return Response.json({ mode: 'cloud', payment }, { status: 200 });
}
