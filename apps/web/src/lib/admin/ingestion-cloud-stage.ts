import {
  chunkLegalDocument,
  extractPdfTextFromBuffer,
  getCountryByCode,
  parseTariffSchedule,
  Prisma,
  prisma,
  recordAdminAudit,
  stageLegalDocumentDraft,
} from '@tariffos/database';
import type {
  LegalDocumentStatus,
  LegalDocumentUploadInput,
  LegalDraftSummary,
} from '@tariffos/shared-types';
import type { PlatformAdminContext } from './admin-session';
import { parseJsonBody } from './http-helpers';

const MAX_INLINE_BYTES = 2 * 1024 * 1024;

export async function listCloudDocumentsWithEmbeddingCounts(
  countryCode: string,
  status?: LegalDocumentStatus,
): Promise<LegalDraftSummary[]> {
  const rows = await prisma.legalKnowledgeParent.findMany({
    where: { countryCode, ...(status ? { status } : {}) },
    include: { _count: { select: { chunks: true } } },
    orderBy: [{ createdAt: 'desc' }],
  });

  const embeddedByParent = new Map<string, number>();
  if (rows.length > 0) {
    const parentIds = rows.map((r) => r.id);
    const counts = await prisma.$queryRaw<Array<{ parentId: string; embedded: bigint }>>(
      Prisma.sql`
        SELECT "parentId", count(*)::bigint AS embedded
        FROM "LegalKnowledgeChunk"
        WHERE "parentId" IN (${Prisma.join(parentIds)}) AND "embedding" IS NOT NULL
        GROUP BY "parentId"
      `,
    );
    for (const c of counts) embeddedByParent.set(c.parentId, Number(c.embedded));
  }

  return rows.map((row) => ({
    id: row.id,
    countryCode: row.countryCode,
    legalType: row.legalType as LegalDraftSummary['legalType'],
    hierarchyPath: row.hierarchyPath,
    title: row.title,
    sourceFile: row.sourceFile,
    officialDocumentNumber: row.officialDocumentNumber,
    decreeNumber: row.decreeNumber,
    validFromDate: row.validFromDate.toISOString(),
    validToDate: row.validToDate ? row.validToDate.toISOString() : null,
    isDerogated: row.isDerogated,
    status: row.status,
    chunkCount: row._count.chunks,
    embeddedChunkCount: embeddedByParent.get(row.id) ?? 0,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function parseIngestionUploadPayload(request: Request): Promise<unknown> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) return parseJsonBody(request);
  const form = await request.formData();
  const file = form.get('file');
  let content = typeof form.get('content') === 'string' ? (form.get('content') as string) : undefined;
  let sourceFile = typeof form.get('sourceFile') === 'string' ? (form.get('sourceFile') as string) : undefined;
  const sourceFormat = form.get('sourceFormat');

  if (file instanceof File) {
    if (file.size > MAX_INLINE_BYTES) {
      throw new Error('Archivo multipart excede 2 MB; use /api/admin/ingestion/upload-url');
    }
    sourceFile = sourceFile ?? file.name;
    if (sourceFormat === 'pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const extracted = await extractPdfTextFromBuffer(new Uint8Array(await file.arrayBuffer()));
      content = extracted.text;
    } else {
      content = await file.text();
    }
  }

  return {
    countryCode: form.get('countryCode') ?? 'VE',
    legalType: form.get('legalType'),
    hierarchyPath: form.get('hierarchyPath'),
    title: form.get('title'),
    sourceFormat,
    sourceFile,
    officialDocumentNumber: form.get('officialDocumentNumber') ?? undefined,
    decreeNumber: form.get('decreeNumber') ?? undefined,
    validFromDate: form.get('validFromDate'),
    replaceSameDate: form.get('replaceSameDate') === 'true',
    content,
  };
}

export async function stageCloudInlineDocument(
  input: LegalDocumentUploadInput,
  actor: PlatformAdminContext,
) {
  const textContent = input.content ?? '';
  const validFromDate = new Date(input.validFromDate);
  let stagedContent = textContent;
  let chunks: ReturnType<typeof chunkLegalDocument> = [];

  if (input.legalType === 'TARIFF_SCHEDULE') {
    const country = await getCountryByCode(input.countryCode, prisma);
    const format = input.sourceFormat === 'tariff_csv' ? 'tariff_csv' : 'tariff_json';
    const tariffParsed = parseTariffSchedule(textContent, format, country);
    if (tariffParsed.rows.length === 0) throw new Error(tariffParsed.errors[0] ?? 'Arancel sin filas válidas');
    stagedContent = JSON.stringify(tariffParsed.rows);
  } else {
    const chunkFormat =
      input.sourceFormat === 'pdf' || input.sourceFormat === 'markdown' ? input.sourceFormat : 'txt';
    chunks = chunkLegalDocument({ title: input.title, content: textContent, format: chunkFormat });
  }

  const result = await stageLegalDocumentDraft(prisma, {
    countryCode: input.countryCode,
    legalType: input.legalType,
    hierarchyPath: input.hierarchyPath,
    title: input.title,
    content: stagedContent,
    sourceFile: input.sourceFile ?? null,
    officialDocumentNumber: input.officialDocumentNumber ?? null,
    decreeNumber: input.decreeNumber ?? null,
    validFromDate,
    replaceSameDate: input.replaceSameDate,
    chunks,
  });

  await recordAdminAudit(prisma, {
    actorUserId: actor.userId,
    actorEmail: actor.userEmail,
    actorRole: actor.role,
    action: 'ingestion.draft_staged',
    targetType: 'legal_document',
    targetId: result.parentId,
    afterState: { countryCode: input.countryCode, hierarchyPath: input.hierarchyPath, chunkCount: result.chunkCount },
    reason: `Borrador cargado: ${input.title}`,
  });

  return result;
}
