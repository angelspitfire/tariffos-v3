import { prisma, publishLegalDraft, recordAdminAudit } from '@tariffos/database';
import { requireAdmin } from '@/lib/admin/http-helpers';
import { publishOfflineDraft } from '@/lib/admin/ingestion-offline-store';
import { appendOfflineAudit } from '@/lib/admin/offline-store';
import { inngest } from '@/lib/inngest/client';
import { resolveIndexingKind } from '@/lib/inngest/legal-ingestion-helpers';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guard = await requireAdmin('ingestion:manage');
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  if (!isCloudModeEnabled()) {
    try {
      const result = publishOfflineDraft(id);
      appendOfflineAudit({
        actorUserId: guard.context.userId,
        actorEmail: guard.context.userEmail,
        actorRole: guard.context.role,
        action: 'ingestion.draft_published',
        targetType: 'legal_document',
        targetId: result.publishedId,
        tenantId: null,
        beforeState: { status: 'DRAFT' },
        afterState: result,
        reason: `Publicación de ${result.countryCode}/${result.hierarchyPath} (derogados: ${result.derogatedCount})`,
      });
      return Response.json({ mode: 'offline', result }, { status: 200 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Publish failed';
      const status = msg.includes('DRAFT') ? 409 : 404;
      return Response.json({ error: msg }, { status });
    }
  }

  let published: Awaited<ReturnType<typeof publishLegalDraft>>;
  try {
    published = await publishLegalDraft(prisma, id);
    await recordAdminAudit(prisma, {
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'ingestion.draft_published',
      targetType: 'legal_document',
      targetId: published.publishedId,
      afterState: published,
      reason: `Publicación de ${published.countryCode}/${published.hierarchyPath} (derogados: ${published.derogatedCount})`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Publish failed';
    const status = msg.includes('DRAFT') ? 409 : /not found|no encontrado/i.test(msg) ? 404 : 500;
    return Response.json({ error: msg }, { status });
  }

  let indexingEnqueued = true;
  let warning: string | undefined;
  try {
    await inngest.send({
      name: 'legal/draft.published',
      data: {
        parentId: published.publishedId,
        countryCode: published.countryCode,
        legalType: published.legalType,
        kind: resolveIndexingKind(published.legalType),
      },
    });
  } catch (err) {
    indexingEnqueued = false;
    warning =
      err instanceof Error
        ? `Publicado en BD, pero falló el encolado de indexación: ${err.message}`
        : 'Publicado en BD, pero falló el encolado de indexación.';
  }

  return Response.json(
    {
      mode: 'cloud',
      result: {
        ...published,
        indexingEnqueued,
        ...(warning ? { warning } : {}),
      },
    },
    { status: 200 },
  );
}
