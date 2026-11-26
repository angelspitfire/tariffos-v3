import { computeLegalChunksDiff } from '@tariffos/database';
import type { LegalDraftDiff, PublishDraftResult } from '@tariffos/shared-types';
import { getOfflineIngestionState } from './ingestion-offline-store';

export function computeOfflineDraftDiff(draftId: string): LegalDraftDiff {
  const state = getOfflineIngestionState();
  const draft = state.documents.find((d) => d.id === draftId);
  if (!draft) throw new Error(`Draft ${draftId} not found.`);

  const overlapping = state.documents.filter(
    (d) =>
      d.id !== draft.id &&
      d.countryCode === draft.countryCode &&
      d.legalType === draft.legalType &&
      d.hierarchyPath === draft.hierarchyPath &&
      d.status === 'PUBLISHED' &&
      !d.isDerogated &&
      d.validFromDate <= draft.validFromDate,
  );
  const legalDiff = computeLegalChunksDiff(
    draft.chunks,
    overlapping.flatMap((o) => o.chunks),
  );
  return {
    draftId: draft.id,
    countryCode: draft.countryCode,
    legalType: draft.legalType,
    hierarchyPath: draft.hierarchyPath,
    kind: draft.legalType === 'TARIFF_SCHEDULE' ? 'tariff' : 'legal',
    overlappingPublished: overlapping.map((o) => ({
      id: o.id,
      title: o.title,
      decreeNumber: o.decreeNumber,
      validFromDate: o.validFromDate,
    })),
    ...legalDiff,
  };
}

export function publishOfflineDraft(draftId: string): PublishDraftResult {
  const state = getOfflineIngestionState();
  const draft = state.documents.find((d) => d.id === draftId);
  if (!draft) throw new Error(`Draft ${draftId} not found.`);
  if (draft.status !== 'DRAFT') {
    throw new Error(`Solo se pueden publicar documentos en estado DRAFT (actual: ${draft.status}).`);
  }

  const derogationDate = new Date(new Date(draft.validFromDate).getTime() - 1).toISOString();
  const derogatedIds: string[] = [];
  for (const doc of state.documents) {
    if (
      doc.id !== draft.id &&
      doc.countryCode === draft.countryCode &&
      doc.legalType === draft.legalType &&
      doc.hierarchyPath === draft.hierarchyPath &&
      doc.status === 'PUBLISHED' &&
      !doc.isDerogated &&
      doc.validFromDate <= draft.validFromDate
    ) {
      doc.status = 'DEROGATED';
      doc.isDerogated = true;
      doc.validToDate = derogationDate;
      derogatedIds.push(doc.id);
    }
  }

  draft.status = 'PUBLISHED';
  draft.isDerogated = false;
  draft.validToDate = null;

  return {
    publishedId: draft.id,
    countryCode: draft.countryCode,
    legalType: draft.legalType,
    hierarchyPath: draft.hierarchyPath,
    status: 'PUBLISHED',
    derogatedCount: derogatedIds.length,
    derogatedIds,
    indexingEnqueued: false,
  };
}

export function discardOfflineDraft(draftId: string): { deletedId: string } {
  const state = getOfflineIngestionState();
  const idx = state.documents.findIndex((d) => d.id === draftId);
  if (idx < 0) throw new Error(`Draft ${draftId} not found.`);
  if (state.documents[idx]?.status !== 'DRAFT') {
    throw new Error('Solo se pueden descartar documentos en estado DRAFT.');
  }
  state.documents.splice(idx, 1);
  return { deletedId: draftId };
}
