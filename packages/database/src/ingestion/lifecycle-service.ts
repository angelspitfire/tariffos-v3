import type { LegalDocumentType } from '@tariffos/shared-types';
import { fetchAndValidateDraft, sunsetOverlappingRecords } from '../derogation';
import { Prisma, type PrismaClient } from '../generated/client';
import type { LegalChunkDraft } from './legal-chunker';
import type { NormalizedTariffRow } from './tariff-parser';
import { publishTariffScheduleRows } from './tariff-publish';

const MAX_COLLISION_RETRIES = 25;
const ONE_SECOND_MS = 1000;

export class DraftDateCollisionError extends Error {
  constructor(countryCode: string, legalType: string, hierarchyPath: string, dateIso: string) {
    super(
      `Ya existe un documento publicado o derogado para (${countryCode}, ${legalType}, ${hierarchyPath}) con fecha ${dateIso}. Active replaceSameDate para generar un borrador de reemplazo.`,
    );
    this.name = 'DraftDateCollisionError';
  }
}

export interface StageLegalDraftInput {
  countryCode: string;
  legalType: LegalDocumentType;
  hierarchyPath: string;
  title: string;
  content: string;
  sourceFile?: string | null;
  officialDocumentNumber?: string | null;
  decreeNumber?: string | null;
  validFromDate: Date;
  replaceSameDate?: boolean;
  chunks: LegalChunkDraft[];
}

export interface StagedDraftResult {
  parentId: string;
  chunkCount: number;
  validFromDate: Date;
}

export async function stageLegalDocumentDraft(
  db: PrismaClient,
  input: StageLegalDraftInput,
): Promise<StagedDraftResult> {
  const path = input.hierarchyPath.trim();
  if (!path) throw new Error('hierarchyPath es obligatorio');

  return db.$transaction(async (tx) => {
    let targetDate = new Date(input.validFromDate.getTime());
    let existingDraftId: string | null = null;

    for (let attempt = 0; attempt <= MAX_COLLISION_RETRIES; attempt += 1) {
      const collision = await tx.legalKnowledgeParent.findFirst({
        where: {
          countryCode: input.countryCode,
          legalType: input.legalType,
          hierarchyPath: path,
          validFromDate: targetDate,
        },
        select: { id: true, status: true },
      });

      if (!collision) break;
      if (collision.status === 'DRAFT') {
        existingDraftId = collision.id;
        break;
      }
      if (!input.replaceSameDate) {
        throw new DraftDateCollisionError(
          input.countryCode,
          input.legalType,
          path,
          targetDate.toISOString(),
        );
      }
      targetDate = new Date(targetDate.getTime() + ONE_SECOND_MS);
    }

    const parent = existingDraftId
      ? await tx.legalKnowledgeParent.update({
          where: { id: existingDraftId },
          data: {
            title: input.title,
            content: input.content,
            sourceFile: input.sourceFile ?? null,
            officialDocumentNumber: input.officialDocumentNumber ?? null,
            decreeNumber: input.decreeNumber ?? null,
          },
        })
      : await tx.legalKnowledgeParent.create({
          data: {
            countryCode: input.countryCode,
            legalType: input.legalType,
            hierarchyPath: path,
            title: input.title,
            content: input.content,
            sourceFile: input.sourceFile ?? null,
            officialDocumentNumber: input.officialDocumentNumber ?? null,
            decreeNumber: input.decreeNumber ?? null,
            validFromDate: targetDate,
            isDerogated: false,
            status: 'DRAFT',
          },
        });

    await tx.legalKnowledgeChunk.deleteMany({ where: { parentId: parent.id } });
    if (input.chunks.length > 0) {
      await tx.legalKnowledgeChunk.createMany({
        data: input.chunks.map((chunk) => ({
          parentId: parent.id,
          heading: chunk.heading,
          ruleNumber: chunk.ruleNumber,
          content: chunk.content,
          scope: chunk.scope,
          chunkIndex: chunk.chunkIndex,
        })),
      });
    }

    return {
      parentId: parent.id,
      chunkCount: input.chunks.length,
      validFromDate: parent.validFromDate,
    };
  });
}

export async function publishLegalDraft(db: PrismaClient, draftId: string) {
  return db.$transaction(
    async (tx) => {
      const draft = await fetchAndValidateDraft(tx, draftId);
      if (draft.status !== 'DRAFT') {
        throw new Error(`Solo se pueden publicar documentos en estado DRAFT (actual: ${draft.status}).`);
      }

      const derogatedIds = await sunsetOverlappingRecords(tx, {
        draftId: draft.id,
        countryCode: draft.countryCode,
        legalType: draft.legalType,
        hierarchyPath: draft.hierarchyPath,
        validFromDate: draft.validFromDate,
      });

      if (draft.legalType === 'TARIFF_SCHEDULE') {
        const rows = JSON.parse(draft.content || '[]') as NormalizedTariffRow[];
        await publishTariffScheduleRows(tx, {
          countryCode: draft.countryCode,
          rows,
          validFromDate: draft.validFromDate,
          datasetVersion: draft.decreeNumber ?? draft.officialDocumentNumber ?? draft.title,
        });
      }

      const published = await tx.legalKnowledgeParent.update({
        where: { id: draft.id },
        data: { status: 'PUBLISHED', isDerogated: false, validToDate: null },
      });

      return {
        publishedId: published.id,
        countryCode: published.countryCode,
        legalType: published.legalType as LegalDocumentType,
        hierarchyPath: published.hierarchyPath,
        status: 'PUBLISHED' as const,
        derogatedCount: derogatedIds.length,
        derogatedIds,
      };
    },
    { timeout: 60_000, maxWait: 10_000 },
  );
}

export async function discardLegalDraft(db: PrismaClient, draftId: string): Promise<{ deletedId: string }> {
  const existing = await db.legalKnowledgeParent.findUnique({
    where: { id: draftId },
    select: { id: true, status: true },
  });
  if (!existing) throw new Error(`Draft ${draftId} not found.`);
  if (existing.status !== 'DRAFT') {
    throw new Error(`Solo se pueden descartar documentos en estado DRAFT (actual: ${existing.status}).`);
  }
  await db.legalKnowledgeParent.delete({ where: { id: draftId } });
  return { deletedId: draftId };
}

export async function populateChunkSearchVectors(db: PrismaClient, parentId: string): Promise<void> {
  await db.$executeRaw(Prisma.sql`
    UPDATE "LegalKnowledgeChunk"
    SET "search" = to_tsvector(
      'spanish',
      translate(coalesce("heading", '') || ' ' || "content", 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN')
    )
    WHERE "parentId" = ${parentId}
  `);
}
