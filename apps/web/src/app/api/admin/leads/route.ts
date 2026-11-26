import { prisma } from '@tariffos/database';
import { LeadStatusSchema, type AdminLeadRecord } from '@tariffos/shared-types';
import { requireAdmin } from '@/lib/admin/http-helpers';
import { getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function GET(request: Request): Promise<Response> {
  const guard = await requireAdmin('admin:read');
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status')?.trim();
  const country = searchParams.get('country')?.trim().toUpperCase();
  const query = searchParams.get('q')?.trim().toLowerCase();

  if (!isCloudModeEnabled()) {
    let leads = [...getOfflineAdminState().leads];
    if (status) leads = leads.filter((l) => l.status === status);
    if (country) leads = leads.filter((l) => l.country.toUpperCase() === country);
    if (query) {
      leads = leads.filter(
        (l) =>
          l.email.toLowerCase().includes(query) ||
          (l.name ?? '').toLowerCase().includes(query) ||
          (l.company ?? '').toLowerCase().includes(query),
      );
    }
    return Response.json({ mode: 'offline', leads }, { status: 200 });
  }

  const rows = await prisma.waitlistLead.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(country ? { country } : {}),
      ...(query
        ? {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
              { company: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const leads: AdminLeadRecord[] = rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    company: row.company,
    phone: row.phone,
    notes: row.notes,
    country: row.country ?? 'VE',
    volume: row.volume,
    source: row.source,
    status: LeadStatusSchema.catch('PENDING').parse(row.status),
    approvedAt: row.approvedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));

  return Response.json({ mode: 'cloud', leads }, { status: 200 });
}
