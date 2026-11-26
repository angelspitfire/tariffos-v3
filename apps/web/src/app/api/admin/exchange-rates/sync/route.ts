import { z } from 'zod';
import { prisma, recordAdminAudit } from '@tariffos/database';
import { parseJsonBody, requireAdmin } from '@/lib/admin/http-helpers';
import { appendOfflineAudit } from '@/lib/admin/offline-store';
import { fetchBcvRates } from '@/lib/bcv/client';
import { MAX_VALID_RATE, MIN_VALID_RATE, type BcvRateQuote } from '@/lib/bcv/parser';
import {
  getLatestExchangeRates,
  listRecentExchangeRates,
  persistBcvRates,
} from '@/lib/bcv/sync-service';
import { isCloudModeEnabled } from '@/lib/runtime-config';

const SyncBodySchema = z
  .object({
    force: z.boolean().optional(),
    manual: z
      .object({
        pair: z.enum(['USD/VES', 'EUR/VES']),
        rate: z.number().min(MIN_VALID_RATE).max(MAX_VALID_RATE),
        valueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        reason: z.string().trim().min(3),
      })
      .optional(),
  })
  .optional();

export async function GET(): Promise<Response> {
  const guard = await requireAdmin('admin:read');
  if (!guard.ok) return guard.response;

  const [rates, history] = await Promise.all([
    getLatestExchangeRates(),
    listRecentExchangeRates(10),
  ]);
  return Response.json({ rates, history }, { status: 200 });
}

export async function POST(request: Request): Promise<Response> {
  const guard = await requireAdmin('tenants:manage');
  if (!guard.ok) return guard.response;

  const rawBody = await parseJsonBody(request);
  const parsed = SyncBodySchema.safeParse(rawBody ?? {});
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data ?? {};
  const isManual = Boolean(input.manual);

  const quotes: BcvRateQuote[] = input.manual
    ? [
        {
          pair: input.manual.pair,
          rate: Math.round(input.manual.rate * 10_000) / 10_000,
          valueDate: input.manual.valueDate ?? new Date().toISOString().slice(0, 10),
          source: 'manual_admin',
        },
      ]
    : await fetchBcvRates();

  const result = await persistBcvRates(quotes, { force: isManual || Boolean(input.force) });

  const auditEntry = {
    actorUserId: guard.context.userId,
    actorEmail: guard.context.userEmail,
    actorRole: guard.context.role,
    action: isManual ? 'exchange_rate.manual_override' : 'exchange_rate.synced',
    targetType: 'exchange_rate',
    targetId: result.saved.map((r) => `${r.pair}:${r.valueDate}`).join(',') || 'none',
    reason: input.manual?.reason ?? 'Sincronización oficial BCV',
    afterState: result,
  };

  if (!isCloudModeEnabled()) {
    appendOfflineAudit({ ...auditEntry, tenantId: null, beforeState: null });
  } else {
    await recordAdminAudit(prisma, {
      ...auditEntry,
      afterState: JSON.parse(JSON.stringify(result)),
    });
  }

  return Response.json({ ok: true, ...result }, { status: 200 });
}
