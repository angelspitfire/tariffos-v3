import { prisma } from '@tariffos/database';
import {
  CreateLeadInputSchema,
  type AdminLeadRecord,
} from '@tariffos/shared-types';
import { parseJsonBody } from '@/lib/admin/http-helpers';
import { getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

async function notifyLeadsWebhook(lead: AdminLeadRecord): Promise<void> {
  const url = process.env.LEADS_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'lead.captured', lead }),
    });
  } catch (err: unknown) {
    console.warn('[leads] Webhook notification failed:', err);
  }
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await parseJsonBody(request);
  if (rawBody === null) {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = CreateLeadInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const email = input.email.toLowerCase();

  if (!isCloudModeEnabled()) {
    const state = getOfflineAdminState();
    const existing = state.leads.find((l) => l.email.toLowerCase() === email);
    const lead: AdminLeadRecord = existing
      ? {
          ...existing,
          name: input.name ?? existing.name,
          company: input.company ?? existing.company,
          phone: input.phone ?? existing.phone,
          notes: input.notes ?? existing.notes,
          country: input.country,
          volume: input.volume ?? existing.volume,
          source: input.source ?? existing.source,
        }
      : {
          id: `lead-${Date.now()}`,
          email,
          name: input.name ?? null,
          company: input.company ?? null,
          phone: input.phone ?? null,
          notes: input.notes ?? null,
          country: input.country,
          volume: input.volume ?? null,
          source: input.source ?? null,
          status: 'PENDING',
          approvedAt: null,
          createdAt: new Date().toISOString(),
        };
    if (!existing) state.leads.unshift(lead);
    void notifyLeadsWebhook(lead);
    return Response.json({ mode: 'offline', lead }, { status: 201 });
  }

  const row = await prisma.waitlistLead.upsert({
    where: { email },
    update: {
      name: input.name ?? undefined,
      company: input.company ?? undefined,
      phone: input.phone ?? undefined,
      notes: input.notes ?? undefined,
      country: input.country,
      volume: input.volume ?? undefined,
      source: input.source ?? undefined,
      landingPath: input.landingPath ?? undefined,
      referrer: input.referrer ?? undefined,
    },
    create: {
      email,
      name: input.name ?? null,
      company: input.company ?? null,
      phone: input.phone ?? null,
      notes: input.notes ?? null,
      country: input.country,
      volume: input.volume ?? null,
      source: input.source ?? null,
      landingPath: input.landingPath ?? null,
      referrer: input.referrer ?? null,
    },
  });

  const lead: AdminLeadRecord = {
    id: row.id,
    email: row.email,
    name: row.name,
    company: row.company,
    phone: row.phone,
    notes: row.notes,
    country: row.country ?? 'VE',
    volume: row.volume,
    source: row.source,
    status: 'PENDING',
    approvedAt: row.approvedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };

  void notifyLeadsWebhook(lead);
  return Response.json({ mode: 'cloud', lead }, { status: 201 });
}
