import { discardLegalDraft, prisma, recordAdminAudit } from '@tariffos/database';
import { requireAdmin } from '@/lib/admin/http-helpers';
import { discardOfflineDraft } from '@/lib/admin/ingestion-offline-store';
import { appendOfflineAudit } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guard = await requireAdmin('ingestion:manage');
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  if (!isCloudModeEnabled()) {
    try {
      const deleted = discardOfflineDraft(id);
      appendOfflineAudit({
        actorUserId: guard.context.userId,
        actorEmail: guard.context.userEmail,
        actorRole: guard.context.role,
        action: 'ingestion.draft_discarded',
        targetType: 'legal_document',
        targetId: id,
        tenantId: null,
        beforeState: { id, status: 'DRAFT' },
        afterState: null,
        reason: 'Descarte de borrador legal',
      });
      return Response.json({ mode: 'offline', ...deleted }, { status: 200 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Not found';
      const status = msg.includes('DRAFT') ? 409 : 404;
      return Response.json({ error: msg }, { status });
    }
  }

  try {
    const deleted = await discardLegalDraft(prisma, id);
    await recordAdminAudit(prisma, {
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'ingestion.draft_discarded',
      targetType: 'legal_document',
      targetId: id,
      reason: 'Descarte de borrador legal',
    });
    return Response.json({ mode: 'cloud', ...deleted }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Not found';
    const status = msg.includes('DRAFT') ? 409 : 404;
    return Response.json({ error: msg }, { status });
  }
}
