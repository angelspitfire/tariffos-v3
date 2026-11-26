import type { LegalDocumentType, LegalDraftDiff } from '@tariffos/shared-types';
import type { PrismaClient } from '../generated/client';
import { computeLegalChunksDiff, computeTariffRowsDiff } from './diff-engine';
import type { NormalizedTariffRow } from './tariff-parser';

/**
 * Computes a structured impact diff for a staged DRAFT against currently
 * PUBLISHED overlapping documents or active NationalTariff rows.
 */
export async function computeDraftDiff(db: PrismaClient, draftId: string): Promise<LegalDraftDiff> {
  const draft = await db.legalKnowledgeParent.findUnique({
    where: { id: draftId },
    include: { chunks: { orderBy: { chunkIndex: 'asc' } } },
  });
  if (!draft) throw new Error(`Draft ${draftId} not found.`);

  const overlapping = await db.legalKnowledgeParent.findMany({
    where: {
      id: { not: draft.id },
      countryCode: draft.countryCode,
      legalType: draft.legalType,
      hierarchyPath: draft.hierarchyPath,
      status: 'PUBLISHED',
      isDerogated: false,
      validFromDate: { lte: draft.validFromDate },
    },
    include: { chunks: { orderBy: { chunkIndex: 'asc' } } },
    orderBy: { validFromDate: 'desc' },
  });

  const overlappingSummary = overlapping.map((o) => ({
    id: o.id,
    title: o.title,
    decreeNumber: o.decreeNumber,
    validFromDate: o.validFromDate.toISOString(),
  }));

  if (draft.legalType === 'TARIFF_SCHEDULE') {
    const incomingRows = JSON.parse(draft.content || '[]') as NormalizedTariffRow[];
    const existingRows = await db.nationalTariff.findMany({
      where: { countryCode: draft.countryCode, isActive: true, isDerogated: false },
      select: {
        hsCode: true,
        description: true,
        adValorem: true,
        iva: true,
        isBK: true,
        isBIT: true,
        legalNotes: true,
      },
    });
    const tariffDiff = computeTariffRowsDiff(incomingRows, existingRows);
    return {
      draftId: draft.id,
      countryCode: draft.countryCode,
      legalType: 'TARIFF_SCHEDULE',
      hierarchyPath: draft.hierarchyPath,
      kind: 'tariff',
      overlappingPublished: overlappingSummary,
      addedChunks: tariffDiff.addedCount,
      modifiedChunks: tariffDiff.modifiedCount,
      removedChunks: tariffDiff.removedCount,
      affectedHsCodes: tariffDiff.affectedHsCodes,
      sampleChanges: [],
      tariffChanges: tariffDiff.changes,
    };
  }

  const legalDiff = computeLegalChunksDiff(
    draft.chunks,
    overlapping.flatMap((o) => o.chunks),
  );
  return {
    draftId: draft.id,
    countryCode: draft.countryCode,
    legalType: draft.legalType as LegalDocumentType,
    hierarchyPath: draft.hierarchyPath,
    kind: 'legal',
    overlappingPublished: overlappingSummary,
    ...legalDiff,
  };
}
