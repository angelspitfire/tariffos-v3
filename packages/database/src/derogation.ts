import type { PrismaClient } from './generated/client';

export type DerogationTx = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

export interface SunsetOverlapParams {
  draftId: string;
  countryCode: string;
  legalType: string;
  hierarchyPath: string;
  validFromDate: Date;
}

/**
 * Fetches a LegalKnowledgeParent record by ID inside a transaction and throws
 * when it does not exist.
 */
export async function fetchAndValidateDraft(tx: DerogationTx, draftId: string) {
  const draft = await tx.legalKnowledgeParent.findUnique({
    where: { id: draftId },
  });

  if (!draft) {
    throw new Error(`Draft with ID ${draftId} not found.`);
  }

  return draft;
}

/**
 * Marks overlapping PUBLISHED records of the exact same `(countryCode, legalType,
 * hierarchyPath)` and earlier/equal `validFromDate` as DEROGATED.
 * Never uses prefix (`startsWith`) matching and rejects empty paths.
 */
export async function sunsetOverlappingRecords(
  tx: DerogationTx,
  params: SunsetOverlapParams,
): Promise<string[]> {
  const path = params.hierarchyPath.trim();
  if (!path) {
    throw new Error('hierarchyPath cannot be empty when derogating overlapping records.');
  }

  const overlapping = await tx.legalKnowledgeParent.findMany({
    where: {
      id: { not: params.draftId },
      countryCode: params.countryCode,
      legalType: params.legalType,
      hierarchyPath: path,
      isDerogated: false,
      status: 'PUBLISHED',
      validFromDate: { lte: params.validFromDate },
    },
    select: { id: true },
  });

  if (overlapping.length === 0) return [];

  const ids = overlapping.map((record) => record.id);
  const derogationDate = new Date(params.validFromDate.getTime() - 1);

  await tx.legalKnowledgeParent.updateMany({
    where: { id: { in: ids } },
    data: {
      isDerogated: true,
      status: 'DEROGATED',
      validToDate: derogationDate,
    },
  });

  return ids;
}
