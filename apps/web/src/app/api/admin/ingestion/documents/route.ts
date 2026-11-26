import { chunkLegalDocument, DraftDateCollisionError, prisma, recordAdminAudit } from '@tariffos/database';
import {
  LegalDocumentStatusSchema,
  LegalDocumentUploadInputSchema,
  type LegalDocumentUploadInput,
} from '@tariffos/shared-types';
import { requireAdmin } from '@/lib/admin/http-helpers';
import {
  listCloudDocumentsWithEmbeddingCounts,
  parseIngestionUploadPayload,
  stageCloudInlineDocument,
} from '@/lib/admin/ingestion-cloud-stage';
import {
  listOfflineDocuments,
  stageOfflineDocument,
  toOfflineDraftSummary,
} from '@/lib/admin/ingestion-offline-store';
import { appendOfflineAudit } from '@/lib/admin/offline-store';
import { inngest } from '@/lib/inngest/client';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function GET(request: Request): Promise<Response> {
  const guard = await requireAdmin('ingestion:read');
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const countryCode = (url.searchParams.get('countryCode') ?? 'VE').trim().toUpperCase();
  const statusParam = url.searchParams.get('status');
  const statusParsed = statusParam ? LegalDocumentStatusSchema.safeParse(statusParam) : null;
  if (statusParsed && !statusParsed.success) {
    return Response.json({ error: 'Invalid status filter' }, { status: 400 });
  }

  if (!isCloudModeEnabled()) {
    return Response.json(
      { mode: 'offline', documents: listOfflineDocuments(countryCode, statusParsed?.data) },
      { status: 200 },
    );
  }

  const documents = await listCloudDocumentsWithEmbeddingCounts(countryCode, statusParsed?.data);
  return Response.json({ mode: 'cloud', documents }, { status: 200 });
}

export async function POST(request: Request): Promise<Response> {
  const guard = await requireAdmin('ingestion:manage');
  if (!guard.ok) return guard.response;

  let rawPayload: unknown;
  try {
    rawPayload = await parseIngestionUploadPayload(request);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Invalid payload' }, { status: 413 });
  }
  if (rawPayload === null) {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = LegalDocumentUploadInputSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }
  const input: LegalDocumentUploadInput = parsed.data;
  const textContent = input.content ?? '';

  if (!isCloudModeEnabled()) {
    const chunkFormat = input.sourceFormat === 'pdf' || input.sourceFormat === 'markdown' ? input.sourceFormat : 'txt';
    const chunks = input.legalType === 'TARIFF_SCHEDULE'
      ? []
      : chunkLegalDocument({ title: input.title, content: textContent, format: chunkFormat });
    const staged = stageOfflineDocument({
      countryCode: input.countryCode,
      legalType: input.legalType,
      hierarchyPath: input.hierarchyPath,
      title: input.title,
      content: textContent,
      sourceFile: input.sourceFile ?? null,
      officialDocumentNumber: input.officialDocumentNumber ?? null,
      decreeNumber: input.decreeNumber ?? null,
      validFromDate: input.validFromDate,
      chunks,
    });
    appendOfflineAudit({
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'ingestion.draft_staged',
      targetType: 'legal_document',
      targetId: staged.id,
      tenantId: null,
      beforeState: null,
      afterState: { countryCode: staged.countryCode, hierarchyPath: staged.hierarchyPath, status: 'DRAFT' },
      reason: `Borrador cargado: ${staged.title}`,
    });
    return Response.json({ mode: 'offline', queued: false, document: toOfflineDraftSummary(staged) }, { status: 201 });
  }

  const shouldQueueInngest = Boolean(input.storageKey) || (input.sourceFormat === 'pdf' && !textContent.trim());
  if (shouldQueueInngest) {
    await inngest.send({ name: 'legal/document.uploaded', data: input });
    await recordAdminAudit(prisma, {
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'ingestion.upload_queued',
      targetType: 'legal_document',
      targetId: input.storageKey ?? `${input.countryCode}/${input.hierarchyPath}`,
      afterState: { countryCode: input.countryCode, hierarchyPath: input.hierarchyPath, storageKey: input.storageKey ?? null },
      reason: `Encolado en Inngest: ${input.title}`,
    });
    return Response.json({ mode: 'cloud', queued: true }, { status: 202 });
  }

  try {
    const result = await stageCloudInlineDocument(input, guard.context);
    return Response.json({ mode: 'cloud', queued: false, ...result }, { status: 201 });
  } catch (err) {
    if (err instanceof DraftDateCollisionError) {
      return Response.json({ error: err.message, code: 'DATE_COLLISION' }, { status: 409 });
    }
    return Response.json({ error: err instanceof Error ? err.message : 'Failed to stage document' }, { status: 400 });
  }
}
