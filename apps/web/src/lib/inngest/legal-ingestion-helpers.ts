import type { IngestionSourceFormat, LegalDocumentType } from '@tariffos/shared-types';

export const LEGAL_INDEX_BATCH_SIZE = 20;
export const LEGAL_DOCUMENTS_BUCKET = 'legal-documents';

export interface LegalDocumentUploadedEventData {
  countryCode: string;
  legalType: LegalDocumentType;
  hierarchyPath: string;
  title: string;
  sourceFormat: IngestionSourceFormat;
  sourceFile?: string;
  officialDocumentNumber?: string;
  decreeNumber?: string;
  validFromDate: string;
  replaceSameDate?: boolean;
  content?: string;
  storageKey?: string;
}

export interface LegalDraftPublishedEventData {
  parentId: string;
  countryCode: string;
  legalType: LegalDocumentType;
  kind?: 'legal' | 'tariff';
  forceEmbeddings?: boolean;
}

export function resolveIndexingKind(legalType: LegalDocumentType): 'legal' | 'tariff' {
  return legalType === 'TARIFF_SCHEDULE' ? 'tariff' : 'legal';
}

export function shouldEmbedLegalType(
  legalType: LegalDocumentType,
  forceEmbeddings = false,
): boolean {
  if (forceEmbeddings) return true;
  return legalType !== 'SECTION' && legalType !== 'CHAPTER';
}

export function chunkIdsIntoBatches<T>(items: T[], size = LEGAL_INDEX_BATCH_SIZE): T[][] {
  if (size <= 0) return [items];
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}
